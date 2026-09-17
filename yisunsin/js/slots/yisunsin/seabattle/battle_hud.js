import { FIELD_W, FIELD_H } from './battle_scene.js';
import { RADIUS as PLAYER_RADIUS, DRAW_SIZE as SHIP, MARK_R } from './battle_player.js';
import { ENEMIES } from './battle_enemy.js';
import { BOSSES, phaseOf } from './battle_boss.js';
import { BLAST_FULL, BLAST_RADIUS, blastReady, blastProgress } from './battle_blast.js';

const TAU = Math.PI * 2;

const MS_PER_SEC = 1000;

const PHASE_COLOR = ['#ffd76a', '#ff9a3c', '#ff4a34'];

const WAVE_RINGS = [
  { at: 1.00, width: 11, alpha: 1.00, color: '#fff3c8' },
  { at: 0.78, width: 7, alpha: 0.62, color: '#ffd76a' },
  { at: 0.56, width: 4, alpha: 0.34, color: '#ffb347' },
];

const HP_HI = '#8ee06a';
const HP_LO = '#ff6b5a';

const HP_BAR_MIN_ENERGY = 2;

function outlined(ctx, text, x, y, size, fill, weight = 600) {
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.lineWidth = Math.max(3, size * 0.16);
  ctx.strokeStyle = 'rgba(4, 14, 20, 0.8)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function bar(ctx, x, y, w, h, ratio, color) {
  ctx.fillStyle = 'rgba(4, 14, 20, 0.7)';
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * Math.max(0, Math.min(1, ratio)), h);
}

export function drawPlayerMark(ctx, p, t) {
  const pulse = 1 + Math.sin(t / 260) * 0.06;
  const r = MARK_R * pulse;
  ctx.save();
  ctx.translate(p.x, p.y);

  const g = ctx.createRadialGradient(0, 0, r * 0.55, 0, 0, r);
  g.addColorStop(0, 'rgba(255, 214, 110, 0)');
  g.addColorStop(0.72, 'rgba(255, 214, 110, 0.30)');
  g.addColorStop(1, 'rgba(255, 214, 110, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 226, 150, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_RADIUS + 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.rotate(p.aim);
  ctx.fillStyle = 'rgba(255, 236, 180, 0.92)';
  ctx.beginPath();
  ctx.moveTo(SHIP / 2 - 6, 0);
  ctx.lineTo(SHIP / 2 - 20, -9);
  ctx.lineTo(SHIP / 2 - 20, 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawBlastGauge(ctx, p) {
  const ratio = Math.min(1, p.energy / BLAST_FULL);
  const w = 46;
  bar(ctx, p.x - w / 2, p.y + SHIP / 2 - 12, w, 4, ratio,
    blastReady(p) ? '#ffd76a' : '#7fd4ff');
}

export function drawEnemyHp(ctx, list) {
  for (const e of list) {
    if (!e.alive) continue;
    const max = ENEMIES[e.grade].energy;
    if (max < HP_BAR_MIN_ENERGY || e.hp >= max) continue;

    const w = Math.max(26, e.radius * 1.6);
    const ratio = e.hp / max;
    bar(ctx, e.x - w / 2, e.y - e.radius - 12, w, 4, ratio, ratio > 0.5 ? HP_HI : HP_LO);
  }
}

export function drawBossHp(ctx, b) {
  if (!b || !b.alive) return;

  const w = b.radius * 1.9;
  const x = b.x - w / 2;
  const y = b.y - b.radius - 18;
  const left = b.energy > 0 ? Math.max(0, b.hp / b.energy) : 0;
  ctx.save();
  bar(ctx, x, y, w, 7, left, PHASE_COLOR[phaseOf(b)]);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  outlined(ctx, BOSSES[b.grade].name, b.x, y - 4, 17, '#ffe9b0', 700);
  ctx.restore();
}

export function drawClockScore(ctx, remainingMs, score) {
  const total = Math.max(0, Math.ceil(remainingMs / MS_PER_SEC));
  const text = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  outlined(ctx, text, FIELD_W / 2, 20, 40, total <= 5 ? '#ff6b5a' : '#f4e4bc');
  outlined(ctx, `점수 ${score.toLocaleString()}`, FIELD_W / 2, 68, 20, '#f4e4bc');
  ctx.restore();
}

export function drawTouchControls(ctx, v, p) {
  const ratio = Math.min(1, p.energy / BLAST_FULL);
  const ready = blastReady(p);
  ctx.save();

  if (v.aim.on) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 236, 190, 0.5)';
    ctx.beginPath();
    ctx.arc(v.aim.x, v.aim.y, 26, 0, TAU);
    ctx.stroke();
  }

  const b = v.blast;
  ctx.lineWidth = 3;
  ctx.fillStyle = b.on ? 'rgba(255, 154, 60, 0.40)' : 'rgba(4, 14, 20, 0.32)';
  ctx.strokeStyle = 'rgba(255, 236, 190, 0.48)';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, TAU);
  ctx.fill();
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.strokeStyle = ready ? 'rgba(255, 215, 106, 0.95)' : 'rgba(127, 212, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r - 4, -Math.PI / 2, -Math.PI / 2 + TAU * ratio);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  outlined(ctx, '일제사격', b.x, b.y, 15,
    ready ? '#ffd76a' : 'rgba(255, 236, 190, 0.5)', 700);
  ctx.restore();
}

export function drawBreachLine(ctx) {
  ctx.save();
  const g = ctx.createLinearGradient(0, FIELD_H - 26, 0, FIELD_H);
  g.addColorStop(0, 'rgba(255, 90, 70, 0)');
  g.addColorStop(1, 'rgba(255, 90, 70, 0.30)');
  ctx.fillStyle = g;
  ctx.fillRect(0, FIELD_H - 26, FIELD_W, 26);
  ctx.strokeStyle = 'rgba(255, 120, 96, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, FIELD_H - 1);
  ctx.lineTo(FIELD_W, FIELD_H - 1);
  ctx.stroke();
  ctx.restore();
}

export function drawBlastWave(ctx, p) {
  const k = blastProgress(p);
  if (k <= 0) return;
  const r = BLAST_RADIUS * k;
  const fade = 1 - k;
  ctx.save();

  const g = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, r);
  g.addColorStop(0, `rgba(255, 236, 170, ${(0.26 * fade).toFixed(3)})`);
  g.addColorStop(0.7, `rgba(255, 200, 90, ${(0.14 * fade).toFixed(3)})`);
  g.addColorStop(1, 'rgba(255, 190, 70, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();

  ctx.arc(p.x, p.y, r, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  for (const w of WAVE_RINGS) {
    const rr = r * w.at;
    if (rr < 2) continue;
    ctx.globalAlpha = fade * w.alpha;
    ctx.lineWidth = w.width;
    ctx.strokeStyle = w.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, rr, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
