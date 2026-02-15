// [Ultra Pixel Art Engine V4] - High Fidelity & Performance
import { BACKGROUND_IMAGES, PLAYER_IMAGES } from './assets.js';


// Helper: 픽셀 그리기 (좌표 보정 포함)
const drawRect = (ctx, x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
};

// Helper: 캐릭터 이미지 그리기 (반전 처리 및 로딩 상태 확인)
const drawCharImg = (ctx, img, x, y, w, h, flip = false) => {
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

// [High-Fidelity] Pixel Grid Helper
const drawPixelGrid = (ctx, x, y, size, grid) => {
    grid.forEach((row, ry) => {
        row.split('').forEach((pixel, rx) => {
            if (pixel === ' ') return;
            const colors = {
                'K': '#1A1A1A', // Rich Black Outline
                'W': '#FFFFFF', // Pure White Sparkle
                'Y': '#FFD54F', // Warm Honey Gold
                'y': '#FFA000', // Rich Amber Shadow
                'M': '#795548', // Chocolate Fedora Brown
                'm': '#4E342E', // Dark Espresso Brown
                'B': '#2D1B17', // Near-Black Hat Band
                'p': '#FFC1CF', // Soft Pastel Pink Blush
                'g': 'rgba(200, 230, 255, 0.4)', // Glassy Transparent Wing
                'S': '#FFF9C4', // Soft Creamy Highlight
                'O': '#FF8F00', // Deep Orange-Honey shading
                'H': '#FFF176'  // Bright Yellow Accent
            };
            drawRect(ctx, x + rx * size, y + ry * size, size, size, colors[pixel] || '#FF00FF');
        });
    });
};

// 1. Hero (Toto) - V12 [FINAL TRUE 1:1 REPLICATION]
// 이 버전은 기존의 마스터본입니다.
// 1. Hero (Toto) - V12 [FINAL TRUE 1:1 REPLICATION]
// 이 버전은 기존의 마스터본입니다.
export function drawPixelTotoV2(ctx, x, y, w, h, vy = 0) {
    drawPixelTotoV5(ctx, x, y, w, h, vy);
}

// 1-B. Hero (Toto) - V5 [HONEY BEE REDESIGN]
// 한순이 AD: "울트라 디테일 2D 픽셀 아트 스타일로 재해석한 꿀벌 또또입니다."
export function drawPixelTotoV5(ctx, x, y, w, h, vy = 0) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player1, x, y, w, h)) return;

    // Fallback to procedural if image not loaded
    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 8) * 6;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1);

    const colors = {
        'B': '#3E2723', 'Y': '#FFD54F', 'y': '#FFA000', 'O': '#E65100',
        'H': '#FFF9C4', 'W': '#FFFFFF', 'E': '#1A1A1A', 'g': 'rgba(200, 230, 255, 0.4)', 'p': '#FFAB91'
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

// 1-C. Bit Bee (Funnel) - Mini Toto
export function drawBitBee(ctx, x, y, w, h) {
    // We use drawPixelTotoV5 with a smaller size (32x32 typically passed from entities)
    // To distinguish them, we can add a slight glow or just use them as is
    ctx.save();
    // drawPixelTotoV5 handles its own hover and scale(-1, 1), so we just position it
    drawPixelTotoV5(ctx, x, y, w, h);
    ctx.restore();
}

// 2. Enemy (Wasp) - Pixel Grid High Detail
export function drawPixelWaspV2(ctx, x, y, w, h) {
    const cx = x;
    const cy = y;
    const t = Date.now() / 1000;
    const hover = Math.sin(t * 10) * 4;
    const pSize = w / 16;

    // Wing Animation
    const wingColor = Math.sin(t * 40) > 0 ? 'rgba(255,255,255,0.4)' : 'rgba(200,200,255,0.2)';
    ctx.fillStyle = wingColor;
    ctx.fillRect(x + 4, y - 10 + hover, 24, 10);

    // [Detail] 16x16 Pixel Map for Wasp
    const waspGrid = [
        "      XXXX      ",
        "    XXyyyyXX    ",
        "  XXyyyyyyyyXX  ",
        " XyyyyyyyyyyyyX ",
        "XyyKKKyyyyKKKyyX", // Eyes
        "XyKKrKyyyyKrKKyX", // Scouter Red
        "XyKKKKyyyyKKKKyX",
        "XooooooooooooooX", // Stripe 1
        "XooooooooooooooX",
        "XssssssssssssssX", // Metal Part
        " XssssssssssssX ",
        "  XssssssssssX  ",
        "   XssssssssX   ",
        "    XXssssXX    ",
        "      XXXX      ",
        "       RR       "  // Stinger
    ];

    drawPixelGrid(ctx, cx, cy + hover, pSize, waspGrid);

    // Booster Effect
    const flame = Math.random() * 15;
    drawRect(ctx, x + w - 4, y + h / 2 - 2 + hover, flame, 4, '#00e5ff');
}

// 2-B. Boss (Buzz) - Ultimate Detail V1
// 2-B. Boss (Buzz) - Ultimate Pixel Grid
export function drawPixelBossBuzzV2(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const hover = Math.sin(t * 5) * 15;
    const pSize = w / 32;

    const bossGrid = [
        "      XXXXXXXXXXXXXXXXXXXX      ",
        "    XXssssssssssssssssssssXX    ",
        "  XXssssssssssssssssssssssssXX  ",
        " XsssssssssXXXXXXXXsssssssssssX ",
        "XssssssssXXKKKKKKKKXXssssssssssX", // Head Plate
        "XsssssssXKKKKKKKKKKKKXsssssssssX",
        "XsssssssXKKKrKKKKKKKKXsssssssssX", // Pulsing Eye
        "XssssssssXXKKKKKKKKXXssssssssssX",
        "XyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyX", // Gold Stripe
        "XyyyyyyyyyX........XyyyyyyyyyyyX", // Rivets in center
        "XooooooooooooooooooooooooooooooX", // Shadow Stripe
        " XssssssssssssssssssssssssssssX ",
        "  XssssssssssX..XssssssssssssX  ",
        "   XXssssssssssssssssssssssXX   ",
        "     XXXXXXXXXXXXXXXXXXXXXX     "
    ];

    drawPixelGrid(ctx, x, y + hover, pSize, bossGrid);

    // [Side Detail] Gatling Gun (Pixelated)
    drawRect(ctx, x - 20, y + 40 + hover, 30, 20, '#263238');
    drawRect(ctx, x - 30, y + 45 + hover, 35, 10, '#455a64');

    // [Detail] Boosters
    const colors = ['#00e5ff', '#00b0ff', '#2979ff', '#3d5afe'];
    for (let i = 0; i < 4; i++) {
        const fy = y + 15 + i * 25 + hover;
        const beamLen = 30 + Math.random() * 20;
        drawRect(ctx, x + w - 5, fy, beamLen, 10, colors[i]);
    }
}

// 3. Enemy (Butterfly) - Pixel Grid V1
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

// 4. Enemy (Beetle) - Pixel Grid V1
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

// 5. Enemy (Drone) - Pixel Grid V1
export function drawPixelDroneV2(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 16;
    const droneGrid = [
        "      XXXX      ",
        "    XXssssXX    ",
        "  XXssssssssXX  ",
        " XssssXXXXXXXXX ", // Offset for fake rotation
        "XssssXXRRRRRRXXS", // Red Lens
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

// 6. Enemy (Ghost) - Pixel Grid V1
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
        "WWWKKWWWWWWKKWWW", // Eyes
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

// 7. Enemy (Slime) - Pixel Grid V1
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
        "GGGGGKGGGGGKGGGG", // Eyes
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


// 3.5 Enemies Continued...

// Background - High Quality Pixel Art Version (V3)
// SEAMLESS LOOPING FIX: Using modulo and extra tile padding to ensure zero jumping.
export function drawPixelForestV2(ctx, CONFIG, state) {
    const stage = state.currentStage || 1;
    const bgOffset = state.bgOffset || 0;

    const envStyles = {
        1: { // PixelSky Theme
            skyTop: '#0d47a1', skyBot: '#42a5f5', sunColor: 'rgba(255, 255, 255, 0.2)',
            treeColor: (c) => `rgba(255, 255, 255, ${c * 0.3})`, groundColor: '#1565c0',
            detailColor: '#1e88e5', accentColor: '#bbdefb', godRays: false
        },
        2: { // Night
            skyTop: '#0d1117', skyBot: '#161b22', sunColor: 'rgba(255,255,255,0.1)',
            treeColor: (c) => `rgba(13, 25, 48, ${c})`, groundColor: '#050a14',
            detailColor: '#1f2937', accentColor: '#38bdf8', godRays: false
        },
        3: { // Sunset
            skyTop: '#4c1d95', skyBot: '#db2777', sunColor: 'rgba(251, 146, 60, 0.3)',
            treeColor: (c) => `rgba(88, 28, 135, ${c})`, groundColor: '#4c1d95',
            detailColor: '#7c3aed', accentColor: '#fcd34d', godRays: true
        }
    };

    const style = envStyles[stage] || envStyles[stage % 3 || 1];

    // 1. Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.SCREEN_HEIGHT);
    grad.addColorStop(0, style.skyTop); grad.addColorStop(1, style.skyBot);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Helper: Draw Parallax Layer
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

    // 2. Parallax Clouds (Rendered *after* stage backgrounds but *before* God Rays for depth)
    const drawCloud = (cx, cy, scale, alpha) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        drawRect(ctx, -20, 0, 40, 20); drawRect(ctx, -10, -10, 30, 10);
        drawRect(ctx, 10, 0, 20, 10); drawRect(ctx, -30, 5, 20, 10);
        ctx.restore();
    };

    // [New Stage 1 Theme] PixelSky Implementation
    if (stage === 1) {
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.layer02, 0.5)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.layer03, 0.8)) layersDrawn = true;

        if (layersDrawn) return; // Only skip procedural if we actually drew PNG layers
    } else if (stage === 2) {
        // [Stage 2] Night Watch - 5 Layer Parallax
        let layersDrawn = false;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer01, 0.2)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer02, 0.4)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer03, 0.6)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer04, 0.8)) layersDrawn = true;
        if (drawLayer(BACKGROUND_IMAGES.s2_layer05, 1.0)) layersDrawn = true;

        if (layersDrawn) return;
    } else if (stage === 3) {
        // [Stage 3] Sunset - 4 Layer Parallax with Adjustments to close gap
        let layersDrawn = false;
        // Layer 01: Sky - Default
        if (drawLayer(BACKGROUND_IMAGES.s3_layer01, 0.2)) layersDrawn = true;
        // Layer 02: Mid-distance - Move UP (-50) and Stretch (200) to cover top gap and meet bottom
        if (drawLayer(BACKGROUND_IMAGES.s3_layer02, 0.3, -50, 200)) layersDrawn = true;
        // Layer 03: Ground - Stretch UP to cover gap from bottom (yOffset -120, extraHeight +120)
        if (drawLayer(BACKGROUND_IMAGES.s3_layer03, 0.5, -120, 120)) layersDrawn = true;
        // Layer 04: Foreground - Default or slight adjust
        if (drawLayer(BACKGROUND_IMAGES.s3_layer04, 0.7, -50, 50)) layersDrawn = true;

        if (layersDrawn) return;
    }

    const cloudSpacing = 500;
    const cloudCount = Math.ceil(CONFIG.SCREEN_WIDTH / cloudSpacing) + 2;
    for (let i = 0; i < cloudCount; i++) {
        const speedFactor = 0.5;
        const x = ((i * cloudSpacing) + (bgOffset * speedFactor) % cloudSpacing) - cloudSpacing;
        drawCloud(x, 100 + (i % 3) * 40, 1.5 + (i % 2) * 0.2, 0.25);
    }

    // 3. God Rays
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

    // 4. Parallax Trees
    // Far Layer (Slow)
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

    // Near Layer (Faster)
    const drawHQTree = (tx, ty, s, c) => {
        drawRect(ctx, tx - 4 * s, ty - 40 * s, 8 * s, 40 * s, '#211815'); // Darker trunk
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

    // 5. Ground with Texture
    ctx.fillStyle = style.groundColor;
    ctx.fillRect(0, CONFIG.SCREEN_HEIGHT - 60, CONFIG.SCREEN_WIDTH, 60);

    // Grass Tufts (Seamless)
    const grassSpacing = 150;
    const grassCount = Math.ceil(CONFIG.SCREEN_WIDTH / grassSpacing) + 2;
    ctx.fillStyle = style.detailColor;
    for (let i = 0; i < grassCount; i++) {
        const gx = ((i * grassSpacing) + (bgOffset * 2 % grassSpacing)) - grassSpacing;
        drawRect(ctx, gx, CONFIG.SCREEN_HEIGHT - 65, 20, 12);
        drawRect(ctx, gx + 6, CONFIG.SCREEN_HEIGHT - 72, 8, 8);
    }

    // Tiny Flowers (Seamless)
    const flowerSpacing = 250;
    const flowerCount = Math.ceil(CONFIG.SCREEN_WIDTH / flowerSpacing) + 2;
    ctx.fillStyle = style.accentColor;
    for (let i = 0; i < flowerCount; i++) {
        const fx = ((i * flowerSpacing) + (bgOffset * 2 % flowerSpacing)) - flowerSpacing + 75;
        drawRect(ctx, fx, CONFIG.SCREEN_HEIGHT - 64, 6, 6);
    }
}

// 2-C. Boss (Queen Arachne) - Pixel Block Design
export function drawPixelQueenArachne(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.translate(0, Math.sin(t * 3) * 10);

    // 1. Abdomen (Huge Pixel Map Cluster)
    const abdSize = pSize * 2;
    ctx.fillStyle = '#311b92';
    drawRect(ctx, -20 * pSize, -25 * pSize, 40 * pSize, 35 * pSize); // Core
    ctx.fillStyle = '#4527a0';
    drawRect(ctx, -15 * pSize, -20 * pSize, 30 * pSize, 25 * pSize); // Detail

    // Poison Sac (Blinking Pixel)
    const pulse = (Math.sin(t * 15) + 1) / 2;
    ctx.fillStyle = `rgba(255, 23, 68, ${0.5 + pulse * 0.5})`;
    drawRect(ctx, -8 * pSize, -15 * pSize, 16 * pSize, 16 * pSize);

    // 2. Head
    ctx.fillStyle = '#212121';
    drawRect(ctx, -12 * pSize, 10 * pSize, 24 * pSize, 20 * pSize);

    // Eyes (Multiple Red Dots)
    ctx.fillStyle = '#ff1744';
    drawRect(ctx, -8 * pSize, 15 * pSize, 4 * pSize, 4 * pSize);
    drawRect(ctx, 4 * pSize, 15 * pSize, 4 * pSize, 4 * pSize);
    drawRect(ctx, -10 * pSize, 10 * pSize, 2 * pSize, 2 * pSize);
    drawRect(ctx, 8 * pSize, 10 * pSize, 2 * pSize, 2 * pSize);

    // 3. Legs (Segmented Pixel Beams)
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

// 2-D. Boss (Metal Orochi) - Pixel Snake V1
export function drawPixelMetalOrochi(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 64;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 1. Body Segments (Blocky Chain)
    for (let i = 6; i > 0; i--) {
        const segX = Math.sin(t * 5 + i) * 30;
        const segY = i * 40;
        ctx.save();
        ctx.translate(segX, segY);
        drawRect(ctx, -30, -20, 60, 40, '#263238'); // Main Frame
        drawRect(ctx, -25, -15, 50, 10, '#37474f'); // Top Armor
        drawRect(ctx, -20, 10, 40, 6, '#00e5ff');   // Energy Core Pulse
        ctx.restore();
    }

    // 2. Head (Mechanical Dragon)
    const hx = Math.sin(t * 5) * 30;
    ctx.translate(hx, 0);

    // Head Map
    const headGrid = [
        "      XXXXXX      ",
        "    XXXXXXXXXX    ",
        "   XXXXXXXXXXXX   ",
        "  XXXXCCXXXXCCXX  ", // CC = Blue Eyes
        "  XXXXCCXXXXCCXX  ",
        " XXXXXXXXXXXXXXXX ",
        "XXXXXXXXXXXXXXXXXX",
        "XXXXXXKKKKKKXXXXXX", // Mouth
        "XXXXXKKKKKKKKXXXXX",
        "XXXXXKKKKKKKKXXXXX",
        "XXXXXXKKKKKKXXXXXX",
        "XXXXXXXXXXXXXXXXXX",
        " XXXXXXXXXXXXXXXX ",
        "  XXXXXXXXXXXXXX  ",
        "   XXXXXXXXXXXX   ",
        "     XXXXXXXX     "
    ];

    // Replace C with Blue Energy
    const sizeHead = w / 2 / 16;
    drawPixelGrid(ctx, -w / 4, -h / 4, sizeHead, headGrid);

    ctx.restore();
}

// 2-E. Boss (Storm Falcon) - Pixel Ace V1
export function drawPixelStormFalcon(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.translate(0, Math.sin(t * 10) * 8); // Fast flap jitter

    // 1. Mechanical Wings (Sharp Pixel Planes)
    const flap = Math.cos(t * 15) * 15;
    ctx.fillStyle = '#cfd8dc';
    // Left Wing
    ctx.save();
    ctx.rotate(flap * Math.PI / 180);
    drawRect(ctx, -50 * pSize, -10 * pSize, 50 * pSize, 12 * pSize);
    drawRect(ctx, -40 * pSize, 2 * pSize, 30 * pSize, 8 * pSize);
    ctx.restore();
    // Right Wing
    ctx.save();
    ctx.rotate(-flap * Math.PI / 180);
    drawRect(ctx, 0, -10 * pSize, 50 * pSize, 12 * pSize);
    drawRect(ctx, 10 * pSize, 2 * pSize, 30 * pSize, 8 * pSize);
    ctx.restore();

    // 2. Body & Cockpit
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
    // C = Blue Glass
    drawPixelGrid(ctx, -6 * pSize, -20 * pSize, pSize, cockpitGrid);

    // 3. Turbo Boosters
    const pulse = (Math.sin(t * 20) + 1) / 2;
    ctx.fillStyle = '#00e5ff';
    drawRect(ctx, -12 * pSize, 20 * pSize, 4 * pSize, 10 * pSize + pulse * 10);
    drawRect(ctx, 8 * pSize, 20 * pSize, 4 * pSize, 10 * pSize + pulse * 10);

    ctx.restore();
}

// 2-F. Boss (Phantom Moth) - Pixel Mirage V1
export function drawPixelPhantomMoth(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 1. Ghost Trails (Pixel Outlines)
    for (let i = 1; i <= 2; i++) {
        ctx.save();
        ctx.globalAlpha = 0.2 / i;
        ctx.translate(Math.sin(t * 5 + i) * 30, Math.cos(t * 5 + i) * 30);
        ctx.fillStyle = '#ba68c8';
        drawRect(ctx, -20 * pSize, -20 * pSize, 40 * pSize, 40 * pSize);
        ctx.restore();
    }

    // 2. Main Wings (Dithered Pattern)
    const scale = 1 - Math.sin(t * 8) * 0.2;
    ctx.save();
    ctx.scale(1, scale);

    // Wing Map (Upper)
    ctx.fillStyle = '#4a148c';
    drawRect(ctx, -35 * pSize, -25 * pSize, 30 * pSize, 40 * pSize);
    drawRect(ctx, 5 * pSize, -25 * pSize, 30 * pSize, 40 * pSize);

    // Pattern Eye
    ctx.fillStyle = '#ea80fc';
    drawRect(ctx, -25 * pSize, -10 * pSize, 10 * pSize, 10 * pSize);
    drawRect(ctx, 15 * pSize, -10 * pSize, 10 * pSize, 10 * pSize);

    ctx.restore();

    // 3. Body
    ctx.fillStyle = '#212121';
    drawRect(ctx, -8 * pSize, -15 * pSize, 16 * pSize, 30 * pSize);

    // Glowing Eyes
    const glow = (Math.sin(t * 10) + 1) / 2;
    ctx.fillStyle = `rgba(0, 230, 118, ${0.5 + glow * 0.5})`;
    drawRect(ctx, -5 * pSize, -10 * pSize, 4 * pSize, 4 * pSize);
    drawRect(ctx, 1 * pSize, -10 * pSize, 4 * pSize, 4 * pSize);

    ctx.restore();
}

// 2-G. Boss (Flame Salamander) - Pixel Drake V1
export function drawPixelFlameSalamander(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 1. Armored Body
    ctx.fillStyle = '#bf360c';
    drawRect(ctx, -25 * pSize, -10 * pSize, 50 * pSize, 20 * pSize);
    drawRect(ctx, 20 * pSize, -15 * pSize, 15 * pSize, 30 * pSize); // Head

    // 2. Fire Tail (Segmented Dots)
    for (let i = 0; i < 5; i++) {
        const tx = -30 * pSize - (i * 10 * pSize);
        const ty = Math.sin(t * 10 + i) * 15;
        const colors = ['#ffab91', '#ff5722', '#e64a19', '#bf360c'];
        ctx.fillStyle = colors[i % 4];
        drawRect(ctx, tx, ty, 8 * pSize, 8 * pSize);
    }

    // 3. Molten Eyes
    ctx.fillStyle = '#ffff00';
    drawRect(ctx, 28 * pSize, -8 * pSize, 4 * pSize, 4 * pSize);

    ctx.restore();
}

// 2-H. Boss (Junk Amalgam) - Pixel Scrap V1
export function drawPixelJunkAmalgam(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.scale(1 + Math.sin(t * 2) * 0.05, 1 - Math.sin(t * 2) * 0.05);

    // 1. Scrap Blocks (Randomly stacked pixel clusters)
    const colors = ['#4e342e', '#3e2723', '#212121', '#455a64'];
    for (let i = 0; i < 12; i++) {
        const ox = Math.cos(i) * 20 * pSize;
        const oy = Math.sin(i * 1.5) * 20 * pSize;
        ctx.fillStyle = colors[i % 4];
        drawRect(ctx, ox, oy, 12 * pSize, 12 * pSize);
    }

    // 2. Burning Core
    const pulse = (Math.sin(t * 10) + 1) / 2;
    ctx.fillStyle = `rgba(255, 235, 59, ${0.8 + pulse * 0.2})`;
    drawRect(ctx, -6 * pSize, -6 * pSize, 12 * pSize, 12 * pSize);

    ctx.restore();
}

// 2-I. Boss (Toxic Chimera) - Pixel Terror V1
export function drawPixelToxicChimera(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 1. Toxic Aura (Bubble Particles)
    for (let i = 0; i < 6; i++) {
        const ang = (t + i) % (Math.PI * 2);
        ctx.fillStyle = 'rgba(118, 255, 3, 0.4)';
        drawRect(ctx, Math.cos(ang) * 25 * pSize, Math.sin(ang) * 25 * pSize, 8 * pSize, 8 * pSize);
    }

    // 2. Main Body (Green Scales)
    ctx.fillStyle = '#1b5e20';
    drawRect(ctx, -20 * pSize, -15 * pSize, 40 * pSize, 35 * pSize);

    // 3. Multi-Head (Dot Design)
    ctx.fillStyle = '#f9a825'; // Head 1
    drawRect(ctx, -30 * pSize, -25 * pSize, 12 * pSize, 12 * pSize);
    ctx.fillStyle = '#00695c'; // Head 2 (Serpent)
    const snakeY = Math.sin(t * 5) * 5;
    drawRect(ctx, 15 * pSize, -25 * pSize + snakeY, 10 * pSize, 15 * pSize);

    ctx.restore();
}

// 2-J. Boss (Sky Fortress Core) - Pixel Engine V1
export function drawPixelSkyFortressCore(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 48;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);

    // 1. Rotating Frame (Blocks)
    ctx.save();
    ctx.rotate(t * 0.5);
    ctx.fillStyle = '#263238';
    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        drawRect(ctx, 20 * pSize, -10 * pSize, 15 * pSize, 20 * pSize);
    }
    ctx.restore();

    // 2. Central Core Eye
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
    // R = Red Core, K = Pupil
    drawPixelGrid(ctx, -12 * pSize, -12 * pSize, pSize * 1.5, eyeGrid);

    ctx.restore();
}

// 2-K. Boss (Emperor "V") - Pixel King V1
export function drawPixelEmperorV(ctx, x, y, w, h) {
    const t = Date.now() / 1000;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.translate(0, Math.sin(t * 2) * 10); // Float

    // 1. Golden Throne (Pixel Stack)
    ctx.fillStyle = '#ffd700';
    drawRect(ctx, -15 * pSize, -20 * pSize, 30 * pSize, 40 * pSize);
    ctx.fillStyle = '#d50000'; // Velvet
    drawRect(ctx, -12 * pSize, -15 * pSize, 24 * pSize, 30 * pSize);

    // 2. The Emperor (Pixel Map)
    const kingGrid = [
        "      YYYY      ",
        "     YYYYYY     ",
        "    YYWWWWYY    ", // Crown
        "    YYYYYYYY    ",
        "   YYYYYYYYYY   ",
        "   WWWWWWWWWW   ", // Face
        "   WKKWWWWKKW   ", // Eyes
        "   WWWWWWWWWW   ",
        "  RRRRRRRRRRRR  ", // Cloak
        "  RRRRRRRRRRRR  ",
        "  RRRRRRRRRRRR  ",
        "   RRRRRRRRRR   ",
        "    RRRRRRRR    ",
        "     RRRRRR     "
    ];
    drawPixelGrid(ctx, -8 * pSize, -25 * pSize, pSize, kingGrid);

    // 3. Orbital Energy Swords
    const rot = t * 3;
    ctx.fillStyle = '#00e5ff';
    for (let i = 0; i < 4; i++) {
        const ang = rot + (Math.PI / 2) * i;
        drawRect(ctx, Math.cos(ang) * 22 * pSize, Math.sin(ang) * 22 * pSize, 6 * pSize, 6 * pSize);
    }

    ctx.restore();
}

// 9. Portraits
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

// 10. Items & Effects
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

    // 텍스트/심볼
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type, 0, 0);

    ctx.restore();
}

// Helper: Hexagon for Toto
function drawHexagon(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x + r * Math.cos(Math.PI / 3 * i), y + r * Math.sin(Math.PI / 3 * i));
    }
    ctx.closePath(); ctx.stroke();
}

// Helper: Star for Lulu
function drawStar(ctx, x, y, r, R, p) {
    ctx.beginPath();
    for (let i = 0; i < p * 2; i++) {
        const rad = i % 2 === 0 ? R : r;
        const a = Math.PI * i / p;
        ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fill();
}

// Helper: Heart for Momo
function drawHeart(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.75, x, y + size);
    ctx.bezierCurveTo(x, y + size * 0.75, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.fill();
}

/**
 * [TENGAI STYLE] High-Impact Character Ultimate Bomb Effects (V3)
 * Inspired by classic arcade shooters (Sengoku Blade).
 */
export function drawPixelBombEffectV2(ctx, x, y, radius, alpha, charId = 'toto', timer = 0) {
    ctx.save();
    const stageWidth = 1280;
    const stageHeight = 720;

    // Screen Shake Logic
    if (timer < 30) {
        const shake = 15 * (1 - timer / 30);
        ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    ctx.globalCompositeOperation = 'lighter'; // Burn/Glow effect

    if (charId === 'toto') {
        // [GIGA STINGER BUSTER] - Enhanced with core and plasma
        ctx.globalAlpha = Math.min(1, alpha * 2);
        const beamH = 180 + Math.sin(timer * 0.4) * 60;

        // Outer Plasma
        const outerGrad = ctx.createLinearGradient(0, y - beamH, 0, y + beamH);
        outerGrad.addColorStop(0, 'rgba(255, 111, 0, 0)');
        outerGrad.addColorStop(0.5, 'rgba(255, 214, 0, 0.3)');
        outerGrad.addColorStop(1, 'rgba(255, 111, 0, 0)');
        ctx.fillStyle = outerGrad;
        ctx.fillRect(0, y - beamH, stageWidth, beamH * 2);

        // Main Beam Core
        const innerGrad = ctx.createLinearGradient(0, y - beamH / 2, 0, y + beamH / 2);
        innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        innerGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
        innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = innerGrad;
        ctx.fillRect(0, y - beamH / 2, stageWidth, beamH);

        // Crystalline Hexagons
        ctx.strokeStyle = '#FFEA00'; ctx.lineWidth = 5;
        for (let i = 0; i < 6; i++) {
            const hx = ((timer * 25) + (i * 250)) % (stageWidth + 400) - 200;
            ctx.globalAlpha = alpha * 0.6;
            drawHexagon(ctx, hx, y, 120 + Math.sin(timer * 0.1) * 30);
        }

    } else if (charId === 'lulu') {
        // [ETERNAL STARLIGHT PILLAR] - Enhanced with magic circles and constellations
        ctx.globalAlpha = alpha;

        // Outer complex magic circle
        ctx.strokeStyle = 'rgba(240, 98, 146, 0.8)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(stageWidth / 2, stageHeight / 2, 350, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(stageWidth / 2, stageHeight / 2, 320, 0, Math.PI * 2); ctx.stroke();

        // Rotating inner runes
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

        // High intensity pillars
        for (let i = 0; i < 8; i++) {
            const px = (i * 180 + (timer * 3)) % stageWidth;
            const pAlpha = 0.4 + Math.sin(timer * 0.15 + i) * 0.4;
            const pGrad = ctx.createLinearGradient(px, 0, px + 120, 0);
            pGrad.addColorStop(0, 'rgba(255, 200, 255, 0)');
            pGrad.addColorStop(0.5, `rgba(255, 255, 255, ${pAlpha})`);
            pGrad.addColorStop(1, 'rgba(255, 200, 255, 0)');
            ctx.fillStyle = pGrad;
            ctx.fillRect(px, 0, 120, stageHeight);

            // Particle Storm in pillars
            for (let j = 0; j < 8; j++) {
                const py = ((timer * 15) + (j * 120)) % stageHeight;
                ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
                drawStar(ctx, px + 60 + Math.sin(timer * 0.1 + j) * 30, py, 4, 15, 4);
            }
        }

    } else if (charId === 'kaka') {
        // [EARTH-SHAKER] - Enhanced with cracks and debris
        ctx.globalAlpha = alpha;

        // Screen Flash
        if (timer < 5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, 0, stageWidth, stageHeight);
        }

        // Concentric Expanding Rings
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(141, 110, 99, ${alpha})`;
            ctx.lineWidth = 15;
            ctx.beginPath(); ctx.arc(x, y, radius * (0.5 + i * 0.25), 0, Math.PI * 2); ctx.stroke();
        }

        // Heavy Volcanic Debris
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
            // Ember particles on rocks
            ctx.fillStyle = '#FF3D00';
            ctx.fillRect(rockSize / 4, rockSize / 4, 5, 5);
            ctx.restore();
        }

    } else if (charId === 'momo') {
        // [LOVE NOVA] - Enhanced with flower petals and pulse
        ctx.globalAlpha = alpha;

        // Pulsing Core
        const coreSize = radius * (1 + Math.sin(timer * 0.2) * 0.1);
        const coreGrad = ctx.createRadialGradient(x, y, 0, x, y, coreSize);
        coreGrad.addColorStop(0, '#FFF');
        coreGrad.addColorStop(0.5, '#FF5252');
        coreGrad.addColorStop(1, 'rgba(255, 82, 82, 0)');
        ctx.fillStyle = coreGrad;
        drawHeart(ctx, x, y, coreSize);

        // Petal/Heart Storm
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
        // [TORNADO VORTEX] - Enhanced with lightning and debris
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

                // Static lightning inside
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

        // Debris being sucked in
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        for (let i = 0; i < 40; i++) {
            const ly = (i * 20 + timer * 25) % stageHeight;
            const lx = (Math.sin(ly * 0.01 + timer * 0.1) * 200) + stageWidth / 2;
            ctx.fillRect(lx, ly, 4, 4);
        }
    }
    ctx.restore();
}

// [Special] Safe Guard (Shield Aura)
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

// 10. Stage Branch Selection (Original line 1005+)
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

    // Option A
    ctx.fillStyle = 'white';
    ctx.font = '24px sans-serif';
    ctx.fillText("[1] FOREST OF DAY", cx - 250, cy);

    // Option B
    ctx.fillText("[2] FOREST OF NIGHT", cx + 250, cy);

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText("Press 1 or 2 to select", cx, cy + 100);
    ctx.restore();
}

// ============================================================
// [New Player Characters] Lulu, Kaka, Momo, Pipi
// ============================================================

// 2. Lulu (Butterfly Speed Type) - V5 Upgrade
export function drawPixelLuluV2(ctx, x, y, w, h) {
    if (drawCharImg(ctx, PLAYER_IMAGES.ch_player2, x, y, w, h)) return;

    const t = Date.now() / 1000;
    const hoverY = Math.sin(t * 10) * 3;
    const pSize = w / 32;

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2 + hoverY);
    ctx.scale(-1, 1); // Face Left

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

// 3. Kaka (Beetle Power Type) - V5 Upgrade
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

// 3. Momo (Ladybug Defense Type) - V5 Upgrade
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

// 4. Pipi (Dragonfly Special Type) - V5 Upgrade
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


// [Character Choice UI] Drawing
export function drawCharacterSelectionUI(ctx, CONFIG, characters, selectedIndex) {
    ctx.save();
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Title
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

        // Choice Card
        ctx.fillStyle = isSelected ? 'rgba(100, 255, 218, 0.2)' : 'rgba(255,255,255,0.05)';
        ctx.strokeStyle = isSelected ? '#64FFDA' : '#444';
        ctx.lineWidth = isSelected ? 4 : 2;

        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x, y, cardW, cardH, 10);
        else ctx.rect(x, y, cardW, cardH);
        ctx.fill();
        ctx.stroke();

        // Character Draw
        const charX = x + cardW / 2 - 75;
        const charY = y + 40;
        if (char.id === 'toto') drawPixelTotoV5(ctx, charX, charY, 150, 150); // V5 Honey Bee Toto
        else if (char.id === 'lulu') drawPixelLuluV2(ctx, charX, charY, 150, 150);
        else if (char.id === 'kaka') drawPixelKakaV2(ctx, charX, charY, 150, 150);
        else if (char.id === 'momo') drawPixelMomoV2(ctx, charX, charY, 150, 150);
        else if (char.id === 'pipi') drawPixelPipiV2(ctx, charX, charY, 150, 150);

        // Name
        ctx.fillStyle = isSelected ? '#64FFDA' : '#fff';
        ctx.font = 'bold 24px "Malgun Gothic"';
        ctx.fillText(char.name, x + cardW / 2, y + 230);

        // Stats
        ctx.font = '16px "Malgun Gothic"';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`속도: ${char.speed}`, x + cardW / 2, y + 270);
        ctx.fillText(`파워: ${char.power}`, x + cardW / 2, y + 295);
        ctx.fillText(`범위: ${char.range}`, x + cardW / 2, y + 320);
    });

    // Control Hint
    ctx.fillStyle = '#64FFDA';
    ctx.font = '22px "Malgun Gothic"';
    ctx.fillText('← → 방향키로 선택 | SPACE 로 결정', CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 90);
    ctx.restore();
}

// [World Map UI] Tengai-Style RPG World Map
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

    // Aurora Borealis — soft flowing bands
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

    // Nebula soft haze — colored patches
    const drawNebula = (nx, ny, nr, col) => {
        const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        ng.addColorStop(0, col); ng.addColorStop(1, 'transparent');
        ctx.fillStyle = ng; ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
    };
    drawNebula(300, 100, 120, 'rgba(100, 50, 180, 0.06)');
    drawNebula(900, 80, 150, 'rgba(40, 100, 160, 0.05)');
    drawNebula(600, 150, 100, 'rgba(180, 60, 100, 0.04)');

    // Multi-layer terrain with pixel shading
    const terrainLayers = [
        { y: 0.58, colors: ['rgba(18,50,35,0.3)', 'rgba(25,65,45,0.15)'] },
        { y: 0.65, colors: ['rgba(22,60,40,0.5)', 'rgba(35,80,55,0.25)'] },
        { y: 0.72, colors: ['rgba(18,50,30,0.65)', 'rgba(28,70,45,0.35)'] },
        { y: 0.79, colors: ['rgba(14,40,25,0.8)', 'rgba(22,55,35,0.5)'] },
        { y: 0.86, colors: ['rgba(10,30,18,0.9)', 'rgba(16,42,28,0.6)'] },
    ];
    terrainLayers.forEach((tl, li) => {
        const baseY = H * tl.y;
        // Dark base
        ctx.fillStyle = tl.colors[0]; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) {
            const h = Math.sin(x * 0.004 + li * 1.5) * 28 + Math.sin(x * 0.011 + li) * 14
                + Math.sin(x * 0.002 - li * 0.7) * 18 + Math.cos(x * 0.007 + li * 3) * 8;
            ctx.lineTo(x, baseY + h);
        }
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
        // Highlight edge
        ctx.fillStyle = tl.colors[1]; ctx.beginPath(); ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 8) {
            const h = Math.sin(x * 0.004 + li * 1.5) * 28 + Math.sin(x * 0.011 + li) * 14
                + Math.sin(x * 0.002 - li * 0.7) * 18 + Math.cos(x * 0.007 + li * 3) * 8;
            ctx.lineTo(x, baseY + h + 3);
        }
        ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    });

    // ═══════════════════════════════════════════════════════
    // 2. STARS — Rich Starfield with Shooting Stars
    // ═══════════════════════════════════════════════════════
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
        // Cross sparkle on bright large stars
        if (size >= 2 && brightness > 0.85) {
            ctx.globalAlpha = brightness * 0.4;
            ctx.fillRect(sx - 1, sy + size / 2, size + 2, 1);
            ctx.fillRect(sx + size / 2, sy - 1, 1, size + 2);
        }
    });
    // Shooting star
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

    // ═══════════════════════════════════════════════════════
    // 3. TERRAIN DECORATIONS — High-Quality Pixel Art
    // ═══════════════════════════════════════════════════════
    // Zone 1-2: Enchanted Forest — multi-shade pixel trees
    const drawPixelTree = (tx, ty, s = 1, variant = 0) => {
        // Trunk with bark shading
        ctx.fillStyle = '#3e2723'; ctx.fillRect(tx - 2 * s, ty, 4 * s, 10 * s);
        ctx.fillStyle = '#4e342e'; ctx.fillRect(tx - 1 * s, ty, 2 * s, 10 * s);
        // Canopy layers (3-tone shading)
        const colors = variant === 0
            ? ['#1b5e20', '#2e7d32', '#43a047', '#66bb6a'] // green
            : ['#0d47a1', '#1565c0', '#1e88e5', '#42a5f5']; // night-blue
        ctx.fillStyle = colors[0]; ctx.beginPath();
        ctx.moveTo(tx, ty - 32 * s); ctx.lineTo(tx - 14 * s, ty - 4 * s); ctx.lineTo(tx + 14 * s, ty - 4 * s); ctx.fill();
        ctx.fillStyle = colors[1]; ctx.beginPath();
        ctx.moveTo(tx, ty - 28 * s); ctx.lineTo(tx - 11 * s, ty - 6 * s); ctx.lineTo(tx + 8 * s, ty - 8 * s); ctx.fill();
        ctx.fillStyle = colors[2]; ctx.beginPath();
        ctx.moveTo(tx, ty - 24 * s); ctx.lineTo(tx - 8 * s, ty - 8 * s); ctx.lineTo(tx + 5 * s, ty - 10 * s); ctx.fill();
        // Highlight edge
        ctx.fillStyle = colors[3]; ctx.globalAlpha = 0.5;
        ctx.fillRect(tx - 2 * s, ty - 26 * s, 3 * s, 3 * s);
        ctx.globalAlpha = 1;
    };
    [[60, 600, 1, 0], [110, 590, 1.2, 0], [160, 580, 0.9, 0], [210, 595, 1.1, 0],
    [260, 575, 1, 1], [310, 540, 0.8, 1], [140, 615, 0.7, 0], [90, 625, 0.9, 0],
    [340, 555, 1, 1], [185, 560, 0.6, 0], [40, 610, 0.8, 0], [280, 560, 1, 1]
    ].forEach(([x, y, s, v]) => drawPixelTree(x, y, s, v));
    // Firefly particles in forest zone
    for (let f = 0; f < 8; f++) {
        const fx = 80 + (f * 37) % 280, fy = 540 + (f * 23) % 80;
        const fb = 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + f * 1.5));
        ctx.globalAlpha = fb * 0.6; ctx.fillStyle = '#c6ff00';
        ctx.fillRect(fx, fy + Math.sin(t * 1.5 + f) * 5, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Zone 3-4: Canyon — layered rock with shading
    const drawRock = (rx, ry, rw, rh) => {
        ctx.fillStyle = '#3e2723'; ctx.beginPath(); // Shadow
        ctx.moveTo(rx, ry); ctx.lineTo(rx - rw / 2, ry + rh); ctx.lineTo(rx + rw / 2, ry + rh); ctx.fill();
        ctx.fillStyle = '#5d4037'; ctx.beginPath(); // Mid
        ctx.moveTo(rx - 1, ry + 2); ctx.lineTo(rx - rw / 2 + 3, ry + rh); ctx.lineTo(rx + rw / 2 - 2, ry + rh); ctx.fill();
        ctx.fillStyle = '#795548'; ctx.beginPath(); // Highlight face
        ctx.moveTo(rx, ry + 3); ctx.lineTo(rx + rw / 4, ry + rh * 0.6); ctx.lineTo(rx + rw / 2 - 2, ry + rh); ctx.fill();
        ctx.fillStyle = '#8d6e63'; ctx.globalAlpha = 0.4; // Top highlight
        ctx.fillRect(rx - 2, ry + 2, 4, 3); ctx.globalAlpha = 1;
    };
    drawRock(460, 530, 35, 40); drawRock(510, 545, 22, 28); drawRock(540, 535, 18, 22);
    drawRock(610, 420, 28, 32); drawRock(570, 460, 20, 24); drawRock(590, 440, 15, 18);
    // Sand/dust particles
    for (let d = 0; d < 5; d++) {
        ctx.globalAlpha = 0.15; ctx.fillStyle = '#ffab91';
        const dx = 460 + d * 35, dy = 510 + Math.sin(t * 0.5 + d) * 8;
        ctx.fillRect(dx, dy, 3, 2); ctx.globalAlpha = 1;
    }

    // Zone 5-6: Mountains with 3-tone pixel shading + lava glow
    const drawMountain = (mx, my, mw, mh, c1, c2, c3, snow) => {
        ctx.fillStyle = c1; ctx.beginPath(); // Dark face
        ctx.moveTo(mx, my - mh); ctx.lineTo(mx - mw / 2, my); ctx.lineTo(mx, my); ctx.fill();
        ctx.fillStyle = c2; ctx.beginPath(); // Mid face
        ctx.moveTo(mx, my - mh); ctx.lineTo(mx + mw / 2, my); ctx.lineTo(mx, my); ctx.fill();
        ctx.fillStyle = c3; ctx.beginPath(); // Light ridge
        ctx.moveTo(mx, my - mh); ctx.lineTo(mx + mw / 8, my - mh * 0.4); ctx.lineTo(mx, my - mh * 0.3); ctx.fill();
        if (snow) {
            ctx.fillStyle = snow; ctx.beginPath();
            ctx.moveTo(mx, my - mh); ctx.lineTo(mx - mw / 7, my - mh * 0.65); ctx.lineTo(mx + mw / 8, my - mh * 0.6); ctx.fill();
        }
    };
    drawMountain(490, 370, 60, 65, '#37474f', '#546e7a', '#607d8b', '#eceff1');
    drawMountain(560, 390, 45, 45, '#455a64', '#607d8b', '#78909c', '#e0e0e0');
    drawMountain(720, 410, 55, 55, '#4e342e', '#6d4c41', '#8d6e63', null);
    // Lava glow between mountains
    const lavaGlow = ctx.createRadialGradient(680, 420, 5, 680, 420, 40);
    lavaGlow.addColorStop(0, 'rgba(255,87,34,0.25)'); lavaGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lavaGlow; ctx.fillRect(640, 380, 80, 80);
    // Lava dots
    for (let l = 0; l < 4; l++) {
        ctx.fillStyle = l % 2 === 0 ? '#ff5722' : '#ff9800'; ctx.globalAlpha = 0.5 + Math.sin(t * 3 + l) * 0.3;
        ctx.fillRect(665 + l * 8, 415 + Math.sin(t * 2 + l) * 3, 2, 2);
    } ctx.globalAlpha = 1;

    // Zone 7-8: Factory — detailed gears with teeth + toxic smoke
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
    // Toxic green smoke
    for (let s = 0; s < 6; s++) {
        const sx = 880 + s * 18, sy = 400 - s * 8 + Math.sin(t + s) * 6;
        ctx.globalAlpha = 0.08 - s * 0.01; ctx.fillStyle = '#76ff03';
        ctx.beginPath(); ctx.arc(sx, sy, 10 + s * 3, 0, Math.PI * 2); ctx.fill();
    } ctx.globalAlpha = 1;

    // Zone 9-10: Sky Fortress — volumetric clouds + golden castle
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
    // Golden castle spire with pixel shading
    ctx.fillStyle = '#5D4037'; ctx.fillRect(1188, 95, 24, 55); // Tower base dark
    ctx.fillStyle = '#795548'; ctx.fillRect(1190, 95, 20, 55); // Tower mid
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(1192, 95, 8, 55);  // Tower highlight
    // Spire roof
    ctx.fillStyle = '#FFA000'; ctx.beginPath();
    ctx.moveTo(1200, 60); ctx.lineTo(1186, 95); ctx.lineTo(1214, 95); ctx.fill();
    ctx.fillStyle = '#FFD700'; ctx.beginPath();
    ctx.moveTo(1200, 60); ctx.lineTo(1200, 95); ctx.lineTo(1214, 95); ctx.fill();
    // Crown ornament
    ctx.fillStyle = '#FFEB3B'; ctx.fillRect(1197, 56, 6, 6);
    // Castle glow
    const castleGlow = ctx.createRadialGradient(1200, 100, 5, 1200, 100, 60);
    castleGlow.addColorStop(0, 'rgba(255,215,0,0.15)'); castleGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = castleGlow; ctx.fillRect(1140, 40, 120, 120);

    // ═══════════════════════════════════════════════════════
    // 4. STAGE DATA — Theme Colors, Names, Coordinates
    // ═══════════════════════════════════════════════════════
    const stageData = [
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

    // ═══════════════════════════════════════════════════════
    // 5. PATH — Premium Dual-Line Golden Path
    // ═══════════════════════════════════════════════════════
    for (let i = 0; i < stageData.length - 1; i++) {
        const from = stageData[i];
        const to = stageData[i + 1];
        const stageNum = i + 1;
        const isCleared = stageNum <= state.currentStage;
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 - 25;

        if (isCleared) {
            // Glow underlay
            ctx.setLineDash([]); ctx.lineWidth = 8;
            ctx.strokeStyle = 'rgba(255,213,79,0.15)';
            ctx.beginPath(); ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(midX, midY, to.x, to.y); ctx.stroke();
            // Main path
            ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 3;
            ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,213,79,0.4)';
            ctx.beginPath(); ctx.moveTo(from.x, from.y);
            ctx.quadraticCurveTo(midX, midY, to.x, to.y); ctx.stroke();
            // Highlight line
            ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(from.x, from.y - 2);
            ctx.quadraticCurveTo(midX, midY - 2, to.x, to.y - 2); ctx.stroke();
            ctx.shadowBlur = 0;
            // Sparkle particles along cleared path
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

    // ═══════════════════════════════════════════════════════
    // 6. STAGE NODES — Premium Pixel-Art Styled
    // ═══════════════════════════════════════════════════════
    stageData.forEach((node, i) => {
        const stageNum = i + 1;
        const isActive = stageNum <= state.currentStage;
        const isNext = stageNum === state.currentStage + 1;
        const isLocked = !isActive && !isNext;
        const nodeR = 24;

        // === LOCKED STATE ===
        if (isLocked) {
            // Shadowed base
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.arc(node.x + 2, node.y + 2, nodeR, 0, Math.PI * 2); ctx.fill();
            // Gradient node body
            const lockGrad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, nodeR);
            lockGrad.addColorStop(0, '#555'); lockGrad.addColorStop(1, '#2a2a2a');
            ctx.fillStyle = lockGrad;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 2; ctx.stroke();
            // Inner rim
            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR - 3, 0, Math.PI * 2); ctx.stroke();
            // Lock body
            ctx.fillStyle = '#757575'; ctx.fillRect(node.x - 6, node.y - 1, 12, 9);
            ctx.fillStyle = '#616161'; ctx.fillRect(node.x - 5, node.y, 10, 7);
            // Lock shackle
            ctx.strokeStyle = '#9e9e9e'; ctx.lineWidth = 2; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(node.x, node.y - 4, 5, Math.PI, 0); ctx.stroke();
            ctx.lineCap = 'butt';
            // Keyhole
            ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.arc(node.x, node.y + 3, 2, 0, Math.PI * 2); ctx.fill();
            // Label
            ctx.fillStyle = '#555'; ctx.font = 'bold 10px "Malgun Gothic"'; ctx.textAlign = 'center';
            ctx.fillText('???', node.x, node.y + nodeR + 15);
            return;
        }

        // === NEXT STAGE (Premium Pulse Glow) ===
        if (isNext) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 3);
            const pulse2 = 0.5 + 0.5 * Math.sin(t * 5 + 1);
            // Outer aura rings
            ctx.globalAlpha = 0.06 + pulse2 * 0.06;
            ctx.strokeStyle = node.glow; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR + 20, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 0.1 + pulse * 0.1;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR + 14, 0, Math.PI * 2); ctx.stroke();
            ctx.globalAlpha = 1;
            // Glow fill
            ctx.shadowBlur = 28 + pulse * 18; ctx.shadowColor = node.glow;
            ctx.fillStyle = `rgba(255,255,255,${0.12 + pulse * 0.12})`;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR + 8, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            // Node gradient body
            const nextGrad = ctx.createRadialGradient(node.x - 5, node.y - 5, 2, node.x, node.y, nodeR);
            nextGrad.addColorStop(0, node.glow); nextGrad.addColorStop(0.7, node.color); nextGrad.addColorStop(1, node.color);
            ctx.fillStyle = nextGrad;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2); ctx.fill();
            // Double border
            ctx.strokeStyle = '#FFEB3B'; ctx.lineWidth = 3; ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR - 3, 0, Math.PI * 2); ctx.stroke();
            // Glossy highlight
            ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(node.x - 3, node.y - 8, 10, 5, -0.3, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            // Stage number
            ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Arial'; ctx.textAlign = 'center';
            ctx.fillText(stageNum, node.x, node.y + 5);
            // Label with bg
            const lbl = node.name; const lblW = ctx.measureText(lbl).width + 12;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(node.x - lblW / 2, node.y + nodeR + 5, lblW, 16);
            ctx.fillStyle = '#FFEB3B'; ctx.font = 'bold 11px "Malgun Gothic"';
            ctx.fillText(lbl, node.x, node.y + nodeR + 17);
            return;
        }

        // === CLEARED STATE ===
        if (isActive) {
            // Drop shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath(); ctx.arc(node.x + 1, node.y + 2, nodeR, 0, Math.PI * 2); ctx.fill();
            // Ambient glow
            ctx.shadowBlur = 14; ctx.shadowColor = node.glow;
            // Gradient body
            const actGrad = ctx.createRadialGradient(node.x - 4, node.y - 4, 2, node.x, node.y, nodeR);
            actGrad.addColorStop(0, node.glow); actGrad.addColorStop(0.6, node.color);
            actGrad.addColorStop(1, node.color);
            ctx.fillStyle = actGrad;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#FFD54F'; ctx.lineWidth = 2; ctx.stroke();
            ctx.shadowBlur = 0;
            // Inner rim
            ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(node.x, node.y, nodeR - 3, 0, Math.PI * 2); ctx.stroke();
            // Glossy highlight
            ctx.globalAlpha = 0.2; ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(node.x - 3, node.y - 8, 9, 4, -0.3, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
            // Check mark
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(node.x - 7, node.y + 1);
            ctx.lineTo(node.x - 2, node.y + 6); ctx.lineTo(node.x + 8, node.y - 5); ctx.stroke();
            ctx.lineCap = 'butt';
            // Label with bg
            const lbl = node.name; ctx.font = '11px "Malgun Gothic"';
            const lblW = ctx.measureText(lbl).width + 10;
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillRect(node.x - lblW / 2, node.y + nodeR + 3, lblW, 15);
            ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center';
            ctx.fillText(lbl, node.x, node.y + nodeR + 14);
        }
    });

    // ═══════════════════════════════════════════════════════
    // 7. TITLE — Premium Embossed Title
    // ═══════════════════════════════════════════════════════
    ctx.textAlign = 'center';
    // Decorative lines
    ctx.strokeStyle = 'rgba(255,213,79,0.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 180, 68); ctx.lineTo(W / 2 - 50, 68); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + 50, 68); ctx.lineTo(W / 2 + 180, 68); ctx.stroke();
    // Diamond ornaments
    ctx.fillStyle = 'rgba(255,213,79,0.3)'; ctx.save();
    ctx.translate(W / 2 - 185, 68); ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    ctx.save(); ctx.translate(W / 2 + 185, 68); ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -3, 6, 6); ctx.restore();
    // Title shadow (dark emboss)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = '900 44px "Malgun Gothic"';
    ctx.fillText('또또의 모험', W / 2 + 2, 52 + 2);
    // Title glow
    ctx.shadowBlur = 25; ctx.shadowColor = 'rgba(255,215,0,0.7)';
    const titleGrad = ctx.createLinearGradient(W / 2 - 200, 20, W / 2 + 200, 60);
    titleGrad.addColorStop(0, '#FFF176'); titleGrad.addColorStop(0.3, '#FFD54F');
    titleGrad.addColorStop(0.7, '#FFA000'); titleGrad.addColorStop(1, '#FF8F00');
    ctx.fillStyle = titleGrad; ctx.font = '900 44px "Malgun Gothic"';
    ctx.fillText('또또의 모험', W / 2, 52);
    // Title highlight
    ctx.shadowBlur = 0; ctx.globalAlpha = 0.2; ctx.fillStyle = '#fff';
    ctx.font = '900 44px "Malgun Gothic"';
    ctx.fillText('또또의 모험', W / 2, 51); ctx.globalAlpha = 1;
    // Subtitle
    ctx.fillStyle = 'rgba(200,210,225,0.6)'; ctx.font = '600 13px Arial';
    ctx.letterSpacing = '6px';
    ctx.fillText('─  S T A G E   S E L E C T  ─', W / 2, 82);

    // ═══════════════════════════════════════════════════════
    // 8. PLAYER ICON (Mini Toto)
    // ═══════════════════════════════════════════════════════
    const progress = state.mapProgress || 0;
    const currentIdx = state.currentStage - 1;
    const nextIdx = Math.min(state.currentStage, stageData.length - 1);

    if (currentIdx >= 0) {
        const start = stageData[currentIdx];
        const end = stageData[nextIdx];
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;
        const bounceY = currentY - 40 - Math.abs(Math.sin(progress * Math.PI)) * 45;
        const hoverOffset = Math.sin(t * 4) * 3;

        // Shadow on ground
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(currentX, currentY - 5, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Character
        ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        drawPixelTotoV5(ctx, currentX - 25, bounceY - 25 + hoverOffset, 50, 50);
        ctx.shadowBlur = 0;
    }

    // ═══════════════════════════════════════════════════════
    // 9. STAGE INFO — Premium Info Bar
    // ═══════════════════════════════════════════════════════
    const currentStageInfo = stageData[Math.min(state.currentStage, stageData.length - 1)];
    if (currentStageInfo) {
        const infoW = 280, infoH = 40;
        const infoX = 18, infoY = H - 58;
        // Gradient background
        const infoBg = ctx.createLinearGradient(infoX, infoY, infoX + infoW, infoY);
        infoBg.addColorStop(0, 'rgba(0,0,0,0.55)'); infoBg.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = infoBg; ctx.fillRect(infoX, infoY, infoW, infoH);
        // Border gradient
        ctx.strokeStyle = 'rgba(255,213,79,0.35)'; ctx.lineWidth = 1;
        ctx.strokeRect(infoX, infoY, infoW, infoH);
        // Left accent bar
        ctx.fillStyle = currentStageInfo.color; ctx.fillRect(infoX, infoY, 3, infoH);
        // Text
        ctx.fillStyle = '#FFD54F'; ctx.font = 'bold 13px "Malgun Gothic"'; ctx.textAlign = 'left';
        ctx.fillText(`STAGE ${state.currentStage + 1}`, infoX + 12, infoY + 17);
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '12px "Malgun Gothic"';
        ctx.fillText(`▸ ${currentStageInfo.name}`, infoX + 85, infoY + 17);
        // Progress dots
        for (let d = 0; d < 10; d++) {
            ctx.fillStyle = d <= state.currentStage ? '#FFD54F' : 'rgba(255,255,255,0.15)';
            ctx.fillRect(infoX + 12 + d * 14, infoY + 28, 8, 4);
        }
    }

    // ═══════════════════════════════════════════════════════
    // 10. GO BUTTON — Premium Styled
    // ═══════════════════════════════════════════════════════
    if (state.isWorldMapReady) {
        const btnX = W / 2;
        const btnY = H - 100;
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

        // Button shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.moveTo(btnX - btnW / 2 + r, btnY - btnH / 2 + 3);
        ctx.arcTo(btnX + btnW / 2 + 2, btnY - btnH / 2 + 3, btnX + btnW / 2 + 2, btnY + btnH / 2 + 3, r);
        ctx.arcTo(btnX + btnW / 2 + 2, btnY + btnH / 2 + 3, btnX - btnW / 2, btnY + btnH / 2 + 3, r);
        ctx.arcTo(btnX - btnW / 2, btnY + btnH / 2 + 3, btnX - btnW / 2, btnY - btnH / 2 + 3, r);
        ctx.arcTo(btnX - btnW / 2, btnY - btnH / 2 + 3, btnX + btnW / 2 + 2, btnY - btnH / 2 + 3, r);
        ctx.closePath(); ctx.fill();

        // Button glow
        ctx.shadowBlur = 22 + pulse * 16;
        ctx.shadowColor = 'rgba(255,235,59,0.55)';

        // Button body gradient
        const btnGrad = ctx.createLinearGradient(btnX, btnY - btnH / 2, btnX, btnY + btnH / 2);
        btnGrad.addColorStop(0, '#FFF176');
        btnGrad.addColorStop(0.3, '#FFEB3B');
        btnGrad.addColorStop(0.7, '#FFC107');
        btnGrad.addColorStop(1, '#FFA000');
        ctx.fillStyle = btnGrad;

        // Rounded rect body
        ctx.beginPath();
        ctx.moveTo(btnX - btnW / 2 + r, btnY - btnH / 2);
        ctx.arcTo(btnX + btnW / 2, btnY - btnH / 2, btnX + btnW / 2, btnY + btnH / 2, r);
        ctx.arcTo(btnX + btnW / 2, btnY + btnH / 2, btnX - btnW / 2, btnY + btnH / 2, r);
        ctx.arcTo(btnX - btnW / 2, btnY + btnH / 2, btnX - btnW / 2, btnY - btnH / 2, r);
        ctx.arcTo(btnX - btnW / 2, btnY - btnH / 2, btnX + btnW / 2, btnY - btnH / 2, r);
        ctx.closePath();
        ctx.fill();

        // Border
        ctx.strokeStyle = '#8D6E63'; ctx.lineWidth = 2; ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner glossy highlight
        ctx.globalAlpha = 0.25; ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(btnX, btnY - btnH / 4, btnW / 2 - 10, btnH / 4, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.globalAlpha = 1;

        // Text shadow
        ctx.fillStyle = 'rgba(120,80,0,0.5)'; ctx.font = 'bold 22px "Malgun Gothic"';
        ctx.textAlign = 'center';
        ctx.fillText(`▶  START STAGE ${state.currentStage + 1}`, btnX + 1, btnY + 8 + 1);
        // Text
        ctx.fillStyle = '#3e2723'; ctx.font = 'bold 22px "Malgun Gothic"';
        ctx.fillText(`▶  START STAGE ${state.currentStage + 1}`, btnX, btnY + 8);
    }

    // ═══════════════════════════════════════════════════════
    // 11. ATMOSPHERIC FOG OVERLAY
    // ═══════════════════════════════════════════════════════
    // Subtle top-down vignette
    const vignetteTop = ctx.createLinearGradient(0, 0, 0, 80);
    vignetteTop.addColorStop(0, 'rgba(5,5,20,0.4)');
    vignetteTop.addColorStop(1, 'transparent');
    ctx.fillStyle = vignetteTop; ctx.fillRect(0, 0, W, 80);
    // Bottom vignette
    const vignetteBot = ctx.createLinearGradient(0, H - 60, 0, H);
    vignetteBot.addColorStop(0, 'transparent');
    vignetteBot.addColorStop(1, 'rgba(5,5,10,0.5)');
    ctx.fillStyle = vignetteBot; ctx.fillRect(0, H - 60, W, 60);

    ctx.restore();
}

