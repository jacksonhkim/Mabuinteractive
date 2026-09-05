/**
 * freetrigger.js — FREE(난중일기) 트리거 연출 (연출기획서 §4)
 *
 * 🔴 왜 이 파일이 따로 있나
 *    `slot.js` 는 판정과 동시에 `awaitingChoice = true` 로 바꾼다. 그래서 지금까지는
 *    "당첨됐다"는 순간이 **없이** 선택 화면이 곧바로 떴다.
 *    그렇다고 `slot.js` 에 `await 연출()` 을 넣을 수는 없다 — 슬롯은 DOM 을 모르는 것이
 *    경계 B3 이고, 그 덕에 슬롯 테스트가 화면 없이 돈다.
 *    → **상태는 즉시 바꾸고, 화면만 늦춘다.** 그 "늦춤"이 이 파일이다.
 *
 * 🔴 이 파일이 지켜야 하는 단 하나
 *    **연출이 무슨 일을 당해도 선택 화면은 뜬다.** 연출은 곁들임이고 게임 진행이 본체다.
 *    사운드가 터져도 스핀이 성공해야 한다는 기존 원칙(R5)과 같은 방어다.
 *
 * ⛔ 여기서 `autoplay` · `freespin_runner` 를 import 하지 않는다.
 *    연출이 스케줄링을 알기 시작하면 둘을 따로 시험할 수 없게 된다.
 */

/** 기본 시퀀스 (§4-3) — 다섯 단계의 합이 곧 총 시간이다 */
const STEPS = [
  { id: 'glow', ms: 350 },   // 난중일기 심볼 3개 발광·고정
  { id: 'dim',  ms: 250 },   // 프레임 **안쪽만** 어둡게
  { id: 'hold', ms: 300 },   // 정지 — 숨 고르기
  { id: 'hit',  ms: 200 },   // 타격음 + 약한 흔들림
  { id: 'wipe', ms: 400 },   // 금빛 번짐
];

/**
 * 🔴 재트리거 축약본 — 발광과 타격만.
 *    프리스핀은 **자동 진행**이라 12회 도는 동안 매번 1.5초가 붙으면 통째로 늘어난다.
 *    `winshow.js` 가 프리스핀 중 WIN 등급을 건너뛰는 것과 같은 판단이다.
 */
const RETRIGGER_STEPS = [
  { id: 'glow', ms: 300 },
  { id: 'hit',  ms: 200 },
];

export const TOTAL_MS = 1500;
export const FAST_SCALE = 0.4;
/** 🔴 FAST 라도 이 아래로 내려가면 연출이 "깜빡"으로만 보인다 */
export const FAST_MIN_MS = 600;
/** 재트리거는 이미 가장 짧다 — FAST 로 더 줄이지 않는다 */
export const RETRIGGER_MS = 500;
/** 등급 배너와 겹칠 때 배너를 줄이는 비율 (§4-4) */
export const TIER_SHRINK = 0.6;

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
export function planFreeTrigger({ fast = false, retrigger = false } = {}) {
  if (retrigger) return { steps: RETRIGGER_STEPS.map((s) => ({ ...s })), total: RETRIGGER_MS };
  if (!fast) return { steps: STEPS.map((s) => ({ ...s })), total: TOTAL_MS };
  const target = Math.max(Math.round(TOTAL_MS * FAST_SCALE), FAST_MIN_MS);
  return { steps: scaleTo(STEPS, target), total: target };
}

/**
 * 스핀 종료 전체 일정. **돈 먼저, 사건 나중** (결제 순서 W-1~W-4 와 같은 순서다).
 *
 * 🔴 등급 배너와 트리거가 동시에 터지면 LEGENDARY 기준 5.0 + 1.5 = 6.5초가 된다.
 *    너무 길다. 겹칠 때만 배너를 60% 로 줄여 4.5초에 묶는다.
 */
export function planSpinEnd({
  tierMs = 0, hasTrigger = false, fast = false, retrigger = false,
} = {}) {
  const shrunk = hasTrigger ? Math.round(tierMs * TIER_SHRINK) : tierMs;
  const triggerMs = hasTrigger ? planFreeTrigger({ fast, retrigger }).total : 0;
  return { tierMs: shrunk, triggerStartsAt: shrunk, triggerMs, total: shrunk + triggerMs };
}

/** 연출이 걸치는 클래스 — 끝나면 전부 걷는다 */
const PANEL_CLASSES = ['fx-dim', 'fx-wipe', 'shake-1'];

/**
 * 연출을 재생하고, **끝난 뒤에** 선택 화면을 띄운다.
 *
 * @param {object} o
 * @param {(sel:string)=>HTMLElement} o.$
 * @param {{play:(id:string)=>unknown}} o.sfx
 * @param {(fn:()=>void, ms:number)=>unknown} [o.timer] 주입 가능 — 테스트가 시간을 안 기다린다
 * @param {boolean} [o.auto] AUTO 진행 중이면 스킵을 무시한다
 * @param {()=>void} o.showChoice 선택 화면을 띄우는 일. 이 파일은 방법을 모른다
 * @returns {{total:number, skip:()=>void, cancel:()=>void}}
 */
export function playFreeTrigger({
  $, sfx, timer = setTimeout, fast = false, retrigger = false, auto = false,
  showChoice = () => {},
} = {}) {
  const plan = planFreeTrigger({ fast, retrigger });
  let done = false;

  /** 🔴 연출은 실패해도 된다. 게임은 실패하면 안 된다. (R5) */
  const safely = (fn) => { try { fn(); } catch { /* 무시 — 아래에서 반드시 진행한다 */ } };

  const cleanup = () => {
    for (const c of PANEL_CLASSES) safely(() => $('.reel-panel').classList.remove(c));
    safely(() => $('#reels').classList.remove('fx-glow'));
  };

  const finish = () => {
    if (done) return;
    done = true;
    cleanup();
    showChoice();
  };

  const STEP = {
    glow: () => { $('#reels').classList.add('fx-glow'); },
    dim:  () => { $('.reel-panel').classList.add('fx-dim'); },
    hold: () => {},
    // 🔴 트리거 사운드는 **여기서** 운다. 판정 순간이 아니라 타격 박자에 맞춘다.
    hit:  () => { sfx.play('trigger_free'); $('.reel-panel').classList.add('shake-1'); },
    wipe: () => { $('.reel-panel').classList.add('fx-wipe'); },
  };

  let at = 0;
  for (const s of plan.steps) {
    const run = STEP[s.id];
    timer(() => { if (!done) safely(run); }, at);
    at += s.ms;
  }
  timer(finish, at);

  return {
    total: plan.total,
    /** 사람이 건너뛴다. ⛔ AUTO 중에는 무시 — 보고 있지 않은 사람의 클릭이 아니다 */
    skip() { if (!auto) finish(); },
    /** 탭 이탈·강제 종료 — 화면만 걷고 선택 화면은 띄우지 않는다 */
    cancel() { done = true; cleanup(); },
  };
}
