/**
 * orientation.js — 세로 화면 안내 (대표님 지시 2026-09-06)
 *
 * 🔴 **강제 회전은 원리적으로 불가능하다.**
 *    `screen.orientation.lock()` 은 **iOS Safari 가 지원하지 않는다.**
 *    안드로이드 크롬도 **전체화면(fullscreen) 상태에서만** 받아 준다.
 *    그래서 "잠그고 끝" 이 아니라 **잠그려 시도하되 실패를 기본값으로 두고**
 *    안내 화면으로 막는다. 대표님 지시(*"세로로 실행시 가로전환하라고 안내"*)가
 *    바로 그 해법이다 — 지시가 기술 제약과 정확히 일치했다.
 *
 * 🔴 **데스크톱에서는 절대 뜨지 않는다.**
 *    창을 세로로 길게 늘린 데스크톱 사용자에게 "기기를 돌리세요" 는 무의미하고,
 *    돌릴 수도 없으니 게임이 영영 막힌다. `pointer: coarse`(주 입력이 손가락)를
 *    함께 본 뒤에만 막는다. 방향만 보고 판단하면 데스크톱을 잠근다.
 *
 * ⚠️ 이 파일은 **DOM 을 안다.** 안내 화면 자체가 DOM 이기 때문이다.
 *    다만 게임은 모른다 — 멈추는 일은 `pause` 콜백으로 바깥에 맡긴다.
 */

/**
 * 안내를 띄워야 하는가.
 * @param {{portrait: boolean, coarsePointer: boolean}} o
 */
export function shouldAskRotate({ portrait, coarsePointer }) {
  return Boolean(portrait) && Boolean(coarsePointer);
}

/** 미디어 쿼리 구독 — Safari 14 이하는 addEventListener 가 없다 */
function listen(query, fn) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', fn);
    return () => query.removeEventListener('change', fn);
  }
  if (typeof query.addListener === 'function') {
    query.addListener(fn);
    return () => query.removeListener(fn);
  }
  return () => {};
}

/**
 * @param {object} [o]
 * @param {Window} [o.win]
 * @param {Document} [o.doc]
 * @param {() => void} [o.pause] 안내가 뜰 때 게임을 멈추는 일 (AUTO · 프리스핀 · 연출)
 * @returns {() => void} 해제
 */
export function installOrientationGuard({
  win = globalThis.window,
  doc = globalThis.document,
  pause = () => {},
} = {}) {
  if (!win || !doc || typeof win.matchMedia !== 'function') return () => {};

  const el = doc.getElementById('rotate');
  if (!el) return () => {};

  const portraitQ = win.matchMedia('(orientation: portrait)');
  const coarseQ = win.matchMedia('(pointer: coarse)');
  let blocked = null;   // null = 아직 판정 전. false 와 구분해야 첫 sync 가 반영된다.

  /**
   * 안드로이드에서만 실제로 먹는다. iOS 는 조용히 실패한다 —
   * ⛔ 실패를 잡지 않으면 미처리 거부(unhandled rejection)로 콘솔이 붉어진다.
   */
  const tryLock = () => {
    const o = win.screen && win.screen.orientation;
    if (!o || typeof o.lock !== 'function') return;
    try {
      const p = o.lock('landscape');
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch { /* 미지원 — 안내 화면이 대신 맡는다 */ }
  };

  const sync = () => {
    const want = shouldAskRotate({
      portrait: portraitQ.matches,
      coarsePointer: coarseQ.matches,
    });
    if (want === blocked) return;
    blocked = want;
    el.classList.toggle('shown', want);
    doc.documentElement.classList.toggle('rotate-blocked', want);
    if (want) {
      pause();      // 안 보이는 사이에 AUTO 가 크레딧을 태우면 안 된다
      tryLock();
    }
  };

  sync();
  const off = [
    listen(portraitQ, sync),
    listen(coarseQ, sync),
  ];
  win.addEventListener('orientationchange', sync, { passive: true });
  win.addEventListener('resize', sync, { passive: true });

  return () => {
    for (const fn of off) fn();
    win.removeEventListener('orientationchange', sync);
    win.removeEventListener('resize', sync);
  };
}
