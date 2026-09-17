const SPIN_BASE = 1.45;
const STAGGER = 0.40;
const MIN_TRAVEL = 14;
const CRUISE = 50;
const BOUNCE_CELLS = 0.3;
const MS_PER_SEC = 1000;

const ACC = 0.12;
const DEC = 0.32;
const CRUISE_PART = 1 - ACC - DEC;
const AREA = ACC / 2 + CRUISE_PART + DEC / 3;

function travelled(x, total) {
  const v = 1 / AREA;
  let p;
  if (x < ACC) {
    p = v * x * x / (2 * ACC);
  } else if (x < ACC + CRUISE_PART) {
    p = v * (ACC / 2 + (x - ACC));
  } else {
    const u = Math.min((x - ACC - CRUISE_PART) / DEC, 1);
    p = v * (ACC / 2 + CRUISE_PART + (DEC / 3) * (1 - (1 - u) ** 3));

    if (u > 0.6) {
      const w = Math.sin(((u - 0.6) / 0.4) * Math.PI);
      return p * total + BOUNCE_CELLS * w * w;
    }
  }
  return p * total;
}

export function createReels({ stripLens, onReelStop, onDone }) {
  const n = stripLens.length;
  const positions = stripLens.map(() => 0);
  const speeds = new Array(n).fill(0);

  let plans = [];
  let t0 = 0;
  let running = false;

  return {
    get positions() {
      return positions;
    },
    get speeds() {
      return speeds;
    },
    get busy() {
      return running;
    },

    set(targets) {
      targets.forEach((v, i) => {
        positions[i] = v;
        speeds[i] = 0;
      });
      plans = [];
      running = false;
    },

    start(targets, now, scale = 1) {
      t0 = now;
      running = true;
      const totals = targets.map((target, i) => {
        const len = stripLens[i];

        let d = ((positions[i] - target) % len + len) % len;
        while (d < MIN_TRAVEL) d += len;
        return d;
      });

      const extra = Math.max(0, Math.max(...totals) - MIN_TRAVEL) / CRUISE;

      plans = targets.map((target, i) => ({
        from: positions[i],
        target,
        total: totals[i],

        dur: (SPIN_BASE + i * STAGGER + extra) * scale,
        done: false,
      }));
    },

    update(now) {
      if (!running) return false;
      const t = (now - t0) / MS_PER_SEC;
      let alive = false;

      plans.forEach((p, i) => {
        if (t < p.dur) {
          const prev = positions[i];
          positions[i] = p.from - travelled(t / p.dur, p.total);
          speeds[i] = Math.abs(positions[i] - prev) * 60;
          alive = true;
          return;
        }

        positions[i] = p.from - p.total;
        speeds[i] = 0;
        if (!p.done) {
          p.done = true;
          if (onReelStop) onReelStop(i);
        }
      });

      if (!alive) {
        running = false;
        if (onDone) onDone();
      }
      return running;
    },
  };
}
