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

    // [New Stage 1 Theme] PixelSky Implementation
    if (stage === 1) {
        let layersDrawn = 0;
        const drawLayer = (img, speed) => {
            if (!img || !img.complete || img.naturalWidth === 0) return false;
            const width = CONFIG.SCREEN_WIDTH;
            let x = (bgOffset * speed) % width;
            if (x > 0) x -= width;
            x = Math.floor(x);
            ctx.drawImage(img, x, 0, width + 1, CONFIG.SCREEN_HEIGHT);
            ctx.drawImage(img, x + width, 0, width + 1, CONFIG.SCREEN_HEIGHT);
            layersDrawn++;
            return true;
        };
        drawLayer(BACKGROUND_IMAGES.layer01, 0.2);
        drawLayer(BACKGROUND_IMAGES.layer02, 0.5);
        drawLayer(BACKGROUND_IMAGES.layer03, 0.8);

        if (layersDrawn > 0) return; // Only skip procedural if we actually drew PNG layers
    }

    // 2. Parallax Clouds
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

// [World Map UI] Drawing
export function drawWorldMap(ctx, CONFIG, state) {
    ctx.save();
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Map Title
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px "Malgun Gothic"';
    ctx.textAlign = 'center';
    ctx.fillText(`WORLD MAP - STAGE ${state.currentStage} to ${state.currentStage + 1}`, CONFIG.SCREEN_WIDTH / 2, 100);

    // Draw Nodes
    const mapY = CONFIG.SCREEN_HEIGHT / 2;
    const padding = 150;
    const stages = 5; // Display 5 stages for simplicity
    const stepX = (CONFIG.SCREEN_WIDTH - padding * 2) / (stages - 1);

    for (let i = 1; i <= stages; i++) {
        const x = padding + (i - 1) * stepX;
        const color = i <= state.currentStage ? '#00E676' : '#546E7A';
        const radius = i === state.currentStage + 1 ? 25 : 15;

        // Line to next
        if (i < stages) {
            ctx.beginPath();
            ctx.strokeStyle = '#546E7A';
            ctx.lineWidth = 5;
            ctx.moveTo(x, mapY);
            ctx.lineTo(padding + i * stepX, mapY);
            ctx.stroke();
        }

        // Node
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, mapY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Stage Label
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Malgun Gothic"';
        ctx.fillText(`STAGE ${i}`, x, mapY + 50);
    }

    // Player Icon Animation
    const t = (Date.now() / 1000) % 1;
    const startX = padding + (state.currentStage - 1) * stepX;
    const endX = padding + (state.currentStage) * stepX;

    // Lerp logic handle in game state, here just draw at state.mapPlayerX if possible, or simulate
    // For visual simplicity, we use state.mapProgress (0 to 1)
    const progress = state.mapProgress || 0;
    const currentX = startX + (endX - startX) * progress;
    const bounceY = mapY - 40 - Math.abs(Math.sin(progress * Math.PI)) * 50;

    // Draw Mini Toto
    drawPixelTotoV5(ctx, currentX - 25, bounceY - 25, 50, 50);

    ctx.restore();
}
