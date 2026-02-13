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
window.goNextStage = () => {
    if (state.isWorldMapActive && state.isWorldMapReady) {
        state.isWorldMapActive = false;
        state.isWorldMapReady = false;
        state.currentStage++;
        startDialogue(state.currentStage);
        sound.playConfirm();
    }
};

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
    const credits = document.getElementById('ending-credits');
    if (credits) credits.remove();
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.style.display = 'block';

    // UI 레이어 초기화
    document.getElementById('ui-layer').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    // UI HUD reset
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'flex';

    // 시작음 재생
    sound.startBGM('START');

    // [Bug Fix] Interaction listener lost after restart
    window.addEventListener('click', startGame, { once: true });
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

        // World Map Go signal
        if (state.isWorldMapActive && state.isWorldMapReady && (e.code === 'Space' || e.code === 'Enter')) {
            window.goNextStage();
        }

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

// Mobile Controls Enhancement: Sliding D-Pad ("도로록" feel)
const dPad = document.getElementById('d-pad');
const dPadButtons = document.querySelectorAll('.d-btn');

function handleDPadTouch(e) {
    if (!state.gameActive && !state.isSelectingCharacter) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = dPad.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Reset current keys
    state.keys['ArrowUp'] = false;
    state.keys['ArrowDown'] = false;
    state.keys['ArrowLeft'] = false;
    state.keys['ArrowRight'] = false;

    // Determine direction based on touch position relative to center
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const threshold = 20;

    if (y < centerY - threshold) state.keys['ArrowUp'] = true;
    if (y > centerY + threshold) state.keys['ArrowDown'] = true;
    if (x < centerX - threshold) state.keys['ArrowLeft'] = true;
    if (x > centerX + threshold) state.keys['ArrowRight'] = true;
}

if (dPad) {
    dPad.addEventListener('touchstart', handleDPadTouch);
    dPad.addEventListener('touchmove', handleDPadTouch);
    dPad.addEventListener('touchend', (e) => {
        state.keys['ArrowUp'] = false;
        state.keys['ArrowDown'] = false;
        state.keys['ArrowLeft'] = false;
        state.keys['ArrowRight'] = false;
    });
}

const actionBtn = document.getElementById('action-btn');
if (actionBtn) {
    actionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        state.keys['Space'] = true;
        if (state.isWorldMapReady) window.goNextStage();
    });
    actionBtn.addEventListener('touchend', (e) => { e.preventDefault(); state.keys['Space'] = false; });
}

// Global Start Logic
async function startGame() {
    // Only allow starting if we are on the title screen
    if (state.gameActive || state.isSelectingCharacter) return;

    // [Bug Fix] BGM Startup: Ensure Audio is initialized and BGM starts ASAP
    try {
        await sound.init();
        sound.startBGM('START');
        sound.playConfirm();

        // [New] Mobile: Try to lock orientation to landscape
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(e => console.log("Orientation lock skipped (requires fullscreen):", e));
        }
    } catch (err) {
        console.error("Audio Init Failed:", err);
    }

    state.isTitleScreen = false;

    try {
        const startMsg = document.querySelector('.start-message');
        if (startMsg) startMsg.innerText = "LOADING ADVENTURE...";

        await Promise.all([
            ASSETS.loadAllAssets(),
            new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        document.getElementById('start-screen').classList.add('hidden');
        state.isSelectingCharacter = true;
        state.selectedCharIndex = 0;

        // Smooth transition to select music
        sound.startBGM('SELECT');

    } catch (err) {
        console.error("Asset Load Error:", err);
    }
    window.removeEventListener('click', startGame);

    // [New] Add global click listener for map 'GO'
    window.addEventListener('click', () => {
        if (state.isWorldMapActive && state.isWorldMapReady) {
            window.goNextStage();
        }
    });
}

window.startGame = startGame;
window.addEventListener('click', startGame, { once: true });
window.addEventListener('keydown', (e) => {
    if (!state.gameActive && !state.isSelectingCharacter && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
    }
});

function confirmCharacter() {
    if (state.gameActive) return;

    state.isSelectingCharacter = false;
    state.gameActive = true;
    state.gameOver = false;

    // Apply Character Stats
    const char = CHARACTERS[state.selectedCharIndex];
    state.player.color = char.color;
    state.player.id = char.id;
    state.player.shotDelay = char.shotDelay;

    // UI Update
    document.getElementById('ui-layer').classList.remove('hidden');
    updateLivesUI();
    updateBombUI();
    sound.playGameStart();
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
