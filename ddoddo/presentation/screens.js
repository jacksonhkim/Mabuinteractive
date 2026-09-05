// ============================================================
// [Presentation Layer] screens.js
// 게임 화면 렌더링 (타이틀, 게임오버, 스테이지 클리어, 캐릭터 선택)
// ============================================================

import { state } from '../state.js';
import { CONFIG, CHARACTERS } from '../constants.js';
import { BACKGROUND_IMAGES } from '../assets.js';
import {
    drawPixelForestV2, drawPixelTotoV5, drawPixelLuluV2,
    drawPixelKakaV2, drawPixelMomoV2, drawPixelPipiV2
} from '../pixel_art_v2.js';

// ── HUD 업데이트 ──
export function updateLivesUI() {
    const el = document.getElementById('lives');
    if (el) el.innerText = '❤'.repeat(state.lives);
}

export function updateBombUI() {
    const el = document.getElementById('bombs');
    if (el) el.innerText = '💣'.repeat(state.player.bombCount);
}

// ── 타이틀 화면 ──
export function drawTitleScreen(ctx) {
    const bg = BACKGROUND_IMAGES.bgStart;
    if (bg && bg.complete && bg.naturalWidth !== 0) {
        const scale = Math.max(CONFIG.SCREEN_WIDTH / bg.width, CONFIG.SCREEN_HEIGHT / bg.height);
        const nw = bg.width * scale;
        const nh = bg.height * scale;
        const nx = (CONFIG.SCREEN_WIDTH - nw) / 2;
        const ny = (CONFIG.SCREEN_HEIGHT - nh) / 2;
        ctx.drawImage(bg, nx, ny, nw, nh);
    } else {
        drawPixelForestV2(ctx, CONFIG, state);
    }
}

// ── 게임 오버 화면 ──
export function drawGameOverScreen(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);

    const sw = CONFIG.SCREEN_WIDTH;
    const sh = CONFIG.SCREEN_HEIGHT;
    const titleSize = Math.round(sw * 0.0625);
    const btnFontSize = Math.round(sw * 0.019);

    ctx.font = `900 ${titleSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff5252';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 15;
    ctx.fillText("GAME OVER", sw / 2, sh / 2 - sh * 0.11);

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Continue 버튼
    const btnW = Math.round(sw * 0.3125);
    const btnH = Math.round(sh * 0.083);
    const centerX = sw / 2;
    const centerY = sh / 2 + sh * 0.028;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#00E676';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - btnW / 2, centerY, btnW, btnH);
    ctx.fillRect(centerX - btnW / 2, centerY, btnW, btnH);

    ctx.font = `bold ${btnFontSize}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText("CONTINUE (CHANGE HERO)", centerX, centerY + btnH * 0.63);

    // Quit 버튼
    const quitY = centerY + btnH + sh * 0.028;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = '#ff5252';
    ctx.strokeRect(centerX - btnW / 2, quitY, btnW, btnH);
    ctx.fillRect(centerX - btnW / 2, quitY, btnW, btnH);

    ctx.fillStyle = '#ccc';
    ctx.fillText("QUIT TO MENU", centerX, quitY + btnH * 0.63);
}

// ── 스테이지 클리어 화면 ──
export function drawStageClear(ctx) {
    const fontSize = Math.round(CONFIG.SCREEN_WIDTH * 0.0625);
    ctx.font = `bold ${fontSize}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffeb3b';
    ctx.fillText("STAGE " + state.currentStage + " CLEAR!", CONFIG.SCREEN_WIDTH / 2, CONFIG.SCREEN_HEIGHT / 2);
}

// ── 캐릭터 선택 UI ──
export function drawCharacterSelectionUI(ctx, selectedIndex) {
    ctx.save();

    // 배경
    if (BACKGROUND_IMAGES.bgCharSelect && BACKGROUND_IMAGES.bgCharSelect.complete) {
        ctx.drawImage(BACKGROUND_IMAGES.bgCharSelect, 0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT);
    }

    const sw = CONFIG.SCREEN_WIDTH;
    const sh = CONFIG.SCREEN_HEIGHT;
    const titleFontSize = Math.round(sw * 0.031);

    // 타이틀
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${titleFontSize}px "Malgun Gothic", sans-serif`;
    ctx.shadowColor = '#FF8F00';
    ctx.shadowBlur = 10;
    ctx.fillText("CHOOSE YOUR HERO", sw / 2, sh * 0.11);
    ctx.shadowBlur = 0;

    // 캐릭터 카드
    const cardW = Math.round(sw * 0.125);
    const cardH = Math.round(sh * 0.333);
    const gap = Math.round(sw * 0.016);
    const spriteSize = Math.round(cardW * 0.8);
    const totalW = CHARACTERS.length * cardW + (CHARACTERS.length - 1) * gap;
    const startX = (sw - totalW) / 2;
    const startY = sh / 2 - cardH / 2;

    CHARACTERS.forEach((char, i) => {
        const x = startX + i * (cardW + gap);
        const y = startY;
        const isSelected = (i === selectedIndex);

        ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.5)';
        ctx.strokeStyle = isSelected ? '#00E676' : '#546E7A';
        ctx.lineWidth = isSelected ? 4 : 2;

        if (isSelected) {
            ctx.save();
            ctx.translate(x + cardW / 2, y + cardH / 2);
            ctx.scale(1.1, 1.1);
            ctx.translate(-(x + cardW / 2), -(y + cardH / 2));
        }

        ctx.fillRect(x, y, cardW, cardH);
        ctx.strokeRect(x, y, cardW, cardH);

        const cx = x + cardW / 2;
        const cy = y + cardH * 0.33;
        const halfSprite = spriteSize / 2;

        if (char.id === 'toto') drawPixelTotoV5(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize);
        else if (char.id === 'lulu') { if (typeof drawPixelLuluV2 === 'function') drawPixelLuluV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else if (char.id === 'kaka') { if (typeof drawPixelKakaV2 === 'function') drawPixelKakaV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else if (char.id === 'momo') { if (typeof drawPixelMomoV2 === 'function') drawPixelMomoV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else if (char.id === 'pipi') { if (typeof drawPixelPipiV2 === 'function') drawPixelPipiV2(ctx, cx - halfSprite, cy - halfSprite, spriteSize, spriteSize); }
        else {
            ctx.fillStyle = char.color;
            ctx.beginPath(); ctx.arc(cx, cy, cardW * 0.125, 0, Math.PI * 2); ctx.fill();
        }

        const nameFontSize = Math.round(cardW * 0.125);
        ctx.fillStyle = isSelected ? '#fff' : '#aaa';
        ctx.font = `bold ${nameFontSize}px "Malgun Gothic", sans-serif`;
        ctx.fillText(char.name, cx, y + cardH * 0.67);

        const statFontSize = Math.round(cardW * 0.088);
        ctx.font = `${statFontSize}px "Malgun Gothic", sans-serif`;
        ctx.fillStyle = '#ccc';
        ctx.fillText(`Speed: ${char.speed}`, cx, y + cardH * 0.79);
        ctx.fillText(`Power: ${char.power}`, cx, y + cardH * 0.875);

        if (isSelected) ctx.restore();
    });

    // 조작 안내
    const instrFontSize = Math.round(sw * 0.014);
    ctx.fillStyle = '#00E676';
    ctx.font = `${instrFontSize}px "Malgun Gothic", sans-serif`;
    ctx.fillText("← / →  Select   |   SPACE  Confirm", sw / 2, sh - sh * 0.083);

    ctx.restore();
}
