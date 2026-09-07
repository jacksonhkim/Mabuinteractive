/** WEB 좌표는 보존하고 모바일 표시 좌표만 넓힌다. */
export function resolveRenderLayout(base, mobile, cols, rows) {
  const cellHeight = base.cell;
  const cellWidth = mobile ? base.cell * 2.4 : base.cell;
  const pitch = cellHeight + base.cellGap;
  const width = cols * cellWidth + (cols - 1) * base.reelGap + base.padding * 2;
  const height = rows * cellHeight + (rows - 1) * base.cellGap;

  return {
    cellWidth,
    cellHeight,
    pitch,
    width,
    height,
    symbolSize: cellHeight * base.symbolScale,
  };
}

/** 주 입력 장치가 손가락인 기기만 모바일 릴 좌표를 사용한다. */
export function usesMobileReelLayout(win) {
  if (!win || typeof win.matchMedia !== 'function') return false;
  try {
    if (win.matchMedia('(pointer: coarse)').matches !== true) return false;
    const screen = win.screen;
    if (!screen) return true;
    const shortSide = Math.min(Number(screen.width), Number(screen.height));
    return !Number.isFinite(shortSide) || shortSide <= 560;
  } catch {
    return false;
  }
}
