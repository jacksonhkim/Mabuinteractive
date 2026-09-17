export const SCREENS = ['seabattle', 'jackpot', 'freespin', 'legendary'];

export const HOLD_MS = 5000;

export const TICK_MS = 1000;

const NEAR_RUN = 3;

export function planTactic(state, elapsed) {
  const s = state || {};

  const run = s.result ? (s.result.jackpotRun || 0) : 0;
  if (!s.spinning && run >= NEAR_RUN) return { screen: 'jackpot', reason: 'near' };

  if (s.freespin) {
    return { screen: s.freespin.stuck ? 'legendary' : 'freespin', reason: 'mode' };
  }

  const i = Math.floor(Math.max(0, elapsed) / HOLD_MS) % SCREENS.length;
  return { screen: SCREENS[i], reason: 'rotate' };
}
