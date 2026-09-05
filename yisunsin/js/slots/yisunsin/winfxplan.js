/**
 * winfxplan.js — 일반 WIN 심볼 반응의 순수 계산
 *
 * DOM·Canvas·타이머를 모른다. 화면은 이 계획을 받아 그리기만 한다.
 * 입자 난수는 전달받은 시드로 따로 만들며 게임 난수를 소비하지 않는다.
 */
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
/** 🔴 연출 중 비당첨 특수 심볼 발광 계수.
 *  0 으로 끄지 않는 이유 — 특수 심볼 테두리는 "하나만 더" 기대감 장치다(`render.js`).
 *  800ms 동안 꺼버리면 그 시간이 통째로 사라진다. 밀어내되 남긴다. */
const SPECIAL_GLOW_FADE = 0.25;

export const winFxDuration = (fast = false) => WIN_MS * (fast ? FAST_SCALE : 1);

/**
 * 비당첨 특수 심볼(SCATTER·BONUS·난중일기)의 발광을 얼마나 낮출지.
 *
 * 🔴 왜 필요한가 — 일반 WIN 연출 중에도 이 테두리가 그대로 빛나면, 당첨과 무관한
 *    SCATTER 가 함께 번쩍여 **"스캐터가 떴다"로 읽힌다.** 실제 영상 검토에서
 *    오독이 발생했다. 배당은 0 이므로 로직이 아니라 연출의 문제다.
 *
 * @param {{active?:boolean}|null} [winFx] `sampleWinFx` 한 프레임. 없으면 연출 중이 아니다.
 * @returns {number} 0~1. 연출 중이 아니면 1 — 기존 그림과 완전히 같다.
 */
export const specialGlowFade = (winFx) => (winFx && winFx.active ? SPECIAL_GLOW_FADE : 1);

const lerp = (a, b, k) => a + (b - a) * k;

function pulseAt(k) {
  if (k <= FIRST_PEAK) return lerp(1, 1.12, k / FIRST_PEAK);
  if (k <= FIRST_END) return lerp(1.12, 1, (k - FIRST_PEAK) / (FIRST_END - FIRST_PEAK));
  if (k <= SECOND_PEAK) return lerp(1, 1.08, (k - FIRST_END) / (SECOND_PEAK - FIRST_END));
  if (k <= SECOND_END) return lerp(1.08, 1, (k - SECOND_PEAK) / (SECOND_END - SECOND_PEAK));
  return 1;
}

function flashAt(k) {
  if (k <= FLASH_PEAK) return k / FLASH_PEAK;
  if (k <= FLASH_END) return 1 - (k - FLASH_PEAK) / (FLASH_END - FLASH_PEAK);
  return 0;
}

/**
 * @param {Set<string>} cells 당첨 칸의 '릴,행' 집합
 * @param {{fast?:boolean,seed?:number}} options
 */
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

  return { duration: winFxDuration(fast), cells: ordered, sparks };
}

/** 경과 시간에 해당하는 한 프레임의 확대·발광·Spark를 계산한다. */
export function sampleWinFx(plan, elapsedMs) {
  const k = Math.max(0, elapsedMs) / plan.duration;
  if (k >= 1) return {
    active: false, scale: 1, glow: 0, flash: 0, nonWinAlpha: 1, sparks: [],
  };

  const scale = pulseAt(k);
  const glow = k < SECOND_END
    ? Math.max(0.35, (scale - 1) / 0.12)
    : 0.25 * (1 - k) / (1 - SECOND_END);
  const flash = flashAt(k);
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
