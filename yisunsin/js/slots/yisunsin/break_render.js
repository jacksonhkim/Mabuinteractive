export const SHARD_COLS = 2;
export const SHARD_ROWS = 2;
export const SHARD_N = SHARD_COLS * SHARD_ROWS;

const SPREAD = 0.62;

const GRAVITY = 0.95;

const FADE_FROM = 0.5;

const FLASH_END = 0.34;

const RING_END = 0.85;

const clamp = (u) => Math.min(Math.max(u, 0), 1);

export function shardAt(i, u, seed = 0) {
  const t = clamp(u);
  const qx = i % SHARD_COLS;
  const qy = Math.floor(i / SHARD_COLS);
  const sx = qx ? 1 : -1;
  const sy = qy ? 1 : -1;
  const vary = ((seed + i) % 3) * 0.09;

  return {
    dx: sx * (SPREAD + vary) * t,

    dy: sy * 0.22 * t + GRAVITY * t * t,
    rot: sx * (0.85 + vary * 3) * t,
    alpha: t < FADE_FROM ? 1 : Math.max(1 - (t - FADE_FROM) / (1 - FADE_FROM), 0),
    scale: 1 - 0.14 * t,
  };
}

export function flashAt(u) {
  const t = clamp(u);
  return t >= FLASH_END ? 0 : 1 - t / FLASH_END;
}

export function ringAt(u) {
  const t = clamp(u);
  if (t >= RING_END) return { r: 0, alpha: 0 };
  const k = t / RING_END;
  return { r: 0.34 + 0.72 * k, alpha: (1 - k) * 0.85 };
}

export function createBreakRenderer(ctx, { cellWidth, cellHeight, symbolSize }) {
  const GOLD = '#e8c66a';

  function flash(cx, cy, k) {
    if (k <= 0) return;
    const r = symbolSize * 0.72;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255, 255, 255, ${0.95 * k})`);
    g.addColorStop(0.4, `rgba(232, 198, 106, ${0.65 * k})`);
    g.addColorStop(1, 'rgba(232, 198, 106, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function ring(cx, cy, u) {
    const { r, alpha } = ringAt(u);
    if (alpha <= 0) return;
    ctx.save();
    ctx.strokeStyle = GOLD;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 3;
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, r * cellWidth, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  return {

    burst(x, y, u) {
      const cx = x + cellWidth / 2;
      const cy = y + cellHeight / 2;
      flash(cx, cy, flashAt(u));
      ring(cx, cy, u);
    },

    draw(img, x, y, u, seed = 0) {
      const cx = x + cellWidth / 2;
      const cy = y + cellHeight / 2;

      if (img && img.width) {
        const half = symbolSize / 2;
        const sw = img.width / SHARD_COLS;
        const sh = img.height / SHARD_ROWS;
        for (let i = 0; i < SHARD_N; i += 1) {
          const s = shardAt(i, u, seed);
          if (s.alpha <= 0) continue;
          const qx = i % SHARD_COLS;
          const qy = Math.floor(i / SHARD_COLS);
          ctx.save();
          ctx.globalAlpha = s.alpha;

          ctx.translate(cx + s.dx * cellWidth + (qx ? half / 2 : -half / 2),
            cy + s.dy * cellHeight + (qy ? half / 2 : -half / 2));
          ctx.rotate(s.rot);
          const d = (half * s.scale) / 2;
          ctx.drawImage(img, qx * sw, qy * sh, sw, sh, -d, -d, d * 2, d * 2);
          ctx.restore();
        }
      }
    },
  };
}
