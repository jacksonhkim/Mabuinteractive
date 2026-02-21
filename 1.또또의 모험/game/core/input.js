// ============================================================
// [Core Layer] input.js
// 입력 처리 시스템 (키보드 + 모바일 터치)
// D-Pad 슬라이딩, 발사/폭탄 버튼, 캐릭터 선택 네비게이션
// ============================================================

import { state } from '../state.js';
import { CONFIG, CHARACTERS } from '../constants.js';
import { sound } from '../sound.js';

// ── 키보드 입력 설정 ──
export function setupKeyboardInput(callbacks) {
    const { confirmCharacter } = callbacks;

    window.addEventListener('keydown', (e) => {
        // 캐릭터 선택 중
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

        // 게임 오버 시 재시작
        if (!state.gameActive && state.gameOver && e.code === 'KeyR') {
            window.handleRestart();
            return;
        }

        // 게임 진행 중
        if (state.gameActive) {
            state.keys[e.code] = true;

            // 월드맵 Go 시그널
            if (state.isWorldMapActive && state.isWorldMapReady && (e.code === 'Space' || e.code === 'Enter')) {
                window.goNextStage();
            }

            // 대화 진행
            if (state.isDialogueActive && (e.code === 'Space' || e.code === 'Enter')) {
                window.advanceDialogue();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (state.gameActive) state.keys[e.code] = false;
    });

    // 포커스 해제 시 키 초기화 (QA Issue #1)
    window.addEventListener('blur', () => {
        state.keys = {};
    });
}

// ── 모바일 D-Pad 설정 ──
export function setupMobileInput(callbacks) {
    const { confirmCharacter } = callbacks;
    const dPad = document.getElementById('d-pad');
    let lastDPadSignal = 0;

    function handleDPadTouch(e) {
        if (!state.gameActive && !state.isSelectingCharacter) return;
        e.preventDefault();

        const touch = e.targetTouches ? e.targetTouches[0] : e.touches[0];
        if (!touch) return;

        const rect = dPad.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // 방향키 초기화
        state.keys['ArrowUp'] = false;
        state.keys['ArrowDown'] = false;
        state.keys['ArrowLeft'] = false;
        state.keys['ArrowRight'] = false;

        // 터치 위치→방향 변환
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const threshold = 20;

        const up = y < centerY - threshold;
        const down = y > centerY + threshold;
        const left = x < centerX - threshold;
        const right = x > centerX + threshold;

        if (state.isSelectingCharacter) {
            handleDPadNavigation(left, right);
        } else {
            state.keys['ArrowUp'] = up;
            state.keys['ArrowDown'] = down;
            state.keys['ArrowLeft'] = left;
            state.keys['ArrowRight'] = right;
        }
    }

    function handleDPadNavigation(left, right) {
        if (Date.now() - lastDPadSignal < 250) return;
        if (left) {
            state.selectedCharIndex = (state.selectedCharIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
            sound.playSelect();
            lastDPadSignal = Date.now();
        } else if (right) {
            state.selectedCharIndex = (state.selectedCharIndex + 1) % CHARACTERS.length;
            sound.playSelect();
            lastDPadSignal = Date.now();
        }
    }

    if (dPad) {
        dPad.addEventListener('touchstart', handleDPadTouch);
        dPad.addEventListener('touchmove', handleDPadTouch);
        dPad.addEventListener('touchend', (e) => {
            if (e.targetTouches && e.targetTouches.length > 0) return;
            state.keys['ArrowUp'] = false;
            state.keys['ArrowDown'] = false;
            state.keys['ArrowLeft'] = false;
            state.keys['ArrowRight'] = false;
        });
        dPad.addEventListener('touchcancel', (e) => {
            if (e.targetTouches && e.targetTouches.length > 0) return;
            state.keys['ArrowUp'] = false;
            state.keys['ArrowDown'] = false;
            state.keys['ArrowLeft'] = false;
            state.keys['ArrowRight'] = false;
        });
    }

    // 발사 버튼
    const btnShot = document.getElementById('btn-shot');
    if (btnShot) {
        btnShot.addEventListener('touchstart', (e) => {
            e.preventDefault();

            if (state.isSelectingCharacter) {
                confirmCharacter();
                return;
            }
            if (state.isDialogueActive) {
                window.advanceDialogue();
                return;
            }

            state.keys['Space'] = true;
            if (state.isWorldMapReady) window.goNextStage();
        });
        btnShot.addEventListener('touchend', (e) => { e.preventDefault(); state.keys['Space'] = false; });
        btnShot.addEventListener('touchcancel', (e) => { e.preventDefault(); state.keys['Space'] = false; });
    }

    // 폭탄 버튼
    const btnBomb = document.getElementById('btn-bomb');
    if (btnBomb) {
        btnBomb.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (state.gameActive && !state.gameOver) {
                state.keys['KeyX'] = true;
            }
        });
        btnBomb.addEventListener('touchend', (e) => {
            e.preventDefault();
            state.keys['KeyX'] = false;
        });
        btnBomb.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            state.keys['KeyX'] = false;
        });
    }
}

// ── 캔버스 초기화 + 리사이즈 ──
export function setupCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    canvas.width = CONFIG.SCREEN_WIDTH;
    canvas.height = CONFIG.SCREEN_HEIGHT;

    function getViewportSize() {
        if (window.visualViewport) {
            return { w: window.visualViewport.width, h: window.visualViewport.height };
        }
        return { w: window.innerWidth, h: window.innerHeight };
    }

    function resizeCanvas() {
        const vp = getViewportSize();
        const vpW = vp.w;
        const vpH = vp.h;
        const scale = Math.min(vpW / CONFIG.SCREEN_WIDTH, vpH / CONFIG.SCREEN_HEIGHT);
        const scaledW = CONFIG.SCREEN_WIDTH * scale;
        const scaledH = CONFIG.SCREEN_HEIGHT * scale;

        canvas.style.width = `${scaledW}px`;
        canvas.style.height = `${scaledH}px`;

        const container = document.getElementById('game-container');
        if (container) {
            container.style.width = `${vpW}px`;
            container.style.height = `${vpH}px`;
        }

        const ui = document.getElementById('ui-layer');
        const startScreen = document.getElementById('start-screen');
        [ui, startScreen].forEach(el => {
            if (el) {
                el.style.width = `${vpW}px`;
                el.style.height = `${vpH}px`;
                el.style.transform = '';
                el.style.transformOrigin = '';
            }
        });
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 100));
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', resizeCanvas);
    }
    resizeCanvas();

    return { canvas, ctx };
}
