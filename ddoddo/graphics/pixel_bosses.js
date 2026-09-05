// ============================================================
// [Graphics Layer] pixel_bosses.js
// 보스 캐릭터 그래픽 (10종 보스 전체)
// 각 보스의 고유 픽셀 아트 + 애니메이션 렌더링
// ============================================================

import { drawRect, drawPixelGrid } from './pixel_helpers.js';

// ── 보스 1: Boss Buzz (거대 말벌) ──
export function drawPixelBossBuzzV2(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const hover = Math.sin(t * 5) * 15;
    const pSize = w / 32;

    const bossGrid = [
        "      XXXXXXXXXXXXXXXXXXXX      ",
        "    XXssssssssssssssssssssXX    ",
        "  XXssssssssssssssssssssssssXX  ",
        " XsssssssssXXXXXXXXsssssssssssX ",
        "XssssssssXXKKKKKKKKXXssssssssssX",
        "XsssssssXKKKKKKKKKKKKXsssssssssX",
        "XsssssssXKKKrKKKKKKKKXsssssssssX",
        "XssssssssXXKKKKKKKKXXssssssssssX",
        "XyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyX",
        "XyyyyyyyyyX........XyyyyyyyyyyyX",
        "XooooooooooooooooooooooooooooooX",
        " XssssssssssssssssssssssssssssX ",
        "  XssssssssssX..XssssssssssssX  ",
        "   XXssssssssssssssssssssssXX   ",
        "     XXXXXXXXXXXXXXXXXXXXXX     "
    ];

    drawPixelGrid(ctx, x, y + hover, pSize, bossGrid);

    // 개틀링건 (좌측 장착)
    drawRect(ctx, x - 20, y + 40 + hover, 30, 20, '#263238');
    drawRect(ctx, x - 30, y + 45 + hover, 35, 10, '#455a64');

    // 부스터 화염
    const colors = ['#00e5ff', '#00b0ff', '#2979ff', '#3d5afe'];
    for (let i = 0; i < 4; i++) {
        const fy = y + 15 + i * 25 + hover;
        const beamLen = 30 + Math.random() * 20;
        drawRect(ctx, x + w - 5, fy, beamLen, 10, colors[i]);
    }
}

// ── 보스 2: Queen Arachne (거미 여왕) ──
export function drawPixelQueenArachne(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.translate(0, Math.sin(t * 3) * 10);

    // 복부 (픽셀 클러스터)
    ctx.fillStyle = '#311b92';
    drawRect(ctx, -20 * pSize, -25 * pSize, 40 * pSize, 35 * pSize);
    ctx.fillStyle = '#4527a0';
    drawRect(ctx, -15 * pSize, -20 * pSize, 30 * pSize, 25 * pSize);

    // 독주머니 (점멸)
    const pulse = (Math.sin(t * 15) + 1) / 2;
    ctx.fillStyle = `rgba(255, 23, 68, ${0.5 + pulse * 0.5})`;
    drawRect(ctx, -8 * pSize, -15 * pSize, 16 * pSize, 16 * pSize);

    // 머리
    ctx.fillStyle = '#212121';
    drawRect(ctx, -12 * pSize, 10 * pSize, 24 * pSize, 20 * pSize);

    // 눈 (다중 적색 도트)
    ctx.fillStyle = '#ff1744';
    drawRect(ctx, -8 * pSize, 15 * pSize, 4 * pSize, 4 * pSize);
    drawRect(ctx, 4 * pSize, 15 * pSize, 4 * pSize, 4 * pSize);
    drawRect(ctx, -10 * pSize, 10 * pSize, 2 * pSize, 2 * pSize);
    drawRect(ctx, 8 * pSize, 10 * pSize, 2 * pSize, 2 * pSize);

    // 다리 (세그먼트 픽셀 빔)
    ctx.fillStyle = '#424242';
    for (let i = 0; i < 4; i++) {
        const side = i < 2 ? -1 : 1;
        const ang = (side * Math.PI / 4) + Math.sin(t * 10 + i) * 0.2;
        ctx.save();
        ctx.rotate(ang);
        drawRect(ctx, side * 10 * pSize, 0, side * 30 * pSize, 6 * pSize);
        ctx.translate(side * 30 * pSize, 0);
        ctx.rotate(side * 0.5);
        drawRect(ctx, 0, 0, side * 30 * pSize, 4 * pSize);
        ctx.restore();
    }

    ctx.restore();
}

// ── 보스 3: Metal Orochi (메카 오로치) ──
export function drawPixelMetalOrochi(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 64;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 바디 세그먼트 (블록 체인)
    for (let i = 6; i > 0; i--) {
        const segX = Math.sin(t * 5 + i) * 30;
        const segY = i * 40;
        ctx.save();
        ctx.translate(segX, segY);
        drawRect(ctx, -30, -20, 60, 40, '#263238');
        drawRect(ctx, -25, -15, 50, 10, '#37474f');
        drawRect(ctx, -20, 10, 40, 6, '#00e5ff');
        ctx.restore();
    }

    // 메카 드래곤 헤드
    const hx = Math.sin(t * 5) * 30;
    ctx.translate(hx, 0);

    const headGrid = [
        "      XXXXXX      ",
        "    XXXXXXXXXX    ",
        "   XXXXXXXXXXXX   ",
        "  XXXXCCXXXXCCXX  ",
        "  XXXXCCXXXXCCXX  ",
        " XXXXXXXXXXXXXXXX ",
        "XXXXXXXXXXXXXXXXXX",
        "XXXXXXKKKKKKXXXXXX",
        "XXXXXKKKKKKKKXXXXX",
        "XXXXXKKKKKKKKXXXXX",
        "XXXXXXKKKKKKXXXXXX",
        "XXXXXXXXXXXXXXXXXX",
        " XXXXXXXXXXXXXXXX ",
        "  XXXXXXXXXXXXXX  ",
        "   XXXXXXXXXXXX   ",
        "     XXXXXXXX     "
    ];

    const sizeHead = w / 2 / 16;
    drawPixelGrid(ctx, -w / 4, -h / 4, sizeHead, headGrid);

    ctx.restore();
}

// ── 보스 4: Storm Falcon (폭풍 매) ──
export function drawPixelStormFalcon(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.translate(0, Math.sin(t * 10) * 8);

    // 기계 날개 (좌/우)
    const flap = Math.cos(t * 15) * 15;
    ctx.fillStyle = '#cfd8dc';
    ctx.save();
    ctx.rotate(flap * Math.PI / 180);
    drawRect(ctx, -50 * pSize, -10 * pSize, 50 * pSize, 12 * pSize);
    drawRect(ctx, -40 * pSize, 2 * pSize, 30 * pSize, 8 * pSize);
    ctx.restore();
    ctx.save();
    ctx.rotate(-flap * Math.PI / 180);
    drawRect(ctx, 0, -10 * pSize, 50 * pSize, 12 * pSize);
    drawRect(ctx, 10 * pSize, 2 * pSize, 30 * pSize, 8 * pSize);
    ctx.restore();

    // 동체 & 콕핏
    ctx.fillStyle = '#37474f';
    drawRect(ctx, -10 * pSize, -15 * pSize, 20 * pSize, 40 * pSize);

    const cockpitGrid = [
        "    CCCC    ",
        "   CCCCCC   ",
        "  CCCCCCCC  ",
        " CCCCCCCCCC ",
        "CCCCCCCCCCCC",
        "CCCCCCCCCCCC"
    ];
    drawPixelGrid(ctx, -6 * pSize, -20 * pSize, pSize, cockpitGrid);

    // 터보 부스터
    const pulse = (Math.sin(t * 20) + 1) / 2;
    ctx.fillStyle = '#00e5ff';
    drawRect(ctx, -12 * pSize, 20 * pSize, 4 * pSize, 10 * pSize + pulse * 10);
    drawRect(ctx, 8 * pSize, 20 * pSize, 4 * pSize, 10 * pSize + pulse * 10);

    ctx.restore();
}

// ── 보스 5: Phantom Moth (환영 나방) ──
export function drawPixelPhantomMoth(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 잔상 트레일
    for (let i = 1; i <= 2; i++) {
        ctx.save();
        ctx.globalAlpha = 0.2 / i;
        ctx.translate(Math.sin(t * 5 + i) * 30, Math.cos(t * 5 + i) * 30);
        ctx.fillStyle = '#ba68c8';
        drawRect(ctx, -20 * pSize, -20 * pSize, 40 * pSize, 40 * pSize);
        ctx.restore();
    }

    // 날개 (디더 패턴)
    const scale = 1 - Math.sin(t * 8) * 0.2;
    ctx.save();
    ctx.scale(1, scale);
    ctx.fillStyle = '#4a148c';
    drawRect(ctx, -35 * pSize, -25 * pSize, 30 * pSize, 40 * pSize);
    drawRect(ctx, 5 * pSize, -25 * pSize, 30 * pSize, 40 * pSize);
    ctx.fillStyle = '#ea80fc';
    drawRect(ctx, -25 * pSize, -10 * pSize, 10 * pSize, 10 * pSize);
    drawRect(ctx, 15 * pSize, -10 * pSize, 10 * pSize, 10 * pSize);
    ctx.restore();

    // 몸체 & 발광 눈
    ctx.fillStyle = '#212121';
    drawRect(ctx, -8 * pSize, -15 * pSize, 16 * pSize, 30 * pSize);
    const glow = (Math.sin(t * 10) + 1) / 2;
    ctx.fillStyle = `rgba(0, 230, 118, ${0.5 + glow * 0.5})`;
    drawRect(ctx, -5 * pSize, -10 * pSize, 4 * pSize, 4 * pSize);
    drawRect(ctx, 1 * pSize, -10 * pSize, 4 * pSize, 4 * pSize);

    ctx.restore();
}

// ── 보스 6: Flame Salamander (화염 도룡뇽) ──
export function drawPixelFlameSalamander(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    ctx.fillStyle = '#bf360c';
    drawRect(ctx, -25 * pSize, -10 * pSize, 50 * pSize, 20 * pSize);
    drawRect(ctx, 20 * pSize, -15 * pSize, 15 * pSize, 30 * pSize);

    // 화염 꼬리
    for (let i = 0; i < 5; i++) {
        const tx = -30 * pSize - (i * 10 * pSize);
        const ty = Math.sin(t * 10 + i) * 15;
        const clrs = ['#ffab91', '#ff5722', '#e64a19', '#bf360c'];
        ctx.fillStyle = clrs[i % 4];
        drawRect(ctx, tx, ty, 8 * pSize, 8 * pSize);
    }

    ctx.fillStyle = '#ffff00';
    drawRect(ctx, 28 * pSize, -8 * pSize, 4 * pSize, 4 * pSize);

    ctx.restore();
}

// ── 보스 7: Junk Amalgam (고철 합성체) ──
export function drawPixelJunkAmalgam(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(1 + Math.sin(t * 2) * 0.05, 1 - Math.sin(t * 2) * 0.05);

    const colors = ['#4e342e', '#3e2723', '#212121', '#455a64'];
    for (let i = 0; i < 12; i++) {
        const ox = Math.cos(i) * 20 * pSize;
        const oy = Math.sin(i * 1.5) * 20 * pSize;
        ctx.fillStyle = colors[i % 4];
        drawRect(ctx, ox, oy, 12 * pSize, 12 * pSize);
    }

    // 타오르는 코어
    const pulse = (Math.sin(t * 10) + 1) / 2;
    ctx.fillStyle = `rgba(255, 235, 59, ${0.8 + pulse * 0.2})`;
    drawRect(ctx, -6 * pSize, -6 * pSize, 12 * pSize, 12 * pSize);

    ctx.restore();
}

// ── 보스 8: Toxic Chimera (독 키메라) ──
export function drawPixelToxicChimera(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 독성 아우라 (버블 파티클)
    for (let i = 0; i < 6; i++) {
        const ang = (t + i) % (Math.PI * 2);
        ctx.fillStyle = 'rgba(118, 255, 3, 0.4)';
        drawRect(ctx, Math.cos(ang) * 25 * pSize, Math.sin(ang) * 25 * pSize, 8 * pSize, 8 * pSize);
    }

    // 메인 바디 (녹색 비늘)
    ctx.fillStyle = '#1b5e20';
    drawRect(ctx, -20 * pSize, -15 * pSize, 40 * pSize, 35 * pSize);

    // 다중 헤드
    ctx.fillStyle = '#f9a825';
    drawRect(ctx, -30 * pSize, -25 * pSize, 12 * pSize, 12 * pSize);
    ctx.fillStyle = '#00695c';
    const snakeY = Math.sin(t * 5) * 5;
    drawRect(ctx, 15 * pSize, -25 * pSize + snakeY, 10 * pSize, 15 * pSize);

    ctx.restore();
}

// ── 보스 9: Sky Fortress Core (하늘 요새 코어) ──
export function drawPixelSkyFortressCore(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 48;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 회전 프레임
    ctx.save();
    ctx.rotate(t * 0.5);
    ctx.fillStyle = '#263238';
    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        drawRect(ctx, 20 * pSize, -10 * pSize, 15 * pSize, 20 * pSize);
    }
    ctx.restore();

    // 중앙 코어 아이
    const eyeGrid = [
        "      RRRRRR      ",
        "    RRRRRRRRRR    ",
        "   RRRRRRRRRRRR   ",
        "  RRRRRRKKRRRRRR  ",
        "  RRRRRKKKKRRRRR  ",
        "  RRRRRKKKKRRRRR  ",
        "  RRRRRRKKRRRRRR  ",
        "   RRRRRRRRRRRR   ",
        "    RRRRRRRRRR    ",
        "      RRRRRR      "
    ];
    drawPixelGrid(ctx, -12 * pSize, -12 * pSize, pSize * 1.5, eyeGrid);

    ctx.restore();
}

// ── 보스 10: Emperor V (황제) ──
export function drawPixelEmperorV(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.translate(0, Math.sin(t * 2) * 10);

    // 황금 옥좌
    ctx.fillStyle = '#ffd700';
    drawRect(ctx, -15 * pSize, -20 * pSize, 30 * pSize, 40 * pSize);
    ctx.fillStyle = '#d50000';
    drawRect(ctx, -12 * pSize, -15 * pSize, 24 * pSize, 30 * pSize);

    // 황제 픽셀 맵
    const kingGrid = [
        "      YYYY      ",
        "     YYYYYY     ",
        "    YYWWWWYY    ",
        "    YYYYYYYY    ",
        "   YYYYYYYYYY   ",
        "   WWWWWWWWWW   ",
        "   WKKWWWWKKW   ",
        "   WWWWWWWWWW   ",
        "  RRRRRRRRRRRR  ",
        "  RRRRRRRRRRRR  ",
        "  RRRRRRRRRRRR  ",
        "   RRRRRRRRRR   ",
        "    RRRRRRRR    ",
        "     RRRRRR     "
    ];
    drawPixelGrid(ctx, -8 * pSize, -25 * pSize, pSize, kingGrid);

    // 궤도 에너지 소드
    const rot = t * 3;
    ctx.fillStyle = '#00e5ff';
    for (let i = 0; i < 4; i++) {
        const ang = rot + (Math.PI / 2) * i;
        drawRect(ctx, Math.cos(ang) * 22 * pSize, Math.sin(ang) * 22 * pSize, 6 * pSize, 6 * pSize);
    }

    ctx.restore();
}
