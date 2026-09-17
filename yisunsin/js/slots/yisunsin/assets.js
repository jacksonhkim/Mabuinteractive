const load = (src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = src;
});

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
