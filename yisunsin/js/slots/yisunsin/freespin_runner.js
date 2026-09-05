/**
 * freespin_runner.js — 프리스핀 자동 진행 (UI기획서 §5-1-4)
 *
 * 🔴 왜 기존 autoplay.js 를 쓰지 않는가 (대표님 지시 2026-08-25)
 *    `autoplay.js` 는 **잔액이 마르면 스스로 멈추도록** 만들어져 있다.
 *    그런데 프리스핀은 베팅을 걷지 않으므로 잔액 0 에서도 남은 횟수는 돌아야 한다.
 *    그대로 재사용하면 프리스핀이 첫 스핀에서 멈춘다.
 *    → 멈추는 조건이 정반대이므로 **파일을 나눈다.**
 *
 * 🔴 왜 main.js 에 넣지 않는가
 *    `main.js` 가 이미 300줄 상한(H1)에 닿아 있다. 그리고 지난 세션에
 *    이 파일을 쪼개다 선언이 날아가는 사고를 세 번 냈다.
 *    새 기능은 **처음부터 밖에서** 짓는다.
 *
 * 🔴 DOM 을 모른다. autoplay.js 와 같은 규칙이다.
 */

/** 선택 직후 첫 스핀까지 (진입 연출이 지나갈 시간) */
const ENTER_MS = 1100;
const ENTER_MS_FAST = 450;

/** 프리스핀 스핀 사이 간격 — 당첨을 봤으면 더 준다 */
const GAP_WIN = 1100;
const GAP_WIN_FAST = 500;
const GAP_IDLE = 650;
const GAP_IDLE_FAST = 260;

/**
 * @param {object} o
 * @param {() => void} o.onSpin      스핀을 실행한다
 * @param {() => boolean} o.isFast   FAST 가 켜져 있는가
 */
/**
 * 프리스핀 **총 획득** — 마지막 스핀까지 포함한 합계.
 *
 * 🔴 `slot.settle()` 은 마지막 스핀에서 `freespin.won` 에 지급을 더한 **직후**
 *    `freespin` 을 null 로 지운다. 화면 쪽은 `if (s.freespin)` 일 때만 누적을
 *    받아 두므로 **마지막 한 번을 놓친다.** 그 한 번을 여기서 되돌린다.
 *
 *    실측 — 화면 21,280 vs 실제 24,800 (누락 3,520) · 화면 10,480 vs 실제 14,240 (누락 3,760)
 *    ⚠️ **마지막 스핀이 당첨돼야만 드러난다**(약 20%). 10회를 돌려도 안 나왔다.
 *
 * @param {number} carried 마지막 스핀 **이전까지**의 누적
 * @param {number} lastWin 마지막 스핀 지급액 (`state.win`)
 */
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

    /**
     * 선택지를 고른 직후. 곧바로 돌리지 않고 한 박자 둔다 —
     * 무엇을 골랐는지 눈으로 확인할 시간이 없으면 선택한 보람이 없다.
     */
    begin() {
      schedule(isFast() ? ENTER_MS_FAST : ENTER_MS);
    },

    /**
     * 스핀이 끝날 때마다 부른다. 남은 횟수가 있으면 다음을 예약한다.
     *
     * ⛔ 잔액을 보지 않는다. 프리스핀은 베팅을 걷지 않기 때문이다.
     *    멈추는 조건은 **남은 횟수 0** 하나뿐이다.
     *
     * @param {object} state slot.state
     * @param {boolean} hasWin 이번 스핀에 당첨이 있었는가
     * @returns {boolean} 다음 스핀을 예약했는가
     */
    step(state, hasWin, showMs = 0) {
      if (!state.freespin) {
        clear();
        return false;
      }
      const fast = isFast();
      const base = hasWin
        ? (fast ? GAP_WIN_FAST : GAP_WIN)
        : (fast ? GAP_IDLE_FAST : GAP_IDLE);
      // 당첨 연출이 더 길면 그쪽을 기다린다 — 프리스핀도 예외가 아니다
      schedule(Math.max(base, showMs));
      return true;
    },

    /** 탭을 떠나거나 프리스핀이 끝났을 때 */
    stop() {
      clear();
    },
  };
}
