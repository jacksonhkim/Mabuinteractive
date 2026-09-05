/**
 * rng.js — 시드 기반 결정론적 난수 (Mulberry32)
 *
 * 🔴 게임과 RTP 시뮬레이터가 **공유**한다.
 *    같은 시드가 같은 결과를 내야 §W3-③ 2층(결정론적 시드 테스트)이 성립한다.
 *
 * ⛔ Math.random() 을 쓰면 재현이 불가능해진다. 게임 어디에서도 쓰지 않는다.
 *
 * ⚠️ 이펙트용 난수는 **별도 스트림**을 쓴다. (보너스게임 기획서 §11-11)
 *    파티클이 게임 난수를 소비하면 같은 시드에서 다른 전장이 나온다.
 */

/**
 * Mulberry32 — 32비트 상태의 경량 PRNG.
 * 주기 2^32, 통계 품질이 슬롯 시뮬레이션에 충분하며 구현이 짧아 검증이 쉽다.
 *
 * @param {number} seed 부호 없는 32비트 정수
 * @returns {{ next: () => number, int: (n:number) => number, pick: <T>(a:T[]) => T, state: () => number }}
 */
export function createRng(seed) {
  let a = seed >>> 0;

  /** [0, 1) 실수 */
  function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    /** [0, n) 정수 */
    int(n) {
      return Math.floor(next() * n);
    },
    /** 배열에서 하나 선택 */
    pick(arr) {
      return arr[Math.floor(next() * arr.length)];
    },
    /** 현재 내부 상태 — 재개·검증용 */
    state() {
      return a >>> 0;
    },
  };
}

/**
 * 배열을 제자리에서 섞는다 (Fisher–Yates).
 * 입력 배열을 변형하므로, 원본을 지켜야 하면 복사본을 넘길 것.
 *
 * @template T
 * @param {T[]} arr
 * @param {{int:(n:number)=>number}} rng
 * @returns {T[]} 같은 배열 참조
 */
export function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}
