// ============================================================
// [Entry Point] game.js
// 게임 엔트리 포인트 — 초기화, 글로벌 함수, 게임 루프
// ============================================================

import { state, resetState } from './state.js';
import { CONFIG, CHARACTERS } from './constants.js';
import { sound } from './sound.js';
import * as ASSETS from './assets.js';
import {
    updateBackground, updatePlayer, updateBullets, spawnEnemy, updateEnemies,
    updateBoss, updateEnemyBullets, updateItems, updateBombs, updateParticles
} from './entities.js?v=bust2';
import {
    drawTitleScreen, drawGameOverScreen, drawStageClear,
    drawCharacterSelectionUI, updateLivesUI, updateBombUI,
    startDialogue, startEndingSequence, startWorldMap
} from './ui.js';
import { draw } from './renderer.js';
import { setupCanvas, setupKeyboardInput, setupMobileInput } from './core/input.js';

// ── 캔버스 초기화 ──
const { canvas, ctx } = setupCanvas();

// ── 글로벌 치트/유틸 노출 ──
window.sound = sound;
window.CONFIG = CONFIG;
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

// ── 치트 시스템 (QA Issue #5) ──
window.gameCheat = function (type) {
    if (!state.gameActive && type !== 'ending') return;

    switch (type) {
        case 'killBoss':
            if (state.boss) { state.boss.hp = 0; console.log("Cheat: Boss Eliminated!"); }
            break;
        case 'maxPower':
            state.player.powerLevel = 5; sound.playPowerUp();
            console.log("Cheat: Max Power Level!");
            break;
        case 'fullBomb':
            state.player.bombCount = 9; updateBombUI(); sound.playItemGet();
            console.log("Cheat: Bombs Refilled!");
            break;
        case 'invincible':
            state.player.invincible = true; state.player.invincibleTime = 999999;
            console.log("Cheat: God Mode ON!");
            break;
        case 'nextStage':
            state.stageCleared = true; state.stageTransitionTimer = 10;
            console.log("Cheat: Skipping Stage...");
            break;
        case 'ending':
            state.gameActive = false; startEndingSequence(ctx);
            console.log("Cheat: Forcing Ending Sequence...");
            break;
    }
};

// ── 재시작 핸들러 ──
window.handleRestart = () => {
    resetState();
    const credits = document.getElementById('ending-credits');
    if (credits) credits.remove();
    const canvasEl = document.getElementById('gameCanvas');
    if (canvasEl) canvasEl.style.display = 'block';

    document.getElementById('ui-layer').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    const hud = document.getElementById('hud');
    if (hud) { hud.style.display = 'flex'; hud.classList.remove('hidden'); }

    sound.startBGM('START');

    window.addEventListener('click', startGame, { once: true });
    window.addEventListener('touchstart', startGame, { once: true });
};

// ── 캐릭터 확정 ──
function confirmCharacter() {
    if (state.gameActive && !state.isContinuing) return;

    const isCont = state.isContinuing;
    state.isSelectingCharacter = false;
    state.gameActive = true;
    state.gameOver = false;
    state.isContinuing = false;

    const char = CHARACTERS[state.selectedCharIndex];
    state.player.color = char.color;
    state.player.id = char.id;
    state.player.shotDelay = char.shotDelay;
    state.player.width = 148;
    state.player.height = 148;

    document.getElementById('ui-layer').classList.remove('hidden');
    const hud = document.getElementById('hud');
    if (hud) hud.classList.remove('hidden');

    if (isCont) {
        state.lives = 3;
        state.player.bombCount = 3;
        state.player.powerLevel = 1;
        state.player.invincible = true;
        state.player.invincibleTime = 120;
        state.player.x = 100;
        state.player.y = 300;
        state.enemies = [];
        state.enemyBullets = [];
        updateLivesUI();
        updateBombUI();
        sound.playConfirm();
        sound.startBGM(`STAGE_${state.currentStage}`);
    } else {
        updateLivesUI();
        updateBombUI();
        sound.playGameStart();
        sound.startBGM(`STAGE_${state.currentStage}`);
        startDialogue(state.currentStage);
    }
}

// ── 입력 설정 (callbacks 주입) ──
const inputCallbacks = { confirmCharacter };
setupKeyboardInput(inputCallbacks);
setupMobileInput(inputCallbacks);

// ── 게임 시작 로직 ──
async function startGame() {
    if (state.gameActive || state.isSelectingCharacter) return;

    try {
        await sound.init();
        sound.startBGM('START');
        sound.playConfirm();

        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(e => console.log("Orientation lock skipped:", e));
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
        document.getElementById('ui-layer').classList.remove('hidden');
        const hud = document.getElementById('hud');
        if (hud) hud.classList.add('hidden');

        state.isSelectingCharacter = true;
        state.selectedCharIndex = 0;

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            const controls = document.getElementById('mobile-controls');
            if (controls) controls.style.display = 'block';
        }

        sound.startBGM('SELECT');

    } catch (err) {
        console.error("Asset Load Error:", err);
    }
    window.removeEventListener('click', startGame);
    window.removeEventListener('touchstart', startGame);

    // 글로벌 액션 리스너 (맵/대화/게임오버 클릭)
    const handleGlobalAction = (e) => {
        if (e.target.closest('.control-group')) return;

        // 월드맵 Go
        if (state.isWorldMapActive && state.isWorldMapReady) {
            if (e.type === 'touchstart' || e.code === 'Space' || e.code === 'Enter') {
                window.goNextStage();
            }
        }

        // 캐릭터 선택 카드 클릭
        if (state.isSelectingCharacter) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = CONFIG.SCREEN_WIDTH / rect.width;
            const scaleY = CONFIG.SCREEN_HEIGHT / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const canvasX = (clientX - rect.left) * scaleX;
            const canvasY = (clientY - rect.top) * scaleY;

            const cardW = Math.round(CONFIG.SCREEN_WIDTH * 0.125);
            const cardH = Math.round(CONFIG.SCREEN_HEIGHT * 0.333);
            const gap = Math.round(CONFIG.SCREEN_WIDTH * 0.016);
            const totalW = CHARACTERS.length * cardW + (CHARACTERS.length - 1) * gap;
            const startX = (CONFIG.SCREEN_WIDTH - totalW) / 2;
            const startY = CONFIG.SCREEN_HEIGHT / 2 - cardH / 2;

            for (let i = 0; i < CHARACTERS.length; i++) {
                const x = startX + i * (cardW + gap);
                const y = startY;

                if (canvasX >= x && canvasX <= x + cardW &&
                    canvasY >= y && canvasY <= y + cardH) {
                    if (state.selectedCharIndex === i) {
                        confirmCharacter();
                    } else {
                        state.selectedCharIndex = i;
                        sound.playSelect();
                    }
                    return;
                }
            }
        }

        // 대화 진행
        if (state.isDialogueActive) {
            window.advanceDialogue();
            return;
        }

        // 게임 오버 버튼 클릭
        if (state.gameOver) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = CONFIG.SCREEN_WIDTH / rect.width;
            const scaleY = CONFIG.SCREEN_HEIGHT / rect.height;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const canvasX = (clientX - rect.left) * scaleX;
            const canvasY = (clientY - rect.top) * scaleY;

            const btnW = Math.round(CONFIG.SCREEN_WIDTH * 0.3125);
            const btnH = Math.round(CONFIG.SCREEN_HEIGHT * 0.083);
            const centerX = CONFIG.SCREEN_WIDTH / 2;
            const centerY = CONFIG.SCREEN_HEIGHT / 2 + CONFIG.SCREEN_HEIGHT * 0.028;

            // Continue 버튼
            if (canvasX >= centerX - btnW / 2 && canvasX <= centerX + btnW / 2 &&
                canvasY >= centerY && canvasY <= centerY + btnH) {
                state.isContinuing = true;
                state.gameOver = false;
                state.isSelectingCharacter = true;
                sound.playConfirm();
                sound.startBGM('SELECT');
                return;
            }

            // Quit 버튼
            const quitY = centerY + btnH + CONFIG.SCREEN_HEIGHT * 0.028;
            if (canvasX >= centerX - btnW / 2 && canvasX <= centerX + btnW / 2 &&
                canvasY >= quitY && canvasY <= quitY + btnH) {
                window.handleRestart();
                return;
            }
        }
    };

    if (window._handleGlobalAction) {
        window.removeEventListener('click', window._handleGlobalAction);
        window.removeEventListener('touchstart', window._handleGlobalAction);
    }
    window._handleGlobalAction = handleGlobalAction;
    window.addEventListener('click', handleGlobalAction);
    window.addEventListener('touchstart', handleGlobalAction);
}

window.startGame = startGame;
window.addEventListener('click', startGame, { once: true });
window.addEventListener('touchstart', startGame, { once: true });
window.addEventListener('keydown', (e) => {
    if (!state.gameActive && !state.isSelectingCharacter && (e.code === 'Space' || e.code === 'Enter')) {
        startGame();
    }
});

// ── 게임 루프 ──
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
                    state.player.x = 100; state.player.y = 300;
                    sound.startBGM(`STAGE_${state.currentStage + 1}`);
                    startWorldMap();
                }
            } else if (!state.isDialogueActive && !state.isWorldMapActive) {
                updateBackground();
                updatePlayer();
                updateBullets();
                spawnEnemy();
                updateEnemies();
                updateBoss();
                updateEnemyBullets();
                updateItems();
                updateBombs();
                updateParticles();

                draw(ctx, state);
            } else {
                draw(ctx, state);
            }

        } else if (state.gameOver) {
            draw(ctx, state);
            drawGameOverScreen(ctx);
        } else {
            drawTitleScreen(ctx);
        }
    } catch (err) {
        console.error("Game Loop Error:", err);
    }
    requestAnimationFrame(gameLoop);
}

// Start Loop
requestAnimationFrame(gameLoop);
