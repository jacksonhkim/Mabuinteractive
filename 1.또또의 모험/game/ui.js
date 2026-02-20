// ============================================================
// [BRIDGE] ui.js
// 리팩토링 브리지 — 새 프레젠테이션 모듈에서 re-export
// 기존 import 호환성을 유지하면서 코드를 분리 모듈로 이전
// ============================================================
// 원본: 371줄 → 3개 모듈로 분리
// - presentation/screens.js   (HUD/타이틀/게임오버/클리어/캐릭터선택)
// - presentation/dialogue.js  (대화 시스템/월드맵 시작)
// - presentation/ending.js    (엔딩 시퀀스/크레딧)
// ============================================================

// ── 화면 + HUD ──
export {
    updateLivesUI, updateBombUI,
    drawTitleScreen, drawGameOverScreen, drawStageClear,
    drawCharacterSelectionUI
} from './presentation/screens.js';

// ── 대화 + 월드맵 ──
export {
    startWorldMap, startDialogue, showNextDialogue
} from './presentation/dialogue.js';

// ── 엔딩 ──
export {
    startEndingSequence, showCreditsScreen
} from './presentation/ending.js';
