/**
 * jackpotfx.js — JACKPOT 연출의 **재생** (연출기획서 §6)
 *
 * 🔴 없던 것은 기능이 아니라 「끝나는 순간」이었다.
 *    `winshow.js` 의 `jackpotShow()` 는 배너·카운트업·금액 확정·스킵을 이미 하고 있었다.
 *    → 대체하지 않고 앞뒤에 얹는다. 카운트업 본체는 여전히 `winshow.js` 것이다.
 *
 * 🔴 지금까지 이 연출이 두 번 틀렸다. 둘 다 「보이는 것」을 안 재서 생겼다.
 *    ① 타임라인 4,016ms 는 명세와 맞았는데 **최종 Hit 가 안 터졌다**
 *       (첫 섬광 밝기 +91.9 vs Hit +0.3) — 같은 `animation-name` 은 재생되지 않는다.
 *    ② 코인이 **릴 안에 갇혀 있었다** — `.reel-panel { isolation: isolate }` 가
 *       자체 층을 만들어 z-index 로는 절대 못 나온다. 그래서 상자가 **body 직계**다.
 *
 * 🔴 이 파일이 지켜야 하는 단 하나
 *    **연출이 무슨 일을 당해도 금액은 확정된다.** 받은 돈이 화면에 안 뜨면 그건 사고다 (R5 · #37).
 *
 * ⛔ 계산은 여기 없다. `jackpotplan.js` 가 갖는다 — 화면과 시간을 한 파일에 두지 않는다.
 */
import {
  RAYS, HIT_COINS, JP_FX_SEED, TOTAL_MS,
  planJackpot, planRain, planCoins, planBursts, planHitBursts,
} from './jackpotplan.js';
import { createRng } from './rng.js';

const styleOf = (o) => `--s:${o.size}vmin;--tilt:${o.tilt}deg;`
  + `--spin:${o.spin}ms;--d:${o.delay}ms`;

/** 강우 코인 하나 — CSS 변수만 실어 보낸다. `document` 를 쓰지 않는다 */
function rainSpan(c) {
  return `<span class="coin rain L${c.layer}${c.copper ? ' cu' : ''}" style="left:${c.x}%;`
    + `--drift:${c.drift}vw;--dur:${c.dur}ms;--stretch:${c.stretch};${styleOf(c)}"></span>`;
}

/** 분출 코인 하나 */
function coinSpan(c) {
  return `<span class="coin pop L${c.layer}${c.copper ? ' cu' : ''}" style="left:${c.x}%;`
    + `--dx:${c.dx};--rise:${c.rise};--fall:${c.fall};${styleOf(c)}"></span>`;
}

/** 폭죽 한 발 — 갈래 각도는 CSS 가 `--i` 로 준다 */
function burstHtml(b, big = false) {
  const rays = Array.from({ length: RAYS }, (_, i) => `<i style="--i:${i}"></i>`).join('');
  return `<span class="burst${big ? ' big' : ''}" `
    + `style="--bx:${b.x}%;--by:${b.y}%;--d:${b.delay}ms">${rays}</span>`;
}

/** 연출이 걸치는 클래스 — 끝나면 전부 걷는다 */
const BANNER_CLASSES = ['jp-flash', 'jp-scale', 'jp-hit'];

/**
 * 연출을 재생한다. 카운트업은 **부르는 쪽이** 갖는다.
 *
 * @param {object} o
 * @param {(sel:string)=>HTMLElement} o.$
 * @param {{play:(id:string)=>unknown}} o.sfx
 * @param {(fn:()=>void, ms:number)=>unknown} [o.timer] 주입 가능 — 테스트가 시간을 안 기다린다
 * @param {boolean} [o.fast]
 * @param {boolean} [o.auto] AUTO 진행 중이면 스킵을 무시한다
 * @param {{next:()=>number}} [o.rngFx] ⛔ 게임 난수를 넘기지 않는다
 * @param {(ms:number)=>void} [o.onCount]  카운트업 시작 — 이 시간 안에 끝내라는 뜻
 * @param {()=>void} [o.onSettle] 🔴 최종 금액 확정. **무슨 일이 있어도 불린다**
 * @param {()=>void} [o.onEnd]    배너를 걷는다
 * @returns {{total:number, skip:()=>void, cancel:()=>void}}
 */
export function playJackpotFx({
  $, sfx, timer = setTimeout, fast = false, auto = false,
  rngFx = createRng(JP_FX_SEED),
  onCount = () => {}, onSettle = () => {}, onEnd = () => {},
  onLine = () => {}, onTotal = () => {}, hasLine = true,
} = {}) {
  const plan = planJackpot({ fast, hasLine });
  // 🔴 FAST 는 연출이 40% 로 줄어든다. 코인의 시차와 수명도 같이 줄이지 않으면
  //    배너가 걷힌 뒤에도 코인이 남아 다음 스핀 위로 떨어진다.
  // ⛔ **연출이 길어졌다고 코인을 느리게 만들지 않는다.** 늘리는 것은 공급 기간뿐이다.
  const scale = plan.timeScale;
  let done = false;
  let settled = false;

  /** 🔴 연출은 실패해도 된다. 지급 표시는 실패하면 안 된다. (R5) */
  const safely = (fn) => { try { fn(); } catch { /* 무시 — 아래에서 반드시 확정한다 */ } };

  /** 최종 금액 확정 — 두 번 불러도 한 번만 먹는다 */
  const settle = () => {
    if (settled) return;
    settled = true;
    safely(onSettle);
  };

  const cleanup = () => {
    for (const c of BANNER_CLASSES) safely(() => $('#winbanner').classList.remove(c));
    safely(() => $('#jp-ring').classList.remove('jp-ring-on'));
    safely(() => $('.reel-panel').classList.remove('shake-2'));
    safely(() => $('#jp-sky').classList.remove('jp-lit'));
    // ⛔ 비우지 않으면 다음 잭팟에 코인이 쌓인다
    safely(() => { $('#jp-sky').innerHTML = ''; });
    safely(() => { $('#jp-sky-hit').innerHTML = ''; });
  };

  const finish = () => {
    if (done) return;
    done = true;
    settle();                 // 아직 확정 전이면 여기서라도 확정한다
    cleanup();
    safely(onEnd);
  };

  const STEP = {
    // 🔴 잭팟 사운드는 **연출이** 운다. 소리의 주인은 연출이다 (#42)
    flash: () => {
      $('#winbanner').classList.add('jp-flash');
      // 🔴 금빛 비네트는 **가장자리만** 물들인다 — 가운데를 덮으면 금액이 죽는다
      $('#jp-sky').style.setProperty('--lit', `${plan.total}ms`);
      $('#jp-sky').classList.add('jp-lit');
      sfx.play('jackpot');
    },
    scale: () => { $('#winbanner').classList.add('jp-scale'); },
    count: () => {
      const rain = planRain(rngFx, plan.rain, scale, plan.supply).map(rainSpan).join('');
      const pops = planCoins(rngFx, undefined, scale).map(coinSpan).join('');
      const bursts = planBursts(rngFx).map((b) => burstHtml(b)).join('');
      $('#jp-sky').innerHTML = rain + pops + bursts;
    },
    // 🔴 마지막 한 방 — 여기가 이 연출의 이유다. 다섯 가지가 **동시에** 걸린다.
    hit: () => {
      sfx.play('impact_promote');
      $('#winbanner').classList.add('jp-hit');          // ① 재섬광 (별도 키프레임)
      $('#jp-ring').classList.add('jp-ring-on');        // ② 충격파 링 — 금액 자리에 남긴다
      $('.reel-panel').classList.add('shake-2');        // ③ 흔들림
      // ④⑤ 코인 일제 분출 + 대형 폭죽. ⛔ 상자를 따로 쓴다 (위 주석 참조)
      const coins = planCoins(rngFx, HIT_COINS, scale).map(coinSpan).join('');
      // 🔴 중앙 한 발은 릴 안에서 터지는 것으로 읽힌다 — 화면 전역 5발이다
      const big = planHitBursts().map((b) => burstHtml(b, true)).join('');
      $('#jp-sky-hit').innerHTML = coins + big;
    },
    // 🆕 ② 라인 당첨 줄이 떠오른다 · ③ 총액 카운트업 — 숫자는 표시 쪽(`jackpotwin.js`)이 쓴다
    line: () => {},
    total: () => {},
    hold: () => {},
  };

  let at = 0;
  for (const s of plan.steps) {
    const { id, ms } = s;
    timer(() => {
      if (done) return;
      // ⛔ 아래 둘은 `safely` 밖이다 — 화면이 터져도 게임 표시는 진행돼야 한다
      if (id === 'count') safely(() => onCount(ms));
      if (id === 'line') safely(() => onLine(ms));
      if (id === 'total') safely(() => onTotal(ms));
      // 🔴 확정은 **절정에서** 한다 — hit 이 총액 뒤로 갔으므로 여기가 마지막 숫자다
      if (id === 'hit') settle();
      safely(STEP[id]);
    }, at);
    at += ms;
  }
  timer(finish, at);

  return {
    total: plan.total,
    /** 사람이 건너뛴다. ⛔ AUTO 중에는 무시 — 보고 있지 않은 사람의 클릭이 아니다 */
    skip() { if (!auto) finish(); },
    /** 새 스핀·강제 종료 — 금액은 확정하고 화면을 걷는다 */
    cancel: finish,
  };
}
