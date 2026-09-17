export const RADIUS = 22;

export const DRAW_SIZE = 120;

export const MARK_R = 46;

export const HOME_MARGIN = 70;

export const AIM_LEFT = -Math.PI;
export const AIM_RIGHT = 0;

const AIM_UP = -Math.PI / 2;

export function clampAim(angle) {
  if (angle <= 0) return angle;
  return angle < Math.PI / 2 ? AIM_RIGHT : AIM_LEFT;
}

export function createPlayer(fieldW, fieldH) {
  return {

    x: fieldW / 2,
    y: fieldH - HOME_MARGIN,

    aim: AIM_UP,

    energy: 0,

    blastT: -1,

    invulnT: 0,
  };
}

export const isInvulnerable = (p) => p.invulnT > 0;

export function stepPlayer(p, input, dt) {

  const dx = input.aimX - p.x;
  const dy = input.aimY - p.y;

  if (dx !== 0 || dy !== 0) p.aim = clampAim(Math.atan2(dy, dx));

  if (p.invulnT > 0) p.invulnT = Math.max(0, p.invulnT - dt);
}
