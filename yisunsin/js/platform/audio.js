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
 */

export function createAudio() {
  let ctx = null;
  let unlocked = false;
  const waiting = [];

  const Ctor = typeof window !== 'undefined'
    ? (window.AudioContext || window.webkitAudioContext)
    : null;

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
     */
    unlock() {
      if (unlocked || !Ctor) return unlocked;
      if (!ctx) ctx = new Ctor();
      if (ctx.state === 'suspended') ctx.resume();
      unlocked = ctx.state !== 'suspended';
      if (unlocked) {
        while (waiting.length) waiting.shift()(ctx);
      }
      return unlocked;
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
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
  };
}
