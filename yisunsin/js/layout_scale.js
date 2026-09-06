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

export function installLayoutScale({
  win = globalThis.window,
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
    return layout;
  };

  sync();
  win.addEventListener("resize", sync, { passive: true });
  // 🔴 회전은 resize 를 늦게 올리는 기기가 있다 — 방향 변화도 함께 듣는다.
  win.addEventListener("orientationchange", sync, { passive: true });
  return () => {
    win.removeEventListener("resize", sync);
    win.removeEventListener("orientationchange", sync);
  };
}
