import { DESPAWN_MARGIN } from './battle_enemy.js';
import { SPAWN_MARGIN } from './battle_spawn.js';

export const BOSSES = [
  { code: 'b1_sojang', name: '소장함', energy: 25, mult: 2, radius: 44, weight: 40 },
  { code: 'b2_jungjang', name: '중장함', energy: 40, mult: 3, radius: 50, weight: 30 },
  { code: 'b3_daejang', name: '대장함', energy: 60, mult: 4, radius: 56, weight: 20 },
  { code: 'b4_chongdaejang', name: '총대장함', energy: 90, mult: 5, radius: 64, weight: 10 },
];

export const BASE_SCORE = 300;

export const PARTIAL_FACTOR = 0.5;

export const ENTER_AT = 0.5;

export const MIN_SEC = 46;

export const MAX_SEC = 120;

export const LATE_WEIGHTS = [15, 25, 30, 30];

export const PHASES = [
  { at: 0.60, speed: 30, turn: 0.6 },
  { at: 0.30, speed: 45, turn: 0.9 },
  { at: 0.00, speed: 100, turn: Infinity },
];

const TAU = Math.PI * 2;

function turnToward(from, to, maxStep) {
  const diff = ((to - from + Math.PI) % TAU + TAU) % TAU - Math.PI;
  if (Math.abs(diff) <= maxStep) return to;
  return from + Math.sign(diff) * maxStep;
}

export function bossWeightsAt(seconds, out = new Array(BOSSES.length)) {
  let t = (seconds - MIN_SEC) / (MAX_SEC - MIN_SEC);
  if (t < 0) t = 0;
  else if (t > 1) t = 1;

  for (let i = 0; i < BOSSES.length; i += 1) {
    out[i] = BOSSES[i].weight * (1 - t) + LATE_WEIGHTS[i] * t;
  }
  return out;
}

export function pickBossGrade(rng, seconds) {
  const w = bossWeightsAt(seconds);
  let total = 0;
  for (let i = 0; i < w.length; i += 1) total += w[i];
  let roll = rng.next() * total;
  for (let i = 0; i < w.length; i += 1) {
    roll -= w[i];
    if (roll < 0) return i;
  }
  return w.length - 1;
}

export const finalScore = (grade) => BASE_SCORE * BOSSES[grade].mult;

export function phaseOf(boss) {
  const ratio = boss.energy > 0 ? boss.hp / boss.energy : 0;
  for (let i = 0; i < PHASES.length; i += 1) if (ratio > PHASES[i].at) return i;
  return PHASES.length - 1;
}

export function partialScore(boss) {
  if (!boss || !boss.alive || boss.energy <= 0) return 0;
  const dealt = boss.energy - boss.hp;
  if (dealt <= 0) return 0;
  return Math.floor(finalScore(boss.grade) * (dealt / boss.energy) * PARTIAL_FACTOR);
}

export function createBossPool() {

  const boss = {
    alive: false,
    grade: 0,
    x: 0, y: 0, dir: 0,
    hp: 0, energy: 0,
    speed: 0, radius: 0, score: 0, turn: 0,
    contact: 'hit',
  };
  const list = [boss];

  return {
    get all() { return list; },
    get liveCount() { return boss.alive ? 1 : 0; },

    get boss() { return boss; },

    spawn(grade, x, y, target) {
      if (boss.alive || boss.energy > 0) return null;
      const spec = BOSSES[grade];
      if (!spec) return null;
      const dx = target.x - x;
      const dy = target.y - y;
      boss.alive = true;
      boss.grade = grade;
      boss.x = x;
      boss.y = y;
      boss.dir = (dx !== 0 || dy !== 0) ? Math.atan2(dy, dx) : -Math.PI / 2;
      boss.hp = spec.energy;
      boss.energy = spec.energy;
      boss.radius = spec.radius;
      boss.score = finalScore(grade);
      return boss;
    },

    damage(e, amount) {
      if (!e.alive) return 0;
      e.hp -= amount;
      if (e.hp > 0) return 0;
      e.hp = 0;
      e.alive = false;
      return e.score;
    },

    clear() {
      boss.alive = false;
      boss.energy = 0;
      boss.hp = 0;
    },
  };
}

export function stepBoss(boss, player, dt, field) {
  if (!boss.alive) return;
  const ph = PHASES[phaseOf(boss)];
  boss.speed = ph.speed;
  boss.turn = ph.turn;

  boss.dir = turnToward(boss.dir, Math.atan2(player.y - boss.y, player.x - boss.x), ph.turn * dt);
  boss.x += Math.cos(boss.dir) * boss.speed * dt;
  boss.y += Math.sin(boss.dir) * boss.speed * dt;

  const m = DESPAWN_MARGIN;
  boss.x = Math.min(field.w + m, Math.max(-m, boss.x));
  boss.y = Math.min(field.h + m, Math.max(-m, boss.y));
}

export function bossEntry(rng, field, radius, out) {
  out.x = rng.next() * field.w;
  out.y = -(SPAWN_MARGIN + radius);
  return out;
}
