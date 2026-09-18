const RESUME_COUNTDOWN_MS = 3000;

export function createScreenGate({
  isSpinning, isAwaitingChoice, isJackpotShowing, isInBattle, battle, now,
}) {

  let open = false;

  let pausedByUs = false;

  const canOpen = () => !isAwaitingChoice() && !isJackpotShowing();

  return {
    canOpen,

    open() {
      if (!canOpen()) return false;
      if (open) return true;
      open = true;

      if (isInBattle()) {
        const b = battle();

        if (b) {
          b.pause(now());
          pausedByUs = true;
        }
      }
      return true;
    },

    close() {
      if (!open) return { countdownMs: 0, finish() {} };
      open = false;

      if (!pausedByUs) return { countdownMs: 0, finish() {} };
      pausedByUs = false;

      return {
        countdownMs: RESUME_COUNTDOWN_MS,
        finish() {
          const b = battle();

          if (b) b.resume(now());
        },
      };
    },

    get isOpen() {
      return open;
    },
  };
}
