const STEPS = [
  { id: 'glow', ms: 350 },
  { id: 'dim',  ms: 250 },
  { id: 'hold', ms: 300 },
  { id: 'hit',  ms: 200 },
  { id: 'wipe', ms: 400 },
];

const RETRIGGER_STEPS = [
  { id: 'glow', ms: 300 },
  { id: 'hit',  ms: 200 },
];

export const TOTAL_MS = 1500;
export const FAST_SCALE = 0.4;

export const FAST_MIN_MS = 600;

export const RETRIGGER_MS = 500;

export const TIER_SHRINK = 0.6;

function scaleTo(steps, target) {
  const src = steps.reduce((a, s) => a + s.ms, 0);
  const out = steps.map((s) => ({ id: s.id, ms: Math.round((s.ms * target) / src) }));
  out[out.length - 1].ms += target - out.reduce((a, s) => a + s.ms, 0);
  return out;
}

export function planFreeTrigger({ fast = false, retrigger = false } = {}) {
  if (retrigger) return { steps: RETRIGGER_STEPS.map((s) => ({ ...s })), total: RETRIGGER_MS };
  if (!fast) return { steps: STEPS.map((s) => ({ ...s })), total: TOTAL_MS };
  const target = Math.max(Math.round(TOTAL_MS * FAST_SCALE), FAST_MIN_MS);
  return { steps: scaleTo(STEPS, target), total: target };
}

export function planSpinEnd({
  tierMs = 0, hasTrigger = false, fast = false, retrigger = false,
} = {}) {
  const shrunk = hasTrigger ? Math.round(tierMs * TIER_SHRINK) : tierMs;
  const triggerMs = hasTrigger ? planFreeTrigger({ fast, retrigger }).total : 0;
  return { tierMs: shrunk, triggerStartsAt: shrunk, triggerMs, total: shrunk + triggerMs };
}

const PANEL_CLASSES = ['fx-dim', 'fx-wipe', 'shake-1'];

export function playFreeTrigger({
  $, sfx, timer = setTimeout, fast = false, retrigger = false, auto = false,
  showChoice = () => {},
} = {}) {
  const plan = planFreeTrigger({ fast, retrigger });
  let done = false;

  const safely = (fn) => { try { fn(); } catch {  } };

  const cleanup = () => {
    for (const c of PANEL_CLASSES) safely(() => $('.reel-panel').classList.remove(c));
    safely(() => $('#reels').classList.remove('fx-glow'));
  };

  const finish = () => {
    if (done) return;
    done = true;
    cleanup();
    showChoice();
  };

  const STEP = {
    glow: () => { $('#reels').classList.add('fx-glow'); },
    dim:  () => { $('.reel-panel').classList.add('fx-dim'); },
    hold: () => {},

    hit:  () => { sfx.play('trigger_free'); $('.reel-panel').classList.add('shake-1'); },
    wipe: () => { $('.reel-panel').classList.add('fx-wipe'); },
  };

  let at = 0;
  for (const s of plan.steps) {
    const run = STEP[s.id];
    timer(() => { if (!done) safely(run); }, at);
    at += s.ms;
  }
  timer(finish, at);

  return {
    total: plan.total,

    skip() { if (!auto) finish(); },

    cancel() { done = true; cleanup(); },
  };
}
