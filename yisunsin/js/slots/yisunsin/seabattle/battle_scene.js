import { rollBattleTime } from './battle_time.js';
import { createFixedStep, createCountdown, STEP_MS } from './battle_loop.js';
import { createPlayer } from './battle_player.js';
import { createShotPool } from './battle_shots.js';
import { createEnemyPool } from './battle_enemy.js';
import { createSpawner } from './battle_spawn.js';
import { createBossPool, partialScore } from './battle_boss.js';
import { convertScore } from './battle_payout.js';
import { runSteps } from './battle_tick.js';
import { resultMs } from './battle_result.js';
import { SCENES, planIntro, sceneAt, startOf, nextScene, holdElapsed } from './battle_intro.js';
import { planWheel } from './battle_wheel.js';

export const OUTRO_MS = 500;

export const FIELD_W = 960;
export const FIELD_H = 540;
const FIELD = { w: FIELD_W, h: FIELD_H };

const DT = STEP_MS / 1000;

const IDLE_INPUT = {
  firing: false, blast: false, aimX: FIELD_W / 2, aimY: FIELD_H / 2 - 1,
};

const INTRO = new Set(SCENES);

export function createBattleScene({ rng, totalBet, payout, fx = null, fast = false }) {
  if (!rng) throw new Error('createBattleScene: rng 주입이 필요하다');

  if (!payout) throw new Error('createBattleScene: payout(환산계수·캡) 주입이 필요하다');

  const roll = rollBattleTime(rng);
  const clock = createCountdown(roll.seconds);
  const stepper = createFixedStep();

  const wheel = planWheel(roll);
  const intro = planIntro(fast);
  let introAt = 0;
  let introFrozen = null;

  let phase = 'idle';
  let outroAt = 0;
  let resultAt = 0;
  let ticks = 0;

  const player = createPlayer(FIELD_W, FIELD_H);
  const shots = createShotPool();
  const enemies = createEnemyPool();

  const spawner = createSpawner({ rng, pool: enemies });

  const bosses = roll.hasBoss ? createBossPool() : null;
  const entry = { x: 0, y: 0 };

  let input = IDLE_INPUT;

  const world = {
    rng, clock, player, shots, enemies, spawner, bosses, entry, fx,
    field: FIELD, dt: DT, seconds: roll.seconds, score: 0,
  };

  function beginBattle(now) {
    phase = 'battle';
    clock.start(now);
    stepper.reset(now);
  }

  return {

    get plan() { return { ...roll, totalBet }; },

    get wheel() { return wheel; },

    get introMs() { return intro.total; },
    get phase() { return phase; },
    get ticks() { return ticks; },
    get player() { return player; },
    get shots() { return shots.all; },

    get enemies() { return enemies.all; },

    get score() { return world.score + (bosses ? partialScore(bosses.boss) : 0); },

    get boss() { return bosses && bosses.boss.energy > 0 ? bosses.boss : null; },
    get field() { return FIELD; },

    get fx() { return fx; },

    get fast() { return fast; },

    resultElapsed(now) { return phase === 'result' ? now - resultAt : 0; },

    setInput(next) { input = next || IDLE_INPUT; },

    remainingMs(now) { return clock.remaining(now); },

    introView(now) {

      return INTRO.has(phase) ? sceneAt(intro, holdElapsed(intro, now - introAt, phase)) : null;
    },

    start(now) {
      if (phase !== 'idle') return false;
      phase = SCENES[0];
      introAt = now;
      return true;
    },

    skip(now) {

      if (phase === 'result') { phase = 'done'; return true; }
      if (!INTRO.has(phase)) return false;
      const next = nextScene(phase);
      if (!next) { beginBattle(now); return true; }
      introAt = now - startOf(intro, next);
      phase = next;
      return true;
    },

    pause(now) {
      if (phase === 'battle') clock.pause(now);
      else if (INTRO.has(phase) && introFrozen === null) introFrozen = now - introAt;
    },

    resume(now) {
      if (INTRO.has(phase)) {
        if (introFrozen !== null) { introAt = now - introFrozen; introFrozen = null; }
        return;
      }
      if (phase !== 'battle') return;
      clock.resume(now);
      stepper.reset(now);
    },

    tick(now) {
      if (INTRO.has(phase)) {
        const at = sceneAt(intro, holdElapsed(intro, now - introAt, phase));

        if (!at) { beginBattle(now); return 0; }
        phase = at.name;
        return 0;
      }
      if (phase === 'battle') {
        const steps = stepper.advance(now);
        ticks += steps;

        const progress = 1 - clock.remaining(now) / clock.totalMs;

        runSteps(world, input, steps, progress);

        if (clock.done(now)) {
          phase = 'outro';
          outroAt = now;
          shots.clear();
          enemies.clear();
          spawner.reset();

        }
        return steps;
      }

      if (phase === 'outro' && now - outroAt >= OUTRO_MS) {
        phase = 'result';
        resultAt = now;
        if (fx) fx.clear();
      } else if (phase === 'result' && now - resultAt >= resultMs(fast)) phase = 'done';
      return 0;
    },

    result() {
      const score = world.score + (bosses ? partialScore(bosses.boss) : 0);
      const { award, mult, capped } = convertScore(score, totalBet, payout);
      return {
        award,

        mult,
        capped,
        score,
        bossGrade: bosses && bosses.boss.energy > 0 ? bosses.boss.grade : null,
        bossSunk: Boolean(bosses && bosses.boss.energy > 0 && !bosses.boss.alive),

        sunk: fx ? fx.sunk : null,
        seconds: roll.seconds,
        band: roll.band,
        hasBoss: roll.hasBoss,
        totalBet,
      };
    },
  };
}
