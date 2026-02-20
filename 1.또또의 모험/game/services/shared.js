// ============================================================
// [Services Layer] shared.js
// 서비스 계층 내 공유 로직 (순환 참조 방지용)
// ============================================================

import { state } from '../state.js';
import { updateLivesUI } from '../ui.js';
import { sound } from '../sound.js';

// ── 플레이어 피격 처리 (공통) ──
export function playerHit() {
    state.lives--;
    updateLivesUI();
    state.player.invincible = true;
    state.player.invincibleTime = 120;
    sound.playExplosion();
    if (state.lives <= 0) {
        state.gameActive = false;
        state.gameOver = true;
    } else {
        state.player.powerLevel = 1;
    }
}
