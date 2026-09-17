import { createWinFxRenderer } from './winfxrender.js';
import { createStickyRenderer } from './stickyrender.js';
import { createReelView } from './reelview.js';
import { specialGlowFade } from './winfxplan.js';
import { resolveRenderLayout } from './renderlayout.js';
import { createPaylineRenderer } from './payline_render.js';
import { createBreakRenderer } from './break_render.js';
import { tumbleCell } from './tumble_cell.js';
const PLACEHOLDER = {
  special: '#c9a227',
  high: '#7a5cc4',
  mid: '#3f7fa8',
  low: '#4a5a6a',
};

const WIN_COLOR = '#ffd75e';

const FREE_CODE = 's5_free';

const LINE_COLOR = '#d4af37';

const HIGHLIGHT = {
  s1_wild: '#e8c65a',
  s2_scatter: '#5ad4e8',
  s5_free: '#ffd76e',
  s3_bonus: '#e85a9c',
};

export function createRenderer(canvas, { config, symbols, assets, strips }) {
  const L = config.layout;
  const cols = config.reels;
  const rows = config.rows;
  const layout = resolveRenderLayout(L, cols, rows);
  const { cellWidth, cellHeight, pitch, width: W, height: H, symbolSize } = layout;

  const tiers = new Map((symbols.reelSymbols || []).map((s) => [s.code, s.tier]));
  const ctx = canvas.getContext('2d');

  const colX = (col) => L.padding + col * (cellWidth + L.reelGap);
  const winFxRenderer = createWinFxRenderer(ctx, {
    cellWidth, cellHeight, pitch, colX, color: WIN_COLOR,
  });
  const stickyRenderer = createStickyRenderer(ctx, {
    cellWidth, cellHeight, pitch, colX, rows, drawSymbol: (...a) => drawSymbol(...a),
  });

  const view = createReelView(strips);

  const breakRenderer = createBreakRenderer(ctx, { cellWidth, cellHeight, symbolSize });

  const symbolAt = (reel, index) => view.symbolAt(reel, index);

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';
  }

  function drawGlow(code, x, y, phase, forceColor, boost = 0, fade = 1) {
    const color = forceColor || HIGHLIGHT[code];
    if (!color) return;

    const pulse = 0.55 + 0.45 * Math.sin(phase * Math.PI * 2);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 + boost * 4;
    ctx.globalAlpha = Math.min(1, 0.5 + pulse * 0.5 + boost * 0.5) * fade;
    ctx.shadowColor = color;
    ctx.shadowBlur = (10 + pulse * 14) * (1 + boost * 1.6);
    ctx.strokeRect(x + 3, y + 3, cellWidth - 6, cellHeight - 6);
    ctx.restore();
  }

  function drawCellBase(x, y) {
    ctx.fillStyle = 'rgba(6, 15, 24, 0.55)';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1);
  }

  function drawSymbol(code, x, y, blur, scale = 1) {
    const size = symbolSize * scale;
    const offX = (cellWidth - size) / 2;
    const offY = (cellHeight - size) / 2;

    drawCellBase(x, y);

    const img = assets.get(code);
    if (img) {
      if (blur > 0) {

        const k = Math.min(blur, 1);
        const h = size * (1 + k * 0.18);
        ctx.globalAlpha = 1 - k * 0.2;
        ctx.drawImage(img, x + offX, y + offY - (h - size) / 2, size, h);
        ctx.globalAlpha = 1;
      } else {
        ctx.drawImage(img, x + offX, y + offY, size, size);
      }
      return;
    }

    ctx.fillStyle = PLACEHOLDER[tiers.get(code)] || '#555';
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x + offX, y + offY, size, size);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f2e8d5';
    ctx.font = '600 15px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, x + cellWidth / 2, y + cellHeight / 2);
  }

  const paylineRenderer = createPaylineRenderer(ctx, {
    cols, colX, cellWidth, cellHeight, pitch, winColor: WIN_COLOR, lineColor: LINE_COLOR,
  });

  return {

    setRound(roundStrips, cells, fresh) {
      view.setRound(roundStrips, cells);
      if (fresh) stickyRenderer.markFresh(fresh, Date.now());
    },

    setPending(cells, positions) { view.setPending(cells, positions); },

    width: W,
    height: H,
    rows,
    cols,

    resize: fit,

    draw(
      positions, speeds, settled, phase = 0,
      winCells = null, line = null, boost = 0, winFx = null, tumble = null,
    ) {
      ctx.clearRect(0, 0, W, H);

      const bursts = [];

      for (let c = 0; c < cols; c += 1) {
        const pos = positions[c];
        const base = Math.floor(pos);
        const frac = pos - base;
        const blur = speeds ? Math.min(speeds[c] / 26, 1) : 0;
        const x = colX(c);

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, 0, cellWidth, H);
        ctx.clip();

        for (let r = -1; r <= rows; r += 1) {
          const key = [c, r].join(',');

          if (view.stuck && view.stuck.has(key)) continue;
          const t = tumbleCell(tumble, c, r, frac, rows);
          if (t && t.broken) {

            drawCellBase(x, (r - frac) * pitch);
            breakRenderer.draw(assets.get(t.code), x, (r - frac) * pitch, tumble.u, c * 7 + r);
            bursts.push([x, (r - frac) * pitch]);
            continue;
          }
          const scale = (winFx && winCells && winCells.has(key) ? winFx.scale : 1) * (t ? t.scale : 1);
          const code = t ? t.code : symbolAt(c, base + r);
          drawSymbol(code, x, (r - frac + (t ? t.dy : 0)) * pitch, blur, scale);
        }

        if (!settled || settled[c]) {
          for (let r = 0; r < rows; r += 1) {
            const t = tumbleCell(tumble, c, r, frac, rows);

            if (t && (t.dy !== 0 || t.broken)) continue;
            const y = (r - frac) * pitch;

            const code = t ? t.code : symbolAt(c, base + r);
            if (winCells && winCells.has(`${c},${r}`)) {
              drawGlow(code, x, y, phase, WIN_COLOR, winFx ? winFx.glow : 0);
            } else {

              drawGlow(code, x, y, phase, null,
                code === FREE_CODE ? boost : 0, specialGlowFade(winFx));
            }
          }
        }
        if (winFx && winCells && winFx.nonWinAlpha < 1) {
          ctx.fillStyle = `rgba(6, 15, 24, ${1 - winFx.nonWinAlpha})`;
          for (let r = 0; r < rows; r += 1) {
            if (!winCells.has(`${c},${r}`)) ctx.fillRect(x, r * pitch, cellWidth, cellHeight);
          }
        }
        ctx.restore();
      }

      for (const [bx, by] of bursts) breakRenderer.burst(bx, by, tumble.u);

      stickyRenderer.draw(view.stuck, phase, winCells, Date.now());

      winFxRenderer.drawImpact(winFx, positions, winCells);
      if (line) paylineRenderer.draw(line.rows, line.count, positions, phase);
      winFxRenderer.drawSparks(winFx, positions);
    },
  };
}
