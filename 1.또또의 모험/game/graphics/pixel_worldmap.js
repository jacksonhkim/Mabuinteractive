// ============================================================
// [Graphics Layer] pixel_worldmap.js
// 월드맵 UI (Tengai 스타일 RPG 월드맵)
// 10개 스테이지의 노드, 경로, 데코레이션, 인포바, 버튼
// 독립 컴포넌트로 분리 (600줄 - 복잡한 비주얼 컴포넌트)
// ============================================================

import { drawRect } from './pixel_helpers.js';
import { drawPixelTotoV5 } from './pixel_hero.js';

// ── 월드맵 메인 렌더링 ──
export function drawWorldMap(ctx, CONFIG, state) {
    ctx.save();
    const W = CONFIG.SCREEN_WIDTH;
    const H = CONFIG.SCREEN_HEIGHT;
    const t = Date.now() / 1000;

    // ═══════════════════════════════════════════════════════
    // 1. BACKGROUND — Fantasy Night Sky with Aurora & Depth
    // ═══════════════════════════════════════════════════════
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#05051a');
    skyGrad.addColorStop(0.12, '#0a0a30');
    skyGrad.addColorStop(0.28, '#14103f');
    skyGrad.addColorStop(0.42, '#1c1555');
    skyGrad.addColorStop(0.55, '#1a2040');
    skyGrad.addColorStop(0.68, '#122a2a');
    skyGrad.addColorStop(0.82, '#0e2218');
    skyGrad.addColorStop(1, '#081510');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Aurora Borealis
    drawAurora(ctx, W, H, t);

    // Nebula patches
    drawNebula(ctx, 300, 100, 120, 'rgba(100, 50, 180, 0.06)');
    drawNebula(ctx, 900, 80, 150, 'rgba(40, 100, 160, 0.05)');
    drawNebula(ctx, 600, 150, 100, 'rgba(180, 60, 100, 0.04)');

    // Multi-layer terrain
    drawTerrain(ctx, W, H, t);

    // ═══════════════════════════════════════════════════════
    // 2. STARS — Rich Starfield with Shooting Stars
    // ═══════════════════════════════════════════════════════
    drawStarfield(ctx, W, H, t);

    // ═══════════════════════════════════════════════════════
    // 3. TERRAIN DECORATIONS
    // ═══════════════════════════════════════════════════════
    drawDecorations(ctx, W, H, t);

    // ═══════════════════════════════════════════════════════
    // 4-6. STAGE DATA, PATH, NODES
    // ═══════════════════════════════════════════════════════
    const stageData = getStageData();
    drawStagePaths(ctx, stageData, state, t);
    drawStageNodes(ctx, stageData, state, t);

    // ═══════════════════════════════════════════════════════
    // 7. TITLE
    // ═══════════════════════════════════════════════════════
    drawMapTitle(ctx, W, t);

    // ═══════════════════════════════════════════════════════
    // 8. PLAYER ICON
    // ═══════════════════════════════════════════════════════
    drawPlayerIcon(ctx, stageData, state, t);

    // ═══════════════════════════════════════════════════════
    // 9. STAGE INFO BAR
    // ═══════════════════════════════════════════════════════
    drawStageInfo(ctx, stageData, state, W, H);

    // ═══════════════════════════════════════════════════════
    // 10. GO BUTTON
    // ═══════════════════════════════════════════════════════
    if (state.isWorldMapReady) {
        drawGoButton(ctx, state, W, H, t);
    }

    // ═══════════════════════════════════════════════════════
    // 11. ATMOSPHERIC FOG OVERLAY
    // ═══════════════════════════════════════════════════════
    const vignetteTop = ctx.createLinearGradient(0, 0, 0, 80);
    vignetteTop.addColorStop(0, 'rgba(5,5,20,0.4)');
    vignetteTop.addColorStop(1, 'transparent');
    ctx.fillStyle = vignetteTop; ctx.fillRect(0, 0, W, 80);

    const vignetteBot = ctx.createLinearGradient(0, H - 60, 0, H);
    vignetteBot.addColorStop(0, 'transparent');
    vignetteBot.addColorStop(1, 'rgba(5,5,10,0.5)');
    ctx.fillStyle = vignetteBot; ctx.fillRect(0, H - 60, W, 60);

    ctx.restore();
}

// ── 스테이지 데이터 ──
function getStageData() {
    return [
        { x: 150, y: 580, color: '#81C784', name: '평화로운 숲', glow: '#A5D6A7' },
        { x: 300, y: 500, color: '#311B92', name: '밤의 숲', glow: '#7C4DFF' },
        { x: 480, y: 550, color: '#FF6D00', name: '붉은 황혼', glow: '#FFAB40' },
        { x: 620, y: 430, color: '#4FC3F7', name: '바람의 계곡', glow: '#81D4FA' },
        { x: 500, y: 320, color: '#B3E5FC', name: '얼음 왕국', glow: '#E1F5FE' },
        { x: 680, y: 380, color: '#D32F2F', name: '불타는 대지', glow: '#EF5350' },
        { x: 850, y: 450, color: '#795548', name: '고철 처리장', glow: '#A1887F' },
        { x: 950, y: 340, color: '#76FF03', name: '독극물 연구소', glow: '#B2FF59' },
        { x: 1080, y: 250, color: '#546E7A', name: '스카이 포트리스', glow: '#90A4AE' },
        { x: 1180, y: 130, color: '#FFD700', name: '황제의 알현실', glow: '#FFECB3' },
    ];
}

// ── 오로라 보레알리스 ──
function drawAurora(ctx, W, H, t) {
    for (let a = 0; a < 3; a++) {
        const aY = 60 + a * 50;
        const aGrad = ctx.createLinearGradient(0, aY - 30, 0, aY + 40);
        const hue = [160, 200, 280][a];
        aGrad.addColorStop(0, 'transparent');
        aGrad.addColorStop(0.3, `hsla(${hue}, 70%, 50%, 0.06)`);
        aGrad.addColorStop(0.5, `hsla(${hue}, 80%, 60%, 0.10)`);
        aGrad.addColorStop(0.7, `hsla(${hue}, 70%, 50%, 0.05)`);
        aGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = aGrad;
        ctx.beginPath(); ctx.moveTo(0, aY - 30);
        for (let x = 0; x <= W; x += 10) {
            ctx.lineTo(x, aY + Math.sin(x * 0.008 + t * 0.3 + a * 2) * 25 + Math.sin(x * 0.003 + t * 0.15) * 15);
        }
        ctx.lineTo(W, aY + 40); ctx.lineTo(0, aY + 40); ctx.closePath(); ctx.fill();
    }
}

// ── 네뷸라 ──
function drawNebula(ctx, nx, ny, nr, col) {
    const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    ng.addColorStop(0, col); ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng; ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
}

// ── 멀티레이어 지형 ──
function drawTerrain(ctx, W, H, t) {
    const terrainLayers = [
        { y: 0.58, colors: ['rgba(18,50,35,0.3)', 'rgba(25,65,45,0.15)'] },
        { y: 0.65, colors: ['rgba(22,60,40,0.5)', 'rgba(35,80,55,0.25)'] },
        { y: 0.72, colors: ['rgba(18,50,30,0.65)', 'rgba(28,70,45,0.35)'] },
        { y: 0.79, colors: ['rgba(14,40,25,0.8)', 'rgba(22,55,35,0.5)'] },
        { y: 0.86, colors: ['rgba(10,30,18,0.9)', 'rgba(16,42,28,0.6)'] },
    ];
    terrainLayers.forEach((tl, li) => {
        const baseY = H * tl.y;
        ctx.fillStyle = tl.colors[0]; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) {
            const h = Math.sin(x * 0.004 + li * 1.5) * 28 + Math.sin(x * 0.011 + li) * 14
                + Math.sin(x * 0.002 - li * 0.7) * 18 + Math.cos(x * 0.007 + li * 3) * 8;
            ctx.lineTo(x, baseY + h);
        }
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        ctx.fillStyle = tl.colors[1]; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) {
            const h = Math.sin(x * 0.004 + li * 1.5) * 28 + Math.sin(x * 0.011 + li) * 14
                + Math.sin(x * 0.002 - li * 0.7) * 18 + Math.cos(x * 0.007 + li * 3) * 8;
            ctx.lineTo(x, baseY + h + 3);
        }
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    });
}

// ── 별 필드 ──
function drawStarfield(ctx, W, H, t) {
    const starSeed = [
        37, 71, 113, 157, 199, 241, 283, 337, 379, 421, 463, 509, 557, 601, 643,
        691, 733, 787, 829, 877, 919, 967, 1013, 1061, 1103, 1151, 53, 97, 139,
        181, 223, 269, 311, 353, 397, 439, 487, 523, 571, 613, 659, 701, 751,
        797, 839, 883, 929, 971, 1019, 1067, 1109, 23, 67, 109, 151, 193, 239,
        277, 319, 367, 409, 457, 499, 547, 593, 637, 683, 727, 773, 811, 859
    ];
    const starColors = ['#ffffff', '#ffe0b2', '#b3e5fc', '#f8bbd0', '#c5cae9', '#dcedc8'];
    starSeed.forEach((s, i) => {
        const sx = (s * 7 + i * 31) % W;
        const sy = (s * 3 + i * 13) % (H * 0.52);
        const brightness = 0.2 + 0.8 * Math.abs(Math.sin(t * (0.5 + i * 0.07) + s));
        const size = (i % 5 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
        ctx.globalAlpha = brightness * (1 - sy / (H * 0.55));
        ctx.fillStyle = starColors[i % starColors.length];
        ctx.fillRect(sx, sy, size, size);
        if (size >= 2 && brightness > 0.85) {
            ctx.globalAlpha = brightness * 0.4;
            ctx.fillRect(sx - 1, sy + size / 2, size + 2, 1);
            ctx.fillRect(sx + size / 2, sy - 1, 1, size + 2);
        }
    });
    // 유성
    const shootT = (t * 0.4) % 8;
    if (shootT < 1) {
        const sx = 200 + shootT * 400, sy = 30 + shootT * 80;
        ctx.globalAlpha = 1 - shootT;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 30, sy - 8); ctx.stroke();
        ctx.globalAlpha = (1 - shootT) * 0.3;
        ctx.beginPath(); ctx.moveTo(sx - 30, sy - 8); ctx.lineTo(sx - 60, sy - 14); ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

// ── 지형 데코레이션 ──
function drawDecorations(ctx, W, H, t) {
    // 나무
    const drawPixelTree = (tx, ty, s = 1, variant = 0) => {
        ctx.fillStyle = '#3e2723'; ctx.fillRect(tx - 2 * s, ty, 4 * s, 10 * s);
        ctx.fillStyle = '#4e342e'; ctx.fillRect(tx - 1 * s, ty, 2 * s, 10 * s);
        const colors = variant === 0
            ? ['#1b5e20', '#2e7d32', '#43a047', '#66bb6a']
            : ['#0d47a1', '#1565c0', '#1e88e5', '#42a5f5'];
        ctx.fillStyle = colors[0]; ctx.beginPath();
        ctx.moveTo(tx, ty - 32 * s); ctx.lineTo(tx - 14 * s, ty - 4 * s); ctx.lineTo(tx + 14 * s, ty - 4 * s); ctx.fill();
        ctx.fillStyle = colors[1]; ctx.beginPath();
        ctx.moveTo(tx, ty - 28 * s); ctx.lineTo(tx - 11 * s, ty - 6 * s); ctx.lineTo(tx + 8 * s, ty - 8 * s); ctx.fill();
        ctx.fillStyle = colors[2]; ctx.beginPath();
        ctx.moveTo(tx, ty - 24 * s); ctx.lineTo(tx - 8 * s, ty - 8 * s); ctx.lineTo(tx + 5 * s, ty - 10 * s); ctx.fill();
        ctx.fillStyle = colors[3]; ctx.globalAlpha = 0.5;
        ctx.fillRect(tx - 2 * s, ty - 26 * s, 3 * s, 3 * s); ctx.globalAlpha = 1;
    };
    [[60, 600, 1, 0], [110, 590, 1.2, 0], [160, 580, 0.9, 0], [210, 595, 1.1, 0],
    [260, 575, 1, 1], [310, 540, 0.8, 1], [140, 615, 0.7, 0], [90, 625, 0.9, 0],
    [340, 555, 1, 1], [185, 560, 0.6, 0], [40, 610, 0.8, 0], [280, 560, 1, 1]
    ].forEach(([x, y, s, v]) => drawPixelTree(x, y, s, v));

    // 반딧불
    for (let f = 0; f < 8; f++) {
        const fx = 80 + (f * 37) % 280, fy = 540 + (f * 23) % 80;
        const fb = 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + f * 1.5));
        ctx.globalAlpha = fb * 0.6; ctx.fillStyle = '#c6ff00';
        ctx.fillRect(fx, fy + Math.sin(t * 1.5 + f) * 5, 2, 2);
    }
    ctx.globalAlpha = 1;

    // 바위
    const drawRock = (rx, ry, rw, rh) => {
        ctx.fillStyle = '#3e2723'; ctx.beginPath();
        ctx.moveTo(rx, ry); ctx.lineTo(rx - rw / 2, ry + rh); ctx.lineTo(rx + rw / 2, ry + rh); ctx.fill();
        ctx.fillStyle = '#5d4037'; ctx.beginPath();
        ctx.moveTo(rx - 1, ry + 2); ctx.lineTo(rx - rw / 2 + 3, ry + rh); ctx.lineTo(rx + rw / 2 - 2, ry + rh); ctx.fill();
        ctx.fillStyle = '#795548'; ctx.beginPath();
        ctx.moveTo(rx, ry + 3); ctx.lineTo(rx + rw / 4, ry + rh * 0.6); ctx.lineTo(rx + rw / 2 - 2, ry + rh); ctx.fill();
        ctx.fillStyle = '#8d6e63'; ctx.globalAlpha = 0.4;
        ctx.fillRect(rx - 2, ry + 2, 4, 3); ctx.globalAlpha = 1;
    };
    drawRock(460, 530, 35, 40); drawRock(510, 545, 22, 28); drawRock(540, 535, 18, 22);
    drawRock(610, 420, 28, 32); drawRock(570, 460, 20, 24); drawRock(590, 440, 15, 18);

    // 산
    const drawMountain = (mx, my, mw, mh, c1, c2, c3, snow) => {
        ctx.fillStyle = c1; ctx.beginPath();
        ctx.moveTo(mx, my - mh); ctx.lineTo(mx - mw / 2, my); ctx.lineTo(mx, my); ctx.fill();
        ctx.fillStyle = c2; ctx.beginPath();
        ctx.moveTo(mx, my - mh); ctx.lineTo(mx + mw / 2, my); ctx.lineTo(mx, my); ctx.fill();
        ctx.fillStyle = c3; ctx.beginPath();
        ctx.moveTo(mx, my - mh); ctx.lineTo(mx + mw / 8, my - mh * 0.4); ctx.lineTo(mx, my - mh * 0.3); ctx.fill();
        if (snow) {
            ctx.fillStyle = snow; ctx.beginPath();
            ctx.moveTo(mx, my - mh); ctx.lineTo(mx - mw / 7, my - mh * 0.65); ctx.lineTo(mx + mw / 8, my - mh * 0.6); ctx.fill();
        }
    };
    drawMountain(490, 370, 60, 65, '#37474f', '#546e7a', '#607d8b', '#eceff1');
    drawMountain(560, 390, 45, 45, '#455a64', '#607d8b', '#78909c', '#e0e0e0');
    drawMountain(720, 410, 55, 55, '#4e342e', '#6d4c41', '#8d6e63', null);

    // 용암
    const lavaGlow = ctx.createRadialGradient(680, 420, 5, 680, 420, 40);
    lavaGlow.addColorStop(0, 'rgba(255,87,34,0.25)'); lavaGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lavaGlow; ctx.fillRect(640, 380, 80, 80);
    for (let l = 0; l < 4; l++) {
        ctx.fillStyle = l % 2 === 0 ? '#ff5722' : '#ff9800'; ctx.globalAlpha = 0.5 + Math.sin(t * 3 + l) * 0.3;
        ctx.fillRect(665 + l * 8, 415 + Math.sin(t * 2 + l) * 3, 2, 2);
    } ctx.globalAlpha = 1;

    // 기어
    const drawGear = (gx, gy, gr, teeth) => {
        ctx.save(); ctx.translate(gx, gy); ctx.rotate(t * 0.4 * (teeth > 7 ? -1 : 1));
        ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, gr, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#4e342e'; ctx.beginPath(); ctx.arc(0, 0, gr * 0.3, 0, Math.PI * 2); ctx.fill();
        for (let a = 0; a < teeth; a++) {
            const ang = (a / teeth) * Math.PI * 2;
            ctx.fillStyle = '#6d4c41';
            ctx.fillRect(Math.cos(ang) * gr - 3, Math.sin(ang) * gr - 3, 6, 6);
        }
        ctx.restore();
    };
    drawGear(850, 465, 18, 8); drawGear(880, 445, 12, 6); drawGear(920, 475, 14, 7);
    drawGear(960, 450, 10, 6); drawGear(940, 420, 8, 5);

    // 독연기
    for (let s = 0; s < 6; s++) {
        const sx = 880 + s * 18, sy = 400 - s * 8 + Math.sin(t + s) * 6;
        ctx.globalAlpha = 0.08 - s * 0.01; ctx.fillStyle = '#76ff03';
        ctx.beginPath(); ctx.arc(sx, sy, 10 + s * 3, 0, Math.PI * 2); ctx.fill();
    } ctx.globalAlpha = 1;

    // 구름 + 성
    const drawCloud = (cx, cy, cw, alpha = 0.2) => {
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw);
        cg.addColorStop(0, `rgba(180,200,220,${alpha})`); cg.addColorStop(0.6, `rgba(150,170,200,${alpha * 0.5})`);
        cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.ellipse(cx, cy, cw, cw * 0.35, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx - cw * 0.35, cy + 4, cw * 0.5, cw * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + cw * 0.4, cy + 2, cw * 0.55, cw * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    };
    drawCloud(1020, 210, 45, 0.15); drawCloud(1100, 160, 50, 0.2);
    drawCloud(1180, 130, 35, 0.18); drawCloud(1220, 180, 30, 0.12);

    // 황금 성 첨탑
    ctx.fillStyle = '#5D4037'; ctx.fillRect(1188, 95, 24, 55);
    ctx.fillStyle = '#795548'; ctx.fillRect(1190, 95, 20, 55);
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(1192, 95, 8, 55);
    ctx.fillStyle = '#FFA000'; ctx.beginPath();
    ctx.moveTo(1200, 60); ctx.lineTo(1186, 95); ctx.lineTo(1214, 95); ctx.fill();
    ctx.fillStyle = '#FFD700'; ctx.beginPath();
    ctx.moveTo(1200, 60); ctx.lineTo(1200, 95); ctx.lineTo(1214, 95); ctx.fill();
    ctx.fillStyle = '#FFEB3B'; ctx.fillRect(1197, 56, 6, 6);
    const castleGlow = ctx.createRadialGradient(1200, 100, 5, 1200, 100, 60);
    castleGlow.addColorStop(0, 'rgba(255,215,0,0.15)'); castleGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = castleGlow; ctx.fillRect(1140, 40, 120, 120);
}

// ── 스테이지 경로 ──
function drawStagePaths(ctx, stageData, state, t) {
    for (let i = 0; i < stageData.length - 1; i++) {
        const from = stageData[i], to = stageData[i + 1];
        const stageNum = i + 1;
        const isCleared = stageNum <= state.currentStage;
        const midX = (from.x + to.x) / 2, midY = (from.y + to.y) / 2 - 25;

        if (isCleared) {
            ctx.setLineDash([]); ctx.lineWidth = 8;
            ctx.strokeStyle = 'rgba(255,213,79,0.15)';
            ctx.beginPath(); ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(midX, midY, to.x, to.y); ctx.stroke();
            ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 3;
            ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,213,79,0.4)';
            ctx.beginPath(); ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(midX, midY, to.x, to.y); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(from.x, from.y - 2);
            ctx.quadraticCurveTo(midX, midY - 2, to.x, to.y - 2); ctx.stroke();
            ctx.shadowBlur = 0;
            for (let p = 0; p < 3; p++) {
                const pt = (p + 1) / 4;
                const px = from.x + (to.x - from.x) * pt;
                const py = from.y + (to.y - from.y) * pt - 15 * Math.sin(pt * Math.PI);
                const sparkle = 0.3 + 0.7 * Math.abs(Math.sin(t * 3 + p + i));
                ctx.globalAlpha = sparkle * 0.6; ctx.fillStyle = '#fff';
                ctx.fillRect(px - 1, py - 1, 2, 2);
            }
            ctx.globalAlpha = 1;
        } else {
            ctx.setLineDash([5, 10]);
            ctx.strokeStyle = 'rgba(255,213,79,0.15)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(midX, midY, to.x, to.y); ctx.stroke();
        }
    }
    ctx.setLineDash([]); ctx.shadowBlur = 0;
}

// ── 스테이지 노드 ──
function drawStageNodes(ctx, stageData, state, t) {
    stageData.forEach((node, i) => {
        const stageNum = i + 1;
        const isActive = stageNum <= state.currentStage;
        const isNext = stageNum === state.currentStage + 1;
        const isLocked = !isActive && !isNext;
        const nodeR = 24;

        if (isLocked) { drawLockedNode(ctx, node, nodeR); return; }
        if (isNext) { drawNextNode(ctx, node, nodeR, stageNum, t); return; }
        if (isActive) { drawClearedNode(ctx, node, nodeR, stageNum, t); }
    });
}

function drawLockedNode(ctx, node, nodeR) {
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.arc(node.x + 2, node.y + 2, nodeR, 0, Math.PI * 2); ctx.fill();
    const lockGrad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, nodeR);
    lockGrad.addColorStop(0, '#555'); lockGrad.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = lockGrad;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR - 3, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#757575'; ctx.fillRect(node.x - 6, node.y - 1, 12, 9);
    ctx.fillStyle = '#616161'; ctx.fillRect(node.x - 5, node.y, 10, 7);
    ctx.strokeStyle = '#9e9e9e'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(node.x, node.y - 4, 5, Math.PI, 0); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.arc(node.x, node.y + 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#555'; ctx.font = 'bold 10px "Malgun Gothic"'; ctx.textAlign = 'center';
    ctx.fillText('???', node.x, node.y + nodeR + 15);
}

function drawNextNode(ctx, node, nodeR, stageNum, t) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    const pulse2 = 0.5 + 0.5 * Math.sin(t * 5 + 1);
    ctx.globalAlpha = 0.06 + pulse2 * 0.06;
    ctx.strokeStyle = node.glow; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR + 20, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.1 + pulse * 0.1;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR + 14, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 28 + pulse * 18; ctx.shadowColor = node.glow;
    ctx.fillStyle = `rgba(255,255,255,${0.12 + pulse * 0.12})`;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR + 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    const nextGrad = ctx.createRadialGradient(node.x - 5, node.y - 5, 2, node.x, node.y, nodeR);
    nextGrad.addColorStop(0, node.glow); nextGrad.addColorStop(0.7, node.color); nextGrad.addColorStop(1, node.color);
    ctx.fillStyle = nextGrad;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFEB3B'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR - 3, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(node.x - 3, node.y - 8, 10, 5, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'center';
    ctx.fillText(stageNum, node.x, node.y + 5);
    const lbl = node.name; const lblW = ctx.measureText(lbl).width + 12;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(node.x - lblW / 2, node.y + nodeR + 5, lblW, 16);
    ctx.fillStyle = '#FFEB3B'; ctx.font = 'bold 11px "Malgun Gothic"';
    ctx.fillText(lbl, node.x, node.y + nodeR + 17);
}

function drawClearedNode(ctx, node, nodeR, stageNum, t) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.arc(node.x + 1, node.y + 2, nodeR, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 14; ctx.shadowColor = node.glow;
    const actGrad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, nodeR);
    actGrad.addColorStop(0, node.glow); actGrad.addColorStop(0.6, node.color);
    actGrad.addColorStop(1, node.color);
    ctx.fillStyle = actGrad;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(node.x, node.y, nodeR - 3, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.2; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(node.x - 3, node.y - 8, 9, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(node.x - 7, node.y + 1);
    ctx.lineTo(node.x - 2, node.y + 6); ctx.lineTo(node.x + 8, node.y - 5); ctx.stroke();
    ctx.lineCap = 'butt';
    const lbl = node.name; ctx.font = '11px "Malgun Gothic"';
    const lblW = ctx.measureText(lbl).width + 10;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(node.x - lblW / 2, node.y + nodeR + 3, lblW, 15);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center';
    ctx.fillText(lbl, node.x, node.y + nodeR + 14);
}

// ── 타이틀 ──
function drawMapTitle(ctx, W, t) {
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(255,213,79,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 180, 68); ctx.lineTo(W / 2 - 50, 68); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + 50, 68); ctx.lineTo(W / 2 + 180, 68); ctx.stroke();
    ctx.fillStyle = 'rgba(255,213,79,0.3)'; ctx.save();
    ctx.translate(W / 2 - 185, 68); ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    ctx.save(); ctx.translate(W / 2 + 185, 68); ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = '900 44px "Malgun Gothic"';
    ctx.fillText('또또의 모험', W / 2 + 2, 52 + 2);
    ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(255,215,0,0.7)';
    const titleGrad = ctx.createLinearGradient(W / 2 - 200, 20, W / 2 + 200, 60);
    titleGrad.addColorStop(0, '#FFF176'); titleGrad.addColorStop(0.3, '#FFD54F');
    titleGrad.addColorStop(0.7, '#FFA000'); titleGrad.addColorStop(1, '#FF8F00');
    ctx.fillStyle = titleGrad; ctx.font = '900 44px "Malgun Gothic"';
    ctx.fillText('또또의 모험', W / 2, 52);
    ctx.shadowBlur = 0; ctx.globalAlpha = 0.2; ctx.fillStyle = '#fff';
    ctx.font = '900 44px "Malgun Gothic"';
    ctx.fillText('또또의 모험', W / 2, 51); ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(200,210,225,0.6)'; ctx.font = '600 13px Arial';
    ctx.fillText('─  S T A G E   S E L E C T  ─', W / 2, 82);
}

// ── 플레이어 아이콘 ──
function drawPlayerIcon(ctx, stageData, state, t) {
    const progress = state.mapProgress || 0;
    const currentIdx = state.currentStage - 1;
    const nextIdx = Math.min(state.currentStage, stageData.length - 1);

    if (currentIdx >= 0) {
        const start = stageData[currentIdx], end = stageData[nextIdx];
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;
        const bounceY = currentY - 40 - Math.abs(Math.sin(progress * Math.PI)) * 45;
        const hoverOffset = Math.sin(t * 4) * 3;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(currentX, currentY - 5, 18, 6, 0, 0, Math.PI * 2); ctx.fill();

        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        drawPixelTotoV5(ctx, currentX - 25, bounceY - 25 + hoverOffset, 50, 50);
        ctx.shadowBlur = 0;
    }
}

// ── 스테이지 인포 바 ──
function drawStageInfo(ctx, stageData, state, W, H) {
    const currentStageInfo = stageData[Math.min(state.currentStage, stageData.length - 1)];
    if (!currentStageInfo) return;

    const infoW = 280, infoH = 40, infoX = 18, infoY = H - 58;
    const infoBg = ctx.createLinearGradient(infoX, infoY, infoX + infoW, infoY);
    infoBg.addColorStop(0, 'rgba(0,0,0,0.55)'); infoBg.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = infoBg; ctx.fillRect(infoX, infoY, infoW, infoH);
    ctx.strokeStyle = 'rgba(255,213,79,0.35)'; ctx.lineWidth = 1;
    ctx.strokeRect(infoX, infoY, infoW, infoH);
    ctx.fillStyle = currentStageInfo.color; ctx.fillRect(infoX, infoY, 3, infoH);
    ctx.fillStyle = '#FFD54F'; ctx.font = 'bold 13px "Malgun Gothic"'; ctx.textAlign = 'left';
    ctx.fillText(`STAGE ${state.currentStage + 1}`, infoX + 12, infoY + 17);
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '12px "Malgun Gothic"';
    ctx.fillText(`▸ ${currentStageInfo.name}`, infoX + 85, infoY + 17);
    for (let d = 0; d < 10; d++) {
        ctx.fillStyle = d <= state.currentStage ? '#FFD54F' : 'rgba(255,255,255,0.15)';
        ctx.fillRect(infoX + 12 + d * 14, infoY + 28, 8, 4);
    }
}

// ── GO 버튼 ──
function drawGoButton(ctx, state, W, H, t) {
    const btnX = W / 2, btnY = H - 100;
    const btnW = 280, btnH = 56;
    const pulse = 0.5 + 0.5 * Math.sin(t * 4);
    const r = 14;

    // Pulsing outer ring
    ctx.globalAlpha = 0.15 + pulse * 0.15;
    ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(btnX - btnW / 2 - 4 + r, btnY - btnH / 2 - 4);
    ctx.arcTo(btnX + btnW / 2 + 4, btnY - btnH / 2 - 4, btnX + btnW / 2 + 4, btnY + btnH / 2 + 4, r);
    ctx.arcTo(btnX + btnW / 2 + 4, btnY + btnH / 2 + 4, btnX - btnW / 2 - 4, btnY + btnH / 2 + 4, r);
    ctx.arcTo(btnX - btnW / 2 - 4, btnY + btnH / 2 + 4, btnX - btnW / 2 - 4, btnY - btnH / 2 - 4, r);
    ctx.arcTo(btnX - btnW / 2 - 4, btnY - btnH / 2 - 4, btnX + btnW / 2 + 4, btnY - btnH / 2 - 4, r);
    ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(btnX - btnW / 2 + r, btnY - btnH / 2 + 3);
    ctx.arcTo(btnX + btnW / 2 + 2, btnY - btnH / 2 + 3, btnX + btnW / 2 + 2, btnY + btnH / 2 + 3, r);
    ctx.arcTo(btnX + btnW / 2 + 2, btnY + btnH / 2 + 3, btnX - btnW / 2, btnY + btnH / 2 + 3, r);
    ctx.arcTo(btnX - btnW / 2, btnY + btnH / 2 + 3, btnX - btnW / 2, btnY - btnH / 2 + 3, r);
    ctx.arcTo(btnX - btnW / 2, btnY - btnH / 2 + 3, btnX + btnW / 2 + 2, btnY - btnH / 2 + 3, r);
    ctx.closePath(); ctx.fill();

    ctx.shadowBlur = 22 + pulse * 16; ctx.shadowColor = 'rgba(255,235,59,0.55)';
    const btnGrad = ctx.createLinearGradient(btnX, btnY - btnH / 2, btnX, btnY + btnH / 2);
    btnGrad.addColorStop(0, '#FFF176'); btnGrad.addColorStop(0.3, '#FFEB3B');
    btnGrad.addColorStop(0.7, '#FFC107'); btnGrad.addColorStop(1, '#FFA000');
    ctx.fillStyle = btnGrad;
    ctx.beginPath();
    ctx.moveTo(btnX - btnW / 2 + r, btnY - btnH / 2);
    ctx.arcTo(btnX + btnW / 2, btnY - btnH / 2, btnX + btnW / 2, btnY + btnH / 2, r);
    ctx.arcTo(btnX + btnW / 2, btnY + btnH / 2, btnX - btnW / 2, btnY + btnH / 2, r);
    ctx.arcTo(btnX - btnW / 2, btnY + btnH / 2, btnX - btnW / 2, btnY - btnH / 2, r);
    ctx.arcTo(btnX - btnW / 2, btnY - btnH / 2, btnX + btnW / 2, btnY - btnH / 2, r);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(btnX, btnY - btnH / 4, btnW / 2 - 10, btnH / 4, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(120,80,0,0.5)'; ctx.font = 'bold 22px "Malgun Gothic"'; ctx.textAlign = 'center';
    ctx.fillText(`▶  START STAGE ${state.currentStage + 1}`, btnX + 1, btnY + 8 + 1);
    ctx.fillStyle = '#3e2723'; ctx.font = 'bold 22px "Malgun Gothic"';
    ctx.fillText(`▶  START STAGE ${state.currentStage + 1}`, btnX, btnY + 8);
}
