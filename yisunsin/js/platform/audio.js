/**
 * audio.js — AudioContext 수명 관리
 *
 * 🔴 이것이 P0 인 이유 (사운드기획서 §5-1)
 *    브라우저는 **사용자 제스처 이전의 소리 재생을 차단한다.**
 *    페이지를 열자마자 만든 AudioContext 는 `suspended` 상태로 태어나고,
 *    이 상태에서 재생을 걸면 소리가 나지 않는다 — 에러도 없이 조용히 실패한다.
 *
 *    그래서 **타이틀 화면의 첫 클릭**이 필요하다.
 *    나중에 붙이려면 "언제 첫 제스처가 오는가" 를 이미 짜인 흐름에 끼워 넣어야 하고,
 *    그 지점은 구조를 다시 건드려야 나온다. 그래서 지금 심는다.
 *
 * ⚠️ Safari 는 제스처 핸들러 **안에서 동기적으로** resume() 을 불러야 풀린다.
 *    await 뒤로 미루면 제스처 컨텍스트가 끊겨 잠긴 채로 남는다.
 *
 * 🔴 **iOS 무음 사고 (2026-09-06 실측 · 대표님 제보)**
 *    구현은 `resume()` 직후 같은 틱에서 `ctx.state !== 'suspended'` 로 해제를
 *    판정했다. 그런데 **`resume()` 은 Promise 다.** 상태는 다음 틱에나 바뀐다.
 *
 *      데스크톱 Chrome — 제스처 안에서 만든 ctx 가 곧바로 'running' → 통과했다
 *      iOS Safari      — ctx 가 'suspended' 로 태어난다 → **영구 false**
 *
 *    `unlocked` 는 한 번 false 가 되면 다시 시도하지 않았으므로
 *    `sfx.play()` 가 전부 NOOP 이 되고 BGM 은 호출조차 되지 않았다.
 *    **없는 값과의 비교처럼, 이른 판정도 언제나 조용히 통과한다.**
 *
 *    해제 확정을 **세 경로**로 받는다 — resume() 의 Promise · statechange 이벤트 ·
 *    다음 제스처의 재시도. 어느 하나만 살아 있어도 소리가 붙는다.
 *
 * 🔴 **두 번째 층 — iOS 측면 무음 스위치**
 *    잠금이 풀려도 iOS 는 웹오디오를 「ambient」 세션으로 보내므로,
 *    벨/무음 스위치가 무음이면 **소리가 통째로 죽는다.** 페이지가 스스로 알 수 없다.
 *    `navigator.audioSession.type = 'playback'` (Safari 16.4+) 로 재생 세션을
 *    선언하면 무음 스위치를 무시한다. 미지원 브라우저에서는 그냥 무시된다.
 */

/** 해제가 늦을 때 다음 제스처에서 다시 시도한다 — iOS 가 첫 제스처를 흘리는 경우가 있다 */
const RETRY_EVENTS = ['pointerdown', 'touchend', 'click'];

export function createAudio() {
  let ctx = null;
  let unlocked = false;
  let retryArmed = false;
  const waiting = [];

  const win = typeof window !== 'undefined' ? window : null;
  const Ctor = win ? (win.AudioContext || win.webkitAudioContext) : null;

  /**
   * 실제로 'running' 이 됐을 때만 해제로 친다. 여러 경로에서 불려도 안전하다.
   * @returns {boolean} 이번 호출로 해제가 확정됐는가
   */
  const settle = () => {
    if (unlocked || !ctx || ctx.state !== 'running') return false;
    unlocked = true;
    disarmRetry();
    while (waiting.length) waiting.shift()(ctx);
    return true;
  };

  const onRetry = () => { unlockNow(); };

  function disarmRetry() {
    if (!retryArmed || !win) return;
    retryArmed = false;
    for (const type of RETRY_EVENTS) win.removeEventListener(type, onRetry, true);
  }

  function armRetry() {
    if (retryArmed || unlocked || !win) return;
    retryArmed = true;
    // 캡처 단계로 듣는다 — 게임이 이벤트를 삼켜도 재시도는 도달해야 한다.
    for (const type of RETRY_EVENTS) {
      win.addEventListener(type, onRetry, { capture: true, passive: true });
    }
  }

  /** iOS 무음 스위치 무시. ⛔ AudioContext 를 만들기 **전에** 선언해야 먹는다. */
  const claimPlaybackSession = () => {
    const session = typeof navigator !== 'undefined' ? navigator.audioSession : null;
    if (!session) return;
    try { session.type = 'playback'; } catch { /* 미지원 — 무시한다 */ }
  };

  /**
   * 길이 1샘플의 무음을 흘린다.
   * iOS 는 제스처 안에서 **실제로 재생을 시도한 적이 있어야** 잠금을 푼다.
   * resume() 만으로는 풀리지 않는 기기가 있다.
   */
  const primeSilently = () => {
    try {
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* 무음 재생 실패는 치명적이지 않다 */ }
  };

  function unlockNow() {
    if (unlocked || !Ctor) return unlocked;
    if (!ctx) {
      claimPlaybackSession();
      ctx = new Ctor();
      // 상태 변화를 직접 듣는다 — Promise 를 놓쳐도 이쪽이 잡는다.
      if (typeof ctx.addEventListener === 'function') {
        ctx.addEventListener('statechange', settle);
      }
    }
    primeSilently();
    // ⚠️ 제스처 핸들러 안에서 **동기적으로** 불러야 한다. await 뒤로 미루지 않는다.
    if (ctx.state === 'suspended') {
      const p = ctx.resume();
      if (p && typeof p.then === 'function') p.then(settle, () => {});
    }
    // Chrome 처럼 이미 'running' 이면 여기서 끝난다. iOS 는 위 세 경로가 마저 맡는다.
    if (!settle()) armRetry();
    return unlocked;
  }

  return {
    get supported() {
      return Boolean(Ctor);
    },

    get unlocked() {
      return unlocked;
    },

    /** 오디오 그래프를 붙일 대상. 잠금 해제 전에는 null 이다. */
    get context() {
      return ctx;
    },

    /**
     * 사용자 제스처 핸들러 안에서 **동기적으로** 부른다.
     * 두 번 이상 불러도 안전하다.
     *
     * ⚠️ **반환값을 해제 여부로 믿지 마라.** iOS 에서는 이 시점에 아직 false 다.
     *    해제 이후에 할 일은 반드시 `onUnlock()` 에 맡긴다.
     */
    unlock() {
      return unlockNow();
    },

    /** 잠금이 풀리면 부를 콜백. 이미 풀렸으면 즉시 부른다. */
    onUnlock(fn) {
      if (unlocked) fn(ctx);
      else waiting.push(fn);
    },

    /** 탭이 가려졌을 때 등, 소리를 잠시 멈춘다. */
    suspend() {
      if (ctx && ctx.state === 'running') ctx.suspend();
    },

    resume() {
      if (!ctx) return;
      if (ctx.state !== 'suspended') return;
      const p = ctx.resume();
      if (p && typeof p.then === 'function') p.then(settle, () => {});
    },
  };
}
