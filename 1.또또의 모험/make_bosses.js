const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const outDir = path.join(__dirname, 'game', 'assets', 'boss');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const bosses = [
    { id: 1, name: 'Giant Buzz', colors: ['#1B5E20', '#4CAF50', '#81C784', '#000000', '#FFEB3B'], type: 'Forest' },
    { id: 2, name: 'Storm Falcon', colors: ['#01579B', '#03A9F4', '#4FC3F7', '#000000', '#FFEB3B'], type: 'Sky' },
    { id: 3, name: 'Pharaoh Beetle', colors: ['#E65100', '#FFC107', '#FFE082', '#000000', '#FF1744'], type: 'Desert' },
    { id: 4, name: 'Flame Salamander', colors: ['#BF360C', '#FF5722', '#FFAB91', '#000000', '#FFFF00'], type: 'Volcano' },
    { id: 5, name: 'Frost Yeti', colors: ['#006064', '#00BCD4', '#B2EBF2', '#000000', '#FF5252'], type: 'Ice' },
    { id: 6, name: 'Mecha Spider', colors: ['#212121', '#9E9E9E', '#E0E0E0', '#000000', '#FF1744'], type: 'Cyber' },
    { id: 7, name: 'Galactic Core', colors: ['#311B92', '#673AB7', '#B39DDB', '#000000', '#00E676'], type: 'Space' },
    { id: 8, name: 'Void Walker', colors: ['#000000', '#212121', '#757575', '#000000', '#D500F9'], type: 'Dimension' },
    { id: 9, name: 'General Iron', colors: ['#3E2723', '#795548', '#BCAAA4', '#000000', '#FF3D00'], type: 'Empire' },
    { id: 10, name: 'Emperor V', colors: ['#880E4F', '#E91E63', '#F48FB1', '#000000', '#FFF'], type: 'Final' }
];

// Seeded random
function Mulberry32(a) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function generateSprite(ctx, w, h, boss, frame) {
    const random = Mulberry32(boss.id * 88888);
    const gridSize = 16;
    const pixelSize = w / gridSize;

    // Create half grid
    const halfWidth = Math.floor(gridSize / 2);
    const grid = Array(gridSize).fill(0).map(() => Array(halfWidth).fill(0));

    // 0: empty, 1: dark edge, 2: base color, 3: highlight, 4: eye

    // 1. Generate core body shape
    for (let y = 1; y < gridSize - 1; y++) {
        for (let x = 0; x < halfWidth; x++) {
            let dx = (halfWidth - 1 - x) / halfWidth;
            let dy = Math.abs(y - gridSize / 2) / (gridSize / 2);
            let dist = Math.sqrt(dx * dx * 1.5 + dy * dy);

            if (random() > dist * 1.1) {
                grid[y][x] = 2; // base
            }
        }
    }

    // 2. Add wings/arms noise
    for (let i = 0; i < 8; i++) {
        let randY = Math.floor(random() * (gridSize - 4)) + 2;
        let randX = Math.floor(random() * (halfWidth - 2));
        if (grid[randY][randX + 1] === 2) {
            grid[randY][randX] = 2;
            if (random() > 0.5) grid[randY - 1][randX] = 2;
            if (random() > 0.5) grid[randY + 1][randX] = 2;
        }
    }

    // 3. Add highlights
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < halfWidth; x++) {
            if (grid[y][x] === 2) {
                if (random() > 0.6) grid[y][x] = 3; // highlight
            }
        }
    }

    // 4. Add eyes near center
    let eyeY = Math.floor(random() * 4) + 4;
    let eyeX = halfWidth - Math.floor(random() * 3) - 1;
    if (grid[eyeY][eyeX] !== 0) {
        grid[eyeY][eyeX] = 4; // eye
        if (eyeX - 1 >= 0) grid[eyeY][eyeX - 1] = 4;
    }

    // 5. Mirror to full grid
    let finalGrid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < halfWidth; x++) {
            finalGrid[y][x] = grid[y][x];
            finalGrid[y][gridSize - 1 - x] = grid[y][x];
        }
    }

    // 6. Draw dark outlines
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (finalGrid[y][x] > 1 && finalGrid[y][x] !== 4) {
                let isEdge = false;
                const neighbors = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                for (let [dy, dx] of neighbors) {
                    let ny = y + dy, nx = x + dx;
                    if (ny < 0 || ny >= gridSize || nx < 0 || nx >= gridSize || finalGrid[ny][nx] === 0) {
                        isEdge = true; break;
                    }
                }
                if (isEdge) {
                    finalGrid[y][x] = 1; // dark outline
                }
            }
        }
    }

    // Render configuration
    ctx.clearRect(0, 0, w, h);

    // palette: 0-empty, 1-outline, 2-base, 3-highlight, 4-eye
    const palette = [
        'transparent',
        boss.colors[3], // outline
        boss.colors[1], // base
        boss.colors[2], // highlight
        boss.colors[4]  // eye
    ];

    // Simple breathing & wing flap animation logic
    // Frame 0: idle
    // Frame 1: breathing up, eye glow
    // Frame 2: idle
    // Frame 3: breathing down, eye glow

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const val = finalGrid[y][x];
            if (val > 0) {
                ctx.fillStyle = palette[val];

                // Eye glow (flicker)
                if (val === 4 && (frame === 1 || frame === 3)) {
                    ctx.fillStyle = '#FFFFFF';
                }

                let yOffset = 0;

                // Animate core up/down
                let isCore = x >= 4 && x <= 11;
                if (isCore) {
                    if (frame === 1) yOffset = -2;
                    else if (frame === 3) yOffset = 2;
                } else {
                    // Animate wings opposite to core
                    if (frame === 1) yOffset = 2;
                    else if (frame === 3) yOffset = -2;
                }

                ctx.fillRect(x * pixelSize, y * pixelSize + yOffset, pixelSize, pixelSize);
            }
        }
    }
}

bosses.forEach(boss => {
    // 1. Static Image
    const canvas1 = createCanvas(128, 128);
    generateSprite(canvas1.getContext('2d'), 128, 128, boss, 0);
    fs.writeFileSync(path.join(outDir, `boss_${boss.id}.png`), canvas1.toBuffer('image/png'));

    // 2. Sprite Image (4 frames)
    const cw = 128;
    const ch = 128;
    const canvas2 = createCanvas(cw * 4, ch);
    const ctx2 = canvas2.getContext('2d');
    for (let i = 0; i < 4; i++) {
        ctx2.save();
        ctx2.translate(i * cw, 0);
        generateSprite(ctx2, cw, ch, boss, i);
        ctx2.restore();
    }
    fs.writeFileSync(path.join(outDir, `boss_${boss.id}_sprite.png`), canvas2.toBuffer('image/png'));
    console.log(`Generated Boss ${boss.id} (${boss.name}) procedurally.`);
});
console.log('Procedural pixel art bosses successfully updated in assets/boss directory.');
