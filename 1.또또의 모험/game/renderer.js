import { CONFIG, CHARACTERS, ENEMY_TYPES, STAGE_DIALOGUES } from './constants.js';
import {
    drawPixelForestV2, drawPixelTotoV2, drawPixelTotoV5, drawPixelLuluV2, drawPixelKakaV2, drawPixelMomoV2, drawPixelPipiV2,
    drawPixelWaspV2, drawPixelButterflyV2, drawPixelBeetleV2, drawPixelDroneV2, drawPixelGhostV2, drawPixelSlimeV2,
    drawPixelItemV2, drawPixelBombEffectV2, drawPixelSafeGuard,
    drawPixelBossBuzzV2, drawPixelQueenArachne, drawPixelMetalOrochi, drawPixelStormFalcon, drawPixelPhantomMoth,
    drawPixelFlameSalamander, drawPixelJunkAmalgam, drawPixelToxicChimera, drawPixelSkyFortressCore, drawPixelEmperorV,
    drawPixelTotoPortrait, drawPixelLuluPortrait, drawPixelKakaPortrait, drawPixelMomoPortrait, drawPixelPipiPortrait,
    drawPixelFairyPortrait, drawWorldMap, drawBitBee
} from './pixel_art_v2.js';

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
                ctx.shadowColor = '#F48FB1'; ctx.shadowBlur = 20 * pulse;
                ctx.fillStyle = `rgba(244, 143, 177, ${0.8 * pulse})`; ctx.fillRect(-b.width / 2, -b.height / 2, b.width, b.height);
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
                ctx.beginPath(); ctx.strokeStyle = '#FF5252'; ctx.lineWidth = 3;
                ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.stroke();
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
        if (e.type === ENEMY_TYPES.SCOUT_WASP) drawPixelWaspV2(ctx, e.x, e.y, e.width, e.height);
        else if (e.type === ENEMY_TYPES.DANCING_BUTTERFLY) {
            const dy = Math.sin(Date.now() / 200) * 2; drawPixelButterflyV2(ctx, e.x, e.y + dy, e.width, e.height);
        }
        else if (e.type === ENEMY_TYPES.BEETLE) drawPixelBeetleV2(ctx, e.x, e.y, e.width, e.height);
        else if (e.type === ENEMY_TYPES.DRONE) drawPixelDroneV2(ctx, e.x, e.y, e.width, e.height);
        else if (e.type === ENEMY_TYPES.GHOST) drawPixelGhostV2(ctx, e.x, e.y, e.width, e.height);
        else if (e.type === ENEMY_TYPES.SLIME) drawPixelSlimeV2(ctx, e.x, e.y, e.width, e.height);
    });

    state.enemyBullets.forEach(eb => {
        ctx.fillStyle = eb.color;
        ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
        // Add a small glow to bullets for better visibility
        ctx.shadowBlur = 4;
        ctx.shadowColor = eb.color;
        ctx.fillRect(eb.x, eb.y, eb.width, eb.height);
        ctx.shadowBlur = 0;
    });
    state.items.forEach(it => drawPixelItemV2(ctx, it.x, it.y, it.type));
    state.bombs.forEach(b => drawPixelBombEffectV2(ctx, b.x, b.y, b.radius, b.alpha, b.charId, b.timer));

    if (state.boss) {
        const b = state.boss;
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

        const hpBarW = 400; const currentW = (b.hp / b.maxHp) * hpBarW;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - hpBarW / 2, 40, hpBarW, 10);
        ctx.fillStyle = '#ff5252'; ctx.fillRect(CONFIG.SCREEN_WIDTH / 2 - hpBarW / 2, 40, currentW, 10);
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
        ctx.beginPath(); ctx.arc(0, 0, (state.player.width * 0.9) * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = ratio === 1 ? '#00e676' : '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-30, 40, 60, 6);
        ctx.fillStyle = ratio === 1 ? '#00e676' : '#fff'; ctx.fillRect(-30, 40, 60 * ratio, 6);
        if (ratio === 1) {
            for (let i = 0; i < 4; i++) {
                const angle = (Date.now() / 100) + (i * Math.PI / 2);
                ctx.fillRect(Math.cos(angle) * 35, Math.sin(angle) * 35, 5, 5);
            }
        }
        ctx.restore();
    }

    if (shouldDrawPlayer) {
        // Always verify function existence before call? Just call safely.
        // Assuming imports handle V2 mapping.
        if (state.player.id === 'toto') drawPixelTotoV5(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy);
        else if (state.player.id === 'lulu') drawPixelLuluV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy);
        else if (state.player.id === 'kaka') drawPixelKakaV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy);
        else if (state.player.id === 'momo') drawPixelMomoV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy);
        else if (state.player.id === 'pipi') drawPixelPipiV2(ctx, state.player.x, state.player.y, state.player.width, state.player.height, state.player.vy);
    }

    if (state.isDialogueActive) {
        const dialogues = STAGE_DIALOGUES[state.currentStage];
        const d = (dialogues && dialogues[state.dialogueIndex]);
        if (d) {
            if (d.name === '또또' || d.name === CHARACTERS[state.selectedCharIndex].name) {
                const charId = state.player.id;
                if (charId === 'toto') drawPixelTotoPortrait(ctx, 200, CONFIG.SCREEN_HEIGHT - 250, 180);
                else if (charId === 'lulu') drawPixelLuluPortrait(ctx, 200, CONFIG.SCREEN_HEIGHT - 250, 180);
                else if (charId === 'kaka') drawPixelKakaPortrait(ctx, 200, CONFIG.SCREEN_HEIGHT - 250, 180);
                else if (charId === 'momo') drawPixelMomoPortrait(ctx, 200, CONFIG.SCREEN_HEIGHT - 250, 180);
                else if (charId === 'pipi') drawPixelPipiPortrait(ctx, 200, CONFIG.SCREEN_HEIGHT - 250, 180);
            } else if (d.name === '요정') {
                drawPixelFairyPortrait(ctx, CONFIG.SCREEN_WIDTH - 200, CONFIG.SCREEN_HEIGHT - 250, 180);
            }
        }
    }
}
