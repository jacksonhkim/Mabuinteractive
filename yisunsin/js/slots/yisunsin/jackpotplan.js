import { createRng } from './rng.js';

const MS_FLASH = 200;
const MS_SCALE = 400;
const MS_COUNT = 2200;

const MS_LINE = 700;

const MS_TOTAL = 1300;
const MS_HIT = 300;
const MS_HOLD = 600;

const MS_COUNT_SOLO = 2600;
const MS_HOLD_SOLO = 500;

const STEPS = [
  { id: 'flash', ms: MS_FLASH },
  { id: 'scale', ms: MS_SCALE },
  { id: 'count', ms: MS_COUNT },
  { id: 'line', ms: MS_LINE },
  { id: 'total', ms: MS_TOTAL },
  { id: 'hit', ms: MS_HIT },
  { id: 'hold', ms: MS_HOLD },
];

const STEPS_SOLO = [
  { id: 'flash', ms: MS_FLASH },
  { id: 'scale', ms: MS_SCALE },
  { id: 'count', ms: MS_COUNT_SOLO },
  { id: 'hit', ms: MS_HIT },
  { id: 'hold', ms: MS_HOLD_SOLO },
];

export const TOTAL_MS = 4000;

export const TOTAL_LINE_MS = 5700;
const FAST_SCALE = 0.4;

export const FAST_MIN_MS = 1500;

export const RAIN = 135;
export const COINS = 32;
export const HIT_COINS = 20;
export const BURSTS = 3;
export const RAYS = 16;

const MS_FAR = 1450;
const MS_MID = 1150;
const MS_NEAR = 900;

const RAIN_STAGGER = 3100;

const POP_STAGGER = 900;

const LAYERS = [
  { min: 2.2, max: 3.2, ms: MS_FAR, stretch: 1.10 },
  { min: 4.0, max: 5.6, ms: MS_MID, stretch: 1.30 },
  { min: 7.0, max: 9.5, ms: MS_NEAR, stretch: 1.70 },
];

const LAYER_MIX = [0.30, 0.75];

export const JP_FX_SEED = 0x1592;

export function jackpotAmounts(paidTotal, jackpotWon) {
  const total = Number.isFinite(paidTotal) ? paidTotal : 0;
  const jackpot = Number.isFinite(jackpotWon) ? jackpotWon : 0;

  return { total, jackpot, line: Math.max(0, total - jackpot) };
}

export function easeJackpot(k) {
  return k < 0.9 ? (k / 0.9) * 0.82 : 0.82 + ((k - 0.9) / 0.1) * 0.18;
}

function scaleTo(steps, target) {
  const src = steps.reduce((a, s) => a + s.ms, 0);
  const out = steps.map((s) => ({ id: s.id, ms: Math.round((s.ms * target) / src) }));
  out[out.length - 1].ms += target - out.reduce((a, s) => a + s.ms, 0);
  return out;
}

export function planJackpot({ fast = false, hasLine = true } = {}) {
  const base = hasLine ? STEPS : STEPS_SOLO;
  const full = hasLine ? TOTAL_LINE_MS : TOTAL_MS;
  if (!fast) {
    return {
      steps: base.map((s) => ({ ...s })), total: full,
      timeScale: 1, supply: supplyFor(full, 1), rain: rainCount(supplyFor(full, 1), 1),
    };
  }
  const target = Math.max(Math.round(full * FAST_SCALE), FAST_MIN_MS);
  const timeScale = target / full;
  const supply = supplyFor(target, timeScale);
  return { steps: scaleTo(base, target), total: target, timeScale, supply, rain: rainCount(supply, timeScale) };
}

function supplyFor(total, timeScale) {
  return Math.round(total - MS_NEAR * timeScale);
}

function rainCount(supply, timeScale) {
  return Math.round(RAIN * (supply / timeScale) / RAIN_STAGGER);
}

function pickLayer(r) {
  if (r < LAYER_MIX[0]) return 0;
  return r < LAYER_MIX[1] ? 1 : 2;
}

const round1 = (n) => Math.round(n * 10) / 10;

export function planRain(rng, n = RAIN, scale = 1, supply = RAIN_STAGGER * scale) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const li = pickLayer(rng.next());
    const L = LAYERS[li];
    out.push({
      layer: li,
      x: Math.round(rng.next() * 100),
      drift: Math.round((rng.next() * 2 - 1) * 9),
      size: round1(L.min + rng.next() * (L.max - L.min)),
      dur: Math.round(L.ms * scale),
      stretch: L.stretch,
      tilt: Math.round((rng.next() * 2 - 1) * 40),
      copper: rng.next() < 0.35,
      spin: Math.round(360 + rng.next() * 540),
      delay: Math.round(rng.next() * supply),
    });
  }
  return out;
}

export function planCoins(rng, n = COINS, scale = 1) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const li = pickLayer(rng.next());
    const L = LAYERS[li];
    const rise = Math.round(34 + rng.next() * 36);
    out.push({
      layer: li,
      x: Math.round(50 + (rng.next() * 2 - 1) * 22),
      dx: Math.round((rng.next() * 2 - 1) * 34),
      rise,
      fall: rise + Math.round(26 + rng.next() * 40),
      size: round1(L.min + rng.next() * (L.max - L.min)),
      tilt: Math.round((rng.next() * 2 - 1) * 40),
      copper: rng.next() < 0.35,
      spin: Math.round(360 + rng.next() * 540),
      delay: Math.round(rng.next() * POP_STAGGER * scale),
    });
  }
  return out;
}

export function planHitBursts() {
  return [
    { x: 50, y: 46, delay: 0 },
    { x: 18, y: 26, delay: 60 },
    { x: 82, y: 30, delay: 60 },
    { x: 26, y: 74, delay: 120 },
    { x: 76, y: 70, delay: 120 },
  ];
}

export function planBursts(rng, n = BURSTS) {
  const zones = [18, 44, 68];
  const out = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      x: Math.round(zones[i % zones.length] + rng.next() * 14),
      y: Math.round(16 + rng.next() * 34),
      delay: Math.round(i * 750 + rng.next() * 180),
    });
  }
  return out;
}

