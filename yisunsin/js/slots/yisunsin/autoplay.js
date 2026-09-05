/**
 * autoplay.js — FAST · AUTO (UI기획서 §6-1 · 기획서 §4-3)
 *
 * 🔴 자동 스핀은 **스스로 멈출 줄 알아야 한다.**
 *    잔액이 마르거나 탭을 떠났을 때 멈추지 않으면, 유저가 보지 않는 사이
 *    크레딧이 계속 빠진다. 멈추는 조건을 이 파일 한 곳에 모아 둔다.
 *
 * 🔴 DOM 을 모른다. 버튼 연결은 부르는 쪽이 한다.
 *    그래야 테스트에서 DOM 없이 돌릴 수 있고, 로비가 붙어도 그대로 쓴다.
 */

const FAST_SCALE = 0.4;      // 연출 시간을 40% 로 (§6-1)

// 다음 스핀까지 기다리는 시간(ms). 당첨을 봤으면 더 준다 —
// 숫자가 올라가는 걸 보기도 전에 다음 스핀이 시작되면 무엇을 땄는지 모른다.
const WAIT_WIN = 1500;
const WAIT_WIN_FAST = 700;
const WAIT_IDLE = 500;
const WAIT_IDLE_FAST = 200;

/**
 * @param {object} o
 * @param {() => void} o.onSpin        스핀을 실행한다
 * @param {() => boolean} o.canSpin    지금 스핀할 수 있는가 (잔액·상태)
 * @param {(on: boolean) => void} [o.onFastChange]
 * @param {(on: boolean) => void} [o.onAutoChange]
 */
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
    /** 릴 회전에 넘길 시간 배율 */
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
      // 켠 즉시 한 번 돈다 — 버튼을 누르고 아무 일도 없으면 고장으로 보인다
      if (auto && canSpin()) onSpin();
      return auto;
    },

    stop() {
      setAuto(false);
    },

    /**
     * 스핀이 끝났을 때 부른다. 자동이 켜져 있으면 다음 스핀을 예약한다.
     * @param {boolean} hasWin 이번 스핀에 당첨이 있었는가
     */
    onSpinEnd(hasWin, showMs = 0) {
      if (!auto) return;
      if (!canSpin()) {          // 🔴 잔액이 마르면 스스로 멈춘다
        setAuto(false);
        return;
      }
      const base = hasWin
        ? (fast ? WAIT_WIN_FAST : WAIT_WIN)
        : (fast ? WAIT_IDLE_FAST : WAIT_IDLE);
      // 🔴 당첨 연출이 기본 대기보다 길면 **연출을 끝까지 보여준다** (UI기획서 §6-2).
      //    MEGA 는 3.5초인데 기본 대기는 1.5초라, 그냥 두면 연출 중에 릴이 다시 돈다.
      const wait = Math.max(base, showMs);
      clear();
      timer = setTimeout(() => {
        timer = 0;
        if (auto) onSpin();
      }, wait);
    },
  };
}
