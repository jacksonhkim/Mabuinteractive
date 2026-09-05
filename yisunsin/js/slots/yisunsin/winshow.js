/**
 * winshow.js — 당첨 등급 연출 (UI기획서 §6-2)
 *
 * 🔴 임계값은 감이 아니다.
 *    확정 배당표로 **50만 스핀을 돌려 실제 당첨 배수 분포를 측정**한 뒤,
 *    "얼마나 드물게 나오는가" 를 기준으로 갈랐다 (§6-2-1).
 *      WIN 1/11 · BIG 1/55 · MEGA 1/469 · LEGENDARY 1/10,870
 *
 * 🔴 이 파일의 핵심은 **승격**이다 (§6-2-3).
 *    최종 등급으로 바로 가지 않는다. BIG 부터 시작해 숫자가 오르면서 승격한다.
 *    기대감은 최종 금액이 아니라 **올라가는 과정**에서 나오기 때문이다.
 *    처음부터 LEGENDARY 를 띄우면 5초 동안 이미 아는 결과를 보고만 있게 된다.
 *
 * ⛔ 돈은 여기서 움직이지 않는다. 지급은 `slot.settle()` 에서 이미 끝났다 (결제 순서 P3).
 *    이 파일은 **이미 받은 것을 보여줄 뿐**이다.
 */

import { jackpotShow } from './jackpotwin.js';

// 연출 시간 (§6-2-4). 이름을 붙여 선언한다 — 식 한복판에 박힌 수치가 아니다.
const MS_WIN = 800;
const MS_BIG = 2000;
const MS_MEGA = 3500;
const MS_LEGENDARY = 5000;

/** 등급 임계 — 총베팅 배수 (§6-2-2) */
const X_BIG = 10;
const X_MEGA = 30;
const X_LEGENDARY = 100;

const PROMOTE_FLASH_MS = 150;   // 승격 섬광 (§6-2-3)
const PROMOTE_PAUSE_MS = 200;   // 승격 직후 숨 고르기
const POP_RISE_PX = 34;

/**
 * 등급표. `min` 은 총베팅 배수 기준이다.
 * @type {{id:string,label:string,min:number,ms:number,sfx:string,shake:number}[]}
 */
const TIERS = [
  { id: 'win', label: '', min: 1, ms: MS_WIN, sfx: 'win_small', shake: 0 },
  { id: 'big', label: 'BIG WIN', min: X_BIG, ms: MS_BIG, sfx: 'fanfare_big', shake: 1 },
  { id: 'mega', label: 'MEGA WIN', min: X_MEGA, ms: MS_MEGA, sfx: 'fanfare_mega', shake: 2 },
  {
    id: 'legendary', label: 'LEGENDARY WIN', min: X_LEGENDARY,
    ms: MS_LEGENDARY, sfx: 'fanfare_legendary', shake: 3,
  },
];

/**
 * 당첨 배수로 등급을 고른다.
 * @param {number} win 당첨액
 * @param {number} totalBet 총베팅
 * @returns {object} TIERS 의 한 항목
 */
export function tierOf(win, totalBet) {
  const x = totalBet > 0 ? win / totalBet : 0;
  let hit = TIERS[0];
  for (const t of TIERS) if (x >= t.min) hit = t;
  return hit;
}

/** 일반 WIN 심볼 연출과 상위 등급·잭팟의 소유권을 한 곳에서 판정한다. */
export function effectOf(win, totalBet, { inFree = false, jackpotWon = 0, roundEnd = false } = {}) {
  if (jackpotWon > 0) return 'jackpot';
  // 🔴 라운드 **마지막 스핀**은 등급 배너를 건너뛴다 (대표님 지시 2026-09-05).
  //    총 획득 연출과 둘 다 WIN 칸을 써서 숫자가 싸우고 글자가 겹친다(영상 101.5초).
  //    그 금액은 어차피 총 획득에 포함돼 있다.
  if (roundEnd) return null;
  const id = tierOf(win, totalBet).id;
  return id === 'win' && inFree ? null : id;
}

const fmt = (n) => n.toLocaleString('ko-KR');

/** 등급별 카운트업 이징 (§6-2-4) — 위로 갈수록 뜸을 들인다 */
function ease(id, k) {
  if (id === 'legendary') return k < 0.9 ? k / 0.9 * 0.82 : 0.82 + (k - 0.9) / 0.1 * 0.18;
  if (id === 'mega') return 1 - (1 - k) ** 3;
  if (id === 'big') return 1 - (1 - k) ** 2;
  return k;                       // WIN 은 선형
}

/**
 * 당첨 연출을 재생한다.
 *
 * @param {(sel:string)=>HTMLElement} $
 * @param {object} sfx
 * @param {object} o
 * @param {number} o.win        당첨액
 * @param {number} o.totalBet   총베팅 — 등급 판정 기준
 * @param {boolean} [o.fast]    FAST 면 40% 로 단축 (§6-1)
 * @param {boolean} [o.inFree]  프리스핀 중인가
 * @param {boolean} [o.roundEnd] 라운드 마지막 스핀인가 — 등급 배너를 건너뛴다
 * @param {number} [o.jackpotWon] 이번 스핀에 받은 누적 보너스
 * @returns {{hold:number, cancel:()=>void}} hold — 자동 스핀이 기다려야 할 시간(ms)
 */
export function showWin($, sfx, { win, totalBet, fast = false, inFree = false, jackpotWon = 0, roundEnd = false }) {
  const scale = fast ? 0.4 : 1;
  const effect = effectOf(win, totalBet, { inFree, jackpotWon, roundEnd });

  // 🔴 잭팟이 터졌으면 등급 연출을 하지 않는다.
  //    잭팟 금액은 늘 100배를 넘어 LEGENDARY 로 잡히는데, 두 연출이 겹치면
  //    유저는 무엇 때문에 받았는지 알 수 없다. 잭팟이 우선한다.
  if (effect === 'jackpot') {
    return { ...jackpotShow($, sfx, jackpotWon, win, scale), effect };
  }
  const setNum = (v) => { $('#win').textContent = fmt(v); };

  // 🔴 프리스핀 중 WIN 등급은 건너뛴다 (대표님 결재 2026-08-25).
  //    마지막에 합산 연출이 따로 오므로, 매 스핀 띄우면 겹친다.
  //    BIG 이상은 그 자체로 사건이므로 프리스핀 중에도 보여준다.
  if (!effect) return { hold: 0, cancel: () => {}, effect: null };

  if (effect === 'win') return { ...small($, sfx, win, scale, setNum), effect };
  return { ...grand($, sfx, { win, totalBet, scale, setNum }), effect };
}

/** WIN 등급 — 배너 대신 금액이 떠올랐다 사라진다 (대표님 결재 2026-08-25) */
function small($, sfx, win, scale, setNum) {
  const pop = $('#winpop');
  const dur = MS_WIN * scale;
  let raf = 0;

  if (pop) {
    pop.textContent = `+${fmt(win)}`;
    pop.classList.remove('hidden');
    pop.style.setProperty('--rise', `${POP_RISE_PX}px`);
    pop.style.animationDuration = `${dur}ms`;
  }
  sfx.play('win_small');

  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min((now - t0) / dur, 1);
    setNum(Math.round(win * k));
    if (k < 1) raf = requestAnimationFrame(step);
    else if (pop) pop.classList.add('hidden');
  };
  raf = requestAnimationFrame(step);

  return {
    hold: dur,
    cancel() {
      if (raf) cancelAnimationFrame(raf);
      setNum(win);
      if (pop) pop.classList.add('hidden');
    },
  };
}

/** BIG 이상 — 배너 + 승격 (§6-2-3) */
function grand($, sfx, { win, totalBet, scale, setNum }) {
  const el = $('#winbanner');
  const tierEl = $('#wb-tier');
  const numEl = $('#wb-num');
  const panel = $('#reels') && $('#reels').closest('.reel-panel');

  const final = tierOf(win, totalBet);
  const dur = final.ms * scale;
  // 🔴 언제나 BIG 부터 시작한다 (§6-2-3)
  let cur = TIERS[1];
  let raf = 0;
  let pauseUntil = 0;
  let done = false;

  const paint = (t) => {
    if (!el) return;
    el.className = `winbanner t-${t.id}`;
    if (tierEl) tierEl.textContent = t.label;
    if (panel) {
      panel.classList.remove('shake-1', 'shake-2', 'shake-3');
      // 다시 붙이기 전에 리플로를 강제해야 같은 클래스가 재생된다
      void panel.offsetWidth;
      panel.classList.add(`shake-${t.shake}`);
    }
  };

  if (el) {
    el.classList.remove('hidden');
    if (numEl) numEl.textContent = '0';
  }
  paint(cur);
  sfx.play(cur.sfx);

  const finish = () => {
    if (done) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    setNum(win);
    if (numEl) numEl.textContent = fmt(win);
    if (el) el.classList.add('hidden');
    if (panel) panel.classList.remove('shake-1', 'shake-2', 'shake-3');
  };

  const t0 = performance.now();
  const step = (now) => {
    if (now < pauseUntil) {
      raf = requestAnimationFrame(step);
      return;
    }
    const k = Math.min((now - t0) / dur, 1);
    const v = Math.round(win * ease(final.id, k));
    setNum(v);
    if (numEl) numEl.textContent = fmt(v);

    // 🔴 승격 — 카운트업 숫자가 상위 임계를 **넘는 순간**
    const next = TIERS[TIERS.indexOf(cur) + 1];
    if (next && next.min <= final.min && v / totalBet >= next.min) {
      cur = next;
      paint(cur);
      if (el) {
        el.classList.add('promote');
        setTimeout(() => el.classList.remove('promote'), PROMOTE_FLASH_MS);
      }
      sfx.play('impact_promote');
      sfx.play(cur.sfx);
      pauseUntil = now + PROMOTE_PAUSE_MS * scale;   // 숨을 고르게 한다
    }

    if (k < 1) raf = requestAnimationFrame(step);
    else finish();
  };
  raf = requestAnimationFrame(step);

  // 클릭하면 즉시 끝난다 (§6-2-4 스킵)
  if (el) el.addEventListener('pointerdown', finish, { once: true });

  return { hold: dur, cancel: finish };
}
