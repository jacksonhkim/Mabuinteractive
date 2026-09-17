export const STICKY_COLOR = '#ffe066';

const FRESH_MS = 400;

export function createStickyRenderer(ctx, {
  cellWidth, cellHeight, pitch, colX, drawSymbol, rows, code = 's1_wild', color = STICKY_COLOR,
}) {
  let fresh = new Set();
  let freshUntil = 0;

  const markFresh = (cells, now) => {
    fresh = cells || new Set();
    freshUntil = now + FRESH_MS;
  };

  const stroke = (x, y, w, h, width, alpha, blur) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  };

  return {
    markFresh,

    draw(cells, phase, winCells = null, now = 0) {
      if (!cells || cells.size === 0) return;

      const pulse = 0.55 + 0.45 * Math.sin(phase * Math.PI * 2);
      const showFresh = now < freshUntil;
      const perReel = new Map();

      for (const key of cells) {
        const [c, r] = key.split(',').map(Number);
        if (!(r >= 0 && r < rows)) continue;
        perReel.set(c, (perReel.get(c) || 0) + 1);

        const x = colX(c);
        const y = r * pitch;
        drawSymbol(code, x, y, 0, 1);

        if (winCells && winCells.has(key)) continue;

        const isNew = showFresh && fresh.has(key);
        stroke(x + 3, y + 3, cellWidth - 6, cellHeight - 6,
          isNew ? 5 : 3,
          Math.min(1, (isNew ? 0.85 : 0.55) + pulse * 0.45),
          (isNew ? 20 : 10) + pulse * 16);
      }

      for (const [c, n] of perReel) {
        if (n < rows) continue;
        stroke(colX(c) + 1, 1, cellWidth - 2, rows * pitch - (pitch - cellHeight) - 2,
          4, Math.min(1, 0.45 + pulse * 0.4), 14 + pulse * 18);
      }
    },
  };
}
