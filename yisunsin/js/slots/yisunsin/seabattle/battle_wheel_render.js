import { SEGMENTS } from './battle_wheel.js';

const DEG = Math.PI / 180;

const TOP = -90 * DEG;

const GOLD = '#e8c66a';
const GOLD_DIM = '#9c8340';
export const WHEEL_R = 132;
const RING_W = 18;
const POINTER_H = 26;

const BAND_FILL = ['#25324a', '#3b5578', '#a58a3c', '#f0cf72'];

function drawRing(ctx, cx, cy, angle, winner = 0) {
  for (const seg of SEGMENTS) {
    const hot = seg.band === winner;
    ctx.beginPath();
    ctx.arc(cx, cy, WHEEL_R + RING_W / 2,
      TOP + (seg.from + angle) * DEG, TOP + (seg.to + angle) * DEG);
    ctx.lineWidth = hot ? RING_W + 6 : RING_W;
    ctx.strokeStyle = hot ? GOLD : BAND_FILL[seg.band - 1];
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, WHEEL_R + RING_W, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = GOLD_DIM;
  ctx.stroke();
}

function drawSegLabels(ctx, cx, cy, angle, winner = 0) {

  const r = WHEEL_R + RING_W / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '700 13px system-ui, sans-serif';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(6, 12, 20, 0.85)';
  for (const seg of SEGMENTS) {
    const a = TOP + ((seg.from + seg.to) / 2 + angle) * DEG;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);

    ctx.rotate(Math.sin(a) > 0 ? a - Math.PI / 2 : a + Math.PI / 2);
    const text = `${seg.min}~${seg.max}`;
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = seg.band === winner ? '#2a1e06' : '#f2e7c8';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawPointer(ctx, cx, cy) {
  const top = cy - WHEEL_R - RING_W - POINTER_H;
  ctx.beginPath();
  ctx.moveTo(cx, top + POINTER_H);
  ctx.lineTo(cx - 13, top);
  ctx.lineTo(cx + 13, top);
  ctx.closePath();
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#3a2c10';
  ctx.stroke();
}

function drawWheelBody(ctx, cx, cy, angle, img) {
  if (!img) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle * DEG);
  ctx.drawImage(img, -WHEEL_R, -WHEEL_R, WHEEL_R * 2, WHEEL_R * 2);
  ctx.restore();
}

export function drawWheelFace(ctx, cx, cy, angle, winner = 0, img = null) {
  drawRing(ctx, cx, cy, angle, winner);
  drawWheelBody(ctx, cx, cy, angle, img);
  drawSegLabels(ctx, cx, cy, angle, winner);
  drawPointer(ctx, cx, cy);
}
