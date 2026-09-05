/**
 * assets.js — 이미지 로더
 *
 * 🔴 경로는 symbols.json 이 갖는다 (경계 B2).
 *    코드에 `'h2_geobukseon.webp'` 같은 문자열이 있으면, 파일을 옮길 때마다
 *    코드를 고쳐야 한다. 여기서는 **심볼 코드**만 다룬다.
 *
 * 🔴 하나가 실패해도 나머지는 뜬다.
 *    에셋 27종 중 하나가 없다고 화면이 통째로 검게 남으면 원인을 찾기 어렵다.
 *    실패한 것만 자리표시자로 그리고, 무엇이 빠졌는지 목록으로 남긴다.
 */

const load = (src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);      // 던지지 않는다 — 아래서 집계한다
  img.src = src;
});

/**
 * @param {object} symbols  data/symbols.json
 * @param {(done:number, total:number)=>void} [onProgress]
 */
export async function loadAssets(symbols, onProgress) {
  const entries = [
    ...(symbols.reelSymbols || []),
    ...(symbols.presentationOnly || []),
  ].filter((s) => s.asset);

  const images = new Map();
  const failed = [];
  let done = 0;

  await Promise.all(entries.map(async (s) => {
    const img = await load(s.asset);
    if (img) images.set(s.code, img);
    else failed.push(s.code);
    done += 1;
    if (onProgress) onProgress(done, entries.length);
  }));

  return {
    /** @returns {HTMLImageElement|null} */
    get: (code) => images.get(code) || null,
    has: (code) => images.has(code),
    get loaded() {
      return images.size;
    },
    get total() {
      return entries.length;
    },
    failed,
  };
}
