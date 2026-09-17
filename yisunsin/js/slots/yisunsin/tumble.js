import { evaluateLines } from './evaluator.js';

export function winningCells(wins, paylines) {
  const seen = new Set();
  const cells = [];
  for (const w of wins) {
    const line = paylines[w.line];
    for (let reel = 0; reel < w.count; reel += 1) {
      const row = line[reel];
      const key = `${reel}:${row}`;
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push({ reel, row });
    }
  }
  return cells.sort((a, b) => (a.reel - b.reel) || (a.row - b.row));
}

export function dropAndRefill(grid, positions, strips, cells, rows) {
  const dead = grid.map(() => new Set());
  for (const c of cells) dead[c.reel].add(c.row);

  const nextPos = positions.slice();
  const fall = grid.map(() => new Array(rows).fill(0));
  const nextGrid = grid.map((col, i) => {
    const gone = dead[i];
    if (gone.size === 0) return col.slice();

    const src = [];
    const kept = col.filter((_, row) => {
      if (gone.has(row)) return false;
      src.push(row);
      return true;
    });
    const k = rows - kept.length;
    const strip = strips[i];
    const len = strip.length;
    nextPos[i] = ((positions[i] - k) % len + len) % len;

    for (let j = 0; j < k; j += 1) fall[i][j] = k;

    src.forEach((from, m) => { fall[i][k + m] = (k + m) - from; });

    const top = Array.from({ length: k }, (_, j) => strip[(nextPos[i] + j) % len]);
    return [...top, ...kept];
  });

  return { grid: nextGrid, positions: nextPos, fall };
}

export function comboMultiplier(ladder, combo) {
  if (!(combo >= 1)) return 1;
  return ladder[Math.min(combo, ladder.length) - 1];
}

export function runTumble(p) {
  const {
    grid, positions, strips, paylines, paytable, lineBet, rows, ladder, cap,
  } = p;

  const steps = [];
  let cur = grid;
  let pos = positions;
  let total = 0;

  for (;;) {
    const { total: raw, wins } = evaluateLines(cur, paylines, paytable, lineBet);
    if (raw <= 0) break;

    const combo = steps.length + 1;
    const multiplier = comboMultiplier(ladder, combo);
    const win = raw * multiplier;
    total += win;

    const last = combo >= cap;
    const cells = last ? [] : winningCells(wins, paylines);
    const next = last ? null : dropAndRefill(cur, pos, strips, cells, rows);

    steps.push({
      combo, multiplier, raw, win, wins, cells,
      grid: cur,
      after: next ? next.grid : null,
      fall: next ? next.fall : null,
    });

    if (last) break;
    cur = next.grid;
    pos = next.positions;
  }

  return {
    steps,
    total,
    combo: steps.length,
    capped: steps.length >= cap,
    grid: cur,
    positions: pos,
  };
}

export function pickFeature(weights, roll) {
  const keys = Object.keys(weights);
  const sum = keys.reduce((a, k) => a + weights[k], 0);
  let left = Math.min(Math.max(roll, 0), 1) * sum;
  for (const k of keys) {
    left -= weights[k];
    if (left < 0) return k;
  }

  return keys[keys.length - 1];
}
