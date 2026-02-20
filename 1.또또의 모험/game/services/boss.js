// ============================================================
// [Services Layer] boss.js
// 보스 비즈니스 로직
// 스폰, AI 상태머신, 사격 패턴, 충돌 판정
// ============================================================

import { state } from '../state.js';
import { CONFIG, BOSS_DATA } from '../constants.js';
import { startEndingSequence } from '../ui.js';
import { sound } from '../sound.js';
import { playerHit } from './shared.js';
import { createExplosion } from './combat.js';

// ── 보스 스폰 ──
export function spawnBoss() {
    const stage = state.currentStage;
    let bossData = BOSS_DATA[stage];
    if (!bossData) bossData = BOSS_DATA[1]; // 폴백

    state.boss = {
        ...bossData,
        x: CONFIG.SCREEN_WIDTH + 100,
        y: CONFIG.SCREEN_HEIGHT / 2 - 50,
        state: 'ENTERING',
        timer: 0,
        hitTimer: 0,
        phase: 1
    };
}

// ── 보스 AI 상태머신 업데이트 ──
export function updateBoss() {
    const b = state.boss;
    if (!b) return;
    b.timer++;
    if (b.hitTimer > 0) b.hitTimer--;

    // == 진입 상태 ==
    if (b.state === 'ENTERING') {
        b.x -= 3;
        const entryThreshold = CONFIG.SCREEN_WIDTH - b.width - 50;
        if (b.x <= entryThreshold) b.state = 'BATTLE';

        // == 전투 상태 (보스 타입별 AI) ==
    } else if (b.state === 'BATTLE') {
        b.y += Math.sin(b.timer * 0.05) * 2;
        updateBossAI(b);

        // == 특수 상태들 ==
    } else if (b.state === 'DASH_PREP') {
        b.prepTimer--;
        b.x += 1;
        if (b.prepTimer <= 0) { b.state = 'DASH'; b.dashTimer = 40; }
    } else if (b.state === 'DASH') {
        b.x -= 20; b.dashTimer--;
        if (b.dashTimer <= 0 || b.x < -b.width) { b.state = 'RETURN'; }
    } else if (b.state === 'RETURN') {
        b.x += 10;
        const targetX = CONFIG.SCREEN_WIDTH - b.width - 50;
        if (b.x >= targetX) { b.x = targetX; b.state = 'BATTLE'; }
    } else if (b.state === 'WEB_ATTACK') {
        b.prepTimer--;
        if (b.prepTimer % 10 === 0) bossShoot(b);
        if (b.prepTimer <= 0) b.state = 'BATTLE';
    }

    // Y좌표 경계 제한
    b.y = Math.max(50, Math.min(CONFIG.SCREEN_HEIGHT - b.height - 50, b.y));

    // 페이즈 전환 (HP 50% 이하)
    if (b.phase === 1 && b.hp <= b.maxHp * 0.5) {
        b.phase = 2;
        for (let k = 0; k < 20; k++) {
            createExplosion(b.x + Math.random() * b.width, b.y + Math.random() * b.height, '#ffeb3b');
            createExplosion(b.x + Math.random() * b.width, b.y + Math.random() * b.height, '#9e9e9e');
        }
        sound.playExplosion();
    }

    // == 총알-보스 충돌 ==
    handleBossBulletCollisions(b);

    // == 플레이어-보스 충돌 ==
    if (!state.player.invincible &&
        state.player.x < b.x + b.width && state.player.x + state.player.width > b.x &&
        state.player.y < b.y + b.height && state.player.y + b.height > b.y) {
        playerHit();
    }
}

// ── 보스 타입별 AI 패턴 ──
function updateBossAI(b) {
    if (b.type === 1) {
        if (b.timer % 120 === 0) bossShoot(b);
        if (b.timer % 400 === 0) { b.state = 'DASH_PREP'; b.prepTimer = 60; }
    } else if (b.type === 2) {
        b.y = (CONFIG.SCREEN_HEIGHT / 2 - 50) + Math.sin(b.timer * 0.02) * 150;
        if (b.timer % 90 === 0) bossShoot(b);
        if (b.timer % 500 === 0) { b.state = 'WEB_ATTACK'; b.prepTimer = 100; }
    } else if (b.type === 3) {
        const centerX = CONFIG.SCREEN_WIDTH - b.width - 50;
        const centerY = CONFIG.SCREEN_HEIGHT / 2 - b.height / 2;
        b.x = centerX + Math.cos(b.timer * 0.03) * 100;
        b.y = centerY + Math.sin(b.timer * 0.04) * 150;
        if (b.timer % 60 === 0) bossShoot(b);
    } else if (b.type === 4) {
        b.x -= 5;
        if (b.x < -b.width) b.x = CONFIG.SCREEN_WIDTH;
        b.y = (CONFIG.SCREEN_HEIGHT / 2 - b.height / 2) + Math.sin(b.timer * 0.1) * 250;
        if (b.timer % 40 === 0) bossShoot(b);
    } else if (b.type === 5) {
        b.y = (CONFIG.SCREEN_HEIGHT / 2 - b.height / 2) + Math.cos(b.timer * 0.05) * 150;
        if (b.timer % 120 === 0) bossShoot(b);
    } else if (b.type === 6) {
        b.y = CONFIG.SCREEN_HEIGHT - b.height - 20;
        const centerX = CONFIG.SCREEN_WIDTH - b.width - 100;
        b.x = centerX + Math.sin(b.timer * 0.02) * 150;
        if (b.timer % 90 === 0) bossShoot(b);
    } else if (b.type === 7) {
        b.x -= 0.3;
        b.y = (CONFIG.SCREEN_HEIGHT / 2 - b.height / 2) + Math.sin(b.timer * 0.03) * 100;
        if (b.timer % 80 === 0) bossShoot(b);
    } else if (b.type === 8) {
        const targetX = CONFIG.SCREEN_WIDTH - b.width - 100;
        const corners = [{ x: targetX, y: 100 }, { x: targetX, y: CONFIG.SCREEN_HEIGHT - b.height - 100 }];
        const target = corners[Math.floor((b.timer / 300) % 2)];
        b.x += (target.x - b.x) * 0.02;
        b.y += (target.y - b.y) * 0.02;
        if (b.timer % 70 === 0) bossShoot(b);
    } else if (b.type === 9) {
        b.x = CONFIG.SCREEN_WIDTH - b.width - 50;
        b.y = CONFIG.SCREEN_HEIGHT / 2 - b.height / 2 + (Math.random() - 0.5) * 10;
        if (b.timer % 50 === 0) bossShoot(b);
    } else if (b.type === 10) {
        if (b.timer % 60 === 0) bossShoot(b);
    }
}

// ── 보스 사격 패턴 (타입별) ──
export function bossShoot(boss) {
    const b = boss || state.boss;
    if (b.type === 1) {
        for (let i = 0; i < 3; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -7, vy: (i - 1) * 1.5, width: 15, height: 8, color: '#ff5252' });
        }
    } else if (b.type === 2) {
        for (let i = 0; i < 5; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -5 - Math.random() * 2, vy: (i - 2) * 1.5 + (Math.random() - 0.5), width: 12, height: 12, color: '#aa00ff' });
        }
    } else if (b.type === 3) {
        state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -12, vy: 0, width: 36, height: 10, color: '#00e5ff' });
        state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -8, vy: 3, width: 24, height: 8, color: '#00e5ff' });
        state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -8, vy: -3, width: 24, height: 8, color: '#00e5ff' });
    } else if (b.type === 4) {
        for (let i = 0; i < 5; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -15, vy: (Math.random() - 0.5) * 10, width: 18, height: 5, color: '#cfd8dc' });
        }
    } else if (b.type === 5) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: Math.cos(angle) * 4 - 2, vy: Math.sin(angle) * 4, width: 12, height: 12, color: '#e040fb' });
        }
    } else if (b.type === 6) {
        for (let i = 0; i < 3; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + 40, vx: -6 - i, vy: (Math.random() - 0.5) * 2, width: 48, height: 12, color: '#ff3d00' });
        }
    } else if (b.type === 7) {
        for (let i = 0; i < 6; i++) {
            state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: (Math.random() - 0.8) * 8, vy: (Math.random() - 0.5) * 8, width: 14, height: 14, color: '#795548' });
        }
    } else if (b.type === 8) {
        for (let i = 0; i < 4; i++) {
            state.enemyBullets.push({ x: b.x + Math.random() * b.width, y: b.y + b.height, vx: -3, vy: 5 + Math.random() * 5, width: 10, height: 16, color: '#76ff03' });
        }
    } else if (b.type === 9) {
        state.enemyBullets.push({ x: b.x, y: b.y + Math.random() * b.height, vx: -5, vy: (state.player.y - (b.y + b.height / 2)) * 0.05, width: 24, height: 10, color: '#ff1744' });
        if (b.timer % 100 === 0) {
            for (let i = 0; i < 4; i++) {
                state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: Math.cos(Math.PI / 2 * i) * 6, vy: Math.sin(Math.PI / 2 * i) * 6, width: 60, height: 60, color: '#cfd8dc' });
            }
        }
    } else if (b.type === 10) {
        if (b.hp > b.maxHp * 0.7) {
            state.enemyBullets.push({ x: b.x, y: b.y + 40, vx: -12, vy: 0, width: 48, height: 12, color: '#ffd600' });
            state.enemyBullets.push({ x: b.x, y: b.y + 100, vx: -12, vy: 0, width: 48, height: 12, color: '#ffd600' });
        } else if (b.hp > b.maxHp * 0.3) {
            for (let i = 0; i < 3; i++) {
                state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -10 - Math.random() * 5, vy: (Math.random() - 0.5) * 10, width: 38, height: 10, color: '#e0e0e0' });
            }
        } else {
            for (let i = 0; i < 12; i++) {
                const angle = b.timer * 0.1 + (Math.PI * 2 / 12) * i;
                state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6, width: 12, height: 12, color: '#ff1744' });
            }
        }
    }
}

// ── 보스-총알 충돌 처리 ──
function handleBossBulletCollisions(b) {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
        const bull = state.bullets[i];
        if (bull.x < b.x + b.width && bull.x + bull.width > b.x &&
            bull.y < b.y + b.height && bull.y + bull.height > b.y) {

            if (b.hitTimer && b.hitTimer > 0) continue;
            const damage = bull.isChargeShot ? 10 : 1;
            b.hp -= damage;
            b.hitTimer = 10;

            if (!bull.isChargeShot) state.bullets.splice(i, 1);
            else {
                const hpLoss = (bull.type === 'BIT_BEE') ? 2 : 1;
                bull.hp -= hpLoss;
                if (bull.hp <= 0) state.bullets.splice(i, 1);
            }

            createExplosion(bull.x, bull.y, '#fff');

            if (b.hp <= 0) {
                state.score += 5000;
                createExplosion(b.x + b.width / 2, b.y + b.height / 2, '#ffcc00');
                // 최종 보스 처치 시 엔딩
                if (b.type === 10) {
                    state.gameActive = false;
                    const cvs = document.getElementById('gameCanvas');
                    startEndingSequence(cvs.getContext('2d'));
                    return;
                }
                state.boss = null;
                state.stageCleared = true;
                state.stageTransitionTimer = 180;
                document.getElementById('score').innerText = state.score.toString().padStart(6, '0');
                return;
            }
        }
    }
}
