import {
  SCATTER, BONUS, FREE, FREE_TRIGGER, SCATTER_TRIGGER, BONUS_TRIGGER,
} from './evaluator.js';

export const TRIGGERS = [
  { kind: 'freespin', code: FREE, need: FREE_TRIGGER, of: 'free' },
  { kind: 'seabattle', code: SCATTER, need: SCATTER_TRIGGER, of: 'scatter' },
  { kind: 'legendary', code: BONUS, need: BONUS_TRIGGER, of: 'bonus' },
];

export function cellsOf(grid, code) {
  const out = [];
  for (let c = 0; c < grid.length; c += 1) {
    for (let r = 0; r < grid[c].length; r += 1) {
      if (grid[c][r] === code) out.push(`${c},${r}`);
    }
  }
  return out;
}

export function scanTriggers(grid, first, counts) {
  const kinds = [];
  const cells = new Set();
  for (const t of TRIGGERS) {
    if (counts[t.of] < t.need) continue;
    if (first[t.of] >= t.need) continue;
    kinds.push(t.kind);
    for (const key of cellsOf(grid, t.code)) cells.add(key);
  }
  return kinds.length ? { kinds, cells } : null;
}
