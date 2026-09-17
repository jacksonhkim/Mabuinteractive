export const SCENES = ['brief', 'controls', 'wheel', 'reveal'];

export const BRIEF_MS = 1500;

export const CONTROLS_MS = 2500;

export const WHEEL_MS = 7000;

export const REVEAL_MS = 1400;

export const FAST_SCALE = 0.4;

export const FAST_MIN_MS = 400;

const BASE_MS = { brief: BRIEF_MS, controls: CONTROLS_MS, wheel: WHEEL_MS, reveal: REVEAL_MS };

export const WAIT = new Set(['brief', 'controls']);

export function holdElapsed(plan, elapsed, phase) {
  if (!WAIT.has(phase)) return elapsed;

  return Math.min(elapsed, startOf(plan, phase) + plan.ms[phase] - 1);
}

export function planIntro(fast = false) {
  const scale = (ms) => (fast ? Math.max(Math.round(ms * FAST_SCALE), FAST_MIN_MS) : ms);
  const map = {};
  let total = 0;
  for (const name of SCENES) {
    map[name] = scale(BASE_MS[name]);
    total += map[name];
  }
  return { ms: map, total };
}

export function startOf(plan, name) {
  let from = 0;
  for (const key of SCENES) {
    if (key === name) return from;
    from += plan.ms[key];
  }
  return plan.total;
}

export function sceneAt(plan, elapsed) {
  if (!(elapsed >= 0)) return { name: SCENES[0], elapsed: 0, duration: plan.ms[SCENES[0]], progress: 0 };
  let from = 0;
  for (const name of SCENES) {
    const duration = plan.ms[name];
    if (elapsed < from + duration) {
      const local = elapsed - from;
      return { name, elapsed: local, duration, progress: local / duration };
    }
    from += duration;
  }
  return null;
}

export function nextScene(name) {
  const i = SCENES.indexOf(name);
  if (i < 0 || i >= SCENES.length - 1) return null;
  return SCENES[i + 1];
}
