import { CONFIG, CHARACTERS, ENEMY_TYPES, STAGE_COMPANION } from './constants.js';
import { BOSS_IMAGES, ENEMY_IMAGES } from './assets.js';
import {
    drawPixelForestV2, drawPixelTotoV2, drawPixelTotoV5, drawPixelLuluV2, drawPixelKakaV2, drawPixelMomoV2, drawPixelPipiV2,
    drawPixelItemV2, drawPixelBombEffectV2, drawPixelSafeGuard,
    drawPixelBossBuzzV2, drawPixelQueenArachne, drawPixelMetalOrochi, drawPixelStormFalcon, drawPixelPhantomMoth,
    drawPixelFlameSalamander, drawPixelJunkAmalgam, drawPixelToxicChimera, drawPixelSkyFortressCore, drawPixelEmperorV,
    drawPixelTotoPortrait, drawPixelLuluPortrait, drawPixelKakaPortrait, drawPixelMomoPortrait, drawPixelPipiPortrait,
    drawPixelFairyPortrait, drawWorldMap, drawBitBee
} from './pixel_art_v2.js';

// --- 전역 헬퍼 함수: 첨부 라퍼런스 기반 원형 도트(Circular Dot) 탄환 렌더링 ---
function drawPixelDotBullet(ctx, radius) {
    ctx.save();
    // 1. 외곽 발광 (주황-빨강색 혼합)
    ctx.fillStyle = '#FF5722';
    // 약간 각진 도트 느낌을 주기 위해 arc 대신 fillRect 활용 (또는 arc로 깔끔하게)
    // 피드백 이미지처럼 완벽한 원/도트에 가까운 형태
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    // 2. 중간 발광 (밝은 주황/노랑)
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 3. 중심 코어 (흰색/매우 밝은 노랑)
    ctx.fillStyle = '#FFFFCC';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

export function draw(ctx, state) {
    if (state.isWorldMapActive) {
        drawWorldMap(ctx, CONFIG, state);
        return;
    }

    drawPixelForestV2(ctx, CONFIG, state);

    // Particles (Visual only)
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    // Bullets with Enhanced Visuals
    state.bullets.forEach(b => {
        if (b.isChargeShot) {
            ctx.save();
            ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
            if (b.type === 'BIT_BEE') drawBitBee(ctx, -b.width / 2, -b.height / 2, b.width, b.height);
            else if (b.type === 'BEE_SWARM') drawPixelTotoV5(ctx, -10, -10, 20, 20);
            else if (b.type === 'METEOR') {
                b.rotation = (b.rotation || 0) + 0.1;
                ctx.rotate(b.rotation);
                ctx.fillStyle = '#5D4037'; ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
                ctx.fillStyle = '#FF7043'; ctx.fillRect(-b.width / 4, -b.height / 4, b.width / 2, b.height / 2);
            } else if (b.type === 'PRISM_LASER') {
                const pulse = Math.sin(Date.now() / 50) * 0.2 + 0.8;
                // [Optimization] ShadowBlur removed - extremely slow in Canvas 2D
                ctx.fillStyle = `rgba(244, 143, 177, ${0.4 * pulse})`;
                ctx.fillRect(-b.width / 2 - 5, -b.height / 2 - 5, b.width + 10, b.height + 10);
                ctx.fillStyle = `rgba(244, 143, 177, ${0.8 * pulse})`;
                ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
                ctx.fillStyle = '#FFF'; ctx.fillRect(-b.width / 2, -5, b.width, 10);
            } else if (b.type === 'SONIC_BOOM') {
                ctx.strokeStyle = '#64FFDA'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.arc(-10, 0, b.height / 2, -Math.PI / 2, Math.PI / 2, false); ctx.stroke();
            } else if (b.type === 'LOVE_BOMB') {
                ctx.fillStyle = b.color;
                ctx.beginPath();
                ctx.moveTo(0, 5); ctx.bezierCurveTo(0, 0, -10, -5, -10, -10);
                ctx.bezierCurveTo(-10, -18, 0, -18, 0, -10); ctx.bezierCurveTo(0, -18, 10, -18, 10, -10);
                ctx.bezierCurveTo(10, -5, 0, 0, 0, 5); ctx.fill();
            } else if (b.type === 'SHIELD_EFFECT') {
                ctx.beginPath(); ctx.strokeStyle = '#FF5252'; ctx.lineWidth = 5;
                ctx.arc(0, 0, 88, 0, Math.PI * 2); ctx.stroke();
                ctx.globalAlpha = 0.3; ctx.fillStyle = '#FFEBEE'; ctx.fill(); ctx.globalAlpha = 1.0;
            }
            ctx.restore();
        } else {
            const charId = state.player.id;
            const bulletColor = b.color || '#fff';
            ctx.save();
            ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
            if (charId === 'toto') {
                ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-10, -8); ctx.lineTo(-10, 8); ctx.fill();
                ctx.fillStyle = '#FFF176'; ctx.fillRect(-10, -3, 20, 6);
            } else if (charId === 'lulu') {
                ctx.fillStyle = '#F48FB1'; ctx.rotate(Date.now() / 100);
                const spikes = 5, outer = 12, inner = 6;
                ctx.beginPath();
                for (let i = 0; i < spikes * 2; i++) {
                    const r = (i % 2 === 0) ? outer : inner; const a = (Math.PI * i) / spikes;
                    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
            } else if (charId === 'kaka') {
                ctx.rotate(Date.now() / 150); ctx.fillStyle = '#5D4037'; ctx.fillRect(-10, -10, 20, 20);
                ctx.fillStyle = '#FF7043'; ctx.fillRect(-6, -6, 12, 12);
            } else if (charId === 'momo') {
                ctx.fillStyle = '#FF5252'; ctx.beginPath();
                ctx.moveTo(0, 5); ctx.bezierCurveTo(0, 0, -10, -5, -10, -10);
                ctx.bezierCurveTo(-10, -18, 0, -18, 0, -10); ctx.bezierCurveTo(0, -18, 10, -18, 10, -10);
                ctx.bezierCurveTo(10, -5, 0, 0, 0, 5); ctx.fill();
            } else if (charId === 'pipi') {
                ctx.fillStyle = '#64FFDA'; ctx.beginPath(); ctx.arc(-5, 0, 12, -Math.PI / 2, Math.PI / 2, false);
                ctx.lineWidth = 3; ctx.strokeStyle = '#64FFDA'; ctx.stroke();
            } else {
                ctx.fillStyle = bulletColor; ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
            }
            ctx.restore();
        }
    });

    state.enemies.forEach(e => {
        if (e.type >= 10 && e.type <= 110) {
            const stage = Math.floor(e.type / 10);
            const types = ['a', 'b', 'c', 'd'];
            const typeLetter = types[e.type % 10];
            const imgKey = `en_stage${stage}_${typeLetter}`;
            const img = ENEMY_IMAGES[imgKey];

            if (img && img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, e.x, e.y, e.width, e.height);
            } else {
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(e.x, e.y, e.width, e.height);
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(e.x, e.y, e.width, e.height);
            }
        }
    });

    state.enemyBullets.forEach(eb => {
        // 모든 적 탄환 색상을 요구사항(원형 도트 발광체)으로 통일
        const radius = (eb.width + eb.height) / 4;
        ctx.save();
        ctx.translate(eb.x + eb.width / 2, eb.y + eb.height / 2);
        drawPixelDotBullet(ctx, radius);
        ctx.restore();
    });
    state.items.forEach(it => drawPixelItemV2(ctx, it.x, it.y, it.type));
    state.bombs.forEach(b => drawPixelBombEffectV2(ctx, b.x, b.y, b.radius, b.alpha, b.charId, b.timer));

    if (state.boss) {
        const b = state.boss;
        const bossSprite = BOSS_IMAGES[`boss_${b.type}_sprite`];
        const bossStatic = BOSS_IMAGES[`boss_${b.type}`];

        if (bossSprite && bossSprite.complete && bossSprite.naturalWidth > 0) {
            const frameIndex = Math.floor(b.timer / 15) % 4;
            if (b.hitTimer > 0 && b.hitTimer % 4 < 2) ctx.globalAlpha = 0.5;

            ctx.save();
            if (b.type === 7) {
                // Flip horizontally (Stage 3 removed)
                ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
                ctx.scale(-1, 1);
                ctx.translate(-(b.x + b.width / 2), -(b.y + b.height / 2));
            }

            ctx.drawImage(bossSprite, frameIndex * 128, 0, 128, 128, b.x, b.y, b.width, b.height);
            ctx.restore();

            ctx.globalAlpha = 1.0;
        } else {
            ctx.save();
            if (b.type === 7) {
                ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
                ctx.scale(-1, 1);
                ctx.translate(-(b.x + b.width / 2), -(b.y + b.height / 2));
            }

            if (b.type === 1) drawPixelBossBuzzV2(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 2) drawPixelQueenArachne(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 3) drawPixelMetalOrochi(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 4) drawPixelStormFalcon(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 5) drawPixelPhantomMoth(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 6) drawPixelFlameSalamander(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 7) drawPixelJunkAmalgam(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 8) drawPixelToxicChimera(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 9) drawPixelSkyFortressCore(ctx, b.x, b.y, b.width, b.height);
            else if (b.type === 10) drawPixelEmperorV(ctx, b.x, b.y, b.width, b.height);
            else drawPixelBossBuzzV2(ctx, b.x, b.y, b.width, b.height);

            ctx.restore();
        }

        const hpBarW = Math.round(CONFIG.SCREEN_WIDTH * 0.3125); const currentW = (b.hp / b.maxHp) * hpBarW;
        const hpBarY = Math.round(CONFIG.SCREEN_HEIGHT * 0.056);
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - hpBarW / 2, hpBarY, hpBarW, 10);
        ctx.fillStyle = '#ff5252'; ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - hpBarW / 2, hpBarY, currentW, 10);
    }

    let shouldDrawPlayer = true;
    if (state.player.invincible) {
        if (state.player.invincibleTime % 10 < 5) shouldDrawPlayer = false;
        drawPixelSafeGuard(ctx, state.player.x, state.player.y, state.player.width, state.player.height);
    }

    if (state.player.chargeValue > 15) {
        const ratio = Math.min(1, state.player.chargeValue / state.player.maxChargeValue);
        ctx.save();
        ctx.translate(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2);
        ctx.beginPath(); ctx.arc(0, 0, (state.player.width * 0.55) * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = ratio === 1 ? '#00e676' : '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-20, 24, 40, 4);
        ctx.fillStyle = ratio === 1 ? '#00e676' : '#fff'; ctx.fillRect(-20, 24, 40 * ratio, 4);
        if (ratio === 1) {
            for (let i = 0; i < 4; i++) {
                const angle = (Date.now() / 100) + (i * Math.PI / 2);
                ctx.fillRect(Math.cos(angle) * 22, Math.sin(angle) * 22, 3, 3);
            }
        }
        ctx.restore();
    }

    if (shouldDrawPlayer) {
        // Always verify function existence before call? Just call safely.
        // Assuming imports
        // ── 플레이어 본체 ──
        if (state.player.id === 'toto') drawPixelTotoV5(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy, state.player);
        else if (state.player.id === 'lulu') drawPixelLuluV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy, state.player);
        else if (state.player.id === 'kaka') drawPixelKakaV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy, state.player);
        else if (state.player.id === 'momo') drawPixelMomoV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy, state.player);
        else if (state.player.id === 'pipi') drawPixelPipiV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy, state.player);
    }

}

