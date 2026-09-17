import { createWakeTrail } from './battle_wake.js';

const MAX_PARTICLES = 90;

const MAX_POPUPS = 14;

const SPARK_N = 5;

const BOOM_N = 14;

const HIT_SFX_GAP = 0.09;

const TAU = Math.PI * 2;

const LITE = { parts: 54, spark: 3, boom: 9 };

export function createBattleFx({ rng, sfx = null, lite = false }) {
  if (!rng) throw new Error('createBattleFx: rngFx 주입이 필요하다 (§11-11)');

  const capParts = lite ? LITE.parts : MAX_PARTICLES;
  const sparkN = lite ? LITE.spark : SPARK_N;
  const boomN = lite ? LITE.boom : BOOM_N;

  const parts = Array.from({ length: capParts }, () => ({
    alive: false, kind: 0, x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 1, size: 1,
  }));
  const pops = Array.from({ length: MAX_POPUPS }, () => ({
    alive: false, x: 0, y: 0, t: 0, life: 1, text: '', big: false,
  }));

  const trail = createWakeTrail({ lite });

  let hitSfxCool = 0;

  const sunk = [0, 0, 0, 0];

  const play = (id, opt) => { if (sfx) sfx.play(id, opt); };

  function spawn(kind, x, y, vx, vy, life, size) {
    const p = parts.find((q) => !q.alive);
    if (!p) return;
    p.alive = true;
    p.kind = kind;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.t = 0; p.life = life; p.size = size;
  }

  function burst(kind, x, y, n, speed, life, size) {
    for (let i = 0; i < n; i += 1) {
      const a = rng.next() * TAU;
      const v = speed * (0.45 + rng.next() * 0.55);
      spawn(kind, x, y, Math.cos(a) * v, Math.sin(a) * v, life * (0.7 + rng.next() * 0.6), size);
    }
  }

  return {

    get sunk() { return sunk; },

    fire(x, y, aim) {
      play('cannon_fire');
      spawn(0, x + Math.cos(aim) * 26, y + Math.sin(aim) * 26,
        Math.cos(aim) * 40, Math.sin(aim) * 40, 0.13, 13);
    },

    hit(x, y) {
      burst(1, x, y, sparkN, 150, 0.22, 4);
      if (hitSfxCool <= 0) { play('hit_spark'); hitSfxCool = HIT_SFX_GAP; }
    },

    sink(x, y, score, big = false, grade = -1) {
      if (grade >= 0 && grade < sunk.length && !big) sunk[grade] += 1;
      burst(2, x, y, big ? boomN * 2 : boomN, big ? 190 : 130, big ? 0.6 : 0.42, big ? 13 : 9);
      play('explosion');
      if (score > 0) {
        const p = pops.find((q) => !q.alive);
        if (p) {
          p.alive = true; p.x = x; p.y = y; p.t = 0;
          p.life = big ? 1.5 : 1.0;
          p.text = `+${score.toLocaleString()}`;
          p.big = big;
        }
      }
    },

    ram(x, y) {
      burst(1, x, y, 9, 220, 0.3, 6);
      play('ram_impact');
    },

    blast(x, y, cleared) {
      burst(2, x, y, boomN * 2, 340, 0.5, 12);
      if (cleared > 0) burst(1, x, y, sparkN, 260, 0.32, 5);
      play('ram_impact');
    },

    playerHit(x, y) {
      burst(3, x, y, 12, 170, 0.45, 8);
      play('player_hit');
    },

    bossAppear() { play('boss_appear'); },

    timeWarning() { play('time_warning'); },

    wake(list, boss, dt) { trail.follow(list, boss, dt); },

    get wakeCount() { return trail.liveCount; },

    step(dt) {
      trail.step(dt);
      if (hitSfxCool > 0) hitSfxCool -= dt;
      for (const p of parts) {
        if (!p.alive) continue;
        p.t += dt;
        if (p.t >= p.life) { p.alive = false; continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.93;
        p.vy *= 0.93;
      }
      for (const p of pops) {
        if (!p.alive) continue;
        p.t += dt;
        if (p.t >= p.life) p.alive = false;
        else p.y -= 34 * dt;
      }
    },

    drawUnder(ctx) {
      trail.draw(ctx);
      ctx.save();
      for (const p of parts) {
        if (!p.alive || p.kind !== 0) continue;
        const k = 1 - p.t / p.life;
        ctx.fillStyle = `rgba(255, 232, 170, ${(0.85 * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * k, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    },

    drawOver(ctx) {
      ctx.save();
      for (const p of parts) {

        if (!p.alive || p.kind === 0) continue;
        const k = 1 - p.t / p.life;
        if (p.kind === 1) ctx.fillStyle = `rgba(255, 244, 200, ${k.toFixed(3)})`;
        else if (p.kind === 2) {
          ctx.fillStyle = k > 0.6
            ? `rgba(255, 236, 170, ${k.toFixed(3)})`
            : `rgba(226, 96, 40, ${k.toFixed(3)})`;
        } else ctx.fillStyle = `rgba(255, 110, 90, ${k.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * k, 0, TAU);
        ctx.fill();
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const p of pops) {
        if (!p.alive) continue;
        const k = 1 - p.t / p.life;
        const size = p.big ? 30 : 20;
        ctx.font = `700 ${size}px system-ui, sans-serif`;
        ctx.lineWidth = 4;
        ctx.strokeStyle = `rgba(4, 14, 20, ${(0.8 * k).toFixed(3)})`;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillStyle = p.big
          ? `rgba(255, 214, 110, ${k.toFixed(3)})`
          : `rgba(255, 243, 208, ${k.toFixed(3)})`;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    },

    clear() {
      for (const p of parts) p.alive = false;
      for (const p of pops) p.alive = false;
      trail.clear();
      hitSfxCool = 0;

    },

    reset() {
      for (let i = 0; i < sunk.length; i += 1) sunk[i] = 0;
    },
  };
}
