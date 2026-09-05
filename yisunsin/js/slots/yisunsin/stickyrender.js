/**
 * stickyrender.js — 고정된 WILD 그리기 + 노란 외곽선 빛
 *
 * 🔴 왜 render.js 에서 갈랐는가
 *    그 파일이 정확히 300줄(H1)이라 연출을 넣을 자리가 없었다.
 *    `winfxrender.js` 가 이미 같은 방식으로 갈라져 있어 선례를 따랐다.
 *
 * 🔴 무엇을 그리는가 (대표님 지시 2026-09-05)
 *    레전더리 라운드에서 고정된 WILD 는 릴이 도는 중에도 제자리에 머문다.
 *    거기에 **노란 외곽선 빛**을 얹어 「이 칸은 고정됐다」를 눈으로 알린다.
 *
 * 🔴 세 가지를 구분해 그린다 (영상 검토 후 보강)
 *    ① 칸 테두리   — 고정된 칸마다
 *    ② 열 테두리   — 한 열이 **완전히** 차면 그 열을 굵게 감싼다
 *    ③ 신규 강조   — 이번 스핀에 새로 열린 칸만 잠깐 더 밝게
 *
 * ⛔ ctx 를 주입받는다. 이 파일은 캔버스 크기도 레이아웃도 스스로 정하지 않는다.
 */

/** 고정 WILD 강조색 — 당첨 금색(#ffd75e)보다 **밝은 노랑**이라 겹쳐도 구분된다 */
export const STICKY_COLOR = '#ffe066';

/** 새로 열린 칸을 더 밝게 유지하는 시간 */
const FRESH_MS = 400;

export function createStickyRenderer(ctx, {
  cell, pitch, colX, drawSymbol, rows, code = 's1_wild', color = STICKY_COLOR,
}) {
  let fresh = new Set();
  let freshUntil = 0;

  /** 이번 스핀에 새로 열린 칸을 알린다 — 잠깐 더 밝게 그린다 */
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

    /**
     * @param {Set<string>|null} cells 고정 칸 `"릴,행"`
     * @param {number} phase 0~1 반복 — 맥동
     * @param {Set<string>|null} [winCells] 당첨 칸 (금색이 이긴다)
     * @param {number} [now] 밀리초 — 신규 강조 판정용
     */
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

        // ⛔ 당첨 칸은 금색이 이긴다 — 무엇 때문에 돈이 들어왔는지가 우선이다
        if (winCells && winCells.has(key)) continue;

        const isNew = showFresh && fresh.has(key);
        stroke(x + 3, y + 3, cell - 6, cell - 6,
          isNew ? 5 : 3,
          Math.min(1, (isNew ? 0.85 : 0.55) + pulse * 0.45),
          (isNew ? 20 : 10) + pulse * 16);
      }

      // ② 완성된 열은 통째로 한 번 더 감싼다 — 「이 열이 열렸다」가 명확해진다
      for (const [c, n] of perReel) {
        if (n < rows) continue;
        stroke(colX(c) + 1, 1, cell - 2, rows * pitch - (pitch - cell) - 2,
          4, Math.min(1, 0.45 + pulse * 0.4), 14 + pulse * 18);
      }
    },
  };
}
