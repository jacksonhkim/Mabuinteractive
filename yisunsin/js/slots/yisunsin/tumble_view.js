import { winningCells } from './tumble.js';

export const HOLD_MS = 780;

export const BREAK_MS = 300;

export const DROP_MS = 340;

export const LINE_STEP_MS = 260;

export const FAST_SCALE = 0.4;

export const FAST_MIN_MS = 90;

export const SETTLE_MS = 620;

export const SHOW_FROM = 2;

export function planTumbleShow(chain, paylines, fast = false) {
  const scale = (v) => (fast ? Math.max(Math.round(v * FAST_SCALE), FAST_MIN_MS) : v);
  const segs = [];
  let total = 0;
  const push = (seg) => { segs.push({ ...seg, from: total }); total += seg.dur; };

  for (const st of chain.steps || []) {
    const cells = winningCells(st.wins, paylines);
    const dead = new Set(cells.map((c) => `${c.reel},${c.row}`));
    const of = { combo: st.combo, multiplier: st.multiplier, win: st.win };

    push({ ...of, phase: 'hold', dur: scale(HOLD_MS), grid: st.grid, dead, wins: st.wins });
    if (!st.after) continue;
    push({ ...of, phase: 'break', dur: scale(BREAK_MS), grid: st.grid, dead, wins: st.wins });
    push({ ...of, phase: 'drop', dur: scale(DROP_MS), grid: st.after, fall: st.fall });
  }

  if (chain.trigger) {
    push({
      combo: 0, multiplier: 1, win: 0, phase: 'settle', dur: scale(SETTLE_MS),
      grid: chain.grid, dead: chain.trigger.cells, kinds: chain.trigger.kinds,

      capped: Boolean(chain.capped),
    });
  }

  return { total, segs };
}

export function frameAt(show, elapsed) {
  if (!show || !show.segs.length) return null;
  const t = Math.max(elapsed, 0);
  if (t >= show.total) return null;
  for (const seg of show.segs) {
    if (t < seg.from + seg.dur) {
      return { ...seg, u: seg.dur > 0 ? (t - seg.from) / seg.dur : 1 };
    }
  }
  return null;
}

export function finalGrid(chain) {
  return chain && chain.steps && chain.steps.length ? chain.grid : null;
}

export function lineAt(frame, paylines) {

  if (!frame || frame.phase !== 'hold') return null;
  if (!frame.wins || !frame.wins.length) return null;
  const at = frame.u * frame.dur;
  const w = frame.wins[Math.floor(at / LINE_STEP_MS) % frame.wins.length];
  return { rows: paylines[w.line], count: w.count };
}

export function comboLabel(frame) {
  if (!frame || frame.combo < SHOW_FROM) return null;
  return { text: `×${frame.multiplier}`, combo: frame.combo, phase: frame.phase };
}
