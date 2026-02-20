// ============================================================
// [Services Layer] player.js
// 플레이어 관련 비즈니스 로직
// 이동, 사격, 차지샷, 폭탄 사용, 피격 처리
// ============================================================

import { state } from '../state.js';
import { CONFIG, CHARACTERS } from '../constants.js';
import { updateBombUI } from '../ui.js';
import { sound } from '../sound.js';

// ── 플레이어 업데이트 (이동 + 사격 + 폭탄) ──
export function updatePlayer() {
    let dx = 0;
    let dy = 0;
    if (state.keys['ArrowUp'] || state.keys['KeyW']) dy -= 1;
    if (state.keys['ArrowDown'] || state.keys['KeyS']) dy += 1;
    if (state.keys['ArrowLeft'] || state.keys['KeyA']) dx -= 1;
    if (state.keys['ArrowRight'] || state.keys['KeyD']) dx += 1;

    // 대각선 이동 정규화
    if (dx !== 0 && dy !== 0) {
        const mag = Math.sqrt(dx * dx + dy * dy);
        dx /= mag;
        dy /= mag;
    }

    const charSpeed = CHARACTERS[state.selectedCharIndex]?.speed || 5.0;
    state.player.x += dx * CONFIG.PLAYER_SPEED * (charSpeed / 5.0);
    state.player.y += dy * CONFIG.PLAYER_SPEED * (charSpeed / 5.0);
    state.player.vy = dy * CONFIG.PLAYER_SPEED * (charSpeed / 5.0);

    // 화면 경계 제한
    state.player.x = Math.max(0, Math.min(CONFIG.SCREEN_WIDTH - state.player.width, state.player.x));
    state.player.y = Math.max(0, Math.min(CONFIG.SCREEN_HEIGHT - state.player.height, state.player.y));

    // 무적 타이머
    if (state.player.invincible) {
        state.player.invincibleTime--;
        if (state.player.invincibleTime <= 0) {
            state.player.invincible = false;
        }
    }

    // 사격 + 차지 로직
    if (state.keys['Space']) {
        const now = Date.now();
        state.player.chargeValue++;

        if (state.player.chargeValue < 15) {
            if (now - state.player.lastShotTime > state.player.shotDelay) {
                shoot();
                state.player.lastShotTime = now;
            }
        }
    } else {
        if (state.player.chargeValue >= state.player.maxChargeValue) {
            fireCharacterChargeShot();
        }
        state.player.chargeValue = 0;
    }

    // 폭탄 사용
    if (state.keys['KeyX'] || state.keys['KeyB']) {
        useBomb();
        state.keys['KeyX'] = false;
        state.keys['KeyB'] = false;
    }
}

// ── 일반 사격 (파워레벨별 탄막 패턴) ──
export function shoot() {
    const p = state.player;
    let bulletData = { speed: 14, width: 25, height: 7, color: '#fff', vx: 14, vy: 0, damage: 1 };

    // 캐릭터별 총알 스탯
    if (p.id === 'kaka') {
        bulletData.width = 27; bulletData.height = 9; bulletData.damage = 2; bulletData.color = '#FFD54F';
    } else if (p.id === 'lulu') {
        bulletData.speed = 18; bulletData.vx = 18; bulletData.color = '#F06292';
    } else if (p.id === 'pipi') {
        bulletData.color = '#81C784';
    } else if (p.id === 'momo') {
        bulletData.color = '#D32F2F'; bulletData.width = 22;
    }

    // 파워레벨별 발사 패턴
    switch (p.powerLevel) {
        case 1:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 7 });
            break;
        case 2:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 28 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 14 });
            break;
        case 3:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 42 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 7 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 28 });
            break;
        case 4:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 46, vy: -1.5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 18 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 32, vy: 1.5 });
            break;
        case 5:
            const heavyBullet = { ...bulletData, width: 34, height: 12, color: '#00e676' };
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 58, vy: -3.5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 35, vy: -1.5 });
            state.bullets.push({ ...heavyBullet, x: p.x + p.width, y: p.y + p.height / 2 - 12 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 12, vy: 1.5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 35, vy: 3.5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 35, vy: 3.5 });
            break;
    }
    sound.playShot(p.id);
}

// ── 캐릭터별 차지샷 (궁극기 사격) ──
export function fireCharacterChargeShot() {
    const p = state.player;
    const charId = p.id;
    const level = Math.min(p.powerLevel, 5);

    if (charId === 'toto') {
        // [BIT BEE 소환] — 호밍 펀넬
        const beeCount = 4 + (level * 2);
        for (let i = 0; i < beeCount; i++) {
            state.bullets.push({
                x: p.x + p.width / 2, y: p.y + p.height / 2,
                width: 37, height: 37, speed: 8 + Math.random() * 4,
                vx: 2 + Math.random() * 5, vy: (Math.random() - 0.5) * 8,
                color: '#FFD700', isChargeShot: true,
                type: 'BIT_BEE', homing: true, damage: 10 + level * 2,
                hp: 5 + level,
                timer: 0, lifeTime: 300 + level * 60,
                target: null
            });
        }
    } else if (charId === 'lulu') {
        // [PRISM LASER] — 관통 레이저
        state.bullets.push({
            x: p.x + p.width, y: p.y + p.height / 2, width: CONFIG.SCREEN_WIDTH, height: 35 + (level * 11),
            speed: 50, color: '#F48FB1', isChargeShot: true, type: 'PRISM_LASER', damage: 2 + level,
            duration: 60 + (level * 10), hp: 9999
        });
    } else if (charId === 'kaka') {
        // [METEOR] — 거대 바위
        const rockSize = 69 + (level * 28);
        state.bullets.push({
            x: p.x + p.width, y: p.y + p.height / 2 - rockSize / 2, width: rockSize, height: rockSize,
            speed: 8, color: '#5D4037', isChargeShot: true, type: 'METEOR', damage: 50 + (level * 20),
            pierce: true, rotation: 0, hp: 999
        });
    } else if (charId === 'momo') {
        // [SHIELD + LOVE BOMB] — 방어 + 전방위 공격
        state.player.invincible = true;
        state.player.invincibleTime = 120 + (level * 30);
        state.bullets.push({ x: p.x, y: p.y, width: 0, height: 0, type: 'SHIELD_EFFECT', duration: 60, isChargeShot: true });
        const heartCount = 4 + level * 2;
        for (let i = 0; i < heartCount; i++) {
            const angle = (Math.PI * 2 / heartCount) * i;
            state.bullets.push({
                x: p.x + p.width / 2, y: p.y + p.height / 2, vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15,
                width: 35, height: 35, color: '#FF5252', isChargeShot: true, type: 'LOVE_BOMB', damage: 20 + level * 5
            });
        }
    } else if (charId === 'pipi') {
        // [SONIC BOOM] — 광역 충격파
        const boomHeight = 450 + (level * 75);
        state.bullets.push({
            x: p.x + p.width, y: p.y + p.height / 2 - boomHeight / 2,
            width: 180, height: boomHeight, speed: 35,
            color: '#64FFDA', isChargeShot: true, type: 'SONIC_BOOM',
            damage: 20 + (level * 5), hp: 999
        });
    }
    sound.playChargeShot(charId);
}

// ── 폭탄 사용 ──
export function useBomb() {
    if (state.player.bombCount <= 0) return;
    state.player.bombCount--;
    updateBombUI();
    state.bombs.push({
        x: state.player.x + state.player.width / 2,
        y: state.player.y + state.player.height / 2,
        radius: 0, maxRadius: 800, alpha: 1.0, timer: 0,
        charId: state.player.id
    });
    sound.playExplosion();
}

// ── 플레이어 피격 처리 ──
// [Moved to shared.js to avoid circular dependency]
