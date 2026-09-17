import { evaluateSpin } from './evaluator.js';
import { applyTumble } from './tumble_round.js';
import { beginLegendary, suppressInFree, applySticky, stripsFor } from './legendary.js';
import { createFreespinState } from './freespin_state.js';
import { createDevForcer } from './_devtools.js';

export function createSlot(config, services) {
  const { wallet, sfx: rawSfx, jackpot } = services;
  if (!wallet) throw new Error('createSlot: wallet 주입이 필요하다');
  if (!rawSfx) throw new Error('createSlot: sfx 주입이 필요하다');
  if (!jackpot) throw new Error('createSlot: jackpot 주입이 필요하다');
  if (!config.paytable) throw new Error('createSlot: paytable 이 필요하다');
  if (!config.strips) throw new Error('createSlot: strips 가 필요하다');
  if (!services.rng) throw new Error('createSlot: rng 주입이 필요하다');

  const sfx = {
    play(id, opt) {
      try {
        return rawSfx.play(id, opt);
      } catch {
        return null;
      }
    },
  };

  const lines = config.paytable.lines;
  const steps = config.bet.steps;
  let betIndex = Math.max(0, steps.indexOf(config.bet.default));
  const listeners = new Set();

  const strips = config.strips.strips;
  const rng = services.rng;
  const devForce = createDevForcer({
    strips, rows: config.rows, rng, paylines: config.paytable.paylines,
  });

  const spinPositions = () => strips.map((strip) => rng.int(strip.length));

  const gridAt = (pos, from = strips) => from.map((strip, i) =>
    Array.from({ length: config.rows }, (_, r) => strip[(pos[i] + r) % strip.length]));

  let positions = spinPositions();
  let grid = gridAt(positions);
  let spinning = false;

  let result = null;
  let lastWin = 0;
  let lastJackpot = 0;

  const free = createFreespinState(config.paytable.freespin, { sfx });

  const evaluate = (g, bet, multiplier = 1) => evaluateSpin(g, {
    paylines: config.paytable.paylines,
    paytable: config.paytable.paytable,
    lineBet: bet / lines,
    totalBet: bet,
    multiplier,
  });

  const state = () => ({
    credit: wallet.balance,
    bet: steps[betIndex],
    lineBet: steps[betIndex] / lines,
    canSpin: wallet.canAfford(steps[betIndex]) && !spinning,
    spinning,
    grid,
    positions,
    win: lastWin,
    jackpot: { value: jackpot.value, won: lastJackpot },
    result,
    ...free.project(),
  });

  const emit = () => {
    const s = state();
    listeners.forEach((fn) => fn(s));
  };

  return {
    id: config.id,
    title: config.title,

    subscribe(fn) {
      listeners.add(fn);
      fn(state());
      return () => listeners.delete(fn);
    },

    get state() {
      return state();
    },

    get grid() {
      return grid;
    },

    get positions() {
      return positions;
    },

    changeBet(dir) {
      if (spinning) return false;
      const next = betIndex + (dir > 0 ? 1 : -1);
      if (next < 0 || next >= steps.length) return false;
      betIndex = next;
      sfx.play('bet_change', { variant: dir > 0 ? 1 : 0 });
      emit();
      return true;
    },

    spin() {
      if (spinning) return { ok: false, reason: 'busy' };
      if (free.awaiting) return { ok: false, reason: 'choice' };

      const inFree = free.active;
      const bet = free.betOr(steps[betIndex]);

      if (!inFree && !wallet.debit(bet)) {
        sfx.play('btn_click', { pitch: 0.7 });
        emit();
        return { ok: false, reason: 'insufficient' };
      }

      if (!inFree) jackpot.contribute(bet);

      spinning = true;
      lastWin = 0;
      lastJackpot = 0;
      positions = devForce.positions(spinPositions(), {
        nextPositions: spinPositions,
        evaluatePositions: (pos) => applyTumble(evaluate(gridAt(pos), bet), { config, grid: gridAt(pos), positions: pos, strips, lineBet: bet / lines, roll: 0 }),
        totalBet: bet,
      });
      grid = applySticky(free.raw, gridAt(positions, stripsFor(config.strips, free.raw)), rng);
      result = evaluate(grid, bet, free.multiplier);

      if (!inFree && !free.raw) {
        result = applyTumble(result, {
          config, grid, positions, strips, lineBet: bet / lines, roll: () => rng.next(),
        });
      }

      result = suppressInFree(result, free.raw);

      sfx.play('reel_start');
      emit();
      return { ok: true, bet, grid, positions, result, freespin: inFree };
    },

    chooseFreespin(id) {
      if (!free.choose(id, steps[betIndex])) return false;
      emit();
      return true;
    },

    settle() {
      if (!spinning) return false;
      spinning = false;

      lastJackpot = result && result.jackpotHit ? jackpot.claim() : 0;
      const paid = (result ? result.spinWin : 0) + lastJackpot;
      if (paid > 0) {
        wallet.credit(paid);
        lastWin = paid;
        free.addWin(paid);
      }

      if (free.active) {
        free.advance(result);
      } else if (result && result.freespinTrigger) {

        free.openChoice();
      } else if (result && result.legendaryTrigger) {

        free.begin(beginLegendary(config.paytable.legendary, steps[betIndex]));
      }

      emit();
      return true;
    },

    creditBattle(award) {
      if (!(award > 0)) return false;
      wallet.credit(award);

      lastWin += award;
      emit();
      return true;
    },

    get normalWinCheat() { return devForce.normalWin; },

    setNormalWinCheat(on) {
      return devForce.setNormalWin(on, free.busy);
    },

    forceNextSpin(kind) { return devForce.forceNext(kind); },

    destroy() {
      listeners.clear();
    },
  };
}
