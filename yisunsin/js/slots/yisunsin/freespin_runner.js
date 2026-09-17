const ENTER_MS = 1100;
const ENTER_MS_FAST = 450;

const GAP_WIN = 1100;
const GAP_WIN_FAST = 500;
const GAP_IDLE = 650;
const GAP_IDLE_FAST = 260;

export function freeTotal(carried, lastWin) {
  const a = Number.isFinite(carried) ? carried : 0;
  const b = Number.isFinite(lastWin) ? lastWin : 0;
  return a + b;
}

export function createFreespinRunner({ onSpin, isFast }) {
  let timer = 0;

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
  };

  const schedule = (ms) => {
    clear();
    timer = setTimeout(() => {
      timer = 0;
      onSpin();
    }, ms);
  };

  return {
    get running() {
      return timer !== 0;
    },

    begin() {
      schedule(isFast() ? ENTER_MS_FAST : ENTER_MS);
    },

    step(state, hasWin, showMs = 0) {
      if (!state.freespin) {
        clear();
        return false;
      }
      const fast = isFast();
      const base = hasWin
        ? (fast ? GAP_WIN_FAST : GAP_WIN)
        : (fast ? GAP_IDLE_FAST : GAP_IDLE);

      schedule(Math.max(base, showMs));
      return true;
    },

    stop() {
      clear();
    },
  };
}
