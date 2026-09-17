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

  const zoom = coarsePointer ? 1 : round(clamp(dpr / base, 0.5, 3));
  return {
    width: round(Math.max(1, innerWidth) * zoom),
    height: round(Math.max(1, innerHeight) * zoom),
    zoom,
    coarsePointer: Boolean(coarsePointer),
  };
}

export function hasCoarsePointer(win) {
  if (!win || typeof win.matchMedia !== 'function') return false;
  try {
    return win.matchMedia('(pointer: coarse)').matches === true;
  } catch {
    return false;
  }
}

const FIT_QUERY = '(orientation: landscape) and (max-height: 560px)';

const STAGE_W = 1600;

const px = (style, name) => {
  const v = parseFloat(style.getPropertyValue(name));
  return Number.isFinite(v) ? v : 0;
};

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

  stage.style.setProperty('--fit', '1');
  const natH = stage.offsetHeight;

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

      root.style.removeProperty("--layout-vw");
      root.style.removeProperty("--layout-vh");
    } else {
      root.style.setProperty("--layout-vw", layout.width + "px");
      root.style.setProperty("--layout-vh", layout.height + "px");
    }
    root.style.setProperty("--browser-zoom", String(layout.zoom));
    root.classList.toggle("ui-zoomed", layout.zoom > 1.001);
    root.classList.toggle("is-touch", layout.coarsePointer);

    syncStageFit({ win, stage: doc && doc.getElementById ? doc.getElementById("stage") : null, root });
    return layout;
  };

  sync();
  win.addEventListener("resize", sync, { passive: true });

  win.addEventListener("orientationchange", sync, { passive: true });

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
