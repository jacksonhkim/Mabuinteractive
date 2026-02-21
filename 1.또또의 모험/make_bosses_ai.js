const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const outDir = path.join(__dirname, 'game', 'assets', 'boss');
const brainDir = path.join(require('os').homedir(), '.gemini', 'antigravity', 'brain', 'd4d2c97d-342c-4576-93cb-c5cc8a151561');

async function processBosses() {
    // We generated images with names like boss_1_*.png in the brain dir
    const files = fs.readdirSync(brainDir);

    for (let i = 1; i <= 10; i++) {
        // Find the generated image for this boss ID
        const bossFiles = files.filter(f => f.startsWith(`boss_${i}_`) && f.endsWith('.png'));
        if (bossFiles.length === 0) {
            console.log(`Skipping boss ${i}, no generated image found.`);
            continue;
        }
        // sort descending by the timestamp in the filename (boss_i_TIMESTAMP.png)
        bossFiles.sort((a, b) => {
            const tsA = parseInt(a.split('_')[2].replace('.png', '')) || 0;
            const tsB = parseInt(b.split('_')[2].replace('.png', '')) || 0;
            return tsB - tsA;
        });
        const bossImgFile = bossFiles[0];

        const sourcePath = path.join(brainDir, bossImgFile);
        const img = await loadImage(sourcePath);

        // Target resolving canvas
        const w = 128;
        const h = 128;

        // Function to make white/light-gray background transparent
        function removeBackground(ctx, width, height) {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            for (let j = 0; j < data.length; j += 4) {
                const r = data[j];
                const g = data[j + 1];
                const b = data[j + 2];
                // Check if rgb is close to white (background)
                if (r > 240 && g > 240 && b > 240) {
                    data[j + 3] = 0; // Set Alpha to 0
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // 1. Save static 128x128 image
        const canvas1 = createCanvas(w, h);
        const ctx1 = canvas1.getContext('2d');
        // disable smoothing for pixel art upscaler look if downsampling
        ctx1.patternQuality = 'nearest';
        ctx1.filter = 'none';

        if (i === 1 || i === 3 || i === 7) {
            ctx1.translate(w, 0);
            ctx1.scale(-1, 1);
        }
        ctx1.drawImage(img, 0, 0, w, h);
        ctx1.setTransform(1, 0, 0, 1, 0, 0);

        removeBackground(ctx1, w, h);
        fs.writeFileSync(path.join(outDir, `boss_${i}.png`), canvas1.toBuffer('image/png'));

        // 2. Create 4-frame sprite (breathing animation)
        const canvas2 = createCanvas(w * 4, h);
        const ctx2 = canvas2.getContext('2d');
        ctx2.patternQuality = 'nearest';
        ctx2.filter = 'none';

        for (let frame = 0; frame < 4; frame++) {
            ctx2.save();
            ctx2.translate(frame * w, 0);

            ctx2.fillStyle = 'transparent';
            ctx2.fillRect(0, 0, w, h);

            let yOffset = 0;
            if (frame === 1) yOffset = -2;
            if (frame === 3) yOffset = 2;

            if (i === 1 || i === 3 || i === 7) {
                ctx2.translate(w, 0);
                ctx2.scale(-1, 1);
            }

            ctx2.drawImage(img, 0, yOffset, w, h);
            ctx2.restore();
        }

        removeBackground(ctx2, w * 4, h);

        fs.writeFileSync(path.join(outDir, `boss_${i}_sprite.png`), canvas2.toBuffer('image/png'));
        console.log(`[AI Generator] Processed High-Quality 2D Fantasy Pixel Art for Boss ${i}`);
    }
}

processBosses().catch(console.error);
