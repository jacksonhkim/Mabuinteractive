// ============================================================
// [Graphics Layer] pixel_hero.js
// 플레이어 캐릭터 그래픽 (또또, 루루, 카카, 모모, 피피)
// 각 캐릭터의 프로시저럴 픽셀 아트 + 이미지 폴백 렌더링
// ============================================================

import { PLAYER_IMAGES } from '../data/assets.js';
import { drawRect, drawCharImg, drawPixelGrid } from './pixel_helpers.js';

// ── 또또 V2 (V5 래핑) ──
export function drawPixelTotoV2(ctx, x, y, w, h, vy = 0) {
    drawPixelTotoV5(ctx, x, y, w, h, vy);
}

// ── 또또 V5 [HONEY BEE REDESIGN] ──
// 한순이 AD: "울트라 디테일 2D 픽셀 아트 스타일로 재해석한 꿀벌 또또"
export function drawPixelTotoV5(ctx, x, y, w, h, vy = 0) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player1, x, y, w, h)) return;

    // 이미지 미로딩시 프로시저럴 폴백
    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 8) * 6;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1);

    const colors = {
        'B': '#3E2723', 'Y': '#FFD54F', 'y': '#FFA000', 'O': '#E65100',
        'H': '#FFF9C4', 'W': '#FFFFFF', 'E': '#1A1A1A',
        'g': 'rgba(200, 230, 255, 0.4)', 'p': '#FFAB91'
    };

    const beeGrid = [
        "          BBBBBBBBBB            ",
        "        BBHHHHHHHHHHBB          ",
        "      BBHHHHHHHHHHHHHHBB        ",
        "    BBHHHHHHHHHHHHHHHHHHBB      ",
        "    BBHHHHHHHHHHHHHHHHHHBB      ",
        "  BBHHHHHHHHHHHHHHHHHHHHHHBB    ",
        "  BBHHHHHHHHHHHHHHHHHHHHHHBB    ",
        "BBHHHHHHHHHHHHHHHHHHHHHHHHHHBB  ",
        "BBHHHHHHHHHBBBBBBBBBBHHHHHHHBB  ",
        "BBHHHHHHBBBEEEEEEEEEEBBBHHHHBB  ",
        "BBHHHHBBEEEEEEEEEEEEEEEEBBHHBB  ",
        "BBHHHBBEEEEEEWWWEEEEEEEEEBBHBB  ",
        "BBHHHBBEEEEEWWWWWEEEEEEEEEBBHBB ",
        "BBHHHBBEEEEEWWWWWEEEEEEEEEBBHBB ",
        "BBHHHBBEEEEEEWWWEEEEEEEEEBBHBB  ",
        "BBHHHBBEEEEEEEEEWWWEEEEEEBBHBB  ",
        "BBHHHBBEEEEEEEEWWWWWEEEEEBBHBB  ",
        "BBHHHBBEEEEEEEEWWWWWEEEEEBBHBB  ",
        "BBHHHHBBEEEEEEEEWWWEEEEBBHHBB   ",
        "BBHHHHHBBBBEEEEEEEEBBBBHHHHHBB  ",
        "BBHHHHHHHHHBBBBBBBBHHHHHHHHHBB  ",
        "  BBHHHHHHHHHHHHHHHHHHHHHHBB    ",
        "  BBHHHHYYppHHHHHHppYYHHHHBB    ",
        "    BBHHppppHHHHHHppppHHBB      ",
        "    BBHHHHYYYYYYYYYYYYHHBB      ",
        "      BBHHHHHHHHHHHHHHBB        ",
        "        BBHHHHHHHHHHBB          ",
        "   gggg   BBBBBBBBBB   gggg     ",
        " gggggggg  BBBBBBBB  gggggggg   ",
        " gggggggg  BBBBBBBB  gggggggg   ",
        "  gggggg     BBBB     gggggg    ",
        "             BBBB               "
    ];

    beeGrid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            drawRect(ctx, -w / 2 + rx * pSize, -h / 2 + ry * pSize, pSize, pSize, colors[pixel]);
        });
    });

    ctx.restore();
}

// ── 비트비 (미니 또또 펀넬) ──
export function drawBitBee(ctx, x, y, w, h) {
    ctx.save();
    drawPixelTotoV5(ctx, x, y, w, h);
    ctx.restore();
}

// ── 루루 (나비 - 스피드 타입) V5 ──
export function drawPixelLuluV2(ctx, x, y, w, h) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player2, x, y, w, h)) return;

    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 10) * 3;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1);

    const luluGrid = [
        "      ppPPpp          ppPPpp    ",
        "    ppPPPPPPpp      ppPPPPPPpp  ",
        "   pPPPPPPPPPPp    pPPPPPPPPPPp ",
        "  pPPPPPPPPPPPPp  pPPPPPPPPPPPPp",
        " pPPPWWWWWWPPPPp  pPPPWWWWWWPPPPp",
        " pPPWWWWWWWWPPpp  ppPPWWWWWWWWPPp",
        " pPPWWWWWWWWPPpp  ppPPWWWWWWWWPPp",
        " pPPPWWWWWWPPPpp  ppPPPWWWWWWPPPp",
        "  pPPPPPPPPPPppBBBBppPPPPPPPPPPp",
        "   pPPPPPPPPppBBBBBBppPPPPPPPPp ",
        "    ppPPPPppBBBBBBBBBBppPPPPpp  ",
        "      ppppBBBBFEFEFBBBBpppp     ",
        "         BBBFFFFFFFFFBBB        ",
        "        BBBFFFEEEEEFFFBBB       ",
        "        BBBFFEEEEEEEFFBBB       ",
        "       BBBFFEEEEWWEEEFFBBB      ",
        "       BBBFFEEEWWWWEEEFFBBB     ",
        "       BBBFFEEEWWWWEEEFFBBB     ",
        "       BBBFFEEEEWWEEEFFBBB      ",
        "        BBBFFEEEEEEEFFBBB       ",
        "        BBBFFFEEEEEFFFBBB       ",
        "         BBBFFFFFFFFFBBB        ",
        "          BBBFFFFFFFBBB         ",
        "          BBBBBBBBBBBBB         ",
        "         ppBBBBBBBBBBBpp        ",
        "        ppppBBBBBBBBBpppp       ",
        "       ppppBBBBBBBBBBBpppp      ",
        "      ppppBBBBBBBBBBBBBpppp     ",
        "     ppppBBBBBBBBBBBBBBBpppp    ",
        "         BBBB       BBBB        ",
        "         BBBB       BBBB        ",
        "        BBBB         BBBB       "
    ];

    const colors = {
        'p': '#F48FB1', 'P': '#E91E63', 'W': 'rgba(255,255,255,0.6)',
        'B': '#880E4F', 'F': '#FFCCBC', 'E': '#1A1A1A'
    };

    luluGrid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            ctx.fillStyle = colors[pixel] || pixel;
            drawRect(ctx, -w / 2 + rx * pSize, -h / 2 + ry * pSize, pSize, pSize, ctx.fillStyle);
        });
    });
    ctx.restore();
}

// ── 카카 (딱정벌레 - 파워 타입) V5 ──
export function drawPixelKakaV2(ctx, x, y, w, h) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player3, x, y, w, h, true)) return;

    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 4) * 2;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1);

    const kakaGrid = [
        "           BBBBBBBB             ",
        "         BBggggggggBB           ",
        "       BBggggggggggggBB         ",
        "      BggggggggggggggggB        ",
        "     BggggggggggggggggggB       ",
        "    BggggggggggggggggggggB      ",
        "    BggggggggggggggggggggB      ",
        "    BggggggggggggggggggggB      ",
        "    BggggggggggggggggggggB      ",
        "   BggggggggggggggggggggggB     ",
        "   BggggggggggggggggggggggB     ",
        "   BggggggggggggggggggggggB     ",
        "  BBMMMMMMMMMMMMMMMMMMMMMMBB    ",
        "  BMMMMMMMMMMMMMMMMMMMMMMMMB    ",
        "  BMMMMMMMMMMMMMMMMMMMMMMMMB    ",
        " BBMMMMMMMMMMMMMMMMMMMMMMMMBB   ",
        " BMMMMHYYYYYHMMMMHYYYYYHMMMMB   ",
        " BMMMHYYYYYYYHM MHYYYYYYYHMMMB   ",
        " BMMMHYYYYYYYHMMMMHYYYYYYYHMMMB   ",
        " BMMMMHYYYYYHMMMMMMHYYYYYHMMMMB   ",
        " BBMMMMMMMMMMMMMMMMMMMMMMMMBB   ",
        "  BBMMMMMMMMMMMMMMMMMMMMMMBB    ",
        "  BMMMMMMMMMMMMMMMMMMMMMMMMB    ",
        "  BMMMMMMMMMMHHMMMMMMMMMMMMB    ",
        "  BMMMMMMMMHHHHHHMMMMMMMMMMB    ",
        "   BMMMMMMHHHHHHHHMMMMMMMMB     ",
        "   BBMMMMMMMMHHMMMMMMMMMMBB     ",
        "    BBMMMMMMMMMMMMMMMMMMBB      ",
        "      BBMMMMMMMMMMMMMMBB        ",
        "        BBBBBBBBBBBBBB          ",
        "       BB            BB         ",
        "      BB              BB        "
    ];

    const colors = {
        'B': '#3E2723', 'g': '#5D4037', 'M': '#3E2723',
        'H': '#8D6E63', 'Y': '#FFD54F'
    };

    kakaGrid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            drawRect(ctx, -w / 2 + rx * pSize, -h / 2 + ry * pSize, pSize, pSize, colors[pixel] || pixel);
        });
    });
    ctx.restore();
}

// ── 모모 (무당벌레 - 방어 타입) V5 ──
export function drawPixelMomoV2(ctx, x, y, w, h) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player4, x, y, w, h, true)) return;

    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 4) * 4;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1);

    const momoGrid = [
        "         RRRRRRRRRR             ",
        "       RRRRRRRRRRRRRR           ",
        "      RRRRRRRRRRRRRRRR          ",
        "     RRRRKKKKKKKKRRRRRR         ",
        "    RRRRKKKKKKKKKRRRRRRR        ",
        "    RRRRKKKKKKKKKRRRRRRR        ",
        "    RRRRKKKKKKKKKRRRRRRR        ",
        "    RRRRRRRRRRRRRRRRRRRR        ",
        "    RRRRRRRRRRRRRRRRRRRR        ",
        "    RRRRRKKKKKKKKKRRRRRR        ",
        "    RRRRRKKKKKKKKKRRRRRR        ",
        "    RRRRRRRRRRRRRRRRRRRR        ",
        "    RRBBBBBBBBBBBBBBBBRR        ",
        "    RBBBBBBBBBBBBBBBBBBR        ",
        "   BBBBBBBBBBBBBBBBBBBBBB       ",
        "   BBBBBBBBBBBBBBBBBBBBBB       ",
        "  BBBBBBFFFFFFFBBBBBBBBBBB      ",
        "  BBBBBFFFFFFFFFBBBBBBBBBB      ",
        "  BBBBBFFE E FFE EBBBBBBBB      ",
        "  BBBBBFF E EF F EBBBBBBBB      ",
        "  BBBBBFFE E FF E EBBBBBBBB      ",
        "  BBBBBFFFFFFFFFBBBBBBBBBB      ",
        "  BBBBBBFFFFFFFBBBBBBBBBBB      ",
        "   BBBBBBBBBBBBBBBBBBBBBB       ",
        "   BBBBBBBBBBBBBBBBBBBBBB       ",
        "    BBBBBBBBBBBBBBBBBBBB        ",
        "    BBBBBBBBBBBBBBBBBBBB        ",
        "     BBBBBB    BBBBBB           ",
        "      BBBB      BBBB            ",
        "      BBBB      BBBB            ",
        "      BBBB      BBBB            "
    ];

    const colors = {
        'R': '#D32F2F', 'K': '#1A1A1A', 'B': '#212121', 'F': '#FFCCBC', 'E': '#000000'
    };

    momoGrid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            drawRect(ctx, -w / 2 + rx * pSize, -h / 2 + ry * pSize, pSize, pSize, colors[pixel] || pixel);
        });
    });
    ctx.restore();
}

// ── 피피 (잠자리 - 특수 타입) V5 ──
export function drawPixelPipiV2(ctx, x, y, w, h) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player5, x, y, w, h)) return;

    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 8) * 6;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1);

    const pipiGrid = [
        "             GGGG               ",
        "           GGGGGGGG             ",
        "          GGGGEEGGGG            ",
        "          GGEEEEEEGG            ",
        "          GGEEEEEEGG            ",
        "          GGGGEEGGGG            ",
        "           GGGGGGGG             ",
        "  TTTTT      BBBB      TTTTT    ",
        " TTTTTTTT    BBBB    TTTTTTTT   ",
        "TTTTTTTTTT   BBBB   TTTTTTTTTT  ",
        " TTTTTTTT    BBBB    TTTTTTTT   ",
        "  TTTTT      BBBB      TTTTT    ",
        "             BBBB               ",
        "  TTTTT      BBBB      TTTTT    ",
        " TTTTTTTT    BBBB    TTTTTTTT   ",
        "TTTTTTTTTT   BBBB   TTTTTTTTTT  ",
        " TTTTTTTT    BBBB    TTTTTTTT   ",
        "  TTTTT      BBBB      TTTTT    ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "             BBBB               ",
        "            BBBBBB              ",
        "           BBBBBBBB             ",
        "           BBBBBBBB             "
    ];

    const colors = {
        'G': '#43A047', 'E': '#212121', 'B': '#1B5E20', 'T': 'rgba(129, 212, 250, 0.5)'
    };

    pipiGrid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            drawRect(ctx, -w / 2 + rx * pSize, -h / 2 + ry * pSize, pSize, pSize, colors[pixel] || pixel);
        });
    });
    ctx.restore();
}
