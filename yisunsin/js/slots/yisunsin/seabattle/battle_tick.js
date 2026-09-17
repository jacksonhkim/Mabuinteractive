import { stepPlayer } from './battle_player.js';
import { SHOT_RADIUS } from './battle_shots.js';
import { stepEnemies } from './battle_enemy.js';
import { stepBoss, pickBossGrade, bossEntry, ENTER_AT, BOSSES } from './battle_boss.js';
import { tryBlast, stepBlast, chargeEnergy } from './battle_blast.js';
import {
  resolveShots, resolveBlast, resolveContact, resolveBreach,
} from './battle_hit.js';

export function runSteps(w, input, steps, progress) {
  const { player, shots, enemies, spawner, bosses, entry, field, dt, fx } = w;

  for (let i = 0; i < steps; i += 1) {

    const blasted = tryBlast(player, i === 0 && input.blast);

    stepPlayer(player, input, dt);
    stepBlast(player, dt);

    chargeEnergy(player, dt);

    if (shots.step(input.firing, player, dt) > 0 && fx) fx.fire(player.x, player.y, player.aim);
    shots.advance(dt, field);

    spawner.step(dt, progress, player, field);
    stepEnemies(enemies.all, player, dt, field);

    if (bosses && progress >= ENTER_AT && bosses.boss.energy === 0) {
      const grade = pickBossGrade(w.rng, w.seconds);
      bossEntry(w.rng, field, BOSSES[grade].radius, entry);
      bosses.spawn(grade, entry.x, entry.y, player);
      if (fx) fx.bossAppear();
    }

    if (bosses) stepBoss(bosses.boss, player, dt, field);

    if (fx) fx.wake(enemies.all, bosses ? bosses.boss : null, dt);

    w.score += resolveShots(shots, enemies, SHOT_RADIUS, fx);
    if (bosses && bosses.boss.alive) {

      w.score += resolveShots(shots, bosses, SHOT_RADIUS, fx, true);
    }

    if (blasted) {
      w.score += resolveBlast(player, enemies, fx);
      if (bosses && bosses.boss.alive) w.score += resolveBlast(player, bosses, fx, true);

      const fired = shots.volley(player);
      if (fx) fx.blast(player.x, player.y, fired);
    }

    let lost = resolveContact(player, enemies, fx);
    if (bosses && bosses.boss.alive) lost += resolveContact(player, bosses, fx);

    lost += resolveBreach(player, enemies, field, fx);
    if (lost > 0) w.clock.penalize(lost);

    if (fx) fx.step(dt);
  }
}
