import { state } from './state.js';
import { CONFIG, CHARACTERS, STAGE_DIALOGUES } from './constants.js';
import { BACKGROUND_IMAGES } from './assets.js';
import {
    drawPixelForestV2, drawPixelTotoV5, drawPixelLuluV2, drawPixelKakaV2, drawPixelMomoV2, drawPixelPipiV2
} from './pixel_art_v2.js';
import { sound } from './sound.js';

export function updateLivesUI() {
    const el = document.getElementById('lives');
    if (el) el.innerText = '❤'.repeat(state.lives);
}

export function updateBombUI() {
    const el = document.getElementById('bombs');
    if (el) el.innerText = '💣'.repeat(state.player.bombCount);
}

export function drawTitleScreen(ctx) {
    const bg = BACKGROUND_IMAGES.bgStart;
    if (bg && bg.complete && bg.naturalWidth !== 0) {
        // Draw image keeping aspect ratio (cover style)
        const scale = Math.max(CONFIG.SCREEN_WIDTH / bg.width, CONFIG.SCREEN_HEIGHT / bg.height);
        const nw = bg.width * scale;
        const nh = bg.height * scale;
        const nx = (CONFIG.SCREEN_WIDTH - nw) / 2;
        const ny = (CONFIG.SCREEN_HEIGHT - nh) / 2;
        ctx.drawImage(bg, nx, ny, nw, nh);
    } else {
        drawPixelForestV2(ctx, CONFIG, state);
    }
    // Text handled by DOM #start-screen
}

export function drawGameOverScreen(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    // Proportional scaling based on canvas width
    const sw = CONFIG.SCREEN_WIDTH;
    const sh = CONFIG.SCREEN_HEIGHT;
    const titleSize = Math.round(sw * 0.0625); // ~80px at 1280
    const btnFontSize = Math.round(sw * 0.019); // ~24px at 1280

    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5252';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 15;
    ctx.fillText("GAME OVER", sw / 2, sh / 2 - sh * 0.11);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Draw Buttons — proportional
    const btnW = Math.round(sw * 0.3125); // ~400 at 1280
    const btnH = Math.round(sh * 0.083);  // ~60 at 720
    const centerX = sw / 2;
    const centerY = sh / 2 + sh * 0.028;

    // Continue Button
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - btnW / 2, centerY, btnW, btnH);
    ctx.fillRect(centerX - btnW / 2, centerY, btnW, btnH);

    ctx.font = `bold ${btnFontSize}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText("CONTINUE (CHANGE HERO)", centerX, centerY + btnH * 0.63);

    // Quit Button
    const quitY = centerY + btnH + sh * 0.028;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = '#ff5252';
    ctx.strokeRect(centerX - btnW / 2, quitY, btnW, btnH);
    ctx.fillRect(centerX - btnW / 2, quitY, btnW, btnH);

    ctx.fillStyle = '#ccc';
    ctx.fillText("QUIT TO MENU", centerX, quitY + btnH * 0.63);
}

export function drawStageClear(ctx) {
    const fontSize = Math.round(CONFIG.SCREEN_WIDTH * 0.0625);
    ctx.font = `bold ${fontSize}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffeb3b';
    ctx.fillText("STAGE " + state.currentStage + " CLEAR!", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2);
}

// [Character Selection UI]
export function drawCharacterSelectionUI(ctx, selectedIndex) {
    ctx.save();

    // 1. Character Select Background
    if (BACKGROUND_IMAGES.bgCharSelect && BACKGROUND_IMAGES.bgCharSelect.complete) {
        ctx.drawImage(BACKGROUND_IMAGES.bgCharSelect, 0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        // Add subtle overlay to maintain text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
    } else {
        // Fallback to Dark Overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
    }

    // 2. Title — proportional sizing
    const sw = CONFIG.SCREEN_WIDTH;
    const sh = CONFIG.SCREEN_HEIGHT;
    const titleFontSize = Math.round(sw * 0.031); // ~40 at 1280

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${titleFontSize}px "Malgun Gothic", sans-serif`;
    ctx.shadowColor = '#FF8F00';
    ctx.shadowBlur = 10;
    ctx.fillText("CHOOSE YOUR HERO", sw / 2, sh * 0.11);
    ctx.shadowBlur = 0;

    // 3. Draw Character Cards — proportional to canvas
    const cardW = Math.round(sw * 0.125);  // ~160 at 1280
    const cardH = Math.round(sh * 0.333);  // ~240 at 720
    const gap = Math.round(sw * 0.016);    // ~20 at 1280
    const spriteSize = Math.round(cardW * 0.8); // character sprite size
    const totalW = CHARACTERS.length * cardW + (CHARACTERS.length - 1) * gap;
    const startX = (sw - totalW) / 2;
    const startY = sh / 2 - cardH / 2;

    CHARACTERS.forEach((char, i) => {
        const x = startX + i * (cardW + gap);
        const y = startY;
        const isSelected = (i === selectedIndex);

        // Card Background
        ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = isSelected ? '#00E676' : '#546E7A';
        ctx.lineWidth = isSelected ? 4 : 2;

        // Scale effect for selected
        if (isSelected) {
            ctx.save();
            ctx.translate(x + cardW / 2, y + cardH / 2);
            ctx.scale(1.1, 1.1);
            ctx.translate(-(x + cardW / 2), -(y + cardH / 2));
        }

        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeRect(x, y, cardW, cardH);

        // Character Preview (Center of Card)
        const cx = x + cardW / 2;
        const cy = y + cardH * 0.33;
        const halfSprite = spriteSize / 2;

        // Draw Character Sprite
        if (char.id === 'toto') drawPixelTotoV5(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize);
        else if (char.id === 'lulu') { if (typeof drawPixelLuluV2 === 'function') drawPixelLuluV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else if (char.id === 'kaka') { if (typeof drawPixelKakaV2 === 'function') drawPixelKakaV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else if (char.id === 'momo') { if (typeof drawPixelMomoV2 === 'function') drawPixelMomoV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else if (char.id === 'pipi') { if (typeof drawPixelPipiV2 === 'function') drawPixelPipiV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else {
            ctx.fillStyle = char.color;
            ctx.beginPath(); ctx.arc(cx, cy, cardW * 0.125, 0, Math.PI * 2); ctx.fill();
        }

        // Name
        const nameFontSize = Math.round(cardW * 0.125); // ~20 at 160
        ctx.fillStyle = isSelected ? '#fff' : '#aaa';
        ctx.font = `bold ${nameFontSize}px "Malgun Gothic", sans-serif`;
        ctx.fillText(char.name, cx, y + cardH * 0.67);

        // Stats Text
        const statFontSize = Math.round(cardW * 0.088); // ~14 at 160
        ctx.font = `${statFontSize}px "Malgun Gothic", sans-serif`;
        ctx.fillStyle = '#ccc';
        ctx.fillText(`Speed: ${char.speed}`, cx, y + cardH * 0.79);
        ctx.fillText(`Power: ${char.power}`, cx, y + cardH * 0.875);

        if (isSelected) ctx.restore();
    });

    // 4. Instructions
    const instrFontSize = Math.round(sw * 0.014); // ~18 at 1280
    ctx.fillStyle = '#00E676';
    ctx.font = `${instrFontSize}px "Malgun Gothic", sans-serif`;
    ctx.fillText("← / →  Select   |   SPACE  Confirm", sw / 2, sh - sh * 0.083);

    ctx.restore();
}

export function startWorldMap() {
    state.isWorldMapActive = true;
    state.isWorldMapReady = false;
    state.mapProgress = 0;

    // Auto-advance map progress
    const mapInterval = setInterval(() => {
        state.mapProgress += 0.015; // Slightly slower for better feel
        if (state.mapProgress >= 1) {
            state.mapProgress = 1;
            clearInterval(mapInterval);
            state.isWorldMapReady = true;
            console.log("Map Journey Complete. Waiting for 'Go' signal.");
        }
    }, 30);
}

// 대화 시스템
export function startDialogue(stage) {
    if (!STAGE_DIALOGUES[stage]) return;
    state.currentStage = stage; // Fix: Sync state with requested stage
    state.isDialogueActive = true;
    state.dialogueIndex = 0;
    showNextDialogue();
}

// Global reference for reliable listener cleanup - REMOVED interactions
// let activeDialogueFunc = null;

export function showNextDialogue() {
    const dialogues = STAGE_DIALOGUES[state.currentStage];
    const box = document.getElementById('dialogue-box');

    if (!dialogues || state.dialogueIndex >= dialogues.length) {
        state.isDialogueActive = false;
        if (box) box.classList.add('hidden');
        return;
    }
    const d = dialogues[state.dialogueIndex];
    if (box) {
        box.classList.remove('hidden');
        const charName = CHARACTERS[state.selectedCharIndex]?.name || '또또';
        const displayName = (d.name === '또또') ? charName : d.name;
        box.querySelector('.character-name').innerText = displayName;
        box.querySelector('.text').innerText = d.text.replace(/또또/g, charName);
    }
}

// Global helper for mobile controls
window.advanceDialogue = () => {
    if (!state.isDialogueActive) return false;

    // Debounce to prevent instant skipping
    const now = Date.now();
    if (now - (state.lastDialogueTime || 0) < 300) {
        return false;
    }
    state.lastDialogueTime = now;

    state.dialogueIndex++;
    showNextDialogue();
    return true;
};

export function startEndingSequence(ctx) {
    console.log("Ending Sequence Started");
    sound.startBGM('ENDING'); // 엔딩 테마 재생

    // 1. 모든 UI 숨기기
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) dialogueBox.classList.add('hidden');

    // 2. 캔버스에 엔딩 연출 그리기 (Update Loop는 멈췄으므로 여기서 직접 제어)
    let endingFrame = 0;

    function drawEnding() {
        endingFrame++;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, endingFrame * 0.02)})`; // 화이트 아웃
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

        if (endingFrame > 120) {
            // 3. 엔딩 크레딧 화면으로 전환 (DOM 조작)
            showCreditsScreen();
            return;
        }
        requestAnimationFrame(drawEnding);
    }
    drawEnding();
}

export function showCreditsScreen() {
    // Canvas와 UI 숨기기
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.style.display = 'none';
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    const dialogue = document.getElementById('dialogue-box');
    if (dialogue) dialogue.style.display = 'none';

    // 기존 크레딧이 있다면 제거
    const oldCredit = document.getElementById('ending-credits');
    if (oldCredit) oldCredit.remove();

    const creditDiv = document.createElement('div');
    creditDiv.id = 'ending-credits';
    creditDiv.style.position = 'fixed';
    creditDiv.style.top = '0';
    creditDiv.style.left = '0';
    creditDiv.style.width = '100vw';
    creditDiv.style.height = '100vh';
    creditDiv.style.background = '#000';
    creditDiv.style.color = '#fff';
    creditDiv.style.display = 'flex';
    creditDiv.style.flexDirection = 'column';
    creditDiv.style.alignItems = 'center';
    creditDiv.style.justifyContent = 'center';
    creditDiv.style.fontFamily = "'Press Start 2P', cursive, sans-serif";
    creditDiv.style.textAlign = 'center';
    creditDiv.style.zIndex = '99999';
    creditDiv.style.overflowY = 'auto';

    const content = `
        <h1 style="color: #ffd700; font-size: clamp(22px, 5vw, 40px); margin-bottom: clamp(20px, 5vh, 50px); text-shadow: 4px 4px #e65100;">THE ADVENTURE OF TOTO</h1>
        <h2 style="color: #00e676; margin-bottom: clamp(15px, 4vh, 40px); font-size: clamp(14px, 3vw, 24px); text-transform: uppercase; letter-spacing: 2px;">Mission Accomplished</h2>
        
        <div style="font-size: clamp(10px, 2vw, 16px); line-height: 2.2; margin-bottom: clamp(15px, 4vh, 40px);">
            <p style="color: #bdbdbd; font-size: clamp(9px, 1.8vw, 14px); margin-bottom: clamp(10px, 2vh, 20px);">- CREDITS -</p>
            
            <div style="margin-bottom: clamp(12px, 3vh, 30px);">
                <p style="color: #fff; font-weight: bold;">[ Executive Producer ]</p>
                <p style="color: #29b6f6; font-size: clamp(12px, 2.5vw, 20px);">PETER (PM)</p>
            </div>

            <div style="margin-bottom: clamp(12px, 3vh, 30px);">
                <p style="color: #fff; font-weight: bold;">[ Game Design ]</p>
                <p style="color: #ba68c8; font-size: clamp(12px, 2.5vw, 20px);">BO (Planning Leader)</p>
            </div>

            <div style="margin-bottom: clamp(12px, 3vh, 30px);">
                <p style="color: #fff; font-weight: bold;">[ Art Direction ]</p>
                <p style="color: #ff4081; font-size: clamp(12px, 2.5vw, 20px);">HANSOONI (AD)</p>
            </div>

            <div style="margin-bottom: clamp(12px, 3vh, 30px);">
                <p style="color: #fff; font-weight: bold;">[ Lead Programmer ]</p>
                <p style="color: #ff9800; font-size: clamp(12px, 2.5vw, 20px);">TTOTTO (Tech Lead)</p>
            </div>
        </div>

        <h3 style="color: #ffff00; font-size: clamp(14px, 3vw, 22px); margin-bottom: clamp(15px, 4vh, 40px); animation: blink 1s infinite;">Thank you for playing!</h3>
        
        <button onclick="handleRestart()" 
            style="padding: clamp(10px, 2vh, 20px) clamp(20px, 4vw, 40px); font-family: inherit; font-size: clamp(12px, 2.5vw, 18px); cursor: pointer; 
            background: #fff; color: #000; border: none; font-weight: bold; border-radius: 8px; 
            box-shadow: 0 4px 10px rgba(255,255,255,0.3); transition: transform 0.2s;">
            PLAY AGAIN
        </button>
    `;

    creditDiv.innerHTML = content;

    // 애니메이션 스타일 추가
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        @keyframes fadeInMove {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
            50% { opacity: 0.5; }
        }
        #ending-credits { animation: fadeInMove 1.5s ease-out; }
        #ending-credits button:hover { transform: scale(1.1); background: #fce4ec; }
    `;
    document.head.appendChild(style);

    document.body.appendChild(creditDiv);
}
