import {
  DRAW_SIZE as BALL, VOLLEY_DRAW as BIG_BALL,
  SPRITE_SPAN, SPRITE_BALL_CY,
} from './battle_shots.js';

const HALO_K = 1.05;
const HALO_K_BIG = 1.25;

const CORE_K = 0.22;

const PLAIN_K = 0.5;

export function drawShots(ctx, shots, img) {
  ctx.save();
  for (const s of shots) {
    if (!s.alive) continue;
    const d = s.big ? BIG_BALL : BALL;

    const halo = d * (s.big ? HALO_K_BIG : HALO_K);
    const g = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, halo);
    g.addColorStop(0, s.big ? 'rgba(255, 255, 246, 0.92)' : 'rgba(255, 248, 214, 0.78)');
    g.addColorStop(0.55, s.big ? 'rgba(255, 206, 90, 0.52)' : 'rgba(255, 214, 110, 0.4)');
    g.addColorStop(1, 'rgba(255, 190, 70, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, halo, 0, Math.PI * 2);
    ctx.fill();

    if (img) {
      const span = SPRITE_SPAN(d);
      ctx.save();
      ctx.translate(s.x, s.y);

      ctx.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 2);

      ctx.drawImage(img, -span / 2, -span * SPRITE_BALL_CY, span, span);
      ctx.restore();
    } else {
      ctx.fillStyle = '#fff3d0';
      ctx.beginPath();
      ctx.arc(s.x, s.y, d * PLAIN_K, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!s.big) continue;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, d * CORE_K, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
