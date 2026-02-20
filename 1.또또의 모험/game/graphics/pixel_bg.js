// ============================================================
// [Graphics Layer] pixel_bg.js
// 배경 렌더링 (스테이지별 패럴랙스 배경 + 프로시저럴 폴백)
// 이미지 레이어 우선 로딩, 미로딩시 프로시저럴 생성
// ============================================================

import { BACKGROUND_IMAGES } from '../data/assets.js';
import { drawRect } from './pixel_helpers.js';

// ── 메인 배경 렌더링 함수 ──
// 스테이지별 환경 스타일 + 멀티레이어 패럴랙스
export function drawPixelForestV2(ctx, CONFIG, state) {
    const stage = state.currentStage || 1;
    const bgOffset = state.bgOffset || 0;

    // 스테이지별 환경 색상 설정
    const envStyles = {
        1: { // 평화로운 숲
            skyTop: '#1a237e', skyBot: '#4fc3f7', sunColor: 'rgba(255, 255, 200, 0.2)',
            treeColor: (c) => `rgba(46, 125, 50, ${c})`, groundColor: '#2e7d32',
            detailColor: '#388e3c', accentColor: '#a5d6a7', godRays: false
        },
        2: { // 밤의 숲
            skyTop: '#0d1117', skyBot: '#161b22', sunColor: 'rgba(255,255,255,0.1)',
            treeColor: (c) => `rgba(13, 25, 48, ${c})`, groundColor: '#050a14',
            detailColor: '#1f2937', accentColor: '#38bdf8', godRays: false
        },
        3: { // 붉은 황혼
            skyTop: '#4c1d95', skyBot: '#db2777', sunColor: 'rgba(251, 146, 60, 0.3)',
            treeColor: (c) => `rgba(88, 28, 135, ${c})`, groundColor: '#4c1d95',
            detailColor: '#7c3aed', accentColor: '#fcd34d', godRays: true
        },
        4: { // 바람의 계곡
            skyTop: '#0d47a1', skyBot: '#42a5f5', sunColor: 'rgba(255, 255, 255, 0.2)',
            treeColor: (c) => `rgba(255, 255, 255, ${c * 0.3})`, groundColor: '#1565c0',
            detailColor: '#1e88e5', accentColor: '#bbdefb', godRays: false
        },
        5: { // 메탈/우주 요새 (Stage 5)
            skyTop: '#0d1117', skyBot: '#21262d', sunColor: 'rgba(56, 139, 253, 0.1)',
            treeColor: (c) => `rgba(48, 54, 61, ${c})`, groundColor: '#161b22',
            detailColor: '#30363d', accentColor: '#58a6ff', godRays: false
        },
        6: { // 용암/지옥 (Stage 6)
            skyTop: '#4a148c', skyBot: '#b71c1c', sunColor: 'rgba(255, 82, 82, 0.2)',
            treeColor: (c) => `rgba(62, 39, 35, ${c})`, groundColor: '#212121',
            detailColor: '#4e342e', accentColor: '#d84315', godRays: true
        }
    };

    const style = envStyles[stage] || envStyles[stage % 6 || 1];

    // ── 1. 하늘 그라디언트 ──
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.SCREEN_HEIGHT);
    grad.addColorStop(0, style.skyTop); grad.addColorStop(1, style.skyBot);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // ── 패럴랙스 레이어 헬퍼 ──
    const drawLayer = (img, speed, yOffset = 0, extraHeight = 0) => {
        if (!img || !img.complete || img.naturalWidth === 0) return false;
        const width = CONFIG.SCREEN_WIDTH;
        let x = (bgOffset * speed) % width;
        if (x > 0) x -= width;
        x = Math.floor(x);
        const h = CONFIG.SCREEN_HEIGHT + extraHeight;
        ctx.drawImage(img, x, yOffset, width + 1, h);
        ctx.drawImage(img, x + width, yOffset, width + 1, h);
        return true;
    };

    // ── 2. 스테이지별 이미지 레이어 ──
    if (stage === 1) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s1_layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s1_layer02, 0)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s1_layer03, 0.5)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s1_layer04, 0.7)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s1_layer05, 0.9)) layersDrawn = true;
        if (layersDrawn) return;
    } else if (stage === 2) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer01, 0)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer02, 0.5)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer03, 0.8)) layersDrawn = true;
        if (layersDrawn) return;
    } else if (stage === 3) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s3_layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s3_layer02, 0.3, -50, 200)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s3_layer03, 0.5, -120, 120)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s3_layer04, 0.7, -50, 50)) layersDrawn = true;
        if (layersDrawn) return;
    } else if (stage === 4) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s4_layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s4_layer02, 0.5)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s4_layer03, 0.8)) layersDrawn = true;
        if (layersDrawn) return;
    } else if (stage === 5) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s5_layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s5_layer02, 0.5)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s5_layer03, 0.8)) layersDrawn = true;
        if (layersDrawn) return;
    } else if (stage === 6) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s6_layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s6_layer02, 0.5)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s6_layer03, 0.8)) layersDrawn = true;
        if (layersDrawn) return;
    }

    // ── 3. 프로시저럴 구름 (폴백) ──
    const drawCloud = (cx, cy, scale, alpha) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        drawRect(ctx, -20, 0, 40, 20); drawRect(ctx, -10, -10, 30, 10);
        drawRect(ctx, 10, 0, 20, 10); drawRect(ctx, -30, 5, 20, 10);
        ctx.restore();
    };

    const cloudSpacing = 500;
    const cloudCount = Math.ceil(CONFIG.SCREEN_WIDTH / cloudSpacing) + 2;
    for (let i = 0; i < cloudCount; i++) {
        const speedFactor = 0.5;
        const x = ((i * cloudSpacing) + (bgOffset * speedFactor) % cloudSpacing) - cloudSpacing;
        drawCloud(x, 100 + (i % 3) * 40, 1.5 + (i % 2) * 0.2, 0.25);
    }

    // ── 4. 갓 레이 (스테이지 3 전용) ──
    if (style.godRays) {
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        const time = Date.now() / 2000;
        for (let i = 0; i < 5; i++) {
            const bx = ((i * 300) + (bgOffset * 0.2)) % CONFIG.SCREEN_WIDTH;
            const bWidth = 100 + Math.sin(time + i) * 20;
            const gradBeam = ctx.createLinearGradient(bx, 0, bx + 100, CONFIG.SCREEN_HEIGHT);
            gradBeam.addColorStop(0, style.sunColor); gradBeam.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradBeam;
            ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + bWidth, 0);
            ctx.lineTo(bx + bWidth - 150, CONFIG.SCREEN_HEIGHT); ctx.lineTo(bx - 150, CONFIG.SCREEN_HEIGHT);
            ctx.fill();
        }
        ctx.restore();
    }

    // ── 5. 프로시저럴 나무 ──
    const farSpacing = 300;
    const farCount = Math.ceil(CONFIG.SCREEN_WIDTH / farSpacing) + 2;
    ctx.fillStyle = style.treeColor(0.2);
    for (let i = 0; i < farCount; i++) {
        const x = ((i * farSpacing) + (bgOffset * 0.4) % farSpacing) - farSpacing;
        ctx.beginPath();
        ctx.moveTo(x, CONFIG.SCREEN_HEIGHT - 60);
        ctx.lineTo(x + 60, CONFIG.SCREEN_HEIGHT - 280);
        ctx.lineTo(x + 120, CONFIG.SCREEN_HEIGHT - 60);
        ctx.fill();
    }

    const drawHQTree = (tx, ty, s, c) => {
        drawRect(ctx, tx - 4 * s, ty - 40 * s, 8 * s, 40 * s, '#211815');
        ctx.fillStyle = c;
        drawRect(ctx, tx - 22 * s, ty - 65 * s, 44 * s, 35 * s);
        drawRect(ctx, tx - 15 * s, ty - 85 * s, 30 * s, 25 * s);
        drawRect(ctx, tx - 8 * s, ty - 100 * s, 16 * s, 20 * s);
    };

    const nearSpacing = 450;
    const nearCount = Math.ceil(CONFIG.SCREEN_WIDTH / nearSpacing) + 2;
    for (let i = 0; i < nearCount; i++) {
        const x = ((i * nearSpacing) + (bgOffset % nearSpacing)) - nearSpacing;
        drawHQTree(x + 200, CONFIG.SCREEN_HEIGHT - 60, 2.8, style.treeColor(1));
    }

    // ── 6. 지면 + 잔디 + 꽃 디테일 ──
    ctx.fillStyle = style.groundColor;
    ctx.fillRect(0, CONFIG.SCREEN_HEIGHT - 60, CONFIG.SCREEN_WIDTH, 60);

    const grassSpacing = 150;
    const grassCount = Math.ceil(CONFIG.SCREEN_WIDTH / grassSpacing) + 2;
    ctx.fillStyle = style.detailColor;
    for (let i = 0; i < grassCount; i++) {
        const gx = ((i * grassSpacing) + (bgOffset * 2 % grassSpacing)) - grassSpacing;
        drawRect(ctx, gx, CONFIG.SCREEN_HEIGHT - 65, 20, 12);
        drawRect(ctx, gx + 6, CONFIG.SCREEN_HEIGHT - 72, 8, 8);
    }

    const flowerSpacing = 250;
    const flowerCount = Math.ceil(CONFIG.SCREEN_WIDTH / flowerSpacing) + 2;
    ctx.fillStyle = style.accentColor;
    for (let i = 0; i < flowerCount; i++) {
        const fx = ((i * flowerSpacing) + (bgOffset * 2 % flowerSpacing)) - flowerSpacing + 75;
        drawRect(ctx, fx, CONFIG.SCREEN_HEIGHT - 64, 6, 6);
    }
}
