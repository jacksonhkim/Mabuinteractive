export const FIRE_INTERVAL = 0.18;

export const SHOT_SPEED = 480;
export const SHOT_DAMAGE = 1;

export const SHOT_RADIUS = 8;

export const DRAW_SIZE = 16;

export const SPRITE_BALL_RATIO = 96 / 512;
export const SPRITE_BALL_CY = 169 / 512;

export const SPRITE_SPAN = (ball) => ball / SPRITE_BALL_RATIO;

export const MAX_SHOTS = 96;

export const VOLLEY_WAVES = [
  { count: 13, offset: 0, speed: 1.00 },
  { count: 12, offset: 0.5, speed: 0.78 },
  { count: 13, offset: 0, speed: 0.58 },
];

export const VOLLEY_COUNT = VOLLEY_WAVES.reduce((n, w) => n + w.count, 0);

const VOLLEY_SLICES = 12;

const VOLLEY_JITTER = 0.07;
const jitterAt = (i) => 1 + VOLLEY_JITTER * Math.sin((i + 1) * 2.399);

export const VOLLEY_DAMAGE = 3;

export const VOLLEY_SPEED = 620;

export const VOLLEY_DRAW = 26;

export const VOLLEY_RADIUS = 13;

const MUZZLE = 26;

export function createShotPool(max = MAX_SHOTS) {

  const shots = Array.from({ length: max }, () => ({
    alive: false, x: 0, y: 0, vx: 0, vy: 0, big: false,
  }));

  let cool = 0;

  return {

    get all() { return shots; },

    get liveCount() { return shots.reduce((n, s) => n + (s.alive ? 1 : 0), 0); },

    get ready() { return cool <= 0; },

    step(firing, p, dt) {
      if (cool > 0) cool -= dt;
      if (!firing || cool > 0) return 0;

      const slot = shots.find((s) => !s.alive);
      if (!slot) return 0;

      const cos = Math.cos(p.aim);
      const sin = Math.sin(p.aim);
      slot.alive = true;
      slot.big = false;
      slot.x = p.x + cos * MUZZLE;
      slot.y = p.y + sin * MUZZLE;
      slot.vx = cos * SHOT_SPEED;
      slot.vy = sin * SHOT_SPEED;
      cool = FIRE_INTERVAL;
      return 1;
    },

    volley(p) {
      let fired = 0;
      for (const wave of VOLLEY_WAVES) {
        for (let i = 0; i < wave.count; i += 1) {
          const slot = shots.find((s) => !s.alive);
          if (!slot) return fired;

          const a = -Math.PI + (Math.PI * (i + wave.offset)) / VOLLEY_SLICES;
          const speed = VOLLEY_SPEED * wave.speed * jitterAt(fired);
          const cos = Math.cos(a);
          const sin = Math.sin(a);
          slot.alive = true;
          slot.big = true;
          slot.x = p.x + cos * MUZZLE;
          slot.y = p.y + sin * MUZZLE;
          slot.vx = cos * speed;
          slot.vy = sin * speed;
          fired += 1;
        }
      }
      return fired;
    },

    advance(dt, field) {
      for (const s of shots) {
        if (!s.alive) continue;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const r = s.big ? VOLLEY_RADIUS : SHOT_RADIUS;
        if (s.x < -r || s.x > field.w + r
          || s.y < -r || s.y > field.h + r) s.alive = false;
      }
    },

    kill(shot) { shot.alive = false; },

    clear() {
      for (const s of shots) s.alive = false;
      cool = 0;
    },
  };
}
