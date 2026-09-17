import { SHOT_DAMAGE, VOLLEY_DAMAGE, VOLLEY_RADIUS } from './battle_shots.js';
import { RADIUS as PLAYER_RADIUS, isInvulnerable } from './battle_player.js';
import { BLAST_DAMAGE, inBlast } from './battle_blast.js';

export const TIME_PENALTY = 2;

export const INVULN_SEC = 1.0;

export function overlaps(a, b, ra, rb) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r = ra + rb;
  return dx * dx + dy * dy < r * r;
}

export function resolveShots(shots, enemies, shotRadius, fx = null, big = false) {
  let score = 0;
  for (const s of shots.all) {
    if (!s.alive) continue;

    const sr = s.big ? VOLLEY_RADIUS : shotRadius;
    for (const e of enemies.all) {
      if (!e.alive || !overlaps(s, e, sr, e.radius)) continue;
      const gained = enemies.damage(e, s.big ? VOLLEY_DAMAGE : SHOT_DAMAGE);
      score += gained;

      if (fx) { if (gained > 0) fx.sink(e.x, e.y, gained, big, e.grade); else fx.hit(s.x, s.y); }
      shots.kill(s);
      break;
    }
  }
  return score;
}

export function resolveBlast(player, enemies, fx = null, big = false) {
  let score = 0;
  for (const e of enemies.all) {
    if (!e.alive || !inBlast(player, e, e.radius)) continue;
    const gained = enemies.damage(e, BLAST_DAMAGE);
    score += gained;
    if (fx) { if (gained > 0) fx.sink(e.x, e.y, gained, big, e.grade); else fx.ram(e.x, e.y); }
  }
  return score;
}

export function resolveBreach(player, enemies, field, fx = null) {
  let lost = 0;
  for (const e of enemies.all) {

    if (!e.alive || e.y - e.radius <= field.h) continue;
    e.alive = false;
    if (lost > 0 || isInvulnerable(player)) continue;
    player.invulnT = INVULN_SEC;
    lost = TIME_PENALTY;
    if (fx) fx.playerHit(player.x, player.y);
  }
  return lost;
}

export function resolveContact(player, enemies, fx = null) {
  if (isInvulnerable(player)) return 0;
  for (const e of enemies.all) {
    if (!e.alive || e.contact === 'none') continue;
    if (!overlaps(player, e, PLAYER_RADIUS, e.radius)) continue;

    if (e.contact === 'suicide') { e.alive = false; if (fx) fx.sink(e.x, e.y, 0, false, -1); }
    player.invulnT = INVULN_SEC;
    if (fx) fx.playerHit(player.x, player.y);
    return TIME_PENALTY;
  }
  return 0;
}
