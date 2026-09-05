/**
 * tacticplan.js — N2 좌측 전략 패널: 지금 어느 화면을 보일지 정한다
 *
 * 🔴 화면이 하는 일 — 「무엇이 뜨면 무엇을 얻는가」를 계속 알려 준다.
 *    이 안내가 없으면 플레이어는 조건을 알 방법이 없다. 실제로 개편 전까지
 *    **거북선 4연속(잭팟 조건)은 게임 안 어디에도 설명이 없었다.**
 *
 * 🔴 우선순위 — 위가 이긴다 (대표님 결재 2026-09-05)
 *    ① 거북선 3연속 근접  → 잭팟 화면으로 강조 전환
 *    ② 라운드 진행 중     → 그 라운드의 조건 화면 고정
 *    ③ 그 외             → 5초 로테이션
 *
 *    ①이 최우선인 이유 — 1/69,767 짜리 잭팟의 **유일한 예고**이고 그 순간이
 *    지나면 다시 오지 않는다. 프리스핀 잔여 횟수는 우측 난중일기가 이미 보여 준다.
 *
 * ⛔ DOM·타이머를 모른다. 시간을 **인자로 받는** 순수 함수다
 *    (`jackpotplan.js`·`winfxplan.js` 선례).
 */

/** 로테이션 순서 — 화면 파일명 접미사와 같다 */
export const SCREENS = ['seabattle', 'jackpot', 'freespin', 'legendary'];

/**
 * 한 화면이 머무는 시간.
 *
 * 📌 3화면 시절 6초였으나 4화면이 되며 **5초**로 줄였다 — 6초면 한 바퀴가
 *    24초라 마지막 화면을 못 보고 지나가는 플레이어가 늘어난다. 5×4 = 20초.
 */
export const HOLD_MS = 5000;

/**
 * 다시 판정하는 간격.
 *
 * 🔴 화면 주기(HOLD_MS)보다 촘촘한 이유 — 모드 전환·근접은 스핀 결과에 따라
 *    언제든 끼어든다. 주기에 맞춰 재우면 그 순간을 최대 5초까지 놓친다.
 */
export const TICK_MS = 1000;

/** 잭팟 근접 판정 — 상단 현판(`ui.js` 의 JACKPOT_NEAR)과 **같은 기준**을 쓴다 */
const NEAR_RUN = 3;

/**
 * @param {object|null} state `slot.state`
 * @param {number} elapsed 라운드 시작으로부터의 경과 ms
 * @returns {{screen:string, reason:'near'|'mode'|'rotate'}}
 */
export function planTactic(state, elapsed) {
  const s = state || {};

  // ① 거북선 근접 — 다른 무엇보다 우선한다
  //    ⛔ 릴이 도는 중에는 켜지 않는다. 멈추기 전에 켜면 결과가 미리 새어 나간다.
  const run = s.result ? (s.result.jackpotRun || 0) : 0;
  if (!s.spinning && run >= NEAR_RUN) return { screen: 'jackpot', reason: 'near' };

  // ② 진행 중인 라운드의 조건을 붙들어 둔다
  //    📌 `stuck` 이 있으면 보너스 게임(코드 식별자 `legendary`), 없으면 프리스핀이다.
  if (s.freespin) {
    return { screen: s.freespin.stuck ? 'legendary' : 'freespin', reason: 'mode' };
  }

  // ③ 평상시 — 순환
  const i = Math.floor(Math.max(0, elapsed) / HOLD_MS) % SCREENS.length;
  return { screen: SCREENS[i], reason: 'rotate' };
}
