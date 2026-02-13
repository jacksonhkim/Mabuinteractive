import { state } from './state.js';
import { CONFIG, ENEMY_TYPES, STAGE_ENEMIES, BOSS_DATA } from './constants.js';
import { updateLivesUI, updateBombUI, startEndingSequence } from './ui.js';
import { sound } from './sound.js';

export function updateBackground() {
    state.bgOffset = (state.bgOffset || 0) - 2.5; // Smooth constant scroll
}

export function updatePlayer() {
    let dx = 0;
    let dy = 0;
    if (state.keys['ArrowUp'] || state.keys['KeyW']) dy -= 1;
    if (state.keys['ArrowDown'] || state.keys['KeyS']) dy += 1;
    if (state.keys['ArrowLeft'] || state.keys['KeyA']) dx -= 1;
    if (state.keys['ArrowRight'] || state.keys['KeyD']) dx += 1;

    if (dx !== 0 && dy !== 0) {
        const mag = Math.sqrt(dx * dx + dy * dy);
        dx /= mag;
        dy /= mag;
    }

    state.player.x += dx * CONFIG.PLAYER_SPEED;
    state.player.y += dy * CONFIG.PLAYER_SPEED;
    state.player.vy = dy * CONFIG.PLAYER_SPEED;

    state.player.x = Math.max(0, Math.min(CONFIG.SCREEN_WIDTH - state.player.width, state.player.x));
    state.player.y = Math.max(0, Math.min(CONFIG.SCREEN_HEIGHT - state.player.height, state.player.y));

    if (state.player.invincible) {
        state.player.invincibleTime--;
        if (state.player.invincibleTime <= 0) {
            state.player.invincible = false;
        }
    }

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

    if (state.keys['KeyX'] || state.keys['KeyB']) {
        useBomb();
        state.keys['KeyX'] = false;
        state.keys['KeyB'] = false;
    }
}

export function shoot() {
    const p = state.player;
    let bulletData = { speed: 14, width: 22, height: 6, color: '#fff', vx: 14, vy: 0, damage: 1 };

    if (p.id === 'kaka') {
        bulletData.width = 35; bulletData.height = 12; bulletData.damage = 2; bulletData.color = '#FFD54F';
    } else if (p.id === 'lulu') {
        bulletData.speed = 18; bulletData.vx = 18; bulletData.color = '#F06292';
    } else if (p.id === 'pipi') {
        bulletData.color = '#81C784';
    } else if (p.id === 'momo') {
        bulletData.color = '#D32F2F'; bulletData.width = 28;
    }

    switch (p.powerLevel) {
        case 1:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 3 });
            break;
        case 2:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 12 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 6 });
            break;
        case 3:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 18 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 3 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 12 });
            break;
        case 4:
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 20, vy: -1 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 8 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 2 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 14, vy: 1 });
            break;
        case 5:
            const heavyBullet = { ...bulletData, width: 30, height: 10, color: '#00e676' };
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 25, vy: -2.5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 - 15, vy: -1 });
            state.bullets.push({ ...heavyBullet, x: p.x + p.width, y: p.y + p.height / 2 - 5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 5, vy: 1 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 15, vy: 2.5 });
            state.bullets.push({ ...bulletData, x: p.x + p.width, y: p.y + p.height / 2 + 15, vy: 2.5 });
            break;
    }
    sound.playShot();
}

export function fireCharacterChargeShot() {
    const p = state.player;
    const charId = p.id;
    const level = Math.min(p.powerLevel, 5);

    if (charId === 'toto') {
        const beeCount = 4 + (level * 2); // More bits for Toto
        for (let i = 0; i < beeCount; i++) {
            state.bullets.push({
                x: p.x + p.width / 2, y: p.y + p.height / 2,
                width: 32, height: 32, speed: 8 + Math.random() * 4,
                vx: 2 + Math.random() * 5, vy: (Math.random() - 0.5) * 8, // Slower initial takeoff for better orbit
                color: '#FFD700', isChargeShot: true,
                type: 'BIT_BEE', homing: true, damage: 10 + level * 2,
                hp: 5 + level, // Reduced durability for balance (can hit 2-3 times)
                timer: 0, lifeTime: 300 + level * 60,
                target: null
            });
        }
    } else if (charId === 'lulu') {
        state.bullets.push({
            x: p.x + p.width, y: p.y + p.height / 2, width: CONFIG.SCREEN_WIDTH, height: 30 + (level * 10),
            speed: 50, color: '#F48FB1', isChargeShot: true, type: 'PRISM_LASER', damage: 2 + level,
            duration: 60 + (level * 10), hp: 9999
        });
    } else if (charId === 'kaka') {
        const rockSize = 60 + (level * 25);
        state.bullets.push({
            x: p.x + p.width, y: p.y + p.height / 2 - rockSize / 2, width: rockSize, height: rockSize,
            speed: 8, color: '#5D4037', isChargeShot: true, type: 'METEOR', damage: 50 + (level * 20),
            pierce: true, rotation: 0, hp: 999
        });
    } else if (charId === 'momo') {
        state.player.invincible = true;
        state.player.invincibleTime = 120 + (level * 30);
        state.bullets.push({ x: p.x, y: p.y, width: 0, height: 0, type: 'SHIELD_EFFECT', duration: 60, isChargeShot: true });
        const heartCount = 4 + level * 2;
        for (let i = 0; i < heartCount; i++) {
            const angle = (Math.PI * 2 / heartCount) * i;
            state.bullets.push({
                x: p.x + p.width / 2, y: p.y + p.height / 2, vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15,
                width: 30, height: 30, color: '#FF5252', isChargeShot: true, type: 'LOVE_BOMB', damage: 20 + level * 5
            });
        }
    } else if (charId === 'pipi') {
        const boomHeight = 300 + (level * 50);
        state.bullets.push({
            x: p.x + p.width, y: p.y + p.height / 2 - boomHeight / 2,
            width: 120, height: boomHeight, speed: 35,
            color: '#64FFDA', isChargeShot: true, type: 'SONIC_BOOM',
            damage: 20 + (level * 5), hp: 999
        });
    }
    sound.playExplosion();
}

export function spawnItem(x, y) {
    const rand = Math.random();
    let type = null;
    if (rand < 0.25) type = 'P';
    else if (rand < 0.35) type = 'B';
    if (type) {
        state.items.push({ x, y, startY: y, type, vx: -2, time: 0, width: 40, height: 40 });
    }
}

export function updateItems() {
    for (let i = state.items.length - 1; i >= 0; i--) {
        const item = state.items[i];
        item.time++;
        item.x += item.vx;
        // [Optimization] Fix jitter: use fixed oscillation around startY instead of additive drift
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
                    // [Planning] Max Power Bonus: 2,000 pts
                    state.score += 2000;
                    sound.playItemGet();
                }
            } else if (item.type === 'B') {
                if (p.bombCount < 5) {
                    p.bombCount++;
                    updateBombUI();
                    sound.playItemGet();
                } else {
                    // [Planning] Max Bomb Bonus: 5,000 pts
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

export function useBomb() {
    if (state.player.bombCount <= 0) return;
    state.player.bombCount--;
    updateBombUI();
    state.bombs.push({
        x: state.player.x + state.player.width / 2,
        y: state.player.y + state.player.height / 2,
        radius: 0, maxRadius: 800, alpha: 1.0, timer: 0,
        charId: state.player.id // Store player id for effect
    });
    sound.playExplosion();
}

export function updateBombs() {
    for (let i = state.bombs.length - 1; i >= 0; i--) {
        const b = state.bombs[i];
        b.radius += 20; b.alpha -= 0.02; b.timer++;
        for (let j = state.enemies.length - 1; j >= 0; j--) {
            const en = state.enemies[j];
            const dx = en.x - b.x; const dy = en.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius) {
                state.score += 100;
                createExplosion(en.x + en.width / 2, en.y + en.height / 2, '#ff4444');
                state.enemies.splice(j, 1);
            }
        }
        state.enemyBullets = state.enemyBullets.filter(eb => {
            const dx = eb.x - b.x; const dy = eb.y - b.y;
            return Math.sqrt(dx * dx + dy * dy) > b.radius;
        });
        if (state.boss) {
            const dx = state.boss.x - b.x; const dy = state.boss.y - b.y;
            if (Math.sqrt(dx * dx + dy * dy) < b.radius && b.timer % 5 === 0) {
                state.boss.hp -= 0.5;
            }
        }
        if (b.alpha <= 0) state.bombs.splice(i, 1);
    }
}

export function updateBullets() {
    for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];

        if (b.homing) {
            // Find target if none
            const isTargetAlive = (b.target === state.boss && state.boss && state.boss.hp > 0) || (state.enemies.includes(b.target) && b.target.hp > 0);
            if (!b.target || !isTargetAlive) {
                let minDistSq = 1000000; // Squared distance to avoid Math.sqrt
                let nearest = null;
                state.enemies.forEach(en => {
                    const d2 = (en.x - b.x) ** 2 + (en.y - b.y) ** 2;
                    if (d2 < minDistSq) { minDistSq = d2; nearest = en; }
                });
                if (state.boss) { nearest = state.boss; } // Boss priority
                b.target = nearest;
            }

            if (b.target) {
                const tx = b.target.x + b.target.width / 2;
                const ty = b.target.y + b.target.height / 2;
                const dx = tx - b.x;
                const dy = ty - b.y;
                const angle = Math.atan2(dy, dx);

                // Adaptive steering (Bit Bee Agility)
                const targetVx = Math.cos(angle) * b.speed * 1.8;
                const targetVy = Math.sin(angle) * b.speed * 1.8;

                b.vx = (b.vx || 0) * 0.82 + targetVx * 0.18;
                b.vy = (b.vy || 0) * 0.82 + targetVy * 0.18;
            } else {
                b.vx = (b.vx || b.speed) * 0.95 + 1.0; // Cruise forward
                b.vy = (b.vy || 0) * 0.95;
            }
        }

        b.x += b.vx || b.speed;
        b.y += b.vy || 0;

        if (b.type === 'BIT_BEE') {
            b.timer++;
            if (b.timer > b.lifeTime) {
                state.bullets.splice(i, 1);
                continue;
            }
        }

        if (b.x > CONFIG.SCREEN_WIDTH + 200 || b.x < -200 || b.y < -100 || b.y > CONFIG.SCREEN_HEIGHT + 100) {
            state.bullets.splice(i, 1);
        }
    }
}

export function spawnEnemy() {
    const now = Date.now();
    if (now - state.lastSpawnTime < 1500) return;
    state.lastSpawnTime = now;
    if (state.boss || state.stageCleared) return;

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

export function spawnBoss() {
    const stage = state.currentStage;
    let bossData = BOSS_DATA[stage];
    if (!bossData) bossData = BOSS_DATA[1]; // Fallback

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

export function updateBoss() {
    const b = state.boss;
    if (!b) return;
    b.timer++;
    if (b.hitTimer > 0) b.hitTimer--;

    if (b.state === 'ENTERING') {
        b.x -= 3;
        const entryThreshold = CONFIG.SCREEN_WIDTH - b.width - 50;
        if (b.x <= entryThreshold) b.state = 'BATTLE';
    } else if (b.state === 'BATTLE') {
        b.y += Math.sin(b.timer * 0.05) * 2;
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
        } else if (b.type === 10) { // Emperor V
            // Logic kept simple for brevity as per original
            if (b.hp > b.maxHp * 0.7) { /*...*/ } // Kept in bossShoot
            if (b.timer % 60 === 0) bossShoot(b); // Added trigger for consistency
        }
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

    b.y = Math.max(50, Math.min(CONFIG.SCREEN_HEIGHT - b.height - 50, b.y));

    if (b.phase === 1 && b.hp <= b.maxHp * 0.5) {
        b.phase = 2;
        for (let k = 0; k < 20; k++) {
            createExplosion(b.x + Math.random() * b.width, b.y + Math.random() * b.height, '#ffeb3b');
            createExplosion(b.x + Math.random() * b.width, b.y + Math.random() * b.height, '#9e9e9e');
        }
        sound.playExplosion();
    }

    for (let i = state.bullets.length - 1; i >= 0; i--) {
        const bull = state.bullets[i];
        if (bull.x < b.x + b.width && bull.x + bull.width > b.x &&
            bull.y < b.y + b.height && bull.y + b.height > b.y) {

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
                if (b.type === 10) { state.gameActive = false; startEndingSequence(); return; }
                state.boss = null;
                state.stageCleared = true;
                state.stageTransitionTimer = 180;
                document.getElementById('score').innerText = state.score.toString().padStart(6, '0');
                return;
            }
        }
    }
    if (!state.player.invincible &&
        state.player.x < b.x + b.width && state.player.x + state.player.width > b.x &&
        state.player.y < b.y + b.height && state.player.y + b.height > b.y) {
        playerHit();
    }
}

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

export function bossShoot(boss) {
    const b = boss || state.boss;
    if (b.type === 1) {
        for (let i = 0; i < 3; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -7, vy: (i - 1) * 1.5, width: 12, height: 6, color: '#ff5252' });
        }
    } else if (b.type === 2) {
        for (let i = 0; i < 5; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -5 - Math.random() * 2, vy: (i - 2) * 1.5 + (Math.random() - 0.5), width: 10, height: 10, color: '#aa00ff' });
        }
    } else if (b.type === 3) {
        state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -12, vy: 0, width: 30, height: 8, color: '#00e5ff' });
        state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -8, vy: 3, width: 20, height: 6, color: '#00e5ff' });
        state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -8, vy: -3, width: 20, height: 6, color: '#00e5ff' });
    } else if (b.type === 4) {
        for (let i = 0; i < 5; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -15, vy: (Math.random() - 0.5) * 10, width: 15, height: 4, color: '#cfd8dc' });
        }
    } else if (b.type === 5) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: Math.cos(angle) * 4 - 2, vy: Math.sin(angle) * 4, width: 10, height: 10, color: '#e040fb' });
        }
    } else if (b.type === 6) {
        for (let i = 0; i < 3; i++) {
            state.enemyBullets.push({ x: b.x, y: b.y + 40, vx: -6 - i, vy: (Math.random() - 0.5) * 2, width: 40, height: 10, color: '#ff3d00' });
        }
    } else if (b.type === 7) {
        for (let i = 0; i < 6; i++) {
            state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: (Math.random() - 0.8) * 8, vy: (Math.random() - 0.5) * 8, width: 12, height: 12, color: '#795548' });
        }
    } else if (b.type === 8) {
        for (let i = 0; i < 4; i++) {
            state.enemyBullets.push({ x: b.x + Math.random() * b.width, y: b.y + b.height, vx: -3, vy: 5 + Math.random() * 5, width: 8, height: 14, color: '#76ff03' });
        }
    } else if (b.type === 9) {
        state.enemyBullets.push({ x: b.x, y: b.y + Math.random() * b.height, vx: -5, vy: (state.player.y - (b.y + b.height / 2)) * 0.05, width: 20, height: 8, color: '#ff1744' });
        if (b.timer % 100 === 0) {
            for (let i = 0; i < 4; i++) {
                state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: Math.cos(Math.PI / 2 * i) * 6, vy: Math.sin(Math.PI / 2 * i) * 6, width: 50, height: 50, color: '#cfd8dc' });
            }
        }
    } else if (b.type === 10) {
        if (b.hp > b.maxHp * 0.7) {
            state.enemyBullets.push({ x: b.x, y: b.y + 40, vx: -12, vy: 0, width: 40, height: 10, color: '#ffd600' });
            state.enemyBullets.push({ x: b.x, y: b.y + 100, vx: -12, vy: 0, width: 40, height: 10, color: '#ffd600' });
        } else if (b.hp > b.maxHp * 0.3) {
            for (let i = 0; i < 3; i++) {
                state.enemyBullets.push({ x: b.x, y: b.y + b.height / 2, vx: -10 - Math.random() * 5, vy: (Math.random() - 0.5) * 10, width: 32, height: 8, color: '#e0e0e0' });
            }
        } else {
            for (let i = 0; i < 12; i++) {
                const angle = b.timer * 0.1 + (Math.PI * 2 / 12) * i;
                state.enemyBullets.push({ x: b.x + b.width / 2, y: b.y + b.height / 2, vx: Math.cos(angle) * 6, vy: Math.sin(angle) * 6, width: 10, height: 10, color: '#ff1744' });
            }
        }
    }
}

export function updateEnemyBullets() {
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
        const eb = state.enemyBullets[i];
        eb.x += eb.vx; eb.y += eb.vy;
        if (eb.x < -20 || eb.x > CONFIG.SCREEN_WIDTH + 20 || eb.y < -20 || eb.y > CONFIG.SCREEN_HEIGHT + 20) {
            state.enemyBullets.splice(i, 1);
            continue;
        }
        if (!state.player.invincible &&
            state.player.x < eb.x + eb.width && state.player.x + state.player.width > eb.x &&
            state.player.y < eb.y + eb.height && state.player.y + state.player.height > eb.y) {
            state.enemyBullets.splice(i, 1);
            playerHit();
        }
    }
}

export function updateEnemies() {
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        e.time = (e.time || 0) + 1;

        moveEnemy(e);
        enemyShootLogic(e);

        if (handleEnemyCollisions(e, i)) continue;

        // Out of bounds
        if (e.x + e.width < -150) {
            state.enemies.splice(i, 1);
        }
    }
}

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

function enemyShootLogic(e) {
    let shootInterval = 80 + (Math.random() * 40);
    if (state.currentStage > 3) shootInterval -= 20;

    if (e.time % Math.floor(shootInterval) === 0 && e.x > 100 && e.x < CONFIG.SCREEN_WIDTH) {
        enemyShoot(e);
    }
}

function handleEnemyCollisions(e, index) {
    // 1. Collision with player bullets
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

                // Cleanup bullet
                if (!b.isChargeShot) state.bullets.splice(j, 1);
                return true; // Enemy destroyed
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

    // 2. Collision with player
    if (!state.player.invincible &&
        state.player.x < e.x + e.width && state.player.x + state.player.width > e.x &&
        state.player.y < e.y + e.height && state.player.y + state.player.height > e.y) {
        playerHit();
        return true; // Simple removal or handle damage
    }

    return false;
}

export function enemyShoot(e) {
    const common = { x: e.x, y: e.y + e.height / 2, width: 10, height: 10, color: '#FF5252' };
    switch (e.type) {
        case ENEMY_TYPES.SCOUT_WASP:
            state.enemyBullets.push({ ...common, vx: -7, vy: 0 }); // Faster bullet
            break;
        case ENEMY_TYPES.DANCING_BUTTERFLY:
            // 5-way fan for more challenge
            for (let i = -2; i <= 2; i++) {
                state.enemyBullets.push({ ...common, vx: -5, vy: i * 1.2, color: '#FF4081' });
            }
            break;
        case ENEMY_TYPES.BEETLE:
            // Heavy aimed shot
            const bdx = state.player.x - e.x;
            const bdy = state.player.y - e.y;
            const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
            state.enemyBullets.push({ ...common, vx: (bdx / bdist) * 4, vy: (bdy / bdist) * 4, width: 24, height: 24, color: '#FFD54F' });
            break;
        case ENEMY_TYPES.DRONE:
            // [Optimization] Removed setTimeout - spawning in same frame or handle in state loop
            state.enemyBullets.push({ ...common, vx: -8, vy: 0, color: '#00E5FF' });
            state.enemyBullets.push({ ...common, x: e.x - 30, y: e.y + e.height / 2, vx: -8, vy: 0, color: '#00E5FF' });
            break;
        case ENEMY_TYPES.GHOST:
            // 8-way star burst
            for (let i = 0; i < 8; i++) {
                const ang = (Math.PI / 4) * i;
                state.enemyBullets.push({ ...common, vx: Math.cos(ang) * 5, vy: Math.sin(ang) * 5, color: '#E0E0E0' });
            }
            break;
        case ENEMY_TYPES.SLIME:
            // Triple spread
            for (let i = -1; i <= 1; i++) {
                state.enemyBullets.push({ ...common, vx: -3, vy: i * 3, color: '#8BC34A' });
            }
            break;
        default:
            state.enemyBullets.push({ ...common, vx: -6, vy: 0 });
    }
}


export function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.02;
        if (p.x < -50 || p.x > CONFIG.SCREEN_WIDTH + 50 || p.y < -50 || p.y > CONFIG.SCREEN_HEIGHT + 50 || p.alpha <= 0) {
            state.particles.splice(i, 1);
        }
    }
}

export function createExplosion(x, y, color) {
    const finalColor = color || '#ffffff';
    for (let i = 0; i < 10; i++) {
        state.particles.push({
            x, y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 4 + 2, color: finalColor, alpha: 1.0
        });
    }
}
