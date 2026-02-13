import { state, resetState } from './state.js';
import { CONFIG, CHARACTERS } from './constants.js';
import { sound } from './sound.js';
import * as ASSETS from './assets.js';
import {
    updateBackground, updatePlayer, updateBullets, spawnEnemy, updateEnemies,
    updateBoss, updateEnemyBullets, updateItems, updateBombs, updateParticles
} from './entities.js';
import {
    drawTitleScreen, drawGameOverScreen, drawStageClear,
    drawCharacterSelectionUI, updateLivesUI, updateBombUI,
    startDialogue, startEndingSequence, startWorldMap
} from './ui.js';
import { draw } from './renderer.js';

// Expose globals for cheats
window.sound = sound;
window.updateBombUI = updateBombUI;
window.startDialogue = startDialogue;
window.startEndingSequence = startEndingSequence;

// [Cheat Logic] - Requested by CEO (QA Issue #5)
window.gameCheat = function (type) {
    if (!state.gameActive && type !== 'ending') return;

    switch (type) {
        case 'killBoss':
            if (state.boss) {
                state.boss.hp = 0;
                console.log("Cheat: Boss Eliminated!");
            }
            break;
        case 'maxPower':
            state.player.powerLevel = 5;
            sound.playPowerUp();
            console.log("Cheat: Max Power Level!");
            break;
        case 'fullBomb':
            state.player.bombCount = 9;
            updateBombUI();
            sound.playItemGet();
            console.log("Cheat: Bombs Refilled!");
            break;
        case 'invincible':
            state.player.invincible = true;
            state.player.invincibleTime = 999999;
            console.log("Cheat: God Mode ON!");
            break;
        case 'nextStage':
            state.stageCleared = true;
            state.stageTransitionTimer = 10;
            console.log("Cheat: Skipping Stage...");
            break;
        case 'ending':
            state.gameActive = false;
            startEndingSequence(ctx);
            console.log("Cheat: Forcing Ending Sequence...");
            break;
    }
};

window.handleRestart = () => {
    resetState();
    isGameStarted = false;
    isCharacterSelection = true;
    const credits = document.getElementById('ending-credits');
    if (credits) credits.remove();
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.style.display = 'block';

    // UI HUD reset
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'flex';
    sound.startBGM('START');
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Canvas Resize
canvas.width = CONFIG.SCREEN_WIDTH;
canvas.height = CONFIG.SCREEN_HEIGHT;

function resizeCanvas() {
    const scale = Math.min(
        window.innerWidth / CONFIG.SCREEN_WIDTH,
        window.innerHeight / CONFIG.SCREEN_HEIGHT
    );
    canvas.style.width = `${CONFIG.SCREEN_WIDTH * scale}px`;
    canvas.style.height = `${CONFIG.SCREEN_HEIGHT * scale}px`;

    const ui = document.getElementById('ui-layer');
    const startScreen = document.getElementById('start-screen');
    [ui, startScreen].forEach(el => {
        if (el) {
            el.style.width = `${CONFIG.SCREEN_WIDTH}px`;
            el.style.height = `${CONFIG.SCREEN_HEIGHT}px`;
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = 'top left';
        }
    });
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Input Handling
window.addEventListener('keydown', (e) => {
    if (state.isSelectingCharacter) {
        if (e.key === 'ArrowRight') {
            state.selectedCharIndex = (state.selectedCharIndex + 1) % CHARACTERS.length;
            sound.playSelect();
        } else if (e.key === 'ArrowLeft') {
            state.selectedCharIndex = (state.selectedCharIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
            sound.playSelect();
        } else if (e.code === 'Space' || e.code === 'Enter') {
            confirmCharacter();
        }
        return;
    }

    if (!state.gameActive && state.gameOver && e.code === 'KeyR') {
        window.handleRestart();
        return;
    }

    if (state.gameActive) {
        state.keys[e.code] = true;
        // Dialogue / Branching logic
        if (state.isDialogueActive && (e.code === 'Space' || e.code === 'Enter')) {
            // handled in showNextDialogue
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (state.gameActive) state.keys[e.code] = false;
});

// Fix for input stuck when window loses focus (QA Issue #1)
window.addEventListener('blur', () => {
    state.keys = {};
});

// Touch Controls
const dPadButtons = document.querySelectorAll('.d-btn');
dPadButtons.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const key = btn.id === 'up' ? 'ArrowUp' : btn.id === 'down' ? 'ArrowDown' : btn.id === 'left' ? 'ArrowLeft' : 'ArrowRight';
        state.keys[key] = true;
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        const key = btn.id === 'up' ? 'ArrowUp' : btn.id === 'down' ? 'ArrowDown' : btn.id === 'left' ? 'ArrowLeft' : 'ArrowRight';
        state.keys[key] = false;
    });
});
const actionBtn = document.getElementById('action-btn');
if (actionBtn) {
    actionBtn.addEventListener('touchstart', (e) => { e.preventDefault(); state.keys['Space'] = true; });
    actionBtn.addEventListener('touchend', (e) => { e.preventDefault(); state.keys['Space'] = false; });
}

// Global Start Function
let isGameStarted = false;
let isCharacterSelection = false;

async function startGame() {
    if (isGameStarted || isCharacterSelection) return;

    try {
        // AudioContext must be resumed/created after user gesture
        await sound.init();
        sound.startBGM('SELECT'); // Start selection theme
        await ASSETS.loadAllAssets();
    } catch (err) {
        console.error("Asset/Sound Load Error:", err);
    }

    document.getElementById('start-screen').classList.add('hidden');
    state.isSelectingCharacter = true;
    isCharacterSelection = true;
    state.selectedCharIndex = 0;

    // Remove the click listener to prevent double triggering
    window.removeEventListener('click', startGame);
}

// Attach to window for onclick in HTML
window.startGame = startGame;
// We only want ONE interaction to trigger start
window.addEventListener('click', startGame, { once: true });
window.addEventListener('keydown', (e) => {
    if (!isGameStarted && !isCharacterSelection && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
    }
});

function confirmCharacter() {
    if (isGameStarted) return;
    isGameStarted = true;
    isCharacterSelection = false;
    state.isSelectingCharacter = false;
    state.gameActive = true;

    // Apply Character Stats
    const char = CHARACTERS[state.selectedCharIndex];
    state.player.color = char.color;
    state.player.id = char.id;
    state.player.shotDelay = char.shotDelay;

    // UI Update
    document.getElementById('ui-layer').classList.remove('hidden');
    updateLivesUI();
    updateBombUI();
    // Start Stage 1
    sound.startBGM('STAGE_1');
    startDialogue(1);
}

// Game Loop
function gameLoop() {
    try {
        if (state.isSelectingCharacter) {
            drawCharacterSelectionUI(ctx, state.selectedCharIndex);
        } else if (state.gameActive && !state.gameOver) {

            if (state.stageCleared) {
                drawStageClear(ctx);
                state.stageTransitionTimer--;
                if (state.stageTransitionTimer <= 0) {
                    state.stageCleared = false;
                    state.stageTransitionTimer = 0;
                    state.boss = null;
                    state.bossSpawnedInStage = false;
                    state.enemies = [];
                    state.bullets = [];
                    state.enemyBullets = [];
                    state.stageStartScore = state.score;
                    state.player.x = 100; state.player.y = 300; // Reset Pos
                    sound.startBGM(`STAGE_${state.currentStage + 1}`); // Preview next stage music
                    startWorldMap(); // Fixed: Show world map instead of skipping to dialogue
                }
            } else if (!state.isDialogueActive && !state.isWorldMapActive) {
                updateBackground(); // Smooth scroll update
                updatePlayer();
                updateBullets();
                spawnEnemy();
                updateEnemies();
                updateBoss();
                updateEnemyBullets();
                updateItems();
                updateBombs();
                updateParticles();

                // Drawing
                draw(ctx, state);
            } else {
                // Dialogue or Map active: Just draw current state (paused)
                draw(ctx, state);
            }

        } else if (state.gameOver) {
            draw(ctx, state);
            drawGameOverScreen(ctx);
        } else {
            // Title Screen
            drawTitleScreen(ctx);
        }
    } catch (err) {
        console.error("Game Loop Error:", err);
    }
    requestAnimationFrame(gameLoop);
}

// Start Loop
requestAnimationFrame(gameLoop);
