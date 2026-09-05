/**
 * reelview.js — 릴이 지금 무슨 심볼을 보여줄지 결정한다
 *
 * 🔴 왜 render.js 에서 갈랐는가
 *    그 파일이 정확히 300줄(H1)이었고, 「무엇을 그리는가」와 「무엇을 읽는가」가
 *    한 파일에 섞여 있었다. 읽는 쪽만 떼면 `render.js` 는 그리기에 집중한다.
 *
 * 세 겹이 순서대로 이긴다 —
 *   ① **예정 칸(pending)** — 이번 스핀에 새로 열릴 자리. 릴이 아직 도는 중이라도
 *      **최종 정지 위치**의 그 인덱스는 WILD 다. 그래서 WILD 가 위에서 흘러 내려와
 *      제자리에 멈추는 것이 보인다 (대표님 지시 2026-09-05 —
 *      *"회전하는 릴에서 와일드가 당첨되는 게 보여야 한다"*).
 *   ② **고정 칸(stuck)** — 이미 열린 자리. 릴이 돌아도 움직이지 않는다.
 *   ③ **스트립** — 그 외 전부. 레전더리 중에는 전용 릴을 읽는다.
 */

export const WILD_CODE = 's1_wild';

/**
 * @param {string[][]} baseStrips 본편 릴
 */
export function createReelView(baseStrips) {
  let strips = baseStrips;
  let stuck = null;      // Set<"릴,행">
  let pending = null;    // Map<릴, Set<행>>
  let stops = null;      // 이번 스핀의 릴별 정지 위치

  return {
    /** 고정 칸(`"릴,행"` Set)과 전용 릴을 알린다. 평상시엔 둘 다 null */
    setRound(roundStrips, cells) {
      strips = roundStrips || baseStrips;
      stuck = cells || null;
    },

    /**
     * 이번 스핀에 **새로 열릴** 칸을 알린다.
     *
     * ⛔ `stops` 가 없으면 예정 칸을 쓰지 않는다 — 어느 인덱스에 실을지 모르기 때문이다.
     *
     * @param {Set<string>|null} cells `"릴,행"`
     * @param {number[]|null} positions 릴별 정지 위치(정수부)
     */
    setPending(cells, positions) {
      stops = positions || null;
      pending = null;
      if (!cells || !positions) return;
      pending = new Map();
      for (const key of cells) {
        const [c, r] = key.split(',').map(Number);
        if (!pending.has(c)) pending.set(c, new Set());
        pending.get(c).add(r);
      }
    },

    /** 고정 칸 Set — 그리는 쪽이 그대로 쓴다 */
    get stuck() { return stuck; },

    /**
     * 스트립을 벗어나지 않게 감아 읽는다 (음수 인덱스 포함).
     * 예정 칸이면 그 인덱스에서 WILD 를 돌려준다.
     */
    symbolAt(reel, index) {
      const strip = strips[reel];
      const i = ((index % strip.length) + strip.length) % strip.length;
      const rows = pending && pending.get(reel);
      if (rows && stops) {
        const base = Math.floor(stops[reel]);
        for (const r of rows) {
          if (((base + r) % strip.length + strip.length) % strip.length === i) return WILD_CODE;
        }
      }
      return strip[i];
    },
  };
}
