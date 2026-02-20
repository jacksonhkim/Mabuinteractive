// ============================================================
// [Graphics Layer] pixel_effects.js
// 이펙트, 아이템, 보호막, UI 초상화, 캐릭터 선택 그래픽
// 게임 내 시각 이펙트 및 UI 관련 렌더링 함수 모음
// ============================================================

import { drawRect, drawHexagon, drawStar, drawHeart } from './pixel_helpers.js';
import {
    drawPixelTotoV5, drawPixelLuluV2, drawPixelKakaV2,
    drawPixelMomoV2, drawPixelPipiV2
} from './pixel_hero.js';

// ── 아이템 렌더링 (P=파워업, B=폭탄) ──
export function drawPixelItemV2(ctx, x, y, type) {
    const t = Date.now() / 1000;
    const hover = Math.sin(t * 5) * 5;
    const size = 32;

    ctx.save();
    ctx.translate(x + size / 2, y + size / 2 + hover);

    // 외곽 광채
    const pulse = (Math.sin(t * 10) + 1) / 2;
    ctx.shadowBlur = 10 + pulse * 10;
    ctx.shadowColor = type === 'P' ? '#ffeb3b' : (type === 'B' ? '#00e5ff' : '#76ff03');

    // 아이템 박스
    drawRect(ctx, -16, -16, 32, 32, '#212121');
    drawRect(ctx, -14, -14, 28, 28, type === 'P' ? '#fbc02d' : (type === 'B' ? '#00b0ff' : '#43a047'));

    // 텍스트 심볼
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type, 0, 0);

    ctx.restore();
}

// ── 보호막 오라 (무적 상태) ──
export function drawPixelSafeGuard(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const radius = w * 0.8;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t);

    // 육각형 배리어
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const ang = (Math.PI * 2 / 6) * i;
        const px = Math.cos(ang) * radius;
        const py = Math.sin(ang) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    // 내부 광채
    ctx.globalAlpha = 0.2 + Math.sin(t * 10) * 0.1;
    ctx.fillStyle = '#00e5ff';
    ctx.fill();

    ctx.restore();
}

// ── 폭탄 이펙트 (캐릭터별 궁극기) ──
// 각 캐릭터의 고유 폭탄 연출을 렌더링
export function drawPixelBombEffectV2(ctx, x, y, radius, alpha, charId = 'toto', timer = 0) {
    ctx.save();
    const stageWidth = 1280;
    const stageHeight = 720;

    // 화면 흔들림
    if (timer < 30) {
        const shake = 15 * (1 - timer / 30);
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    ctx.globalCompositeOperation = 'lighter';

    if (charId === 'toto') {
        // [GIGA STINGER BUSTER] — 플라즈마 빔
        ctx.globalAlpha = Math.min(1, alpha * 2);
        const beamH = 180 + Math.sin(timer * 0.4) * 60;

        const outerGrad = ctx.createLinearGradient(0, y - beamH, 0, y + beamH);
        outerGrad.addColorStop(0, 'rgba(255, 111, 0, 0)');
        outerGrad.addColorStop(0.5, 'rgba(255, 214, 0, 0.3)');
        outerGrad.addColorStop(1, 'rgba(255, 111, 0, 0)');
        ctx.fillStyle = outerGrad;
        ctx.fillRect(0, y - beamH, stageWidth, beamH * 2);

        const innerGrad = ctx.createLinearGradient(0, y - beamH / 2, 0, y + beamH / 2);
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        innerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGrad;
        ctx.fillRect(0, y - beamH / 2, stageWidth, beamH);

        ctx.strokeStyle = '#FFEA00'; ctx.lineWidth = 5;
        for (let i = 0; i < 6; i++) {
            const hx = ((timer * 25) + (i * 250)) % (stageWidth + 400) - 200;
            ctx.globalAlpha = alpha * 0.6;
            drawHexagon(ctx, hx, y, 120 + Math.sin(timer * 0.1) * 30);
        }

    } else if (charId === 'lulu') {
        // [ETERNAL STARLIGHT PILLAR] — 마법진 + 빛기둥
        ctx.globalAlpha = alpha;

        ctx.strokeStyle = 'rgba(240, 98, 146, 0.8)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(stageWidth / 2, stageHeight / 2, 350, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(stageWidth / 2, stageHeight / 2, 320, 0, Math.PI * 2); ctx.stroke();

        ctx.save();
        ctx.translate(stageWidth / 2, stageHeight / 2);
        ctx.rotate(timer * 0.02);
        for (let i = 0; i < 8; i++) {
            const rot = (Math.PI * 2 / 8) * i;
            ctx.fillStyle = '#F48FB1';
            ctx.font = 'bold 20px serif';
            ctx.fillText("✨", Math.cos(rot) * 280, Math.sin(rot) * 280);
        }
        ctx.restore();

        for (let i = 0; i < 8; i++) {
            const px = (i * 180 + (timer * 3)) % stageWidth;
            const pAlpha = 0.4 + Math.sin(timer * 0.15 + i) * 0.4;
            const pGrad = ctx.createLinearGradient(px, 0, px + 120, 0);
            pGrad.addColorStop(0, 'rgba(255, 200, 255, 0)');
            pGrad.addColorStop(0.5, `rgba(255, 255, 255, ${pAlpha})`);
            pGrad.addColorStop(1, 'rgba(255, 200, 255, 0)');
            ctx.fillStyle = pGrad;
            ctx.fillRect(px, 0, 120, stageHeight);

            for (let j = 0; j < 8; j++) {
                const py = ((timer * 15) + (j * 120)) % stageHeight;
                ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
                drawStar(ctx, px + 60 + Math.sin(timer * 0.1 + j) * 30, py, 4, 15, 4);
            }
        }

    } else if (charId === 'kaka') {
        // [EARTH-SHAKER] — 지진 + 파편
        ctx.globalAlpha = alpha;

        if (timer < 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, 0, stageWidth, stageHeight);
        }

        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(141, 110, 99, ${alpha})`;
            ctx.lineWidth = 15;
            ctx.beginPath(); ctx.arc(x, y, radius * (0.5 + i * 0.25), 0, Math.PI * 2); ctx.stroke();
        }

        for (let i = 0; i < 25; i++) {
            const angle = (i * Math.PI * 2 / 25) + timer * 0.08;
            const dist = timer * 30 + (i % 3) * 50;
            const rx = x + Math.cos(angle) * dist;
            const ry = y + Math.sin(angle) * dist;
            ctx.save();
            ctx.translate(rx, ry);
            ctx.rotate(timer * 0.15);
            const rockSize = 30 + (i % 5) * 10;
            ctx.fillStyle = (i % 2 === 0) ? '#4E342E' : '#212121';
            ctx.fillRect(-rockSize / 2, -rockSize / 2, rockSize, rockSize);
            ctx.fillStyle = '#FF3D00';
            ctx.fillRect(rockSize / 4, rockSize / 4, 5, 5);
            ctx.restore();
        }

    } else if (charId === 'momo') {
        // [LOVE NOVA] — 하트 폭풍
        ctx.globalAlpha = alpha;

        const coreSize = radius * (1 + Math.sin(timer * 0.2) * 0.1);
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreSize);
        coreGrad.addColorStop(0, '#FFF');
        coreGrad.addColorStop(0.5, '#FF5252');
        coreGrad.addColorStop(1, 'rgba(255, 82, 82, 0)');
        ctx.fillStyle = coreGrad;
        drawHeart(ctx, x, y, coreSize);

        for (let i = 0; i < 30; i++) {
            const rot = (timer * 0.15) + (i * Math.PI * 2 / 30);
            const dist = radius * 0.8 + Math.sin(timer * 0.1 + i) * 100;
            ctx.save();
            ctx.translate(x + Math.cos(rot) * dist, y + Math.sin(rot) * dist);
            ctx.rotate(rot + Math.PI / 2);
            ctx.fillStyle = (i % 2 === 0) ? '#F8BBD0' : '#FFEBEE';
            drawHeart(ctx, 0, 0, 20 + (i % 5) * 5);
            ctx.restore();
        }

    } else if (charId === 'pipi') {
        // [TORNADO VORTEX] — 토네이도 + 번개
        ctx.globalAlpha = alpha;

        const drawHurricane = (hx, hy, scale, rotSpeed) => {
            ctx.save();
            ctx.translate(hx, hy);
            ctx.scale(scale, scale);
            ctx.rotate(timer * rotSpeed);
            for (let i = 0; i < 10; i++) {
                const r = 30 + i * 20 + Math.sin(timer * 0.3 + i) * 15;
                ctx.strokeStyle = `rgba(178, 235, 242, ${0.8 - i * 0.05})`;
                ctx.lineWidth = 3 + i;
                ctx.beginPath();
                ctx.ellipse(0, 0, r, r / 4, i * 0.5, 0, Math.PI * 2);
                ctx.stroke();

                if (Math.random() > 0.8) {
                    ctx.strokeStyle = '#FFF';
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo((Math.random() - 0.5) * r, (Math.random() - 0.5) * r);
                    ctx.stroke();
                }
            }
            ctx.restore();
        };

        drawHurricane(stageWidth / 2 + Math.cos(timer * 0.03) * 350, stageHeight / 2 + Math.sin(timer * 0.04) * 250, 1.8, 0.05);
        drawHurricane(stageWidth - 300 + Math.sin(timer * 0.05) * 150, 250, 1.2, -0.08);
        drawHurricane(300, stageHeight - 250 + Math.cos(timer * 0.02) * 200, 1.4, 0.06);

        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 40; i++) {
            const ly = (i * 20 + timer * 25) % stageHeight;
            const lx = (Math.sin(ly * 0.01 + timer * 0.1) * 200) + stageWidth / 2;
            ctx.fillRect(lx, ly, 4, 4);
        }
    }
    ctx.restore();
}

// ── 캐릭터 초상화 (대화 시스템용) ──

export function drawPixelTotoPortrait(ctx, x, y, size = 120) {
    ctx.save();
    ctx.translate(x, y);
    drawPixelTotoV5(ctx, -size / 2, -size / 2, size, size, 0);
    ctx.restore();
}

export function drawPixelLuluPortrait(ctx, x, y, size = 120) {
    ctx.save();
    ctx.translate(x, y);
    drawPixelLuluV2(ctx, -size / 2, -size / 2, size, size);
    ctx.restore();
}

export function drawPixelKakaPortrait(ctx, x, y, size = 120) {
    ctx.save();
    ctx.translate(x, y);
    drawPixelKakaV2(ctx, -size / 2, -size / 2, size, size);
    ctx.restore();
}

export function drawPixelMomoPortrait(ctx, x, y, size = 120) {
    ctx.save();
    ctx.translate(x, y);
    drawPixelMomoV2(ctx, -size / 2, -size / 2, size, size);
    ctx.restore();
}

export function drawPixelPipiPortrait(ctx, x, y, size = 120) {
    ctx.save();
    ctx.translate(x, y);
    drawPixelPipiV2(ctx, -size / 2, -size / 2, size, size);
    ctx.restore();
}

export function drawPixelFairyPortrait(ctx, x, y, size = 120) {
    ctx.save();
    ctx.translate(x, y);
    const t = Date.now() / 1000;
    ctx.fillStyle = 'rgba(129, 212, 250, 0.6)';
    const flap = Math.sin(t * 10) * 10;
    ctx.beginPath(); ctx.ellipse(-20, -10, 30 + flap, 15, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(20, -10, 30 + flap, 15, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath(); ctx.arc(0, 0, size / 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

// ── 분기 선택 UI (스토리 분기점) ──
export function drawBranchSelectionUI(ctx, CONFIG, state) {
    const cx = CONFIG.SCREEN_WIDTH / 2;
    const cy = CONFIG.SCREEN_HEIGHT / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText("CHOOSE YOUR PATH", cx, cy - 150);

    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText("[1] FOREST OF DAY", cx - 250, cy);
    ctx.fillText("[2] FOREST OF NIGHT", cx + 250, cy);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText("Press 1 or 2 to select", cx, cy + 100);
    ctx.restore();
}

// ── 캐릭터 선택 UI (pixel_art_v2 원본 - 미사용 대체본) ──
export function drawCharacterSelectionUI(ctx, CONFIG, characters, selectedIndex) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 45px "Malgun Gothic"';
    ctx.textAlign = 'center';
    ctx.fillText('캐릭터 선택', CONFIG.SCREEN_WIDTH / 2, 110);

    const cardW = 200;
    const cardH = 350;
    const spacing = 35;
    const startX = (CONFIG.SCREEN_WIDTH - (cardW * 5 + spacing * 4)) / 2;

    characters.forEach((char, i) => {
        const x = startX + i * (cardW + spacing);
        const y = 190;
        const isSelected = i === selectedIndex;

        ctx.fillStyle = isSelected ? 'rgba(100, 255, 218, 0.2)' : 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = isSelected ? '#64FFDA' : '#444';
        ctx.lineWidth = isSelected ? 4 : 2;

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, cardW, cardH, 10);
        else ctx.rect(x, y, cardW, cardH);
        ctx.fill();
        ctx.stroke();

        const charX = x + cardW / 2 - 75;
        const charY = y + 40;
        if (char.id === 'toto') drawPixelTotoV5(ctx, charX, charY, 150, 150);
        else if (char.id === 'lulu') drawPixelLuluV2(ctx, charX, charY, 150, 150);
        else if (char.id === 'kaka') drawPixelKakaV2(ctx, charX, charY, 150, 150);
        else if (char.id === 'momo') drawPixelMomoV2(ctx, charX, charY, 150, 150);
        else if (char.id === 'pipi') drawPixelPipiV2(ctx, charX, charY, 150, 150);

        ctx.fillStyle = isSelected ? '#64FFDA' : '#fff';
        ctx.font = 'bold 24px "Malgun Gothic"';
        ctx.fillText(char.name, x + cardW / 2, y + 230);

        ctx.font = '16px "Malgun Gothic"';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`속도: ${char.speed}`, x + cardW / 2, y + 270);
        ctx.fillText(`파워: ${char.power}`, x + cardW / 2, y + 295);
        ctx.fillText(`범위: ${char.range}`, x + cardW / 2, y + 320);
    });

    ctx.fillStyle = '#64FFDA';
    ctx.font = '22px "Malgun Gothic"';
    ctx.fillText('← → 방향키로 선택 | SPACE 로 결정', CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 90);
    ctx.restore();
}
