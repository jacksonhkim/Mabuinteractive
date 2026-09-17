export const STEP_MS = 1000 / 60;

export const MAX_CATCH_UP = 5;

const MS_PER_SEC = 1000;

export function createFixedStep({ step = STEP_MS, maxCatchUp = MAX_CATCH_UP } = {}) {
  let acc = 0;
  let last = null;

  return {

    advance(now) {
      if (last === null) { last = now; return 0; }
      const dt = Math.max(0, now - last);
      last = now;
      acc += dt;

      let steps = Math.floor(acc / step);
      if (steps > maxCatchUp) {
        steps = maxCatchUp;
        acc = 0;
      } else {
        acc -= steps * step;
      }
      return steps;
    },

    reset(now = null) { acc = 0; last = now; },

    get pending() { return acc; },
  };
}

export function createCountdown(seconds) {
  const totalMs = seconds * MS_PER_SEC;
  let startedAt = null;
  let frozenMs = null;

  return {
    start(now) { startedAt = now; frozenMs = null; },

    remaining(now) {
      if (frozenMs !== null) return frozenMs;
      if (startedAt === null) return totalMs;
      return Math.max(0, totalMs - (now - startedAt));
    },

    done(now) { return this.remaining(now) <= 0; },

    penalize(seconds) {
      const ms = seconds * MS_PER_SEC;
      if (frozenMs !== null) { frozenMs = Math.max(0, frozenMs - ms); return; }
      if (startedAt === null) return;
      startedAt -= ms;
    },

    pause(now) { if (frozenMs === null) frozenMs = this.remaining(now); },

    resume(now) {
      if (frozenMs === null) return;
      startedAt = now - (totalMs - frozenMs);
      frozenMs = null;
    },

    get totalMs() { return totalMs; },
  };
}
