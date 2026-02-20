// ============================================================
// [Services Layer] enemies.js
// 적 캐릭터 비즈니스 로직
// 스폰, 이동 AI, 사격 패턴, 충돌 처리
// ============================================================

import { state } from '../state.js';
import { CONFIG, ENEMY_TYPES, STAGE_ENEMIES } from '../constants.js';
import { sound } from '../sound.js';
import { playerHit } from './shared.js';
import { createExplosion, spawnItem } from './combat.js';
import { spawnBoss } from './boss.js';

// ── 적 스폰 ──
export function spawnEnemy() {
    const now = Date.now();
    if (now - state.lastSpawnTime < 1500) return;
    state.lastSpawnTime = now;
    if (state.boss || state.stageCleared) return;

    // 보스 등장 조건
    const bossThreshold = state.stageStartScore + 3000;
    if (state.score >= bossThreshold && !state.boss && !state.bossSpawnedInStage) {
        state.bossSpawnedInStage = true;
        spawnBoss();
        return;
    }

    const possibleTypes = STAGE_ENEMIES[state.currentStage] || [ENEMY_TYPES.SCOUT_WASP];
    const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    let w = 48, h = 48, hp = 1, speedBase = 2.0;

    if (type === ENEMY_TYPES.SCOUT_WASP) { w = 64; h = 48; hp = 2; speedBase = 2.2; }
    else if (type === ENEMY_TYPES.DANCING_BUTTERFLY) { w = 64; h = 64; hp = 1; speedBase = 1.8; }
    else if (type === ENEMY_TYPES.BEETLE) { w = 60; h = 60; hp = 4; speedBase = 1.2; }
    else if (type === ENEMY_TYPES.DRONE) { w = 60; h = 60; hp = 3; speedBase = 2.5; }
    else if (type === ENEMY_TYPES.GHOST) { w = 64; h = 64; hp = 2; speedBase = 1.5; }
    else if (type === ENEMY_TYPES.SLIME) { w = 60; h = 60; hp = 3; speedBase = 1.0; }

    const enemy = {
        type: type,
        x: CONFIG.SCREEN_WIDTH + 60,
        y: Math.random() * (CONFIG.SCREEN_HEIGHT - 120) + 60,
        speed: speedBase * (CONFIG.GAME_SPEED / 1.5),
        width: w, height: h, hp: hp, time: 0
    };
    state.enemies.push(enemy);
}

// ── 적 전체 업데이트 ──
export function updateEnemies() {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        e.time = (e.time || 0) + 1;

        moveEnemy(e);
        enemyShootLogic(e);

        if (handleEnemyCollisions(e, i)) continue;

        // 화면 밖 제거
        if (e.x + e.width < -150) {
            state.enemies.splice(i, 1);
        }
    }
}

// ── 적 이동 AI (타입별 패턴) ──
function moveEnemy(e) {
    switch (e.type) {
        case ENEMY_TYPES.SCOUT_WASP:
            e.x -= e.speed;
            e.y += Math.sin(e.time * 0.1) * 2;
            break;
        case ENEMY_TYPES.DANCING_BUTTERFLY:
            e.x -= e.speed * 0.8;
            e.y += Math.sin(e.time * 0.05) * 5;
            break;
        case ENEMY_TYPES.BEETLE:
            e.x -= e.speed;
            if (Math.floor(e.time / 60) % 2 === 0) e.y += 2;
            else e.y -= 2;
            break;
        case ENEMY_TYPES.DRONE:
            e.x -= e.speed;
            const dy = state.player.y - e.y;
            if (Math.abs(dy) > 5) e.y += (dy > 0 ? 1 : -1) * 1.5;
            break;
        case ENEMY_TYPES.GHOST:
            const cycle = e.time % 120;
            if (cycle < 40) e.x -= e.speed * 3;
            else e.x -= e.speed * 0.5;
            break;
        case ENEMY_TYPES.SLIME:
            e.x -= e.speed;
            e.y += Math.sin(e.time * 0.08) * 8;
            break;
        default:
            e.x -= e.speed;
    }
}

// ── 적 사격 로직 (타이밍 결정) ──
function enemyShootLogic(e) {
    let shootInterval = 80 + (Math.random() * 40);
    if (state.currentStage > 3) shootInterval -= 20;

    if (e.time % Math.floor(shootInterval) === 0 && e.x > 100 && e.x < CONFIG.SCREEN_WIDTH) {
        enemyShoot(e);
    }
}

// ── 적 사격 패턴 (타입별) ──
export function enemyShoot(e) {
    const common = { x: e.x, y: e.y + e.height / 2, width: 12, height: 12, color: '#FF5252' };
    switch (e.type) {
        case ENEMY_TYPES.SCOUT_WASP:
            state.enemyBullets.push({ ...common, vx: -7, vy: 0 });
            break;
        case ENEMY_TYPES.DANCING_BUTTERFLY:
            // 5방향 팬
            for (let i = -2; i <= 2; i++) {
                state.enemyBullets.push({ ...common, vx: -5, vy: i * 1.2, color: '#FF4081' });
            }
            break;
        case ENEMY_TYPES.BEETLE:
            // 조준 사격 (Heavy)
            const bdx = state.player.x - e.x;
            const bdy = state.player.y - e.y;
            const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
            state.enemyBullets.push({ ...common, vx: (bdx / bdist) * 4, vy: (bdy / bdist) * 4, width: 28, height: 28, color: '#FFD54F' });
            break;
        case ENEMY_TYPES.DRONE:
            state.enemyBullets.push({ ...common, vx: -8, vy: 0, color: '#00E5FF' });
            state.enemyBullets.push({ ...common, x: e.x - 30, y: e.y + e.height / 2, vx: -8, vy: 0, color: '#00E5FF' });
            break;
        case ENEMY_TYPES.GHOST:
            // 8방향 스타버스트
            for (let i = 0; i < 8; i++) {
                const ang = (Math.PI / 4) * i;
                state.enemyBullets.push({ ...common, vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5, color: '#E0E0E0' });
            }
            break;
        case ENEMY_TYPES.SLIME:
            // 3방향 스프레드
            for (let i = -1; i <= 1; i++) {
                state.enemyBullets.push({ ...common, vx: -3, vy: i * 3, color: '#8BC34A' });
            }
            break;
        default:
            state.enemyBullets.push({ ...common, vx: -6, vy: 0 });
    }
}

// ── 적-총알/플레이어 충돌 처리 ──
function handleEnemyCollisions(e, index) {
    // 1. 플레이어 총알과 충돌
    for (let j = state.bullets.length - 1; j >= 0; j--) {
        const b = state.bullets[j];
        if (b.x < e.x + e.width && b.x + b.width > e.x &&
            b.y < e.y + e.height && b.y + b.height > e.y) {

            e.hp -= (b.isChargeShot ? 5 : 1);

            if (e.hp <= 0) {
                state.score += 100;
                createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#ff4444');
                sound.playExplosion();
                spawnItem(e.x, e.y);
                document.getElementById('score').innerText = state.score.toString().padStart(6, '0');
                state.enemies.splice(index, 1);

                if (!b.isChargeShot) state.bullets.splice(j, 1);
                return true;
            }

            if (!b.isChargeShot) {
                state.bullets.splice(j, 1);
            } else {
                const hpLoss = (b.type === 'BIT_BEE') ? 2 : 1;
                b.hp -= hpLoss;
                if (b.hp <= 0) state.bullets.splice(j, 1);
            }
        }
    }

    // 2. 플레이어와 직접 충돌
    if (!state.player.invincible &&
        state.player.x < e.x + e.width && state.player.x + state.player.width > e.x &&
        state.player.y < e.y + e.height && state.player.y + state.player.height > e.y) {
        playerHit();
        return true;
    }

    return false;
}

