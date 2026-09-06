/**
 * 브라우저 확대가 viewport 단위를 다시 줄여 버리는 현상을 보정한다.
 * 대표님 검수 환경은 Windows 표시 배율 100%이므로 기준 DPR은 1이다.
 *
 * 🔴 **터치 기기에서는 이 보정을 걸지 않는다** (2026-09-06 모바일 대응).
 *    DPR 은 데스크톱에서 「브라우저 확대」의 단서지만, 폰에서는 확대와 무관한
 *    **하드웨어 속성**이다. 아이폰 16 Pro 는 확대한 적이 없어도 DPR 이 3 이라
 *    `--layout-vh` 가 세로 272px 화면에서 816px 로 부풀었고, 높이 기반 축소항
 *    (`--panel-w` 둘째 항)이 통째로 무력화되어 레이아웃이 화면의 2.1배가 됐다.
 *    실측 — iPhone 16 Pro 가로 874×402, 사파리 바 표시 중 실사용 세로 272px.
 *
 *    터치 기기에서는 커스텀 속성을 **지우고** CSS 기본값(`100vw`/`100dvh`)에
 *    맡긴다. `dvh` 는 사파리 주소창이 숨고 나타날 때 스스로 따라오므로
 *    JS 가 `innerHeight` 로 흉내 내는 것보다 정확하다.
 */
/* 🔴 **뷰포트 대응의 단일 진입점**으로 함께 내보낸다 (2026-09-06).
   `main.js` 가 H1 상한(300줄)에 닿아 있어 import 문 한 줄을 더 쓸 수 없다.
   확대 보정과 방향 안내는 둘 다 「기기가 준 화면에 맞추는 일」이라 같은 문으로
   나가는 것이 어색하지 않다. 구현과 시험은 `orientation.js` 에 그대로 있다. */
export { installOrientationGuard, shouldAskRotate } from './orientation.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value) => Math.round(value * 1000) / 1000;

export function computeLayoutViewport({
  innerWidth,
  innerHeight,
  devicePixelRatio,
  baseDevicePixelRatio = 1,
  coarsePointer = false,
}) {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
    ? devicePixelRatio
    : 1;
  const base = Number.isFinite(baseDevicePixelRatio) && baseDevicePixelRatio > 0
    ? baseDevicePixelRatio
    : 1;
  // 🔴 터치 기기는 배율 보정 대상이 아니다 — DPR 이 확대를 뜻하지 않는다.
  const zoom = coarsePointer ? 1 : round(clamp(dpr / base, 0.5, 3));
  return {
    width: round(Math.max(1, innerWidth) * zoom),
    height: round(Math.max(1, innerHeight) * zoom),
    zoom,
    coarsePointer: Boolean(coarsePointer),
  };
}

/**
 * 손가락으로 쓰는 기기인가.
 *
 * ⚠️ `ontouchstart` 로 판정하지 않는다 — 터치 지원 노트북이 전부 걸린다.
 *    `pointer: coarse` 는 **주 입력 장치가 손가락인가**를 묻는다.
 *    matchMedia 가 없는 기동 검사 환경에서는 false 로 둔다 (데스크톱과 동일).
 */
export function hasCoarsePointer(win) {
  if (!win || typeof win.matchMedia !== 'function') return false;
  try {
    return win.matchMedia('(pointer: coarse)').matches === true;
  } catch {
    return false;
  }
}

/* ══ 고정 무대 배율 (대표님 결재 2026-09-06) ═══════════════════════════════
   폰 가로에서는 데스크톱 1920×1080 화면을 굳혀 놓고 통째로 축소한다 (§FIT).
   그 배율을 여기서 계산해 `--fit` 으로 넘긴다.

   🔴 무대 높이를 상수로 박지 않는다. 힌트 한 줄, 개발용 줄 하나에도 높이가
      바뀌는데 상수로 두면 그때마다 아래가 잘리거나 뜬다. **매번 실측한다.**
      `--fit: 1` 로 되돌려 재고 곧바로 되돌리므로 화면에는 보이지 않는다
      (스타일 계산만 일어나고 페인트 사이에 끝난다).

   ⚠️ 안전영역은 CSS 에서만 읽을 수 있다(`env()`). §FIT 이 `--sa-t`/`--sa-b` 로
      노출해 둔 값을 여기서 받는다. 빼지 않으면 iOS 가로에서 홈 인디케이터
      21px 만큼 하단이 잘린다. */

/** 폰 가로 고정 무대 티어가 켜져 있는가 — CSS 의 §FIT 조건과 **한 글자도 다르면 안 된다** */
const FIT_QUERY = '(orientation: landscape) and (max-height: 560px)';

/** 무대가 데스크톱에서 차지하는 폭. §FIT 의 `#stage { width }` 와 같은 값이다. */
const STAGE_W = 1600;

const px = (style, name) => {
  const v = parseFloat(style.getPropertyValue(name));
  return Number.isFinite(v) ? v : 0;
};

/**
 * @param {object} o
 * @param {Window} o.win
 * @param {HTMLElement|null} o.stage
 * @param {HTMLElement} o.root
 * @returns {number|null} 적용한 배율. 티어가 꺼져 있으면 null.
 */
/**
 * 확대와 무관한 **레이아웃 뷰포트**를 돌려준다.
 *
 * 🔴 **`innerWidth` 를 그대로 쓰면 확대할수록 게임이 작아진다** (2026-09-06 대표님 제보).
 *    iOS Safari 는 핀치 확대 중 `innerWidth`/`innerHeight` 로 **보이는 영역**
 *    (visual viewport)을 돌려준다. 확대하면 이 값이 작아지므로
 *
 *      확대 → innerHeight 감소 → --fit 감소 → 무대 축소 → 화면에서 더 작아짐
 *        ↑                                                          │
 *        └──────────────────  또 확대  ←───────────────────────────┘
 *
 *    되먹임이 걸려 게임이 배경만 남기고 사라졌다 (실측 — 확대 후 릴이 오히려 31% 축소).
 *    배경은 `background-attachment: fixed` 라 확대 영향을 받지 않아 그것만 남는다.
 *
 *    `visualViewport.width × scale` 이 확대분을 되돌린 **레이아웃 뷰포트**다.
 *    이 값으로 재면 배율이 확대와 무관하게 고정되고, 사파리가 순수하게 화면만
 *    확대한다 — 즉 **확대하면 릴이 진짜로 커진다.**
 *
 * ⛔ 확대를 막지 않는다. 작은 글씨를 크게 보려는 것은 정당한 요구다.
 */
export function layoutViewport(win) {
  const vv = win && win.visualViewport;
  if (vv && Number.isFinite(vv.width) && Number.isFinite(vv.scale) && vv.scale > 0) {
    return { width: vv.width * vv.scale, height: vv.height * vv.scale };
  }
  return { width: win.innerWidth, height: win.innerHeight };
}

export function syncStageFit({ win, stage, root }) {
  if (!stage || !stage.style || typeof win.matchMedia !== 'function') return null;

  let on = false;
  try { on = win.matchMedia(FIT_QUERY).matches === true; } catch { on = false; }
  if (!on) {
    stage.style.removeProperty('--fit');
    return null;
  }

  const style = win.getComputedStyle ? win.getComputedStyle(root) : null;
  const insetY = style ? px(style, '--sa-t') + px(style, '--sa-b') : 0;

  // 자연 크기를 재려면 배율을 잠시 풀어야 한다. 폭은 고정이라 높이만 본다.
  stage.style.setProperty('--fit', '1');
  const natH = stage.offsetHeight;

  // 🔴 타이틀 화면에서는 무대가 `display: none` 이라 높이가 0 이다.
  //    그 0 으로 나누면 배율이 폭 항으로 떨어져 화면 두 배짜리 무대가 나온다
  //    (실측 --fit 0.5463 = 874/1600 — 높이를 아예 못 본 값이었다).
  //    아래 ResizeObserver 가 무대가 실제로 열릴 때 다시 부른다.
  if (!natH) {
    stage.style.removeProperty('--fit');
    return null;
  }

  const view = layoutViewport(win);
  const fit = Math.min(
    view.width / STAGE_W,
    Math.max(1, view.height - insetY) / natH,
  );
  const safe = Math.max(0.05, Math.min(1, fit));
  stage.style.setProperty('--fit', String(Math.round(safe * 10000) / 10000));
  return safe;
}

export function installLayoutScale({
  win = globalThis.window,
  doc = globalThis.document,
  root = globalThis.document?.documentElement,
  baseDevicePixelRatio = 1,
} = {}) {
  if (!root?.style?.setProperty || !root?.classList?.toggle) {
    return () => {};
  }

  const sync = () => {
    const layout = computeLayoutViewport({
      innerWidth: win.innerWidth,
      innerHeight: win.innerHeight,
      devicePixelRatio: win.devicePixelRatio,
      baseDevicePixelRatio,
      coarsePointer: hasCoarsePointer(win),
    });
    if (layout.coarsePointer) {
      // CSS 기본값(`100vw` / `100dvh`)으로 되돌린다 — dvh 가 사파리 바를 따라온다.
      root.style.removeProperty("--layout-vw");
      root.style.removeProperty("--layout-vh");
    } else {
      root.style.setProperty("--layout-vw", layout.width + "px");
      root.style.setProperty("--layout-vh", layout.height + "px");
    }
    root.style.setProperty("--browser-zoom", String(layout.zoom));
    root.classList.toggle("ui-zoomed", layout.zoom > 1.001);
    root.classList.toggle("is-touch", layout.coarsePointer);
    // 🔴 고정 무대 배율도 같은 박자로 다시 잰다 — 회전·사파리 바 숨김이 전부 resize 로 온다
    syncStageFit({ win, stage: doc && doc.getElementById ? doc.getElementById("stage") : null, root });
    return layout;
  };

  sync();
  win.addEventListener("resize", sync, { passive: true });
  // 🔴 회전은 resize 를 늦게 올리는 기기가 있다 — 방향 변화도 함께 듣는다.
  win.addEventListener("orientationchange", sync, { passive: true });

  /* 🔴 무대가 **열리는 순간**을 잡는다.
     타이틀을 누르기 전에는 `display: none` 이라 높이를 잴 수 없고, 그 뒤로는
     resize 가 오지 않으므로 배율이 영영 틀린 채로 남는다.
     ⛔ 무한 루프가 아니다 — `--fit` 은 transform 만 바꾸고 border-box 크기는
        건드리지 않으므로 이 관찰자를 다시 깨우지 않는다. */
  let ro = null;
  const stage = doc && doc.getElementById ? doc.getElementById("stage") : null;
  if (stage && typeof win.ResizeObserver === "function") {
    ro = new win.ResizeObserver(() => sync());
    ro.observe(stage);
  }

  return () => {
    win.removeEventListener("resize", sync);
    win.removeEventListener("orientationchange", sync);
    if (ro) ro.disconnect();
  };
}
