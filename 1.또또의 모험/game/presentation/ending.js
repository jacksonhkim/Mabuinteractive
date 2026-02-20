// ============================================================
// [Presentation Layer] ending.js
// 엔딩 시퀀스 + 크레딧 화면
// 최종 보스 처치 후 화이트아웃 → 크레딧 롤 → 재시작
// ============================================================

import { CONFIG } from '../constants.js';
import { sound } from '../sound.js';

// ── 엔딩 시퀀스 시작 ──
export function startEndingSequence(ctx) {
    console.log("Ending Sequence Started");
    sound.startBGM('ENDING');

    // 모든 UI 숨기기
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    const dialogueBox = document.getElementById('dialogue-box');
    if (dialogueBox) dialogueBox.classList.add('hidden');

    // 화이트아웃 연출
    let endingFrame = 0;

    function drawEnding() {
        endingFrame++;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, endingFrame * 0.02)})`;
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

        if (endingFrame > 120) {
            showCreditsScreen();
            return;
        }
        requestAnimationFrame(drawEnding);
    }
    drawEnding();
}

// ── 크레딧 화면 ──
export function showCreditsScreen() {
    // Canvas와 UI 숨기기
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.style.display = 'none';
    const hud = document.getElementById('hud');
    if (hud) hud.style.display = 'none';
    const dialogue = document.getElementById('dialogue-box');
    if (dialogue) dialogue.style.display = 'none';

    // 기존 크레딧 제거
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

    // 애니메이션 스타일
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
