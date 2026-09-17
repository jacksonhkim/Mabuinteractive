export const WILD = "s1_wild";
export const SCATTER = "s2_scatter";
export const BONUS = "s3_bonus";

export const FREE = "s5_free";

const SPECIAL = new Set([WILD, SCATTER, BONUS, FREE]);

export const MIN_RUN = 3;

export const FREE_TRIGGER = 3;

export const BONUS_TRIGGER = 3;

export const SCATTER_TRIGGER = 3;

export const JACKPOT = "h2_geobukseon";
export const JACKPOT_RUN = 4;

function readLine(grid, line) {
  const out = new Array(line.length);
  for (let reel = 0; reel < line.length; reel++) {
    out[reel] = grid[reel][line[reel]];
  }
  return out;
}

export function scanLines(grid, paylines) {
  const hits = [];

  for (let li = 0; li < paylines.length; li++) {
    const syms = readLine(grid, paylines[li]);

    let base = null;
    for (const s of syms) {
      if (!SPECIAL.has(s)) { base = s; break; }
    }
    if (base === null) continue;

    if (syms[0] !== WILD && syms[0] !== base) continue;

    let n = 0;
    for (const s of syms) {
      if (s === base || s === WILD) n++;
      else break;
    }

    if (n < MIN_RUN) continue;
    hits.push({ line: li, symbol: base, count: n });
  }

  return hits;
}

export function evaluateLines(grid, paylines, paytable, lineBet) {
  const wins = [];
  let total = 0;

  for (const h of scanLines(grid, paylines)) {
    const pay = (paytable[h.symbol]?.[h.count] ?? 0) * lineBet;
    if (pay <= 0) continue;
    wins.push({ ...h, pay });
    total += pay;
  }

  return { total, wins };
}

export function countScatter(grid) {
  return countOf(grid, SCATTER);
}

export function countFree(grid) {
  return countOf(grid, FREE);
}

function countOf(grid, code) {
  let n = 0;
  for (const reel of grid) {
    for (const s of reel) {
      if (s === code) n++;
    }
  }
  return n;
}

export function countBonus(grid) {
  return countOf(grid, BONUS);
}

export function detectJackpot(grid, paylines) {
  const lines = [];
  let maxRun = 0;

  for (let li = 0; li < paylines.length; li++) {
    const syms = readLine(grid, paylines[li]);
    let n = 0;
    for (const s of syms) {
      if (s === JACKPOT || s === WILD) n++;
      else break;
    }
    if (n > maxRun) maxRun = n;
    if (n >= JACKPOT_RUN) lines.push(li);
  }

  return { hit: lines.length > 0, lines, maxRun };
}

export function evaluateSpin(grid, cfg) {
  const {
    paylines, paytable, lineBet, multiplier = 1,
  } = cfg;

  const line = evaluateLines(grid, paylines, paytable, lineBet);
  const scatterCount = countScatter(grid);
  const freeCount = countFree(grid);
  const bonusCount = countBonus(grid);
  const jack = detectJackpot(grid, paylines);

  const lineWin = line.total * multiplier;

  return {
    lineWin,

    spinWin: lineWin,
    scatterCount,
    freeCount,
    bonusCount,

    freespinTrigger: freeCount >= FREE_TRIGGER,
    seaBattleTrigger: scatterCount >= SCATTER_TRIGGER,
    legendaryTrigger: bonusCount >= BONUS_TRIGGER,
    jackpotHit: jack.hit,
    jackpotLines: jack.lines,

    jackpotRun: jack.maxRun,
    wins: line.wins,
  };
}
