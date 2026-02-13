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
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
    ctx.font = '900 64px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff5252';
    ctx.fillText("GAME OVER", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2);
    ctx.font = '24px sans-serif'; ctx.fillStyle = '#fff';
    ctx.fillText("Press 'R' to Restart", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2 + 60);
}

export function drawStageClear(ctx) {
    ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffeb3b';
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

    // 2. Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px "Malgun Gothic", sans-serif';
    ctx.shadowColor = '#FF8F00';
    ctx.shadowBlur = 10;
    ctx.fillText("CHOOSE YOUR HERO", CONFIG.SCREEN_WIDTH / 2, 80);
    ctx.shadowBlur = 0; // Reset shadow

    // 3. Draw Character Cards
    const cardW = 160;
    const cardH = 240;
    const gap = 20;
    const totalW = CHARACTERS.length * cardW + (CHARACTERS.length - 1) * gap;
    const startX = (CONFIG.SCREEN_WIDTH - totalW) / 2;
    const startY = CONFIG.SCREEN_HEIGHT / 2 - cardH / 2;

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
        const cy = y + 80;

        // Draw Character Sprite
        if (char.id === 'toto') drawPixelTotoV5(ctx, cx - 64, cy - 64, 128, 128);
        else if (char.id === 'lulu') { if (typeof drawPixelLuluV2 === 'function') drawPixelLuluV2(ctx, cx - 64, cy - 64, 128, 128); }
        else if (char.id === 'kaka') { if (typeof drawPixelKakaV2 === 'function') drawPixelKakaV2(ctx, cx - 64, cy - 64, 128, 128); }
        else if (char.id === 'momo') { if (typeof drawPixelMomoV2 === 'function') drawPixelMomoV2(ctx, cx - 64, cy - 64, 128, 128); }
        else if (char.id === 'pipi') { if (typeof drawPixelPipiV2 === 'function') drawPixelPipiV2(ctx, cx - 64, cy - 64, 128, 128); }
        else {
            // Fallback circle
            ctx.fillStyle = char.color;
            ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
        }

        // Name
        ctx.fillStyle = isSelected ? '#fff' : '#aaa';
        ctx.font = 'bold 20px "Malgun Gothic", sans-serif';
        ctx.fillText(char.name, cx, y + 160);

        // Stats Text
        ctx.font = '14px "Malgun Gothic", sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.fillText(`Speed: ${char.speed}`, cx, y + 190);
        ctx.fillText(`Power: ${char.power}`, cx, y + 210);

        if (isSelected) ctx.restore();
    });

    // 4. Instructions
    ctx.fillStyle = '#00E676';
    ctx.font = '18px "Malgun Gothic", sans-serif';
    ctx.fillText("← / →  Select   |   SPACE  Confirm", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT - 60);

    ctx.restore();
}

export function startWorldMap() {
    state.isWorldMapActive = true;
    state.mapProgress = 0;

    // Auto-advance map progress
    const mapInterval = setInterval(() => {
        state.mapProgress += 0.02;
        if (state.mapProgress >= 1) {
            clearInterval(mapInterval);
            setTimeout(() => {
                state.isWorldMapActive = false;
                state.currentStage++; // Fixed: Increment stage after map animation
                startDialogue(state.currentStage);
            }, 1000);
        }
    }, 30)
}

// 대화 시스템
export function startDialogue(stage) {
    const dialogues = STAGE_DIALOGUES[stage];
    if (!dialogues) return;
    state.isDialogueActive = true;
    state.dialogueIndex = 0;
    showNextDialogue();
}

export function showNextDialogue() {
    const dialogues = STAGE_DIALOGUES[state.currentStage];
    const box = document.getElementById('dialogue-box');
    if (!dialogues || state.dialogueIndex >= dialogues.length) {
        state.isDialogueActive = false; if (box) box.classList.add('hidden'); return;
    }
    const d = dialogues[state.dialogueIndex];
    if (box) {
        box.classList.remove('hidden');
        const charName = CHARACTERS[state.selectedCharIndex].name;
        const displayName = (d.name === '또또') ? charName : d.name;
        box.querySelector('.character-name').innerText = displayName;
        box.querySelector('.text').innerText = d.text.replace(/또또/g, charName);
    }
    const nextFunc = (e) => {
        if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'Enter') return;
        window.removeEventListener('click', nextFunc); window.removeEventListener('keydown', nextFunc);
        state.dialogueIndex++; showNextDialogue();
    };
    setTimeout(() => {
        window.addEventListener('click', nextFunc); window.addEventListener('keydown', nextFunc);
    }, 200);
}

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
        <h1 style="color: #ffd700; font-size: 40px; margin-bottom: 50px; text-shadow: 4px 4px #e65100;">THE ADVENTURE OF TOTO</h1>
        <h2 style="color: #00e676; margin-bottom: 40px; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Mission Accomplished</h2>
        
        <div style="font-size: 16px; line-height: 2.5; margin-bottom: 40px;">
            <p style="color: #bdbdbd; font-size: 14px; margin-bottom: 20px;">- CREDITS -</p>
            
            <div style="margin-bottom: 30px;">
                <p style="color: #fff; font-weight: bold;">[ Executive Producer ]</p>
                <p style="color: #29b6f6; font-size: 20px;">PETER (PM)</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p style="color: #fff; font-weight: bold;">[ Game Design ]</p>
                <p style="color: #ba68c8; font-size: 20px;">BO (Planning Leader)</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p style="color: #fff; font-weight: bold;">[ Art Direction ]</p>
                <p style="color: #ff4081; font-size: 20px;">HANSOONI (AD)</p>
            </div>

            <div style="margin-bottom: 30px;">
                <p style="color: #fff; font-weight: bold;">[ Lead Programmer ]</p>
                <p style="color: #ff9800; font-size: 20px;">TTOTTO (Tech Lead)</p>
            </div>
        </div>

        <h3 style="color: #ffff00; font-size: 22px; margin-bottom: 40px; animation: blink 1s infinite;">Thank you for playing!</h3>
        
        <button onclick="handleRestart()" 
            style="padding: 20px 40px; font-family: inherit; font-size: 18px; cursor: pointer; 
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
