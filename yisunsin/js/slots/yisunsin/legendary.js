import { WILD } from './evaluator.js';

export function beginLegendary(cfg, bet) {
  return {
    option: { ...cfg },
    left: cfg.spins,
    retriggers: 0,
    won: 0,
    bet,

    stuck: cfg.sticky ? [[], [], [], [], []] : null,
  };
}

export function planFill(round, rng) {
  const plan = round && round.option && round.option.fillPlan;
  if (!plan) return 0;

  const spun = (round.option.spins || 0) - round.left;
  if (spun < (plan.openingSpins || 0)) return plan.opening || 1;

  const w = plan.weights || [1];
  let t = rng.int(w.reduce((a, b) => a + b, 0));
  let k = 0;
  while (k < w.length - 1 && t >= w[k]) { t -= w[k]; k += 1; }
  return k + 1;
}

export function applySticky(round, grid, rng) {
  if (!round || !round.stuck || !grid) return grid;

  const reels = grid.length;
  const rows = grid[0] ? grid[0].length : 0;
  const out = grid.map((reel) => reel.slice());

  if (rng) {
    let n = planFill(round, rng);
    for (let c = 0; c < reels && n > 0; c++) {
      for (let r = 0; r < rows && n > 0; r++) {
        if (!round.stuck[c].includes(r)) { round.stuck[c].push(r); n -= 1; }
      }
    }
  }

  for (let c = 0; c < reels; c++) {
    for (const r of round.stuck[c] || []) out[c][r] = WILD;
  }
  return out;
}

export function suppressInFree(result, round) {
  if (!result || !round) return result;
  const out = { ...result, legendaryTrigger: false, seaBattleTrigger: false };
  if (round.stuck) {
    out.jackpotHit = false;
    out.jackpotLines = [];
  }
  return out;
}

export function stripsFor(all, round) {
  const name = round && round.option && round.option.strips;
  return (name && all[name]) || all.strips;
}

export function syncRound(renderer, slot, all, seen = null, positions = null) {
  const f = slot.state.freespin;
  if (!f || !f.stuck) {
    renderer.setRound(null, null);
    renderer.setPending(null, null);
    return null;
  }
  const cells = new Set();
  for (let c = 0; c < f.stuck.length; c += 1) {
    for (const r of f.stuck[c]) cells.add([c, r].join(','));
  }
  const fresh = new Set();
  for (const key of cells) if (!seen || !seen.has(key)) fresh.add(key);
  const reels = all.legendaryStrips || all.strips;

  if (positions) {

    renderer.setRound(reels, seen || new Set());
    renderer.setPending(fresh, positions);
  } else {

    renderer.setRound(reels, cells, fresh);
    renderer.setPending(null, null);
  }
  return cells;
}
