/**
 * fx.js — 연출 조립
 *
 * 🔴 `main.js` 에서 갈라져 나왔다 (Phase 0 · 2026-08-28).
 *    부트스트랩 파일이 **정확히 300줄** — 코드 위생 H1 상한에 닿아 연출을 더 넣을 자리가
 *    없었다. 줄을 줄이려고 주석이나 검증을 지우는 것은 본말전도다.
 *    **화면 일은 화면 파일로** 보낸다 (`ui.js` 가 같은 이유로 갈라져 나온 선례가 있다).
 *
 * 여기가 아는 것 — 화면(캔버스·DOM)과 당첨 표시 상태.
 * 여기가 모르는 것 — 자동 스핀·프리스핀 진행 규칙. 그것은 부르는 쪽(`main.js`)의 일이다.
 *   ⛔ 이 파일에 `autoplay` · `freespin_runner` 를 import 하지 않는다.
 *      연출이 스케줄링을 알기 시작하면 둘을 따로 시험할 수 없게 된다.
 */
import { lineAtTime, presentWin } from './ui.js';
import { playFreeTrigger } from './freetrigger.js';
import { createRng } from './rng.js';
import { createWinFxPlan, sampleWinFx } from './winfxplan.js';

/** 강조가 한 번 숨쉬는 주기 */
const PULSE_MS = 1400;
const WIN_FX_SEED = 0x51a7;
const RNG_SPAN = 0x100000000;

/**
 * @param {(sel: string) => HTMLElement} $
 * @param {object} deps
 * @param {object} deps.renderer 캔버스 렌더러
 * @param {object} deps.reels    릴 상태 머신 (위치·속도를 읽기만 한다)
 * @param {boolean[]} deps.settled 릴별 정지 여부 — 소유자는 `main.js` 다
 * @param {object[]} deps.paylines
 * @param {object} deps.sfx
 */
export function createFx($, { renderer, reels, settled, paylines, sfx }) {
  /** 🔴 부스트 상태를 클래스로 읽는다 — 연출이 켜고 끄는 스위치가 곧 상태다 */
  const canvasEl = $('#reels');
  /** 게임 결과와 분리된 화면 전용 난수 */
  const rngFx = createRng(WIN_FX_SEED);
  /** 진행 중인 트리거 연출 — 스킵·취소를 위해 잡아 둔다 */
  let trigger = null;
  /** 당첨 칸 `"릴,행"` — settle 후 채워진다 */
  let winCells = new Set();
  /** 당첨 라인 목록 */
  let winLines = [];
  /** 순차 점등의 기준 시각. 0 이면 다음 draw 에서 잡는다 */
  let lineT0 = 0;
  /** 카운트업 취소 함수 — 새 스핀이 이전 카운트업을 끊는다 */
  let cancelCount = null;
  /** 일반 WIN의 800ms 심볼 반응 */
  let winFx = null;

  const stopCount = () => {
    if (cancelCount) {
      cancelCount();
      cancelCount = null;
    }
  };

  return {
    /** 새 스핀 — 이전 강조와 카운트업을 끈다 */
    resetForSpin() {
      winCells = new Set();
      winLines = [];
      lineT0 = 0;
      winFx = null;
      stopCount();
    },

    /**
     * 당첨 연출을 재생한다. 당첨이 없으면 아무것도 하지 않는다.
     * @returns {number} 자동 스핀이 기다려야 할 시간(ms)
     */
    showWin(slot, fast, freeEnded = false) {
      const s = slot.state;
      if (s.win <= 0) return 0;
      stopCount();
      const shown = presentWin($, s, paylines, sfx, fast, freeEnded);
      winCells = shown.cells;
      winLines = shown.lines;
      cancelCount = shown.cancel;
      lineT0 = 0;
      winFx = shown.effect === 'win' ? {
        plan: createWinFxPlan(winCells, {
          fast, seed: Math.floor(rngFx.next() * RNG_SPAN),
        }),
        t0: performance.now(),
      } : null;
      return shown.hold;
    },

    draw(now = 0) {
      // 🔴 라인이 여럿이면 0.6초씩 **순차 점등**한다 (§6-2-4).
      //    한꺼번에 겹쳐 그리면 어느 심볼이 어느 라인인지 읽을 수 없다.
      if (winLines.length && lineT0 === 0) lineT0 = now;
      const line = lineAtTime(winLines, now, lineT0);
      let winFrame = null;
      if (winFx) {
        winFrame = sampleWinFx(winFx.plan, now - winFx.t0);
        if (!winFrame.active) winFx = null;
      }
      // 🔴 연출이 켠 클래스가 곧 부스트 값이다. 상태를 두 곳에 두지 않는다.
      const boost = canvasEl.classList.contains('fx-glow') ? 1 : 0;
      renderer.draw(
        reels.positions, reels.speeds, settled,
        (now % PULSE_MS) / PULSE_MS, winCells, line, boost, winFrame,
      );
    },

    /**
     * FREE 트리거 연출을 재생한다.
     * @param {object} o `showChoice` 는 선택 화면을 띄우는 일. 재트리거면 비워 둔다.
     */
    playTrigger(o = {}) {
      if (trigger) trigger.cancel();     // 겹쳐 걸리면 앞것을 걷는다
      trigger = playFreeTrigger({ $, sfx, ...o });
      return trigger;
    },

    /** 사람이 화면을 눌러 건너뛴다. 연출이 없으면 아무 일도 없다. */
    skipTrigger() { if (trigger) trigger.skip(); },

    /** 탭 이탈 — 화면만 걷는다 */
    cancelTrigger() { if (trigger) trigger.cancel(); },

    /** 화면에 강조할 것이 있으면 정지 중에도 계속 그려야 맥동이 보인다 */
    hasGlow(slot) {
      return winCells.size > 0 || winLines.length > 0
        || slot.grid.some((reel) => reel.some((c) => c.startsWith('s')));
    },
  };
}
