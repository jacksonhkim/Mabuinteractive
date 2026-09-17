import { ENEMIES, DESPAWN_MARGIN } from './battle_enemy.js';

export const SPAWN_MARGIN = 80;

export const INTERVAL_MAX = 1.2;

export const INTERVAL_MIN = 0.45;

export const LATE_AT = 0.6;

export const LATE_WEIGHTS = [25, 32, 25, 18];

export function intervalAt(progress) {
  const t = progress < 0 ? 0 : (progress > 1 ? 1 : progress);

  return INTERVAL_MAX * (1 - t) + INTERVAL_MIN * t;
}

export function weightsAt(progress, out = new Array(ENEMIES.length)) {
  const span = 1 - LATE_AT;
  let t = (progress - LATE_AT) / span;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;

  for (let i = 0; i < ENEMIES.length; i += 1) {
    out[i] = ENEMIES[i].weight * (1 - t) + LATE_WEIGHTS[i] * t;
  }
  return out;
}

function pickGrade(rng, weights) {
  let total = 0;
  for (let i = 0; i < weights.length; i += 1) total += weights[i];
  let roll = rng.next() * total;
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i];
    if (roll < 0) return i;
  }

  return weights.length - 1;
}

export function edgePoint(rng, field, out) {
  out.x = rng.next() * field.w;
  out.y = -SPAWN_MARGIN;
  return out;
}

export function createSpawner({ rng, pool }) {
  if (!rng) throw new Error('createSpawner: rng 주입이 필요하다');
  if (!pool) throw new Error('createSpawner: 적 풀 주입이 필요하다');

  const weights = new Array(ENEMIES.length).fill(0);
  const point = { x: 0, y: 0 };

  let cool = 0;

  return {

    get cool() { return cool; },

    step(dt, progress, player, field) {
      cool -= dt;
      if (cool > 0) return 0;

      cool += intervalAt(progress);

      if (pool.liveCount >= pool.all.length) return 0;

      weightsAt(progress, weights);
      edgePoint(rng, field, point);
      return pool.spawn(pickGrade(rng, weights), point.x, point.y, player) ? 1 : 0;
    },

    reset() { cool = 0; },
  };
}

export const MARGIN_OK = SPAWN_MARGIN < DESPAWN_MARGIN;
