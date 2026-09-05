// ============================================================
// [Graphics Layer] pixel_enemies.js
// 적 캐릭터 그래픽 (정찰벌, 나비, 딱정벌레, 드론, 유령, 슬라임)
// 각 적의 픽셀 그리드 기반 프로시저럴 렌더링
// ============================================================

import { drawRect, drawPixelGrid } from './pixel_helpers.js';

// ── 정찰벌 (Scout Wasp) ──
export function drawPixelWaspV2(ctx, x, y, w, h) {
    const cx = x;
    const cy = y;
    const t = Date.now() / 1000;
    const hover = Math.sin(t * 10) * 4;
    const pSize = w / 16;

    // 날개 애니메이션
    const wingColor = Math.sin(t * 40) > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(200,200,255,0.2)';
    ctx.fillStyle = wingColor;
    ctx.fillRect(x + 4, y - 10 + hover, 24, 10);

    // 16x16 픽셀 맵
    const waspGrid = [
        "      XXXX      ",
        "    XXyyyyXX    ",
        "  XXyyyyyyyyXX  ",
        " XyyyyyyyyyyyyX ",
        "XyyKKKyyyyKKKyyX",
        "XyKKrKyyyyKrKKyX",
        "XyKKKKyyyyKKKKyX",
        "XooooooooooooooX",
        "XooooooooooooooX",
        "XssssssssssssssX",
        " XssssssssssssX ",
        "  XssssssssssX  ",
        "   XssssssssX   ",
        "    XXssssXX    ",
        "      XXXX      ",
        "       RR       "
    ];

    drawPixelGrid(ctx, cx, cy + hover, pSize, waspGrid);

    // 부스터 이펙트
    const flame = Math.random() * 15;
    drawRect(ctx, x + w - 4, y + h / 2 - 2 + hover, flame, 4, '#00e5ff');
}

// ── 나비 (Dancing Butterfly) ──
export function drawPixelButterflyV2(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const flap = Math.sin(t * 15) > 0;
    const pSize = w / 16;

    const butterflyGrid = flap ? [
        "  MMMM    MMMM  ",
        " MMMMMMM MMMMMMM",
        "MMMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMMM",
        " MMMMMMMMMMMMMM ",
        "  MMMMMMMMMMMM  ",
        "   MMMKKKKMMM   ",
        "    MKKKKKKM    ",
        "     KKKKKK     ",
        "    KKKKKKKK    ",
        "   KKKKKKKKKK   ",
        "  MMMMMMMMMMMM  ",
        " MMMMMMMMMMMMMM ",
        "MMMMMMMMMMMMMMMM",
        "MMMMMMMMMMMMMMMM",
        " MMMMMMM MMMMMMM"
    ] : [
        "      MMMM      ",
        "     MMMMMM     ",
        "    MMMMMMMM    ",
        "   MMMMMMMMMM   ",
        "  MMMMKKKKMMMM  ",
        " MMMMMKKKKMMMMM ",
        "MMMMMMKKKKMMMMMM",
        "MMMMMMKKKKMMMMMM",
        "MMMMMMKKKKMMMMMM",
        " MMMMMKKKKMMMMM ",
        "  MMMMKKKKMMMM  ",
        "   MMMMMMMMMM   ",
        "    MMMMMMMM    ",
        "     MMMMMM     ",
        "      MMMM      ",
        "                "
    ];

    drawPixelGrid(ctx, x, y, pSize, butterflyGrid);
}

// ── 딱정벌레 (Beetle) ──
export function drawPixelBeetleV2(ctx, x, y, w, h) {
    const pSize = w / 16;
    const beetleGrid = [
        "      XXXX      ",
        "    XXssssXX    ",
        "  XXssssssssXX  ",
        " XssssssssssssX ",
        "XssssssssssssssX",
        "XsssssXXXXsssssX",
        "XssssXXKKXXssssX",
        "XssssXKKKKXssssX",
        "XooooooooooooooX",
        "XooooooooooooooX",
        "XssssssssssssssX",
        " XssssssssssssX ",
        "  XXssssssssXX  ",
        "    XXssssXX    ",
        "      XXXX      ",
        "     KK  KK     "
    ];
    drawPixelGrid(ctx, x, y, pSize, beetleGrid);
}

// ── 드론 (Drone) ──
export function drawPixelDroneV2(ctx, x, y, w, h) {
    const pSize = w / 16;
    const droneGrid = [
        "      XXXX      ",
        "    XXssssXX    ",
        "  XXssssssssXX  ",
        " XssssXXXXXXXXX ",
        "XssssXXRRRRRRXXS",
        "XssssXRRRRRRRRXS",
        "XssssXXRRRRRRXXS",
        "XssssXXXXXXXXXXS",
        "XssssssssssssssS",
        " XssssssssssssX ",
        "  XXssssssssXX  ",
        "    XXssssXX    ",
        "      XXXX      ",
        "     KK  KK     ",
        "    KK    KK    ",
        "                "
    ];
    drawPixelGrid(ctx, x, y, pSize, droneGrid);
}

// ── 유령 (Ghost) ──
export function drawPixelGhostV2(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 16;
    const ghostGrid = [
        "      WWWW      ",
        "    WWWWWWWW    ",
        "   WWWWWWWWWW   ",
        "  WWWWWWWWWWWW  ",
        " WWWWWWWWWWWWWW ",
        "WWWWWWWWWWWWWWWW",
        "WWWKKWWWWWWKKWWW",
        "WWKKKKWWWWKKKKWW",
        "WWKKKKWWWWKKKKWW",
        "WWWWWWWWWWWWWWWW",
        "WWWWWWWWWWWWWWWW",
        " WWWWWWWWWWWWWW ",
        "  WW  WW  WW  W ",
        "   W   W   W    ",
        "                ",
        "                "
    ];
    ctx.save();
    ctx.globalAlpha = 0.7;
    drawPixelGrid(ctx, x, y + Math.sin(t * 5) * 5, pSize, ghostGrid);
    ctx.restore();
}

// ── 슬라임 (Slime) ──
export function drawPixelSlimeV2(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 16;
    const slimeGrid = [
        "                ",
        "      GGGG      ",
        "    GGGGGGGG    ",
        "   GGGGGGGGGG   ",
        "  GGGGGGGGGGGG  ",
        " GGGGGGGGGGGGGG ",
        "GGGGGKGGGGGKGGGG",
        "GGGGKKKGGGGKKKGG",
        "GGGGGGGGGGGGGGGG",
        " GGGGGGGGGGGGGG ",
        "  GGGGGGGGGGGG  ",
        "   GGGGGGGGGG   ",
        "    GGGGGGGG    ",
        "      GGGG      ",
        "                ",
        "                "
    ];
    const squish = Math.sin(t * 10) * 0.1;
    ctx.save();
    ctx.translate(x + w / 2, y + h);
    ctx.scale(1 + squish, 1 - squish);
    drawPixelGrid(ctx, -w / 2, -h, pSize, slimeGrid);
    ctx.restore();
}
