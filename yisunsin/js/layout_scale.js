/**
 * 브라우저 확대가 viewport 단위를 다시 줄여 버리는 현상을 보정한다.
 * 대표님 검수 환경은 Windows 표시 배율 100%이므로 기준 DPR은 1이다.
 */
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value) => Math.round(value * 1000) / 1000;

export function computeLayoutViewport({
  innerWidth,
  innerHeight,
  devicePixelRatio,
  baseDevicePixelRatio = 1,
}) {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
    ? devicePixelRatio
    : 1;
  const base = Number.isFinite(baseDevicePixelRatio) && baseDevicePixelRatio > 0
    ? baseDevicePixelRatio
    : 1;
  const zoom = round(clamp(dpr / base, 0.5, 3));
  return {
    width: round(Math.max(1, innerWidth) * zoom),
    height: round(Math.max(1, innerHeight) * zoom),
    zoom,
  };
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
    });
    root.style.setProperty("--layout-vw", layout.width + "px");
    root.style.setProperty("--layout-vh", layout.height + "px");
    root.style.setProperty("--browser-zoom", String(layout.zoom));
    root.classList.toggle("ui-zoomed", layout.zoom > 1.001);
    return layout;
  };

  sync();
  win.addEventListener("resize", sync, { passive: true });
  return () => win.removeEventListener("resize", sync);
}
