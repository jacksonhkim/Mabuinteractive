// ============================================================
// [Presentation Layer] dialogue.js
// 대화 시스템 + 월드맵 시작 로직
// 스테이지별 스토리 대화, 보스 등장 씬 대화, 월드맵 전환
// ============================================================

import { state } from '../state.js';
import { CHARACTERS, STAGE_COMPANION, getStageDialogue, getBossDialogue } from '../constants.js';

// ── 캐릭터 ID → ch_playerN 번호 매핑 ──
const CHAR_TO_PLAYER_NUM = {
    toto: 1, lulu: 2, kaka: 3, momo: 4, pipi: 5
};

// ── 좌측 portrait 이미지 — 발화자(charId) 기반 동적 교체 ──
function updatePortraitBySpeaker(charId) {
    const img = document.getElementById('dialogue-portrait-left');
    if (!img) return;
    const num = CHAR_TO_PLAYER_NUM[charId];
    if (num) {
        img.src = `assets/ch_player${num}.png`;
        img.alt = charId;
        img.style.display = 'block';
    } else {
        // boss 등 매핑 없는 경우 portrait 숨김
        img.src = '';
        img.style.display = 'none';
    }
}

// ── 월드맵 시작 (스테이지 간 전환) ──
export function startWorldMap() {
    state.isWorldMapActive = true;
    state.isWorldMapReady = false;
    state.mapProgress = 0;

    const mapInterval = setInterval(() => {
        state.mapProgress += 0.015;
        if (state.mapProgress >= 1) {
            state.mapProgress = 1;
            clearInterval(mapInterval);
            state.isWorldMapReady = true;
        }
    }, 30);
}

// ── 스테이지 진입 대화 시작 ──
export function startDialogue(stage) {
    const playerId = state.player.id || 'toto';
    const dialogues = getStageDialogue(stage, playerId);
    if (!dialogues || dialogues.length === 0) return;

    state.currentStage = stage;
    state._currentDialogues = dialogues;
    state.isDialogueActive = true;
    state.dialogueIndex = 0;
    showNextDialogue();
}

// ── 보스 등장 대화 씬 시작 ──
export function startBossDialogue(stage) {
    const playerId = state.player.id || 'toto';
    const dialogues = getBossDialogue(stage, playerId);
    if (!dialogues || dialogues.length === 0) return;

    state._bossDialogues = dialogues;
    state.isBossDialogueActive = true;
    state.bossDialogueIndex = 0;

    // BGM 일시 정지
    if (window.sound) window.sound.stopBGM();

    showNextBossDialogue();
}

// ── 보스 대화 다음 줄 표시 ──
export function showNextBossDialogue() {
    const dialogues = state._bossDialogues;
    const box = document.getElementById('boss-dialogue-box');

    if (!dialogues || state.bossDialogueIndex >= dialogues.length) {
        // 대화 종료 → 전투 시작
        state.isBossDialogueActive = false;
        if (box) box.classList.add('hidden');
        // 보스 BGM 재개
        if (window.sound) window.sound.startBGM(`BOSS_${state.currentStage}`);
        return;
    }

    const d = dialogues[state.bossDialogueIndex];
    if (box) {
        box.classList.remove('hidden');
        const nameEl = box.querySelector('.boss-char-name');
        const textEl = box.querySelector('.boss-char-text');
        if (nameEl) {
            nameEl.innerText = d.name;
            // 보스 대사: 빨간 계열, 플레이어 대사: 해당 캐릭터 색상
            const char = CHARACTERS.find(c => c.id === d.charId);
            nameEl.style.color = d.charId === 'boss' ? '#FF5252' : (char?.color || '#FFD700');
        }
        if (textEl) textEl.innerText = d.text;
        // 발화자 방향 표시 (left=플레이어, right=보스)
        box.dataset.side = d.side;
    }
}

// ── 보스 대화 진행 ──
window.advanceBossDialogue = () => {
    if (!state.isBossDialogueActive) return false;

    const now = Date.now();
    if (now - (state.lastBossDialogueTime || 0) < 300) return false;
    state.lastBossDialogueTime = now;

    state.bossDialogueIndex++;
    showNextBossDialogue();
    return true;
};

// ── 스테이지 대화 다음 줄 표시 ──
export function showNextDialogue() {
    const dialogues = state._currentDialogues;
    const box = document.getElementById('dialogue-box');

    if (!dialogues || state.dialogueIndex >= dialogues.length) {
        state.isDialogueActive = false;
        if (box) box.classList.add('hidden');
        return;
    }

    const d = dialogues[state.dialogueIndex];
    if (box) {
        box.classList.remove('hidden');
        const nameEl = box.querySelector('.character-name');
        const textEl = box.querySelector('.text');

        if (nameEl) {
            nameEl.innerText = d.name;
            // 캐릭터 고유 색상 적용
            const char = CHARACTERS.find(c => c.id === d.charId);
            nameEl.style.color = char?.color || '#FFD700';
        }
        if (textEl) textEl.innerText = d.text;

        // 발화자에 맞게 좌측 portrait 이미지 동적 교체
        updatePortraitBySpeaker(d.charId);
    }
}

// ── 모바일/글로벌 대화 진행 헬퍼 ──
window.advanceDialogue = () => {
    if (!state.isDialogueActive) return false;

    const now = Date.now();
    if (now - (state.lastDialogueTime || 0) < 300) return false;
    state.lastDialogueTime = now;

    state.dialogueIndex++;
    showNextDialogue();
    return true;
};

