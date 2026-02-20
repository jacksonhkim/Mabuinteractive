// ============================================================
// [Services Layer] combat.js
// 전투 시스템 공통 로직
// 총알/폭탄/아이템/파티클 업데이트, 배경 스크롤, 폭발 이펙트
// ============================================================

import { state } from '../state.js';
import { CONFIG } from '../constants.js';
import { updateBombUI } from '../ui.js';
import { sound } from '../sound.js';
import { playerHit } from './shared.js';

// ── 배경 스크롤 ──
export function updateBackground() {
    state.bgOffset = (state.bgOffset || 0) - 2.5;
}

// ── 아이템 스폰 ──
export function spawnItem(x, y) {
    const rand = Math.random();
    let type = null;
    if (rand < 0.25) type = 'P';
    else if (rand < 0.35) type = 'B';
    if (type) {
        state.items.push({ x, y, startY: y, type, vx: -2, time: 0, width: 40, height: 40 });
    }
}

// ── 아이템 업데이트 + 수집 처리 ──
export function updateItems() {
    for (let i = state.items.length - 1; i >= 0; i--) {
        const item = state.items[i];
        item.time++;
        item.x += item.vx;
        item.y = item.startY + Math.sin(item.time * 0.05) * 15;

        const p = state.player;
        if (p.x < item.x + item.width && p.x + p.width > item.x &&
            p.y < item.y + item.height && p.y + p.height > item.y) {

            if (item.type === 'P') {
                if (p.powerLevel < 5) {
                    p.powerLevel++;
                    state.score += 500;
                    sound.playPowerUp();
                } else {
                    state.score += 2000;
                    sound.playItemGet();
                }
            } else if (item.type === 'B') {
                if (p.bombCount < 5) {
                    p.bombCount++;
                    updateBombUI();
                    sound.playItemGet();
                } else {
                    state.score += 5000;
                    sound.playItemGet();
                }
            }
            document.getElementById('score').innerText = state.score.toString().padStart(6, '0');
            state.items.splice(i, 1);
            continue;
        }
        if (item.x < -100) state.items.splice(i, 1);
    }
}

// ── 총알 업데이트 (호밍 + 이동 + 수명 관리) ──
export function updateBullets() {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];

        // 호밍 로직 (BIT_BEE 등)
        if (b.homing) {
            const isTargetAlive = (b.target === state.boss && state.boss && state.boss.hp > 0) || (state.enemies.includes(b.target) && b.target.hp > 0);
            if (!b.target || !isTargetAlive) {
                let minDistSq = 1000000;
                let nearest = null;
                state.enemies.forEach(en => {
                    const d2 = (en.x - b.x) ** 2 + (en.y - b.y) ** 2;
                    if (d2 < minDistSq) { minDistSq = d2; nearest = en; }
                });
                if (state.boss) { nearest = state.boss; } // 보스 우선
                b.target = nearest;
            }

            if (b.target) {
                const tx = b.target.x + b.target.width / 2;
                const ty = b.target.y + b.target.height / 2;
                const dx = tx - b.x;
                const dy = ty - b.y;
                const angle = Math.atan2(dy, dx);

                const targetVx = Math.cos(angle) * b.speed * 1.8;
                const targetVy = Math.sin(angle) * b.speed * 1.8;

                b.vx = (b.vx || 0) * 0.82 + targetVx * 0.18;
                b.vy = (b.vy || 0) * 0.82 + targetVy * 0.18;
            } else {
                b.vx = (b.vx || b.speed) * 0.95 + 1.0;
                b.vy = (b.vy || 0) * 0.95;
            }
        }

        b.x += b.vx || b.speed;
        b.y += b.vy || 0;

        // BIT_BEE 수명 관리
        if (b.type === 'BIT_BEE') {
            b.timer++;
            if (b.timer > b.lifeTime) {
                state.bullets.splice(i, 1);
                continue;
            }
        }

        // 화면 밖 제거
        if (b.x > CONFIG.SCREEN_WIDTH + 200 || b.x < -200 || b.y < -100 || b.y > CONFIG.SCREEN_HEIGHT + 100) {
            state.bullets.splice(i, 1);
        }
    }
}

// ── 폭탄 업데이트 (범위 확장 + 적/보스 데미지) ──
export function updateBombs() {
    for (let i = state.bombs.length - 1; i >= 0; i--) {
        const b = state.bombs[i];
        b.radius += 20; b.alpha -= 0.02; b.timer++;

        // 적 제거
        for (let j = state.enemies.length - 1; j >= 0; j--) {
            const en = state.enemies[j];
            const dx = en.x - b.x; const dy = en.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius) {
                state.score += 100;
                createExplosion(en.x + en.width / 2, en.y + en.height / 2, '#ff4444');
                state.enemies.splice(j, 1);
            }
        }

        // 적 탄막 소거
        state.enemyBullets = state.enemyBullets.filter(eb => {
            const dx = eb.x - b.x; const dy = eb.y - b.y;
            return Math.sqrt(dx * dx + dy * dy) > b.radius;
        });

        // 보스 데미지
        if (state.boss) {
            const dx = state.boss.x - b.x; const dy = state.boss.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius && b.timer % 5 === 0) {
                state.boss.hp -= 0.5;
            }
        }

        if (b.alpha <= 0) state.bombs.splice(i, 1);
    }
}

// ── 적 총알 업데이트 + 플레이어 피격 판정 ──
export function updateEnemyBullets() {
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
        const eb = state.enemyBullets[i];
        eb.x += eb.vx; eb.y += eb.vy;

        // 화면 밖 제거
        if (eb.x < -20 || eb.x > CONFIG.SCREEN_WIDTH + 20 || eb.y < -20 || eb.y > CONFIG.SCREEN_HEIGHT + 20) {
            state.enemyBullets.splice(i, 1);
            continue;
        }

        // 플레이어 피격
        if (!state.player.invincible &&
            state.player.x < eb.x + eb.width && state.player.x + state.player.width > eb.x &&
            state.player.y < eb.y + eb.height && state.player.y + state.player.height > eb.y) {
            state.enemyBullets.splice(i, 1);
            playerHit();
        }
    }
}

// ── 파티클 업데이트 ──
export function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.02;
        if (p.x < -50 || p.x > CONFIG.SCREEN_WIDTH + 50 || p.y < -50 || p.y > CONFIG.SCREEN_HEIGHT + 50 || p.alpha <= 0) {
            state.particles.splice(i, 1);
        }
    }
}

// ── 폭발 이펙트 생성 ──
export function createExplosion(x, y, color) {
    const finalColor = color || '#ffffff';
    for (let i = 0; i < 10; i++) {
        state.particles.push({
            x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 4 + 2, color: finalColor, alpha: 1.0
        });
    }
}
