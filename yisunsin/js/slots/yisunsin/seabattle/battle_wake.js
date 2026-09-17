const TAU = Math.PI * 2;

const MAX_WAKE = 264;

const GAP = 0.13;

const LIFE = 1.6;

const LITE = { max: 184, gap: 0.19 };

const BACK_K = 0.9;

const SIDE_K = 0.38;

const SIZE_K = 0.5;

const DRIFT_K = 0.45;

const ALPHA = 0.30;

const SPAN_K = 1.8;

const MIN_HALF = 4;

const FALLBACK_SPEED = 60;

const SPREAD = 1.7;

export function createWakeTrail({ lite = false } = {}) {
  const cap = lite ? LITE.max : MAX_WAKE;
  const gap = lite ? LITE.gap : GAP;

  const parts = Array.from({ length: cap }, () => ({
    alive: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, size: 1, dir: 0, half: MIN_HALF,
  }));

  let cool = 0;

  let side = 1;

  function mark(ship) {
    const p = parts.find((q) => !q.alive);
    if (!p) return;
    const back = ship.dir + Math.PI;
    const r = ship.radius;

    const sx = Math.cos(back + Math.PI / 2) * r * SIDE_K * side;
    const sy = Math.sin(back + Math.PI / 2) * r * SIDE_K * side;
    p.alive = true;
    p.t = 0;
    p.size = r * SIZE_K;

    p.dir = ship.dir;

    p.half = Math.max(MIN_HALF, (ship.speed || FALLBACK_SPEED) * gap * SPAN_K);
    p.x = ship.x + Math.cos(back) * r * BACK_K + sx;
    p.y = ship.y + Math.sin(back) * r * BACK_K + sy;
    p.vx = Math.cos(back) * r * DRIFT_K;
    p.vy = Math.sin(back) * r * DRIFT_K;
  }

  return {

    get liveCount() { return parts.reduce((n, p) => n + (p.alive ? 1 : 0), 0); },

    follow(list, boss, dt) {
      cool -= dt;
      if (cool > 0) return;
      cool = gap;
      side = -side;
      for (const e of list) { if (e.alive) mark(e); }
      if (boss && boss.alive) mark(boss);
    },

    step(dt) {
      for (const p of parts) {
        if (!p.alive) continue;
        p.t += dt;
        if (p.t >= LIFE) { p.alive = false; continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.vx *= 0.94;
        p.vy *= 0.94;
      }
    },

    draw(ctx) {
      ctx.save();
      for (const p of parts) {
        if (!p.alive) continue;
        const k = 1 - p.t / LIFE;
        ctx.fillStyle = `rgba(255, 255, 255, ${(ALPHA * k).toFixed(3)})`;
        ctx.beginPath();

        ctx.ellipse(p.x, p.y, p.half, p.size * (SPREAD - k), p.dir, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },

    clear() {
      for (const p of parts) p.alive = false;
      cool = 0;
      side = 1;
    },
  };
}
