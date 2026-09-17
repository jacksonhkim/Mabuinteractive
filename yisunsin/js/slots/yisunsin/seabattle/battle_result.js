import { FIELD_W, FIELD_H } from './battle_scene.js';
import { ENEMIES } from './battle_enemy.js';
import { BOSSES } from './battle_boss.js';

export const STEP_MS = [0, 620, 1240, 1860];

export const HOLD_MS = 3200;

export const RESULT_MS = STEP_MS[STEP_MS.length - 1] + HOLD_MS;

export const FAST_SCALE = 0.45;

const FADE_MS = 260;

const ease = (t) => 1 - (1 - t) ** 3;

function shownAt(elapsed, fast = false) {
  const scale = fast ? FAST_SCALE : 1;
  let n = 0;
  for (const at of STEP_MS) if (elapsed >= at * scale) n += 1;
  return n;
}

export const resultMs = (fast = false) => (fast ? RESULT_MS * FAST_SCALE : RESULT_MS);

function line(ctx, label, value, y, size, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.font = `600 ${Math.round(size * 0.62)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(226, 214, 186, 0.75)';
  ctx.fillText(label, FIELD_W / 2 - 18, y);
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.lineWidth = Math.max(3, size * 0.14);
  ctx.strokeStyle = 'rgba(4, 14, 20, 0.85)';
  ctx.strokeText(value, FIELD_W / 2 + 18, y);
  ctx.fillStyle = color;
  ctx.fillText(value, FIELD_W / 2 + 18, y);
  ctx.globalAlpha = 1;
}

export function drawResult(ctx, r, elapsed, fast = false, view = null) {
  const scale = fast ? FAST_SCALE : 1;
  const ox = view && view.overX > 0 ? view.overX : 0;
  const oy = view && view.overY > 0 ? view.overY : 0;
  ctx.save();

  const cover = Math.min(1, elapsed / FADE_MS);
  ctx.fillStyle = `rgba(4, 14, 20, ${(0.78 * cover).toFixed(3)})`;
  ctx.fillRect(-ox, -oy, FIELD_W + ox * 2, FIELD_H + oy * 2);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.globalAlpha = cover;
  ctx.font = '700 34px system-ui, sans-serif';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(4, 14, 20, 0.85)';
  ctx.strokeText('전투 종료', FIELD_W / 2, 82);
  ctx.fillStyle = '#f4e4bc';
  ctx.fillText('전투 종료', FIELD_W / 2, 82);
  ctx.globalAlpha = 1;

  const n = shownAt(elapsed, fast);
  const alphaOf = (i) => (n > i
    ? Math.min(1, ease((elapsed - STEP_MS[i] * scale) / (FADE_MS * scale)))
    : 0);

  if (n > 0) {
    const sunk = r.sunk || [0, 0, 0, 0];
    const total = sunk.reduce((a, b) => a + b, 0);
    const detail = ENEMIES
      .map((e, i) => (sunk[i] > 0 ? `${e.name} ${sunk[i]}` : null))
      .filter(Boolean).join(' · ');
    line(ctx, '격침', `${total}척`, 158, 30, '#f4e4bc', alphaOf(0));
    if (detail) {
      ctx.globalAlpha = alphaOf(0) * 0.8;
      ctx.font = '500 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(226, 214, 186, 0.9)';
      ctx.fillText(detail, FIELD_W / 2, 190);
      ctx.globalAlpha = 1;
    }
    if (r.hasBoss && r.bossGrade !== null) {
      ctx.globalAlpha = alphaOf(0);
      ctx.font = '600 17px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = r.bossSunk ? '#ffd76a' : 'rgba(226, 214, 186, 0.75)';
      ctx.fillText(
        `${BOSSES[r.bossGrade].name} ${r.bossSunk ? '격침' : '미격침'}`,
        FIELD_W / 2, 216,
      );
      ctx.globalAlpha = 1;
    }
  }

  if (n > 1) line(ctx, '총점', r.score.toLocaleString(), 264, 34, '#f4e4bc', alphaOf(1));
  if (n > 2) {
    line(ctx, '환산', `× ${r.mult.toFixed(2)}`, 322, 30,
      r.capped ? '#ffd76a' : '#f4e4bc', alphaOf(2));
    if (r.capped) {

      ctx.globalAlpha = alphaOf(2);
      ctx.font = '700 26px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffd76a';
      ctx.fillText('大 捷', FIELD_W / 2, 360);
      ctx.globalAlpha = 1;
    }
  }
  if (n > 3) {
    const a = alphaOf(3);
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(226, 214, 186, 0.8)';
    ctx.fillText('획득', FIELD_W / 2, r.capped ? 400 : 384);
    ctx.font = '800 54px system-ui, sans-serif';
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(4, 14, 20, 0.9)';
    const money = r.award.toLocaleString();
    ctx.strokeText(money, FIELD_W / 2, r.capped ? 446 : 430);
    ctx.fillStyle = '#ffd76a';
    ctx.fillText(money, FIELD_W / 2, r.capped ? 446 : 430);
    ctx.globalAlpha = 1;

    if (elapsed > (STEP_MS[3] + 500) * scale) {
      ctx.globalAlpha = 0.55 + Math.sin(elapsed / 300) * 0.2;
      ctx.font = '500 15px system-ui, sans-serif';
      ctx.fillStyle = '#e2d6ba';
      ctx.fillText('화면을 눌러 계속', FIELD_W / 2, FIELD_H - 34);
      ctx.globalAlpha = 1;
    }
  }
  ctx.restore();
}
