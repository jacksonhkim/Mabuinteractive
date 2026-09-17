export function createPaylineRenderer(ctx, {
  cols, colX, cellWidth, cellHeight, pitch, winColor, lineColor,
}) {
  const WIN_COLOR = winColor;
  const LINE_COLOR = lineColor;
  return {
    draw(rowsOfLine, count, positions, phase) {
      if (!rowsOfLine || count < 2) return;

      const all = [];
      for (let c = 0; c < cols; c += 1) {
        const frac = positions[c] - Math.floor(positions[c]);
        all.push([
          colX(c) + cellWidth / 2,
          (rowsOfLine[c] - frac) * pitch + cellHeight / 2,
        ]);
      }
      const hit = all.slice(0, Math.min(count, cols));
      if (hit.length < 2) return;

      const pulse = 0.6 + 0.4 * Math.sin(phase * Math.PI * 2);
      const path = (pts) => {
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      };

      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      path(all);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(6, 15, 24, 0.75)';
      ctx.lineWidth = 8;
      path(hit);
      ctx.stroke();

      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 4;
      ctx.shadowColor = LINE_COLOR;
      ctx.shadowBlur = 8 + pulse * 12;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = WIN_COLOR;
      for (const [x, y] of hit) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (hit.length < all.length) {
        const [x, y] = all[hit.length];
        ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
  };
}
