// ============================================================
// [Graphics Layer] pixel_helpers.js
// 공통 픽셀 아트 렌더링 헬퍼 함수 모음
// 모든 그래픽 모듈에서 재사용되는 기본 드로잉 유틸리티
// ============================================================

import { PLAYER_IMAGES } from '../data/assets.js';

// ── 기본 픽셀 그리기 (좌표 보정 포함) ──
export const drawRect = (ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
};

// ── 캐릭터 이미지 그리기 (반전 처리 및 로딩 상태 확인) ──
export const drawCharImg = (ctx, img, x, y, w, h, flip = false) => {
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    ctx.save();
    if (flip) {
        ctx.translate(Math.floor(x + w), Math.floor(y));
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, Math.floor(w), Math.floor(h));
    } else {
        ctx.drawImage(img, Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
    }
    ctx.restore();
    return true;
};

// ── 픽셀 그리드 렌더러 (문자열 배열 → 픽셀 맵 변환) ──
// 각 문자가 색상 키에 매핑되어 픽셀 아트를 구성
export const drawPixelGrid = (ctx, x, y, size, grid) => {
    grid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            const colors = {
                'K': '#1A1A1A',              // Rich Black Outline
                'W': '#FFFFFF',              // Pure White Sparkle
                'Y': '#FFD54F',              // Warm Honey Gold
                'y': '#FFA000',              // Rich Amber Shadow
                'M': '#795548',              // Chocolate Fedora Brown
                'm': '#4E342E',              // Dark Espresso Brown
                'B': '#2D1B17',              // Near-Black Hat Band
                'p': '#FFC1CF',              // Soft Pastel Pink Blush
                'g': 'rgba(200, 230, 255, 0.4)', // Glassy Transparent Wing
                'S': '#FFF9C4',              // Soft Creamy Highlight
                'O': '#FF8F00',              // Deep Orange-Honey shading
                'H': '#FFF176',              // Bright Yellow Accent
                'X': '#37474f', 'o': '#e65100', 's': '#455a64', // Enemy colors
                'r': '#ff1744', 'R': '#d50000', 'C': '#00e5ff', // Boss colors
                'G': '#43A047', 'T': 'rgba(129, 212, 250, 0.5)' // Pipi colors
            };
            drawRect(ctx, x + rx * size, y + ry * size, size, size, colors[pixel] || '#FF00FF');
        });
    });
};

// ── 도형 헬퍼: 육각형 (또또 폭탄 이펙트용) ──
export function drawHexagon(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + r * Math.cos(Math.PI / 3 * i), y + r * Math.sin(Math.PI / 3 * i));
    }
    ctx.closePath(); ctx.stroke();
}

// ── 도형 헬퍼: 별 (루루 폭탄 이펙트용) ──
export function drawStar(ctx, x, y, r, R, p) {
    ctx.beginPath();
    for (let i = 0; i < p * 2; i++) {
        const rad = i % 2 === 0 ? R : r;
        const a = Math.PI * i / p;
        ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fill();
}

// ── 도형 헬퍼: 하트 (모모 폭탄 이펙트용) ──
export function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.fill();
}
