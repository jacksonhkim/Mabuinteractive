/**
 * overlay.js — 릴 밖으로 화면을 들어 올린다 (대표님 지시 2026-09-08)
 *
 * 🔴 왜 필요한가
 *    `.reel-panel { isolation: isolate }` 은 **자체 층을 만든다.** 그 안에 있는 한
 *    z-index 를 아무리 올려도 릴 밖으로 나올 수 없다 — 잭팟 코인(`.jp-sky`)이
 *    이미 같은 이유로 `body` 직계에 산다(연출기획서 §6 · 주의사항 #38).
 *    CSS 로는 풀 수 없고 **부모를 바꾸는 수밖에 없다.**
 *
 * 🔴 왜 「잠깐」인가
 *    잭팟만 무대 전체로 커지고 등급 배너(BIG·MEGA·LEGENDARY)는 릴 자리가
 *    제자리다 (대표님 결재 「라」 2026-09-08). 요소는 하나뿐이므로, 잭팟 연출
 *    동안만 올렸다가 끝나면 **있던 자리로 정확히 되돌린다.**
 *    ⛔ 「끝에 다시 붙이기」로는 부족하다 — 형제 순서가 바뀌면 같은 z-index 를
 *       가진 이웃(`#winpop`·`#fs-total`)과의 앞뒤가 뒤집힌다. 다음 형제를
 *       기억해 **그 앞에** 되돌린다.
 *
 * ⛔ 이 파일은 무엇을 올리는지 모른다. 대상도 목적지도 부르는 쪽이 정한다.
 */

/**
 * 요소를 목적지로 옮기고, **되돌리는 함수**를 준다.
 *
 * 🔴 되돌리기를 반환값으로 묶는 것이 요점이다. 올리는 곳과 내리는 곳이
 *    떨어져 있으면(연출 시작 vs 종료) 한쪽만 고치다 짝이 어긋난다.
 *
 * @param {(sel: string) => HTMLElement|null} $
 * @param {string} sel      올릴 요소
 * @param {string} hostSel  목적지
 * @returns {() => void} 되돌리기. 여러 번 불러도 안전하다
 */
export function liftOverlay($, sel, hostSel = '#stage') {
  const el = $(sel);
  const host = $(hostSel);
  // 🔴 연출은 실패해도 된다. 게임은 실패하면 안 된다 (R5).
  //    요소가 없거나 이미 목적지에 있으면 아무 일도 하지 않는다.
  if (!el || !host || el.parentElement === host) return () => {};

  const home = el.parentElement;
  const next = el.nextSibling;
  let lifted = false;
  try {
    host.appendChild(el);
    lifted = true;
  } catch { /* 무시 — 아래 되돌리기가 아무 일도 하지 않는다 */ }

  return () => {
    if (!lifted) return;
    lifted = false;
    try {
      // 기억해 둔 다음 형제가 아직 제자리면 **그 앞**에, 아니면 끝에 붙인다
      if (next && next.parentNode === home) home.insertBefore(el, next);
      else home.appendChild(el);
    } catch { /* 무시 — 화면이 조금 어긋날 뿐 게임은 진행된다 */ }
  };
}
