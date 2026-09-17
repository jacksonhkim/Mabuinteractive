export const BANDS = [
  { min: 20, max: 30, weight: 30 },
  { min: 31, max: 45, weight: 25 },
  { min: 46, max: 55, weight: 30 },
  { min: 56, max: 60, weight: 15 },
];

export const BOSS_MIN_SEC = 46;

const TOTAL_WEIGHT = BANDS.reduce((a, b) => a + b.weight, 0);

export function pickBand(rng) {
  let roll = rng.next() * TOTAL_WEIGHT;
  for (const band of BANDS) {
    roll -= band.weight;
    if (roll < 0) return band;
  }

  return BANDS[BANDS.length - 1];
}

export function rollBattleTime(rng) {
  const band = pickBand(rng);
  const span = band.max - band.min + 1;
  const seconds = band.min + rng.int(span);
  return {
    seconds,
    band: BANDS.indexOf(band) + 1,
    hasBoss: seconds >= BOSS_MIN_SEC,
  };
}

export function expectedSeconds() {
  const sum = BANDS.reduce((a, b) => a + b.weight * (b.min + b.max) / 2, 0);
  return sum / TOTAL_WEIGHT;
}
