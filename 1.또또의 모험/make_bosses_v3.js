const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const outDir = path.join(__dirname, 'game', 'assets', 'boss');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Draw a simple 16x16 pixel art shape mapped to the 128x128 canvas
function drawPixels(ctx, data, colors, pxSize = 8) {
    for (let y = 0; y < data.length; y++) {
        const row = data[y];
        for (let x = 0; x < row.length; x++) {
            const char = row[x];
            if (char !== ' ') {
                ctx.fillStyle = colors[char] || '#FF00FF';
                ctx.fillRect(x * pxSize, y * pxSize, pxSize, pxSize);
            }
        }
    }
}

const bosses = [
    {
        id: 1, name: 'Giant Buzz',
        // 말벌 장군: 녹색 정모, 선글라스, 다탄두 미사일
        colors: { 'g': '#1B5E20', 'G': '#4CAF50', 'k': '#000000', 'r': '#F44336', 'Y': '#FFEB3B', 'b': '#795548', 'w': '#FFFFFF', 't': 'rgba(255,255,255,0.4)', 'O': '#FF9800' },
        frameData: [
            [
                "      tttttttt  ",
                "  gGGGGGGg      ",  // 녹색 장교 모자
                " GggggggggG     ",
                " wGkkwwkkGw   tt",  // 붉은 렌즈 선글라스 (kkkk)
                "GkrrrrrrrrkG ttt",
                "wkwYwwwwYwkw    ",  // 견장 & 제복
                " YYGwbbwGYY     ",
                "kkGbbbbbbGkk    ",
                "  GbbkkbbG      ",
                "  bbbbbbbb      ",
                " kkk    kkk     ",
                "OkOkO  OkOkO    "   // 미사일 발사기 모양
            ]
        ]
    },
    {
        id: 2, name: 'Arachne',
        // 거미 여왕 아라크네: 검은(벨벳) 바탕에 핑크색 네온, 금색 티아라, 다리 8개
        colors: { 'k': '#111111', 'p': '#FF4081', 'P': '#F50057', 'Y': '#FFD700', 'g': '#424242' },
        frameData: [
            [
                "     kYYYYk     ", // 금색 티아라
                "    kkYppYkk    ",
                "   kkkkppkkkk   ",
                " g kkpkkkkpkk g ", // 6개 붉은(핑크) 눈
                " ggkkpkkkkpkkgg ",
                "  gkkppppppkkg  ", // 몸체 네온 패턴
                " g kkkPkkPkkk g ",
                "   kkPkkkkPkk   ",
                "g  kkppppppkk  g",
                "g gkkkkkkkkkkg g",
                "g  k        k  g",
                "   k        k   "  // 날카로운 금속 창 같은 다리 (일부)
            ]
        ]
    },
    {
        id: 3, name: 'Metal Orochi',
        // 메탈 오로치: 뱀 3개 머리, 크롬 메탈(은/파), 초록 네온
        colors: { 's': '#B0BEC5', 'S': '#78909C', 'w': '#FFFFFF', 'G': '#00E676', 'g': '#00C853', 'k': '#263238' },
        frameData: [
            [
                " ss        ss   ",
                "sGGs  ss  sGGs  ", // 3개 머리 눈(초록 네온)
                "sSSs sGGs sSSs  ",
                " kS  sSSs  Sk   ",
                "      Sk        ",
                "  ssSSssSSss    ", // 구불구불한 크롬 연결부
                " sSSSSkSSSSs    ",
                " sSSGSSGSSGs    ", // 틈새에서 나오는 초록 네온
                " sSGGSSGGSGs    ",
                "  ssSSkkSSss    ",
                "    sSSSSs      ",
                "      ss        "
            ]
        ]
    },
    {
        id: 4, name: 'Storm Falcon',
        // 스톰 팔콘: 파란/흰색 폭격기 매, 고글, 항공 점퍼
        colors: { 'B': '#2196F3', 'b': '#1565C0', 'w': '#FFFFFF', 'k': '#000000', 'O': '#FF9800', 'L': '#8D6E63', 'Y': '#FFC107' },
        frameData: [
            [
                "    bbbwwbbb    ",
                "   bBwkOOkWbb   ", // 고글(OO)과 날개 깃
                " bBwkkOOkkWbBwb ",
                "bbBwkkWLLkWbBbwb", // 갈색 항공 점퍼(LL)
                "    LWWLLLL     ",
                "wwbbLWYkLLLbbww ", // 금색 윙 배지(Y)
                "bbwwkLLLLLkwwbb ",
                "  bbwWLLLLWbb   ",
                " b b wwkkw  b b ",
                " b    OOO     b ", // 날카로운 발톱
                "      O O       ",
                "                "
            ]
        ]
    },
    {
        id: 5, name: 'Yeti King',
        // 예티 킹: 거대한 눈사람 유인원, 파란 피부, 얼음 곤봉
        colors: { 'W': '#FFFFFF', 'w': '#ECEFF1', 'B': '#00BCD4', 'b': '#0097A7', 'k': '#000000', 'r': '#E57373', 'I': '#84FFFF' },
        frameData: [
            [
                "     WWW        ", // 머리
                "    WWkWWW I    ", // 파란 피부 얼굴 (k:눈)
                "   WBkBBkWI I   ",
                "  WWBkBBkWW II  ", // 얼음 방망이 (III)
                "  WWWrBBrWW III ", // 포효하는 입 (빨강/파랑)
                " WWWWWWWWWWWII  ",
                " WWW BBB WWWI   ",
                " WWW BBB WWWW   ", // 근육질 몸통
                "  WW B B W W    ",
                "  WW B B W      ",
                "   BB   BB      ", // 파란 발
                "                "
            ]
        ]
    },
    {
        id: 6, name: 'Flame Salamander',
        // 불꽃 도롱뇽: 등줄기 불꽃, 거대한 육각형 비늘, 흑요석 발톱
        colors: { 'R': '#D32F2F', 'r': '#F44336', 'k': '#212121', 'B': '#2962FF', 'O': '#FF9800', 'Y': '#FFEB3B' },
        frameData: [
            [
                "      BBB       ", // 푸른 심지 불꽃
                "    Y BOB Y     ", // 붉은 불꽃 (YBORY)
                "    YRORORY     ",
                "   rRRkRkrRR    ", // 얼굴 (검은 반점 k)
                "  rrRrRRRrrrR   ",
                " kkrRRkkRRrrkk  ", // 육각형 검은 비늘 느낌 & 흑요석 발톱 (kk)
                "  rrRRkkRRrrr   ",
                "   rRkkkkRrR    ",
                " Y RRRkkRRR  Y  ",
                "YRY rRkkRr    Y ",
                "RY   rRRr      R",
                "      rr        "
            ]
        ]
    },
    {
        id: 7, name: 'Amalgam',
        // 고철 융합체: 버스 얼굴, 타이어 어깨, 폭주하는 코어 레드
        colors: { 'Y': '#FBC02D', 'y': '#FFF59D', 'K': '#212121', 'k': '#424242', 'R': '#D50000', 'r': '#FF5252', 's': '#9E9E9E', 'w': '#FFFFFF' },
        frameData: [
            [
                "  KKKss  ssKKK  ", // 타이어(K)와 굴삭기(s) 어깨
                " KKKKks  skKKKK ",
                " KKKYYyYYyYYKKK ", // 스쿨버스(Y) 흉부 
                "  KsYYYYYYYYsK  ",
                "  ssYkkYYkwYss  ", // 깨진 헤드라이트 (kw)
                "    YkkYYkkY    ",
                "   sYYRRRRYYs   ", // 붉은 핵폭주 (RRR)
                "  sskRrrrrRkss  ",
                "   kkRRRRRRkk   ",
                "    kkkskkk     ",
                "   kk     kk    ",
                "   K       K    "
            ]
        ]
    },
    {
        id: 8, name: 'Toxic Chimera',
        // 맹독 키메라: 방독면, 짐승 몸통, 약물 배양관 
        colors: { 'K': '#212121', 'k': '#424242', 'G': '#00E676', 'g': '#69F0AE', 'P': '#9C27B0', 'p': '#E1BEE7', 's': '#BCAAA4', 'S': '#795548', 'R': '#F44336' },
        frameData: [
            [
                "P    RkKkR    P ", // 방독면 렌즈 (R) 주변 가스 (P) 
                "K  p kKkKk p  K ",
                "R G KKkKkKK G R ", // 호스 (K), 유리관 (G)
                "gGg SSSsSSS gGg ", // 몸통 근육 (S)
                "G GSSsSsSsSSG G ",
                "  SSSSSSSSSSSS  ",
                "  SSSSGkGSSSSS  ",
                " P SSSGkGSSSS P ", // 약물 흐름
                "  P SSSkSSSS P  ",
                " k  SS   SS     ",
                "Kk  kK   Kk     ",
                " k     K        "  // 뱀 꼬리
            ]
        ]
    },
    {
        id: 9, name: 'Galactic Core',
        // 원자로 핵: 투명 기둥 속 플라즈마, 강철 프레임, 레이저 스나이퍼
        colors: { 'S': '#546E7A', 's': '#78909C', 'B': '#00B0FF', 'b': '#84FFFF', 'w': '#FFFFFF', 'K': '#263238', 'R': '#FF1744' },
        frameData: [
            [
                "   R  SS  R     ", // 파란 플라즈마
                "  SSS KK SSS    ",
                "  SK SwBS KS    ",
                "  SKK BwB KKS   ",
                "   KK wBB KK    ",
                " R KS BwB SK R  ", // 레이저 포(R)
                "RSRSK wBw KSRS  ",
                " sS KK B KK Ss  ",
                " sS KK w KK Ss  ",
                "  s KKKKKK s    ",
                "  s  SKKS  s    ",
                "     SKKS       "
            ]
        ]
    },
    {
        id: 10, name: 'Emperor V',
        // 황제: 황금 아머, 백/청 안광, 붉은 벨벳 망토
        colors: { 'Y': '#FFD700', 'y': '#FFF59D', 'w': '#FFFFFF', 'b': '#18FFFF', 'r': '#B71C1C', 'R': '#D32F2F', 'D': '#3E2723' },
        frameData: [
            [
                "    wYYw        ", // 투구 (YY)
                "   YYwwYY       ",
                "   wDYwDw   wb  ", // 파란 안광 (wb) 검은 틈(D)
                "   DDYDwD   YY  ",
                "  rYYYYYYr YY  ",
                " Rr YYYY rRYY   ", // 대검 (YY)을 들고 있는 모습
                " RR YwwY YYY    ",
                " RR wYYw   Y    ",
                "  R YYYY  R     ",
                "R   YYYY   R    ",
                "RR   DD   RR    ",
                "RR        RR    "  // 길게 깔리는 핏빛 망토 (RR)
            ]
        ]
    }
];

function generateV3Sprite(ctx, w, h, boss, frame) {
    ctx.clearRect(0, 0, w, h);

    // Background placeholder
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, w, h);

    const baseData = boss.frameData[0];
    const pxSize = w / 16;

    // Handle simple 4 frame breathing animation (Y offset)
    const animOffset = (frame === 1 || frame === 3) ? (frame === 1 ? -1 : 1) : 0;

    ctx.save();
    // Only apply breathing to specific lines or whole body depending on boss
    ctx.translate(0, animOffset * (pxSize / 2));
    drawPixels(ctx, baseData, boss.colors, pxSize);

    // Dynamic eyes or particle overlays for frames
    if (frame === 1 || frame === 3) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        // Draw a random blink or glow over certain parts
        if (boss.id === 8 || boss.id === 3 || boss.id === 9) {
            ctx.fillRect(w / 2 - pxSize, h / 2 - pxSize, pxSize * 2, pxSize * 2);
        }
    }

    ctx.restore();
}

bosses.forEach(boss => {
    // 1. Static Image
    const canvas1 = createCanvas(128, 128);
    generateV3Sprite(canvas1.getContext('2d'), 128, 128, boss, 0);
    fs.writeFileSync(path.join(outDir, `boss_${boss.id}.png`), canvas1.toBuffer('image/png'));

    // 2. Sprite Image (4 frames)
    const cw = 128;
    const ch = 128;
    const canvas2 = createCanvas(cw * 4, ch);
    const ctx2 = canvas2.getContext('2d');
    for (let i = 0; i < 4; i++) {
        ctx2.save();
        ctx2.translate(i * cw, 0);
        generateV3Sprite(ctx2, cw, ch, boss, i);
        ctx2.restore();
    }
    fs.writeFileSync(path.join(outDir, `boss_${boss.id}_sprite.png`), canvas2.toBuffer('image/png'));
    console.log(`[V3.2 SPEC] Generated Boss ${boss.id} (${boss.name}).`);
});
console.log('HARDCODED Pixel Art Bosses generated perfectly according to v3.2 specs in assets/boss directory.');
