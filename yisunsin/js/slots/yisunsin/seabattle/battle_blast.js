export const BLAST_FULL = 20;

export const CHARGE_SEC = 8;

export const BLAST_RADIUS = 300;

export const BLAST_DAMAGE = 10;

export const BLAST_SEC = 0.45;

export const blastReady = (p) => p.energy >= BLAST_FULL;

export const blastProgress = (p) => (p.blastT < 0 ? 0 : Math.min(1, p.blastT / BLAST_SEC));

export function chargeEnergy(p, dt) {
  if (p.energy >= BLAST_FULL) return;
  const next = p.energy + (BLAST_FULL / CHARGE_SEC) * dt;
  p.energy = next > BLAST_FULL ? BLAST_FULL : next;
}

export function tryBlast(p, pressed) {
  if (!pressed || p.energy < BLAST_FULL) return false;
  p.energy = 0;
  p.blastT = 0;
  return true;
}

export function stepBlast(p, dt) {
  if (p.blastT < 0) return;
  p.blastT += dt;
  if (p.blastT >= BLAST_SEC) p.blastT = -1;
}

export function inBlast(p, t, tr) {
  if (t.y > p.y) return false;
  const dx = t.x - p.x;
  const dy = t.y - p.y;
  const r = BLAST_RADIUS + tr;
  return dx * dx + dy * dy < r * r;
}
