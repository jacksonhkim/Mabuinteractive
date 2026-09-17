export const WILD_CODE = 's1_wild';

export function createReelView(baseStrips) {
  let strips = baseStrips;
  let stuck = null;
  let pending = null;
  let stops = null;

  return {

    setRound(roundStrips, cells) {
      strips = roundStrips || baseStrips;
      stuck = cells || null;
    },

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

    get stuck() { return stuck; },

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
