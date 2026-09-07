/**
 * render.js — 릴 Canvas 렌더링
 *
 * 🔴 WEB 논리 좌표는 872×664 로 고정하고 모바일은 표시 좌표만 넓힌다.
 *    한쪽에서만 나는 버그가 생긴다. 여기서는 **고정 좌표로 그리고 CSS 로 축소**한다.
 *
 * 🔴 릴 위치는 **소수**다.
 *    `pos = 12.4` 는 "스트립 12번 칸에서 0.4칸만큼 흘러내린 상태" 를 뜻한다.
 *    정수 인덱스만 다루면 릴이 칸 단위로 튀어 회전으로 보이지 않는다.
 *    화면 위아래로 한 칸씩 더 그리고 릴 영역으로 잘라내 빈틈을 없앤다.
 */

import { createWinFxRenderer } from './winfxrender.js';
import { createStickyRenderer } from './stickyrender.js';
import { createReelView } from './reelview.js';
import { specialGlowFade } from './winfxplan.js';
import { resolveRenderLayout, usesMobileReelLayout } from './renderlayout.js';
const PLACEHOLDER = {
  special: '#c9a227',
  high: '#7a5cc4',
  mid: '#3f7fa8',
  low: '#4a5a6a',
};

/**
 * 🔴 특수 심볼 강조 색 (레퍼런스 "Money Blessing" 연출 채택 — 대표님 지시)
 *    릴이 멈추는 **그 순간** 특수 심볼에 테두리를 씌우고, 남은 릴이 다 설 때까지 유지한다.
 *    두 개째가 켜지면 "하나만 더" 라는 기대가 생긴다 — 이것이 슬롯의 긴장감이다.
 *    전부 멈춘 뒤 한꺼번에 표시하면 그 시간이 통째로 사라진다.
 */
/** 당첨 칸 — 특수 심볼 색보다 우선한다 */
const WIN_COLOR = '#ffd75e';
/** 🔴 프리스핀 트리거 심볼. 배당이 없고 트리거 전용이다 (주의사항 #15) */
const FREE_CODE = 's5_free';

/** 당첨 꺾은선 (UI기획서 §4-2 · §1-2 강조 금색) */
const LINE_COLOR = '#d4af37';

const HIGHLIGHT = {
  s1_wild: '#e8c65a',      // 금 — 이순신
  s2_scatter: '#5ad4e8',   // 청록 — 함대(산발 배당)
  s5_free: '#ffd76e',      // 금색 — 난중일기(프리스핀 트리거)
  s3_bonus: '#e85a9c',     // 자홍 — 보물상자(보너스)
};

export function createRenderer(canvas, { config, symbols, assets, strips }) {
  const L = config.layout;
  const cols = config.reels;
  const rows = config.rows;
  const layout = resolveRenderLayout(L, usesMobileReelLayout(window), cols, rows);
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

  /** 스트립을 벗어나지 않게 감아 읽는다 (음수 인덱스 포함) */
  const symbolAt = (reel, index) => view.symbolAt(reel, index);

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);   // 3배까지 갈 필요는 없다
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = 'high';
  }

  /**
   * @param {number} [boost] 0~1. 트리거 연출이 특정 심볼만 확 밝힐 때 쓴다 (연출기획서 §4-3).
   *   평소에는 0 이라 이 인자가 없던 때와 그림이 완전히 같다.
   */
  function drawGlow(code, x, y, phase, forceColor, boost = 0, fade = 1) {
    const color = forceColor || HIGHLIGHT[code];
    if (!color) return;
    // 숨쉬듯 밝기가 오르내려 정지 화면에서도 살아 있게 보인다
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

  function drawSymbol(code, x, y, blur, scale = 1) {
    const size = symbolSize * scale;
    const offX = (cellWidth - size) / 2;
    const offY = (cellHeight - size) / 2;

    ctx.fillStyle = 'rgba(6, 15, 24, 0.55)';
    ctx.fillRect(x, y, cellWidth, cellHeight);
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cellWidth - 1, cellHeight - 1);

    const img = assets.get(code);
    if (img) {
      if (blur > 0) {
        // 빠를수록 세로로 늘여 잔상처럼 보이게 한다. 실제 블러 필터는 프레임을 잡아먹는다.
        // 🔴 예전 값(늘임 0.35 / 투명 0.35)은 회전 중 심볼을 아예 못 읽게 만들었다.
        //    잔상은 속도를 느끼게 하는 장치이지 심볼을 가리는 장치가 아니다.
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

  /**
   * 당첨 라인을 꺾은선으로 그린다 (UI기획서 §4-2).
   *
   * 🔴 선만으로는 어느 심볼이 걸렸는지 알기 어렵다. 심볼 강조와 **함께** 쓴다.
   *    접근성 항목(§13)도 "색상만으로 구분하지 않고 선 굵기·발광을 함께" 를 요구한다.
   *
   * @param {number[]} rowsOfLine  릴별 행 번호 — paylines[n]
   * @param {number} count         앞에서부터 몇 릴까지 당첨인가
   * @param {number[]} positions
   * @param {number} phase         0~1 — 발광 맥동
   */
  function drawPayline(rowsOfLine, count, positions, phase) {
    if (!rowsOfLine || count < 2) return;

    // 🔴 라인은 **5릴 전체**를 그린다.
    //    당첨 구간까지만 그리면 선이 허공에서 끊긴 것처럼 보인다 (대표님 지적).
    //    전체 경로를 흐리게 깔고 맞은 구간만 진하게 해야
    //    "이 라인이 이렇게 지나가고 여기까지 맞았다" 가 한눈에 읽힌다.
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

    // ① 전체 경로 — 나머지 구간이 어디로 가는지만 보여 준다
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    path(all);
    ctx.stroke();
    ctx.setLineDash([]);

    // ② 당첨 구간 — 어두운 테두리를 먼저 깔아 밝은 심볼 위에서도 보이게 한다
    ctx.strokeStyle = 'rgba(6, 15, 24, 0.75)';
    ctx.lineWidth = 8;
    path(hit);
    ctx.stroke();

    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 4;
    ctx.shadowColor = LINE_COLOR;
    ctx.shadowBlur = 8 + pulse * 12;
    ctx.stroke();

    // ③ 각 릴의 통과점에 매듭을 찍어 경로를 읽기 쉽게 한다
    ctx.shadowBlur = 0;
    ctx.fillStyle = WIN_COLOR;
    for (const [x, y] of hit) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    // 당첨이 끊긴 지점에 작은 마디를 찍어 "여기까지" 를 분명히 한다
    if (hit.length < all.length) {
      const [x, y] = all[hit.length];
      ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  return {
    /** 레전더리 라운드의 릴·고정 칸(`"릴,행"` Set)을 알린다. 평상시엔 둘 다 null */
    setRound(roundStrips, cells, fresh) {
      view.setRound(roundStrips, cells);
      if (fresh) stickyRenderer.markFresh(fresh, Date.now());
    },

    /** 🔴 이번 스핀에 새로 열릴 칸 — 정지 위치에 실어 회전 중에도 보이게 한다 */
    setPending(cells, positions) { view.setPending(cells, positions); },

    width: W,
    height: H,
    rows,
    cols,

    resize: fit,

    /**
     * @param {number[]} positions  릴별 위치(소수). 정수부가 최상단 칸.
     * @param {number[]} [speeds]   릴별 속도(칸/초) — 잔상 표현에만 쓴다
     * @param {boolean[]} [settled] 릴별 정지 여부. 멈춘 릴만 특수 심볼을 강조한다
     * @param {number} [phase]      0~1 반복. 강조 맥동에 쓴다
     * @param {Set<string>} [winCells] 당첨 칸 `"릴,행"`. 금색으로 덧칠한다
     * @param {{rows:number[], count:number}} [line] 지금 보여줄 당첨 라인 하나
     * @param {number} [boost] 0~1. FREE 트리거 연출 중 난중일기만 확 밝힌다
     * @param {object} [winFx] 일반 WIN의 800ms Pulse·Glow·Spark 한 프레임
     */
    draw(
      positions, speeds, settled, phase = 0,
      winCells = null, line = null, boost = 0, winFx = null,
    ) {
      ctx.clearRect(0, 0, W, H);

      for (let c = 0; c < cols; c += 1) {
        const pos = positions[c];
        const base = Math.floor(pos);
        const frac = pos - base;
        const blur = speeds ? Math.min(speeds[c] / 26, 1) : 0;
        const x = colX(c);

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, 0, cellWidth, H);      // 릴 밖으로 새는 부분을 자른다
        ctx.clip();

        // 위아래 한 칸씩 더 그려야 흘러내릴 때 빈틈이 없다
        for (let r = -1; r <= rows; r += 1) {
          const key = [c, r].join(',');
          // 🔴 고정 칸은 흐르지 않는다 — 아래에서 제자리에 따로 그린다
          if (view.stuck && view.stuck.has(key)) continue;
          const scale = winFx && winCells && winCells.has(key) ? winFx.scale : 1;
          drawSymbol(symbolAt(c, base + r), x, (r - frac) * pitch, blur, scale);
        }


        // 멈춘 릴에서만 — 도는 중에 켜면 무엇이 걸렸는지 미리 새어 나간다
        if (!settled || settled[c]) {
          for (let r = 0; r < rows; r += 1) {
            const y = (r - frac) * pitch;
            // 당첨 칸이 먼저다. 특수 심볼이면서 당첨이기도 하면 금색으로 보인다.
            const code = symbolAt(c, base + r);
            if (winCells && winCells.has(`${c},${r}`)) {
              drawGlow(code, x, y, phase, WIN_COLOR, winFx ? winFx.glow : 0);
            } else {
              // 🔴 부스트는 **난중일기에만**. 트리거가 무엇인지 눈으로 알려 준다.
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

      // 🔴 고정 WILD 는 도는 중에도 제자리에 머문다 — 릴 클립 밖이라 빛이 안 잘린다
      stickyRenderer.draw(view.stuck, phase, winCells, Date.now());
      // 🔴 꺾은선은 **맨 위에** 그린다. 릴 클리핑 안에서 그리면 잘린다.
      winFxRenderer.drawImpact(winFx, positions, winCells);
      if (line) drawPayline(line.rows, line.count, positions, phase);
      winFxRenderer.drawSparks(winFx, positions);
    },
  };
}
