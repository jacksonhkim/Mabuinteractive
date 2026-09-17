import { createRng } from './rng.js';

const WIN_MS = 800;
const FAST_SCALE = 0.4;
const SPARKS_PER_CELL = 4;
const MAX_SPARKS = 32;
const FIRST_PEAK = 0.20;
const FIRST_END = 0.40;
const SECOND_PEAK = 0.60;
const SECOND_END = 0.775;
const FLASH_PEAK = 0.07;
const FLASH_END = 0.12;
const DIM_END = 0.78;

const FLASH_MIN_MS = 60;

const FLASH_PEAK_RATIO = FLASH_PEAK / FLASH_END;

const SPECIAL_GLOW_FADE = 0.25;

export const winFxDuration = (fast = false) => WIN_MS * (fast ? FAST_SCALE : 1);

export const flashWindow = (duration) => Math.max(duration * FLASH_END, FLASH_MIN_MS);

export const specialGlowFade = (winFx) => (winFx && winFx.active ? SPECIAL_GLOW_FADE : 1);

const lerp = (a, b, k) => a + (b - a) * k;

function pulseAt(k) {
  if (k <= FIRST_PEAK) return lerp(1, 1.12, k / FIRST_PEAK);
  if (k <= FIRST_END) return lerp(1.12, 1, (k - FIRST_PEAK) / (FIRST_END - FIRST_PEAK));
  if (k <= SECOND_PEAK) return lerp(1, 1.08, (k - FIRST_END) / (SECOND_PEAK - FIRST_END));
  if (k <= SECOND_END) return lerp(1.08, 1, (k - SECOND_PEAK) / (SECOND_END - SECOND_PEAK));
  return 1;
}

function flashAt(elapsedMs, windowMs) {
  const t = elapsedMs / windowMs;
  if (t <= FLASH_PEAK_RATIO) return t / FLASH_PEAK_RATIO;
  if (t < 1) return 1 - (t - FLASH_PEAK_RATIO) / (1 - FLASH_PEAK_RATIO);
  return 0;
}

export function createWinFxPlan(cells, { fast = false, seed = 0x51a7 } = {}) {
  const ordered = [...cells].sort();
  const rngFx = createRng(seed >>> 0);
  const sparks = [];

  for (const cell of ordered) {
    const [col, row] = cell.split(',').map(Number);
    for (let i = 0; i < SPARKS_PER_CELL && sparks.length < MAX_SPARKS; i += 1) {
      sparks.push({
        cell, col, row,
        angle: rngFx.next() * Math.PI * 2,
        distance: 0.18 + rngFx.next() * 0.20,
        delay: rngFx.next() * 0.22,
        life: 0.38 + rngFx.next() * 0.32,
        size: 0.035 + rngFx.next() * 0.035,
      });
    }
    if (sparks.length >= MAX_SPARKS) break;
  }

  const duration = winFxDuration(fast);
  return { duration, flashMs: flashWindow(duration), cells: ordered, sparks };
}

export function sampleWinFx(plan, elapsedMs) {
  const ms = Math.max(0, elapsedMs);
  const k = ms / plan.duration;
  if (k >= 1) return {
    active: false, scale: 1, glow: 0, flash: 0, nonWinAlpha: 1, sparks: [],
  };

  const scale = pulseAt(k);
  const glow = k < SECOND_END
    ? Math.max(0.35, (scale - 1) / 0.12)
    : 0.25 * (1 - k) / (1 - SECOND_END);

  const flash = flashAt(ms, plan.flashMs ?? flashWindow(plan.duration));
  const nonWinAlpha = k <= DIM_END ? 0.8 : lerp(0.8, 1, (k - DIM_END) / (1 - DIM_END));

  const sparks = plan.sparks.flatMap((s) => {
    const t = (k - s.delay) / s.life;
    if (t < 0 || t >= 1) return [];
    const travel = 1 - (1 - t) ** 2;
    return [{
      ...s,
      x: Math.cos(s.angle) * s.distance * travel,
      y: Math.sin(s.angle) * s.distance * travel - t * 0.08,
      alpha: 1 - t,
    }];
  });
  return {
    active: true, scale, glow, flash, nonWinAlpha, sparks,
  };
}
