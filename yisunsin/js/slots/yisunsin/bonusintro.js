/**
 * bonusintro.js — 보너스 게임 진입 연출 (대표님 지시 2026-09-08)
 *
 * 🔴 왜 필요했나
 *    보물상자 3개는 **1/3,669** 다. 그런데 결재 2026-09-05 로 선택 화면이
 *    사라지면서, 이 라운드는 재트리거 축약 연출(500ms)만 얹은 채 곧바로 무료
 *    스핀이 시작됐다. 프리스핀(1/76)에는 1,500ms 트리거 연출과 선택 화면이
 *    있는데 **48배 드문 사건이 더 조용했다.**
 *
 * 🔴 이 파일이 지켜야 하는 단 하나
 *    **연출이 무슨 일을 당해도 라운드는 시작된다.** 사운드가 터져도 스핀이
 *    성공해야 한다는 기존 원칙(R5)과 같은 방어다. 그래서 모든 화면 조작이
 *    `safely` 를 지나고, 길이는 화면과 무관하게 미리 정해져 돌아간다.
 *
 * ⛔ 여기서 `freespin_runner` 를 import 하지 않는다. 이 파일은 **얼마나 걸리는지만**
 *    말하고, 그 시간을 누가 어떻게 기다릴지는 부르는 쪽(`main.js`)이 정한다.
 *    연출이 스케줄링을 알기 시작하면 둘을 따로 시험할 수 없게 된다.
 */

/** 기본 길이 — 대표님 지시 「2초 정도」. 사운드(`trigger_legendary`)도 2.0s 다 */
export const TOTAL_MS = 2000;
/** FAST 는 40% 로 줄인다 (§6-1). 다만 이 아래로는 「깜빡」으로만 보인다 */
export const FAST_SCALE = 0.4;
export const FAST_MIN_MS = 900;

/**
 * 연출 길이를 정한다. **화면도 타이머도 모른다** — 계산만 한다.
 * @param {boolean} fast
 * @returns {number} ms
 */
export function planBonusIntro(fast = false) {
  if (!fast) return TOTAL_MS;
  return Math.max(Math.round(TOTAL_MS * FAST_SCALE), FAST_MIN_MS);
}

/**
 * 연출을 재생한다.
 *
 * @param {object} o
 * @param {(sel: string) => HTMLElement|null} o.$
 * @param {{play: (id: string) => unknown}} o.sfx
 * @param {(fn: () => void, ms: number) => unknown} [o.timer] 주입 가능 — 테스트가 시간을 안 기다린다
 * @param {boolean} [o.fast]
 * @returns {{total: number, cancel: () => void}} `total` — 부르는 쪽이 기다릴 시간(ms)
 */
export function playBonusIntro({ $, sfx, timer = setTimeout, fast = false } = {}) {
  const total = planBonusIntro(fast);
  let done = false;

  /** 🔴 연출은 실패해도 된다. 라운드는 실패하면 안 된다. (R5) */
  const safely = (fn) => { try { fn(); } catch { /* 무시 — 아래에서 반드시 걷는다 */ } };

  const el = $('#bonus-intro');
  // 🔴 애니메이션 길이를 화면에 실어 보낸다. CSS 에 2s 를 박아 두면 FAST 에서
  //    화면만 2초를 끌어 첫 스핀 위로 상자가 남는다.
  safely(() => {
    el.style.setProperty('--bi-dur', `${total}ms`);
    for (const sel of ['.bi-chest', '.bi-title', '.bi-sub']) {
      const e = el.querySelector(sel);
      if (e) e.style.animationDuration = `${total}ms`;
    }
    // ⛔ 클래스를 뗐다 붙이는 것만으로는 같은 애니메이션이 다시 돌지 않는다.
    //    연속 트리거(재트리거)에서 두 번째가 조용히 죽는다 — 리플로를 강제한다.
    el.classList.remove('hidden');
    void el.offsetWidth;
  });
  // 🔴 소리의 주인은 연출이다 (주의사항 #42). 「땡땡」은 화면과 같은 순간에 시작한다.
  safely(() => sfx.play('trigger_legendary'));

  const finish = () => {
    if (done) return;
    done = true;
    safely(() => $('#bonus-intro').classList.add('hidden'));
  };

  timer(finish, total);
  return { total, cancel: finish };
}
