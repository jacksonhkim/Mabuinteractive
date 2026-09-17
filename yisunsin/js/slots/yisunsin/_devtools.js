import { findNormalWinPositions } from './_normalwincheat.js';

const FREE = 's5_free';
const BONUS = 's3_bonus';
const SCATTER = 's2_scatter';
const GEO = 'h2_geobukseon';
const WILD = 's1_wild';
const JACKPOT_REELS = 4;

function positionsShowing(strip, rows, code) {
  const out = [];
  for (let p = 0; p < strip.length; p += 1) {
    for (let r = 0; r < rows; r += 1) {
      if (strip[(p + r) % strip.length] === code) {
        out.push(p);
        break;
      }
    }
  }
  return out;
}

function forcedPositions(strips, rows, rng, kind, base, paylines) {
  const pos = [...base];

  if (kind === 'jackpot') {
    const line = (paylines && paylines[0]) || [0, 0, 0, 0, 0];
    for (let i = 0; i < JACKPOT_REELS; i += 1) {

      for (const code of (i === 0 ? [GEO] : [GEO, WILD])) {
        const cands = [];
        for (let p = 0; p < strips[i].length; p += 1) {
          if (strips[i][(p + line[i]) % strips[i].length] === code) cands.push(p);
        }
        if (cands.length) {
          pos[i] = cands[rng.int(cands.length)];
          break;
        }
      }
    }
    return pos;
  }

  const code = kind === 'bonus' ? BONUS
    : kind === 'seabattle' ? SCATTER
      : FREE;
  for (let i = 0; i < 3; i += 1) {
    const cands = positionsShowing(strips[i], rows, code);
    if (cands.length) pos[i] = cands[rng.int(cands.length)];
  }
  return pos;
}

const COMBO_TRIES = 300000;

function findComboPositions(nextPositions, evaluatePositions) {
  if (!evaluatePositions) return null;
  for (let i = 0; i < COMBO_TRIES; i += 1) {
    const pos = nextPositions();
    const r = evaluatePositions(pos);
    if (r && r.tumble && r.tumble.capped) return pos;
  }
  return null;
}

export function createDevForcer({
  strips, rows, rng, paylines,
}) {
  let next = null;
  let normalWin = false;

  return {
    get normalWin() { return normalWin; },
    setNormalWin(on, blocked = false) {
      if (on && blocked) return false;
      normalWin = Boolean(on);
      return true;
    },
    forceNext(kind) {
      normalWin = false;
      next = kind;
      return true;
    },
    positions(base, {
      nextPositions, evaluatePositions, totalBet,
    }) {
      let chosen = base;
      if (next === 'combo') chosen = findComboPositions(nextPositions, evaluatePositions) || base;
      else if (next) chosen = forcedPositions(strips, rows, rng, next, base, paylines);
      else if (normalWin) {

        try {
          chosen = findNormalWinPositions(nextPositions, evaluatePositions, totalBet);
        } catch {
          normalWin = false;
        }
      }
      next = null;
      return chosen;
    },
  };
}
