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
import { startBossDialogue } from '../presentation/dialogue.js';

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
        // 보스 등장 대화 씬 트리거 (등장→대화→전투 플로우)
        startBossDialogue(state.currentStage);
        return;
    }

    const possibleTypes = STAGE_ENEMIES[state.currentStage] || [ENEMY_TYPES.S1_A];
    const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    let w = 64, h = 64, hp = 1, speedBase = 2.0;

    // All Stage Enemies (10 Stages * 4 Types)
    if (type >= 10 && type <= 110) {
        w = 84; h = 84;
        hp = Math.floor(state.currentStage / 2) + 2; // Scaled HP
        speedBase = 1.5 + (state.currentStage * 0.1); // Scaled Speed

        // Custom overrides based on spec types (A=Scout, B=Balanced, C=TankY/Turret, D=Special)
        const typeMod = type % 10;
        if (typeMod === 0) { speedBase *= 1.5; hp *= 0.8; } // Type A: Fast
        if (typeMod === 2) { speedBase *= 0.6; hp *= 2.5; } // Type C: Tank
    }

    const enemy = {
        type: type,
        x: CONFIG.SCREEN_WIDTH + 60,
        y: Math.max(0 + 20, Math.min(CONFIG.SCREEN_HEIGHT - h - 20, Math.random() * (CONFIG.SCREEN_HEIGHT - h))),
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
    // All Stage Enemies (10 Stages * 4 Types: A=0, B=1, C=2, D=3)
    if (e.type >= 10 && e.type <= 110) {
        const stage = Math.floor(e.type / 10);
        const typeMod = e.type % 10;

        if (stage === 2 && typeMod === 1) { // STAGE 2-B: Hanging Spider
            e.x -= e.speed * 0.7;
            e.y = 80 + Math.sin(e.time * 0.05) * 20; // Stay near top
        } else if (stage === 3 && typeMod === 2) { // STAGE 3-C: Jumping Sandworm
            e.x -= e.speed;
            e.y = (CONFIG.SCREEN_HEIGHT - 100) - Math.abs(Math.sin(e.time * 0.05) * 300); // Jump from bottom
        } else if (typeMod === 0) { // TYPE A: Scout (Wavy/Fast)
            e.x -= e.speed;
            e.y += Math.sin(e.time * 0.12) * 3;
        } else if (typeMod === 1) { // TYPE B: Balanced (Straight)
            e.x -= e.speed;
        } else if (typeMod === 2) { // TYPE C: Tank (Slow, steady)
            e.x -= e.speed;
        } else if (typeMod === 3) { // TYPE D: Special (Lurking/Vertical)
            e.x -= e.speed * 0.5;
            e.y += Math.cos(e.time * 0.05) * 4;
        } else {
            e.x -= e.speed;
        }
    } else {
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
    const common = { x: e.x, y: e.y + e.height / 2, width: 16, height: 16, color: '#FF5252' };

    // All Stage Enemies (10 Stages * 4 Types: A=0, B=1, C=2, D=3)
    if (e.type >= 10 && e.type <= 110) {
        const typeMod = e.type % 10;
        if (typeMod === 0) { // TYPE A: Scout (Fast single shot)
            state.enemyBullets.push({ ...common, vx: -8, vy: 0, color: '#FFD54F' });
        } else if (typeMod === 1) { // TYPE B: Balanced (3-way fan)
            for (let i = -1; i <= 1; i++) {
                state.enemyBullets.push({ ...common, vx: -6, vy: i * 1.5, color: '#FF8A65' });
            }
        } else if (typeMod === 2) { // TYPE C: Tank/Turret (Slow aimed heavy)
            const bdx = state.player.x - e.x;
            const bdy = state.player.y - e.y;
            const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
            state.enemyBullets.push({ ...common, vx: (bdx / bdist) * 3, vy: (bdy / bdist) * 3, width: 29, height: 29, color: '#4DB6AC' });
        } else if (typeMod === 3) { // TYPE D: Special (8-way starburst)
            for (let i = 0; i < 8; i++) {
                const ang = (Math.PI / 4) * i;
                state.enemyBullets.push({ ...common, vx: Math.cos(ang) * 4, vy: Math.sin(ang) * 4, color: '#9575CD' });
            }
        } else {
            state.enemyBullets.push({ ...common, vx: -6, vy: 0 });
        }
    } else {
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
            sound.playEnemyHit();

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

