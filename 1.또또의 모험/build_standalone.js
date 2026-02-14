
const fs = require('fs');
const path = require('path');

const gameDir = path.join(__dirname, 'game'); // Assumes this script is run from project root, adjusting path logic below
// The tool `run_command` usually runs in the root or specified Cwd.
// I will assume Cwd is `c:\Users\JACKSON\Desktop\앱 개발\안티그래비티 테스크\1.또또의 모험`
// So game dir is `./game`.

const ORDER = [
    'constants.js',
    'state.js',
    'assets.js',
    'sound.js',
    'pixel_art_v2.js',
    'ui.js',
    'renderer.js',
    'entities.js',
    'cheat.js',
    'game.js'
];

function processFile(filename) {
    const filePath = path.join('game', filename);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return '';
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove imports
    content = content.replace(/^\s*import\s+.*?from\s+['"].*?['"];?/gm, '');

    // 2. Remove 'export' keyword but keep declarations
    // export const -> const
    // export function -> function
    // export class -> class
    // export async function -> async function
    // export default -> (remove logic needed? usually not used here)
    content = content.replace(/^\s*export\s+(const|let|var|function|class|async)/gm, '$1');
    content = content.replace(/^\s*export\s+default\s+/gm, ''); // risky if default export creates a value, but we use named exports.

    // 3. Manual Patching for game.js namespace usage
    if (filename === 'game.js') {
        content = content.replace(/ASSETS\.loadAllAssets/g, 'loadAllAssets');
    }

    // 4. Wrap in a comment block for clarity
    return `\n/* --- ${filename} --- */\n` + content;
}

function build() {
    let jsBundle = '';
    ORDER.forEach(file => {
        jsBundle += processFile(file);
    });

    // Read index.html to get styles and structure
    const indexHtmlPath = path.join('game', 'index.html');
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

    // Extract CSS (if it were inline) or read style.css
    const cssPath = path.join('game', 'style.css');
    let cssContent = '';
    if (fs.existsSync(cssPath)) {
        cssContent = fs.readFileSync(cssPath, 'utf8');
    }

    // Construct the Standalone HTML
    // We will replace the <link rel="stylesheet"> with inline <style>
    // And replace <script ... type="module"> with our bundle.

    // 1. CSS
    let outputHtml = indexHtml.replace(/<link rel="stylesheet" href="style.css">/, `<style>\n${cssContent}\n</style>`);

    // 2. Remove module script tags
    outputHtml = outputHtml.replace(/<script\s+src=".*?"\s+type="module"><\/script>/g, '');
    outputHtml = outputHtml.replace(/<script\s+src=".*?"\s+type="module">\s*<\/script>/g, '');

    // Clean up specific game.js reference if strictly matched
    // The regex above might be too greedy or miss specific attributes order.
    // Let's be aggressive: remove all script src="..." type="module" tags
    // And insert our bundle at the end of body.

    // Better approach: Find closing body tag and insert script there.
    const scriptBlock = `<script>\n${jsBundle}\n</script>`;
    outputHtml = outputHtml.replace('</body>', `${scriptBlock}\n</body>`);

    // Write to game_standalone.html
    const outputPath = path.join('game', 'game_standalone.html');
    fs.writeFileSync(outputPath, outputHtml);
    console.log(`Successfully created ${outputPath}`);
}

build();
