import {
  countFree, countScatter, countBonus,
  FREE_TRIGGER, SCATTER_TRIGGER, BONUS_TRIGGER,
} from './evaluator.js';
import { runTumble, pickFeature } from './tumble.js';
import { scanTriggers } from './tumble_trigger.js';

export function tumbleRound(p) {
  const chain = runTumble(p);

  const grids = p.chainTriggers === false ? [p.grid] : chain.steps.map((s) => s.grid);
  if (p.chainTriggers !== false && !chain.capped) grids.push(chain.grid);

  const most = (fn) => grids.reduce((a, g) => Math.max(a, fn(g)), 0);
  const of = (g) => ({ free: countFree(g), scatter: countScatter(g), bonus: countBonus(g) });
  const counts = { free: most(countFree), scatter: most(countScatter), bonus: most(countBonus) };
  const forced = chain.capped
    ? pickFeature(p.feature, typeof p.roll === 'function' ? p.roll() : p.roll) : null;

  const scanned = scanTriggers(chain.grid, of(p.grid), counts);
  const trigger = forced
    ? {
      kinds: [forced, ...(scanned ? scanned.kinds.filter((k) => k !== forced) : [])],
      cells: scanned ? scanned.cells : new Set(),
    }
    : scanned;

  return {
    ...chain, counts, trigger, forced,
  };
}

export function applyTumble(result, o) {
  const cfg = o.config.paytable;
  if (!cfg.tumble) return result;
  return mergeTumble(result, tumbleRound({
    grid: o.grid, positions: o.positions, strips: o.strips, rows: o.config.rows,
    paylines: cfg.paylines, paytable: cfg.paytable, lineBet: o.lineBet,
    ladder: cfg.tumble.ladder, cap: cfg.tumble.cap,
    feature: cfg.tumble.feature, roll: o.roll,
    chainTriggers: cfg.tumble.chainTriggers,
  }));
}

export function mergeTumble(result, round) {
  const on = (had, count, need) => had || count >= need;
  const forced = round.forced;
  return {
    ...result,
    spinWin: round.total,
    tumble: round,
    freespinTrigger: on(result.freespinTrigger, round.counts.free, FREE_TRIGGER)
      || forced === 'freespin',
    seaBattleTrigger: on(result.seaBattleTrigger, round.counts.scatter, SCATTER_TRIGGER)
      || forced === 'seabattle',
    legendaryTrigger: on(result.legendaryTrigger, round.counts.bonus, BONUS_TRIGGER)
      || forced === 'legendary',
  };
}
