export const TURN_SEKIBUNE = 1.2;

export const ENEMIES = [
  {
    code: 'e1_kobaya',
    name: '고바야',
    energy: 1,
    score: 10,
    speed: 100,
    weight: 45,
    radius: 20,
    turn: 0,
    contact: 'hit',
  },
  {
    code: 'e2_sekibune',
    name: '세키부네',
    energy: 3,
    score: 30,
    speed: 63,
    weight: 32,
    radius: 26,
    turn: TURN_SEKIBUNE,
    contact: 'hit',
  },
  {
    code: 'e3_atakebune',
    name: '아타케부네',
    energy: 6,
    score: 80,
    speed: 40,
    weight: 15,
    radius: 34,
    turn: 0,
    contact: 'none',
  },
  {
    code: 'e4_fireship',
    name: '화선',
    energy: 2,
    score: 50,
    speed: 150,
    weight: 8,
    radius: 21,
    turn: Infinity,
    contact: 'suicide',
  },
];

export const DRAW_SCALE = 3.3;

export const MAX_ENEMIES = 20;

export const DESPAWN_MARGIN = 160;

const TAU = Math.PI * 2;

const SOUTH = Math.PI / 2;

function turnToward(from, to, maxStep) {

  const diff = ((to - from + Math.PI) % TAU + TAU) % TAU - Math.PI;
  if (Math.abs(diff) <= maxStep) return to;
  return from + Math.sign(diff) * maxStep;
}

export function createEnemyPool(max = MAX_ENEMIES) {

  const list = Array.from({ length: max }, () => ({
    alive: false,
    grade: 0,
    x: 0,
    y: 0,
    dir: 0,
    hp: 0,
    speed: 0,
    radius: 0,
    score: 0,
    turn: 0,
    fireCool: 0,
    contact: 'none',
  }));

  return {

    get all() { return list; },

    get liveCount() { return list.reduce((n, e) => n + (e.alive ? 1 : 0), 0); },

    spawn(grade, x, y, target) {
      const spec = ENEMIES[grade];
      if (!spec) return null;

      const e = list.find((s) => !s.alive);
      if (!e) return null;

      e.alive = true;
      e.grade = grade;
      e.x = x;
      e.y = y;

      if (spec.turn === 0) e.dir = SOUTH;
      else {
        const dx = target.x - x;
        const dy = target.y - y;

        e.dir = (dx !== 0 || dy !== 0) ? Math.atan2(dy, dx) : SOUTH;
      }
      e.hp = spec.energy;
      e.speed = spec.speed;
      e.radius = spec.radius;
      e.score = spec.score;
      e.turn = spec.turn;
      e.fireCool = 0;
      e.contact = spec.contact;
      return e;
    },

    damage(e, amount) {
      if (!e.alive) return 0;
      e.hp -= amount;
      if (e.hp > 0) return 0;
      e.alive = false;
      return e.score;
    },

    clear() {
      for (const e of list) e.alive = false;
    },
  };
}

export function stepEnemies(list, player, dt, field) {
  for (const e of list) {
    if (!e.alive) continue;

    if (e.turn > 0) {
      e.dir = turnToward(e.dir, Math.atan2(player.y - e.y, player.x - e.x), e.turn * dt);
    }

    e.x += Math.cos(e.dir) * e.speed * dt;
    e.y += Math.sin(e.dir) * e.speed * dt;

    if (e.x < -DESPAWN_MARGIN || e.x > field.w + DESPAWN_MARGIN
      || e.y < -DESPAWN_MARGIN || e.y > field.h + DESPAWN_MARGIN) e.alive = false;
  }
}
