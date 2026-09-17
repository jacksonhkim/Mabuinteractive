import { BANDS } from './battle_time.js';

export const FULL_TURN = 360;

export const SPIN_TURNS = 3;

export const EASE_SOFT = 2;

export const EASE_HARD = 6;

export const TAIL_MIX = 0.55;

const HALF = 0.5;

const TOTAL_WEIGHT = BANDS.reduce((a, b) => a + b.weight, 0);

export const SEGMENTS = (() => {
  let from = 0;
  return BANDS.map((band, i) => {
    const deg = (band.weight / TOTAL_WEIGHT) * FULL_TURN;
    const seg = { band: i + 1, min: band.min, max: band.max, from, to: from + deg, deg };
    from += deg;
    return seg;
  });
})();

export function planWheel(roll) {
  const seg = SEGMENTS[roll.band - 1];
  const span = seg.max - seg.min + 1;
  const pos = (roll.seconds - seg.min + HALF) / span;
  const mark = seg.from + pos * seg.deg;

  const settle = (FULL_TURN - (mark % FULL_TURN)) % FULL_TURN;
  return { mark, total: SPIN_TURNS * FULL_TURN + settle, band: roll.band };
}

export function angleAt(plan, u) {
  const t = Math.min(Math.max(u, 0), 1);
  const rest = 1 - t;
  const soft = 1 - rest ** EASE_SOFT;
  const hard = 1 - rest ** EASE_HARD;
  return plan.total * (TAIL_MIX * soft + (1 - TAIL_MIX) * hard);
}

export function ticksBetween(from, to) {
  if (!(to > from)) return 0;
  let n = 0;
  for (const seg of SEGMENTS) {
    const base = (FULL_TURN - (seg.from % FULL_TURN)) % FULL_TURN;
    n += Math.floor((to - base) / FULL_TURN) - Math.floor((from - base) / FULL_TURN);
  }
  return n;
}

export function ticksBetweenProgress(plan, from, to) {
  return ticksBetween(angleAt(plan, from), angleAt(plan, to));
}
