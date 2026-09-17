export function computeView(cssW, cssH, fieldW, fieldH) {

  const w = Math.max(1, cssW);
  const h = Math.max(1, cssH);
  const scale = Math.min(w / fieldW, h / fieldH);
  const ox = (w - fieldW * scale) / 2;
  const oy = (h - fieldH * scale) / 2;
  return {
    scale,
    ox,
    oy,

    overX: ox / scale,
    overY: oy / scale,
    cssW: w,
    cssH: h,
  };
}

export function toFieldPoint(view, rect, clientX, clientY) {
  const k = rect.width > 0 ? rect.width / view.cssW : 1;
  const x = (clientX - rect.left) / k;
  const y = (clientY - rect.top) / k;
  return { x: (x - view.ox) / view.scale, y: (y - view.oy) / view.scale };
}
