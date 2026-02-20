// ============================================================
// [Presentation Layer] dialogue.js
// 대화 시스템 + 월드맵 시작 로직
// 스테이지별 스토리 대화, 대화 진행, 월드맵 전환
// ============================================================

import { state } from '../state.js';
import { CHARACTERS, STAGE_DIALOGUES } from '../constants.js';

// ── 월드맵 시작 (스테이지 간 전환) ──
export function startWorldMap() {
    state.isWorldMapActive = true;
    state.isWorldMapReady = false;
    state.mapProgress = 0;

    // 맵 진행 자동 애니메이션
    const mapInterval = setInterval(() => {
        state.mapProgress += 0.015;
        if (state.mapProgress >= 1) {
            state.mapProgress = 1;
            clearInterval(mapInterval);
            state.isWorldMapReady = true;
            console.log("Map Journey Complete. Waiting for 'Go' signal.");
        }
    }, 30);
}

// ── 대화 시작 ──
export function startDialogue(stage) {
    if (!STAGE_DIALOGUES[stage]) return;
    state.currentStage = stage;
    state.isDialogueActive = true;
    state.dialogueIndex = 0;
    showNextDialogue();
}

// ── 다음 대화 표시 ──
export function showNextDialogue() {
    const dialogues = STAGE_DIALOGUES[state.currentStage];
    const box = document.getElementById('dialogue-box');

    if (!dialogues || state.dialogueIndex >= dialogues.length) {
        state.isDialogueActive = false;
        if (box) box.classList.add('hidden');
        return;
    }
    const d = dialogues[state.dialogueIndex];
    if (box) {
        box.classList.remove('hidden');
        const charName = CHARACTERS[state.selectedCharIndex]?.name || '또또';
        const displayName = (d.name === '또또') ? charName : d.name;
        box.querySelector('.character-name').innerText = displayName;
        box.querySelector('.text').innerText = d.text.replace(/또또/g, charName);
    }
}

// ── 모바일 대화 진행 헬퍼 (글로벌) ──
window.advanceDialogue = () => {
    if (!state.isDialogueActive) return false;

    // 디바운스 (빠른 스킵 방지)
    const now = Date.now();
    if (now - (state.lastDialogueTime || 0) < 300) {
        return false;
    }
    state.lastDialogueTime = now;

    state.dialogueIndex++;
    showNextDialogue();
    return true;
};
