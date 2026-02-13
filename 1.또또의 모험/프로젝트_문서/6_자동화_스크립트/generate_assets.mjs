
import fs from 'fs';
import { askGemini } from './gemini_helper.mjs';

async function generateSprite(name, description) {
    console.log(`🎨 Generating Sprite Data for: ${name}...`);
    const prompt = `Generate a 32x32 pixel art grid for a game character: ${description}. 
    Return ONLY a JSON object with a "grid" property which is a 2D array of hexadecimal color strings (e.g. ["#ffffff", "#000000", ...]). 
    Use null for transparent pixels. No other text.`;

    let response = await askGemini(prompt);
    // Clean-up response if needed (remove markdown backticks)
    response = response.replace(/```json|```/g, '').trim();

    try {
        const data = JSON.parse(response);
        return data.grid;
    } catch (e) {
        console.error("Failed to parse Gemini response", response);
        return null;
    }
}

async function saveAsPNG(name, grid) {
    // We don't have a PNG library, so we will generate a simple TGA or BMP, 
    // or better, we will generate an HTML file that renders the grid to a canvas and use the browser to capture it.
    // For now, let's just save the JSON data to a file that the game can load.
    // Wait, the user wants PNG. I will use the browser tool to convert this to PNG.
    fs.writeFileSync(`./game/assets/${name}_data.json`, JSON.stringify(grid));
    console.log(`✅ Saved ${name} grid data.`);
}

const assets = [
    { name: 'toto_player', desc: 'A cute honeybee named Toto with small round glasses and a hero pose' },
    { name: 'boss_buzz', desc: 'A massive mechanical wasp commander named General Buzz with golden armor and a gatling gun' },
    { name: 'enemy_wasp', desc: 'A sleek scout wasp with a red scouter eye and mechanical wings' }
];

for (const asset of assets) {
    const grid = await generateSprite(asset.name, asset.desc);
    if (grid) await saveAsPNG(asset.name, grid);
}
