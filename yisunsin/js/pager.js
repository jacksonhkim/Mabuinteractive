export const SWIPE_MIN_PX = 48;

export function step(cur, dir, total) {
  const last = Math.max(0, total - 1);
  const at = Number.isFinite(cur) ? cur : 0;
  return Math.min(last, Math.max(0, at + dir));
}

export function swipeDir(dx, dy) {
  if (Math.abs(dx) < SWIPE_MIN_PX) return 0;
  if (Math.abs(dy) >= Math.abs(dx)) return 0;
  return dx < 0 ? 1 : -1;
}
