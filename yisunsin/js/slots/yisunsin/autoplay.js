const FAST_SCALE = 0.4;

const WAIT_WIN = 1500;
const WAIT_WIN_FAST = 700;
const WAIT_IDLE = 500;
const WAIT_IDLE_FAST = 200;

export function createAutoplay({ onSpin, canSpin, onFastChange, onAutoChange }) {
  let fast = false;
  let auto = false;
  let timer = 0;

  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = 0;
    }
  };

  const setAuto = (on) => {
    auto = on;
    if (!on) clear();
    if (onAutoChange) onAutoChange(on);
  };

  return {
    get fast() {
      return fast;
    },
    get auto() {
      return auto;
    },

    get scale() {
      return fast ? FAST_SCALE : 1;
    },

    toggleFast() {
      fast = !fast;
      if (onFastChange) onFastChange(fast);
      return fast;
    },

    toggleAuto() {
      setAuto(!auto);

      if (auto && canSpin()) onSpin();
      return auto;
    },

    stop() {
      setAuto(false);
    },

    onSpinEnd(hasWin, showMs = 0) {
      if (!auto) return;
      if (!canSpin()) {
        setAuto(false);
        return;
      }
      const base = hasWin
        ? (fast ? WAIT_WIN_FAST : WAIT_WIN)
        : (fast ? WAIT_IDLE_FAST : WAIT_IDLE);

      const wait = Math.max(base, showMs);
      clear();
      timer = setTimeout(() => {
        timer = 0;
        if (auto) onSpin();
      }, wait);
    },
  };
}
