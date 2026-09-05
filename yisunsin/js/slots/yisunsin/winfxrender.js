/**
 * winfxrender.js — 일반 WIN 전용 Canvas 충격광·Spark
 *
 * render.js의 릴·페이라인 책임과 분리한다. 좌표와 색은 주입받아
 * 이 파일이 슬롯 레이아웃 상수를 복제하지 않게 한다.
 */
export function createWinFxRenderer(ctx, {
  cell, pitch, colX, color,
}) {
  const center = (col, row, positions) => {
    const frac = positions[col] - Math.floor(positions[col]);
    return [
      colX(col) + cell / 2,
      (row - frac) * pitch + cell / 2,
    ];
  };

  function drawImpact(frame, positions, winCells) {
    if (!frame || frame.flash <= 0 || !winCells) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const key of winCells) {
      const [col, row] = key.split(',').map(Number);
      const [x, y] = center(col, row, positions);
      const radius = cell * 0.58;
      const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
      light.addColorStop(0, `rgba(255, 255, 244, ${frame.flash * 0.62})`);
      light.addColorStop(0.35, `rgba(255, 224, 112, ${frame.flash * 0.38})`);
      light.addColorStop(1, 'rgba(255, 215, 94, 0)');
      ctx.fillStyle = light;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.restore();
  }

  function drawSparks(frame, positions) {
    if (!frame || !frame.sparks.length) return;
    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    for (const spark of frame.sparks) {
      const [cx, cy] = center(spark.col, spark.row, positions);
      const size = cell * spark.size;
      ctx.save();
      ctx.globalAlpha = spark.alpha;
      ctx.translate(cx + spark.x * cell, cy + spark.y * cell);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff8d8';
      const core = size * 0.38;
      ctx.fillRect(-core / 2, -core / 2, core, core);
      ctx.restore();
      ctx.fillStyle = color;
    }
    ctx.restore();
  }

  return { drawImpact, drawSparks };
}
