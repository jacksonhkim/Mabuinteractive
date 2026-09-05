/**
 * jackpotplan.js — JACKPOT 연출의 **계산**만 (연출기획서 §6)
 *
 * 🔴 왜 갈라졌나 (2026-08-29 3차)
 *    `jackpotfx.js` 가 305줄이 되어 H1 상한(300)을 넘었다.
 *    주석을 지워 줄이는 것은 본말전도다 — **파일이 스스로 선언한 경계**로 가른다:
 *    *"시간 계산은 여기서만 한다 — 화면도 타이머도 모른다."*
 *    여기는 그 「모르는 쪽」이다. DOM·타이머·사운드를 일절 import 하지 않는다.
 *
 * 🔴 수치의 출처는 감이 아니라 레퍼런스 실측이다 (`잭팟레퍼런스.mp4`).
 *    동시 65개 · 폭 2.2~9.1%(화면 높이 대비) · 낙하 약 960px/s ·
 *    세로 늘임 1.2~2.75배 · 하단 편중. **바꾸려면 다시 재고 바꾼다.**
 *
 * ⛔ 입자는 게임 난수를 쓰지 않는다 (`synth.js:20` 선례 · #45).
 */
import { createRng } from './rng.js';

// 연출 시간 (§6-3). 이름을 붙여 선언한다 — 식 한복판에 박힌 수치가 아니다.
const MS_FLASH = 200;
const MS_SCALE = 400;
const MS_COUNT = 2200;
/** 🆕 ② 「+ LINE WIN」 이 떠오르는 시간 (대표님 결재 2026-08-30) */
const MS_LINE = 700;
/** 🆕 ③ 「TOTAL WIN」 카운트업 — **여기가 절정이다** */
const MS_TOTAL = 1300;
const MS_HIT = 300;
const MS_HOLD = 600;
/** 잭팟 단독(라인 당첨 0)일 때 — 기존 4,000ms 구성을 그대로 지킨다 */
const MS_COUNT_SOLO = 2600;
const MS_HOLD_SOLO = 500;

/**
 * 🔴 **hit 은 total 뒤에 온다** (대표님 결재 2026-08-30 A안).
 *    절정이 잭팟 도착에 있으면 뒤에 붙는 라인·총액이 「흐지부지」로 읽힌다.
 *    터지는 것은 **총액**이어야 한다.
 */
const STEPS = [
  { id: 'flash', ms: MS_FLASH },
  { id: 'scale', ms: MS_SCALE },
  { id: 'count', ms: MS_COUNT },
  { id: 'line', ms: MS_LINE },
  { id: 'total', ms: MS_TOTAL },
  { id: 'hit', ms: MS_HIT },
  { id: 'hold', ms: MS_HOLD },
];

/** 라인 당첨이 없으면 보여줄 합산이 없다 — 두 단계를 걷어낸다 */
const STEPS_SOLO = [
  { id: 'flash', ms: MS_FLASH },
  { id: 'scale', ms: MS_SCALE },
  { id: 'count', ms: MS_COUNT_SOLO },
  { id: 'hit', ms: MS_HIT },
  { id: 'hold', ms: MS_HOLD_SOLO },
];

/** 잭팟 단독 연출 길이 */
export const TOTAL_MS = 4000;
/** 🆕 3단 합산 연출 길이 (잭팟 → 라인 → 총액) */
export const TOTAL_LINE_MS = 5700;
const FAST_SCALE = 0.4;
/** 🔴 FAST 라도 이 아래로 내려가면 잭팟이 "깜빡" 으로만 보인다 */
export const FAST_MIN_MS = 1500;

/**
 * 🔴 수치의 출처는 레퍼런스 실측이다 (`잭팟레퍼런스.mp4` · Gates of Olympus 1000).
 *    동시 65개를 유지하려면 수명(약 1.1초)보다 창(2.6초)이 길므로 그만큼 더 뿌려야 한다.
 */
export const RAIN = 135;         // 화면 위에서 내리는 코인 (주역)
export const COINS = 32;         // 아래에서 튀어오르는 코인 (조역)
export const HIT_COINS = 20;     // 최종 Hit 일제 분출
export const BURSTS = 3;         // 카운트업 중 폭죽 발수
export const RAYS = 16;          // 폭죽 한 발의 갈래

// 계층별 낙하 시간 — 🔴 **가까울수록 빠르다.** 이것이 원근을 만든다.
const MS_FAR = 1450;
const MS_MID = 1150;
const MS_NEAR = 900;
/**
 * 강우를 흩뿌리는 시차 폭.
 *
 * 🔴 1,800ms 였을 때 **코인이 연출보다 1.35초 먼저 말랐다** (실측 2026-08-29).
 *    공급이 끊긴 뒤로는 떨어지던 것만 소진되므로 **최종 Hit 가 텅 빈 화면에 떨어졌다.**
 *    한꺼번에 더 뿌리는 것으로는 안 된다 — 뿌리는 **기간**을 연출 끝까지 늘려야 한다.
 *    (레퍼런스는 12.7초 내내 65개를 유지했다. 계속 공급하기 때문이다.)
 */
const RAIN_STAGGER = 3100;
/** 분출은 초반에 몰린다 — 강우와 달리 「터진 순간」을 표현한다 */
const POP_STAGGER = 900;

/**
 * 원근 3계층 — [최소, 최대] 지름(vmin) · 수명(ms) · 세로 늘임(모션 블러)
 *
 * ⚠️ 🔴 늘임은 **뒤집힘과 곱해진다.** 실측 세로/가로 비 2.75 를 그대로 넣었더니
 *    `scaleX(0.14)` 구간과 겹쳐 코인이 쌀알이 됐다. 레퍼런스의 2.75 는
 *    **늘임과 뒤집힘이 합쳐진 결과값**이지 늘임 단독값이 아니다 — 그래서 낮춘다.
 */
const LAYERS = [
  { min: 2.2, max: 3.2, ms: MS_FAR, stretch: 1.10 },   // 원경 — 작고 느리다
  { min: 4.0, max: 5.6, ms: MS_MID, stretch: 1.30 },   // 중경
  { min: 7.0, max: 9.5, ms: MS_NEAR, stretch: 1.70 },    // 근경 — 크고 빠르고 길게 늘어난다
];
/** 계층 추첨 비율 (원경 · 중경 · 근경) */
const LAYER_MIX = [0.30, 0.75];

/** ⛔ 게임 시드와 **다른 스트림**이어야 한다 */
export const JP_FX_SEED = 0x1592;

/**
 * 🔴 잭팟 카운트업 이징 — 90% 까지 82%, **마지막 10% 에 18%** 를 남긴다.
 *    3제곱 이징은 마지막 0.7초에 전체의 3% 만 움직여 숫자가 먼저 멈춘 것처럼 보였고,
 *    한 방은 그 멈춘 화면에 떨어졌다. 뜸을 들이다 **타격 순간에 도착**하게 한다.
 */
/**
 * 잭팟 스핀의 **표시 금액**을 가른다.
 *
 * 🔴 `paidTotal` 은 **이미 잭팟을 품고 있다.** `slot.js` 가 지급 시점에
 *    `lastWin = result.spinWin + lastJackpot` 으로 담기 때문이다 (결제 순서 P3).
 *    2026-08-30 이전에는 표시 쪽이 이것을 「라인 당첨」으로 읽고 잭팟을 한 번 더 더해
 *    WIN 칸이 실제 지급액보다 **잭팟 전액만큼 많았다** (실측 25,022 vs 20,021).
 *    인자 이름이 `spinWin` 이라 계약을 속였다 — 그래서 이름을 `paidTotal` 로 바꿨다.
 *
 * @param {number} paidTotal 이번 스핀 지급액 — **잭팟 포함**
 * @param {number} jackpotWon 그중 잭팟 몫 (배너에 서는 숫자)
 * @returns {{total:number, jackpot:number, line:number}}
 */
export function jackpotAmounts(paidTotal, jackpotWon) {
  const total = Number.isFinite(paidTotal) ? paidTotal : 0;
  const jackpot = Number.isFinite(jackpotWon) ? jackpotWon : 0;
  // 🔴 숫자가 이상해도 화면은 선다 (R5) — 라인 당첨분이 음수로 내려가지 않는다
  return { total, jackpot, line: Math.max(0, total - jackpot) };
}

export function easeJackpot(k) {
  return k < 0.9 ? (k / 0.9) * 0.82 : 0.82 + ((k - 0.9) / 0.1) * 0.18;
}

/** 단계 비율을 지키며 총 시간을 맞춘다. 반올림 오차는 마지막 단계가 흡수한다. */
function scaleTo(steps, target) {
  const src = steps.reduce((a, s) => a + s.ms, 0);
  const out = steps.map((s) => ({ id: s.id, ms: Math.round((s.ms * target) / src) }));
  out[out.length - 1].ms += target - out.reduce((a, s) => a + s.ms, 0);
  return out;
}

/**
 * 연출 계획을 세운다. **시간 계산은 여기서만** 한다 — 화면도 타이머도 모른다.
 * @returns {{steps: {id:string, ms:number}[], total: number}}
 */
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

/**
 * 코인 **공급 기간** — 언제까지 새 코인을 뿌릴 것인가.
 *
 * 🔴 v4.1 에서 «코인비가 연출보다 1.35초 먼저 말랐다» 를 고치며 3,100ms 로 튜닝했는데,
 *    그 값은 정확히 **4,000 − 900** 이었다. 즉 *"가장 빠른 코인(근경)이 화면을 다
 *    지나는 시간만 남기고 끝낸다"* 는 규칙이 이미 거기 있었다.
 *    연출이 5,700ms 로 길어져도 **같은 규칙**을 쓰면 다시 마르지 않는다.
 *
 * ⛔ 늘려야 하는 것은 **공급 기간**이지 낙하 시간이 아니다.
 *    `dur` 까지 늘리면 코인이 느려져 레퍼런스 실측(약 960px/s)에서 벗어난다.
 */
function supplyFor(total, timeScale) {
  return Math.round(total - MS_NEAR * timeScale);
}

/**
 * 뿌릴 코인 **개수** — 창이 길어지면 그만큼 더 뿌린다.
 *
 * 🔴 v4.1 의 주석이 이미 말하고 있었다: *"동시 65개를 유지하려면 수명(약 1.1초)보다
 *    창(2.6초)이 길므로 그만큼 더 뿌려야 한다."* 그런데 개수는 상수 하나였다.
 *    연출을 5,700ms 로 늘리자 **같은 135개가 더 긴 창에 흩어져 성겨졌다**
 *    (실측 Hit 순간 동시 50 → **27개**). 개수를 창에 매달아 밀도를 지킨다.
 *
 * ⚠️ 밀도는 `개수 × 수명 / 창` 이다. FAST 는 창과 수명이 **함께** 줄므로
 *    `supply / timeScale` 로 나누면 개수가 변하지 않는다 — 그래야 맞다.
 */
function rainCount(supply, timeScale) {
  return Math.round(RAIN * (supply / timeScale) / RAIN_STAGGER);
}

/** 원근 계층을 뽑는다 — 가까울수록 드물다 */
function pickLayer(r) {
  if (r < LAYER_MIX[0]) return 0;
  return r < LAYER_MIX[1] ? 1 : 2;
}

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * 🌧 강우 코인 — **화면 위에서 아래로** 쏟아진다. 레퍼런스의 지배적 요소다.
 *
 * ⛔ 크기·수명·늘임을 계층이 함께 정한다. 따로 뽑으면 「작고 빠르고 크게 늘어난 코인」
 *    같은 물리적으로 말이 안 되는 조합이 나온다.
 *
 * @param {{next:()=>number}} rng ⛔ 게임 난수를 넘기지 않는다
 */
export function planRain(rng, n = RAIN, scale = 1, supply = RAIN_STAGGER * scale) {
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const li = pickLayer(rng.next());
    const L = LAYERS[li];
    out.push({
      layer: li,
      x: Math.round(rng.next() * 100),                     // 시작 가로 위치 (%)
      drift: Math.round((rng.next() * 2 - 1) * 9),         // 떨어지며 옆으로 밀리는 정도
      size: round1(L.min + rng.next() * (L.max - L.min)),  // 지름 (vmin)
      dur: Math.round(L.ms * scale),
      stretch: L.stretch,
      tilt: Math.round((rng.next() * 2 - 1) * 40),         // 기울기 (deg)
      copper: rng.next() < 0.35,                           // 구리빛 섞기
      spin: Math.round(360 + rng.next() * 540),            // 한 바퀴 뒤집는 시간
      delay: Math.round(rng.next() * supply),
    });
  }
  return out;
}

/**
 * 🪙 분출 코인 — 중앙 하단에서 **튀어올랐다 떨어진다**. 강우의 조역이다.
 * 🔴 `fall > rise` — 정점을 지나 시작점보다 아래로 간다. 위로 사라지면 그건 연기다.
 */
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

/**
 * 🔴 최종 Hit 폭죽 — **화면 전역 5발** (대표님 지시 2026-08-29).
 *    중앙 한 발은 릴 안에서 터지는 것으로 읽힌다. 네 귀퉁이로 벌려야 화면 전체가 된다.
 *    시차를 조금 주지 않으면 다섯 발이 한 발로 뭉친다.
 */
export function planHitBursts() {
  return [
    { x: 50, y: 46, delay: 0 },
    { x: 18, y: 26, delay: 60 },
    { x: 82, y: 30, delay: 60 },
    { x: 26, y: 74, delay: 120 },
    { x: 76, y: 70, delay: 120 },
  ];
}

/** 폭죽 자리 — **세 발이 겹치면 한 발로 보인다.** 구역과 시차를 갈라 준다 */
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

