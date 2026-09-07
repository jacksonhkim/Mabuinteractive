/**
 * ui.js — 당첨 표시 (UI기획서 §4-2 · §6-2-4)
 *
 * 🔴 DOM 을 다루지만 **슬롯 안**에 둔다.
 *    당첨 라인을 어떻게 보여줄지는 이 슬롯의 규칙(25 페이라인·왼쪽부터 연속)에
 *    묶여 있어서, 다른 슬롯이 그대로 쓸 수 있는 것이 아니다.
 *    플랫폼으로 올리면 슬롯마다 분기가 생긴다.
 */
import { showWin } from './winshow.js';

const LINE_MS = 600;         // 라인당 표시 시간 (UI기획서 §5)
const COUNT_MIN_MS = 400;    // 카운트업 최소 시간
const COUNT_MAX_MS = 1600;   // 금액이 커도 이보다 오래 끌지 않는다

/**
 * 당첨 결과를 화면 표시용으로 편다 — 칸 집합과 라인 목록.
 * @param {object} result  evaluateSpin 결과
 * @param {number[][]} paylines
 */
function layoutWins(result, paylines) {
  const cells = new Set();
  const lines = [];
  for (const w of result.wins || []) {
    const rowsOfLine = paylines[w.line];
    if (!rowsOfLine) continue;
    // 앞에서부터 count 개까지가 당첨 구간이다 (§6-2 왼쪽부터 연속)
    for (let reel = 0; reel < w.count; reel += 1) cells.add(`${reel},${rowsOfLine[reel]}`);
    lines.push({ rows: rowsOfLine, count: w.count, no: w.line, pay: w.pay });
  }
  // 배당이 큰 라인부터 보여준다 — 먼저 눈에 들어와야 할 것이 먼저다
  lines.sort((a, b) => b.pay - a.pay);
  return { cells, lines };
}

/**
 * 여러 라인을 0.6초씩 **순차 점등**한다 (§6-2-4).
 * 한꺼번에 겹쳐 그리면 어느 심볼이 어느 라인인지 읽을 수 없다.
 */
export function lineAtTime(lines, now, t0) {
  if (!lines.length) return null;
  return lines[Math.floor((now - t0) / LINE_MS) % lines.length];
}

/**
 * WIN 카운트업 (§4-1).
 *
 * 🔴 숫자는 **지급이 끝난 뒤** 올라간다. 잔액은 그전에 확정돼 있다.
 *    틱은 60ms 마다 한 번만 — 매 프레임 울리면 소음이 된다.
 *
 * @returns {() => void} 취소 함수
 */
function countUp(amount, { onValue, onTick, onDone }) {
  const dur = Math.min(COUNT_MIN_MS + amount / 4, COUNT_MAX_MS);
  const t0 = performance.now();
  let raf = 0;
  let lastTick = 0;

  const step = (now) => {
    const k = Math.min((now - t0) / dur, 1);
    const eased = 1 - (1 - k) ** 2;
    onValue(Math.round(amount * eased));
    if (k < 1) {
      if (now - lastTick > 60) {
        lastTick = now;
        onTick(0.85 + eased * 0.9);      // 금액이 오를수록 높게
      }
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
      if (onDone) onDone();
    }
  };
  raf = requestAnimationFrame(step);
  return () => {
    if (raf) cancelAnimationFrame(raf);
  };
}

/**
 * 프리스핀 선택지를 그린다 (기획서 §8-2).
 *
 * 🔴 세 선택지는 **기대값이 같고 분산만 다르다**(스핀 × 배수 = 24).
 *    그래서 "무엇이 유리한가" 가 아니라 "어떤 리듬을 원하는가" 를 묻는 화면이다.
 *    trait 문구를 크게 보여 주는 이유가 그것이다.
 *
 * @param {HTMLElement} listEl
 * @param {Array<{id:string, spins:number, multiplier:number, trait:string}>} options
 * @param {(id: string) => void} onPick
 */
function renderChoice(listEl, options, onPick) {
  listEl.textContent = '';
  for (const o of options) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice-item';

    const spec = document.createElement('span');
    spec.className = 'spec';
    spec.textContent = `${o.spins}회 ×${o.multiplier}`;

    const trait = document.createElement('span');
    trait.className = 'trait';
    trait.textContent = o.trait;

    // 🔴 innerHTML 을 쓰지 않는다. 데이터가 JSON 에서 오므로
    //    문자열을 그대로 넣으면 그 값이 마크업으로 해석될 여지가 생긴다.
    b.append(spec, trait);
    b.addEventListener('click', () => onPick(o.id));
    listEl.appendChild(b);
  }
}

const fmt = (n) => n.toLocaleString('ko-KR');

/**
 * HUD 를 슬롯 상태에 묶는다 — CREDIT · BET · SPIN 활성 · 프리스핀 표시 · 선택 화면.
 *
 * 🔴 그리기는 하지 않는다. 릴은 애니메이션 루프가 맡는다 —
 *    양쪽이 같이 그리면 회전 중에 정지 화면이 끼어들어 튄다.
 *
 * @param {(sel: string) => HTMLElement} $
 * @param {object} slot
 * @param {(id: string) => void} onChoose
 * @returns {() => void} 구독 해지
 */
/** 총 획득 배너가 화면에 머무는 시간 — 카운트업이 끝난 뒤부터 */
const FS_TOTAL_HOLD_MS = 2200;

/**
 * 프리스핀 종료 — **총 획득** 연출 (대표님 지시 2026-08-25)
 *
 * 🔴 여기서 돈이 움직이지 않는다.
 *    지갑은 이미 매 스핀 `settle()` 에서 정산됐다 (결제 순서 P3).
 *    지급을 끝까지 미뤘다가 한 번에 주는 방식은 채택하지 않았다 —
 *    프리스핀 도중 브라우저가 닫히면 딴 돈이 통째로 증발하기 때문이다.
 *    이 화면은 **이미 받은 것을 합쳐 보여줄 뿐**이다.
 *
 * @param {(sel:string)=>HTMLElement} $
 * @param {number} total 프리스핀 동안 획득한 합계
 * @param {object} [hooks]
 * @returns {() => void} 취소
 */
function showFreeTotal($, total, hooks = {}) {
  const el = $('#fs-total');
  const num = $('#fs-total-num');
  // 🔴 하단 WIN 칸도 **같은 값**으로 함께 올린다 (대표님 결재 2026-08-30 ①안).
  //    프리스핀 내내 누적을 들던 칸이 마지막에만 그 스핀 금액으로 떨어져
  //    「총 획득 45,040 · WIN 3,760」 처럼 어긋나 보였다.
  const winEl = $('#win');
  if (!el || !num) return () => {};

  let hideTimer = 0;
  num.textContent = '0';
  el.classList.remove('hidden');

  const cancelCount = countUp(total, {
    onValue: (v) => { num.textContent = fmt(v); if (winEl) winEl.textContent = fmt(v); },
    onTick: hooks.onTick,
    onDone: () => {
      if (hooks.onDone) hooks.onDone();
      hideTimer = setTimeout(() => el.classList.add('hidden'), FS_TOTAL_HOLD_MS);
    },
  });

  return () => {
    cancelCount();
    if (hideTimer) clearTimeout(hideTimer);
    el.classList.add('hidden');
  };
}

/**
 * 당첨 표시 — 강조할 칸·라인을 계산하고 숫자와 문구를 화면에 올린다.
 *
 * 🔴 `main.js` 에서 옮겨 왔다. 그 파일이 300줄 상한(H1)에 닿았기 때문이다.
 *    줄을 줄이려고 주석이나 검증을 지우는 것은 본말전도다. **화면 일은 화면 파일로** 보낸다.
 *
 * @returns {{cells: Set<string>, lines: object[], cancel: (()=>void)|null}}
 */
export function presentWin($, s, paylines, sfx, fast = false, freeEnded = false) {
  const laid = layoutWins(s.result, paylines);

  // 🔴 카운트업·사운드·배너를 winshow 가 통째로 맡는다 (UI기획서 §6-2).
  //    예전에는 여기서 직접 countUp 을 돌렸는데, 등급 배너가 생기면서
  //    같은 숫자를 두 곳이 각자 올리게 되어 속도가 어긋났다. 주인을 하나로 둔다.
  const shown = showWin($, sfx, {
    // 🔴 마지막 프리스핀은 `s.freespin` 이 이미 없다 — 그래도 프리스핀으로 친다.
    //    아니면 그 스핀만의 카운트업이 합산 연출과 겹쳐 두 숫자가 싸운다 (2026-08-30)
    win: s.win, totalBet: s.bet, fast, inFree: Boolean(s.freespin) || freeEnded, roundEnd: freeEnded,
    jackpotWon: s.jackpot ? s.jackpot.won : 0,
  });
  // 프리스핀 중에는 하단 WIN 칸이 **누적값**을 든다 (대표님 지시 2026-08-25)
  if (s.freespin) $('#win').textContent = fmt(s.freespin.won);

  const tag = s.result.freespinTrigger ? ' · 프리스핀 트리거!'
    : s.result.seaBattleTrigger ? ' · 해전 트리거!'
    : s.result.legendaryTrigger ? ' · 레전더리 스핀!' : '';
  $('#hint').textContent = laid.lines.length
    ? `${laid.lines.length}개 라인 당첨${tag}`
    : `당첨${tag}`;

  return {
    cells: laid.cells, lines: laid.lines,
    cancel: shown.cancel, hold: shown.hold, effect: shown.effect,
  };
}

/** 프리스핀 종료 — 합산 연출을 띄운다 */
export function endFreespin($, total, sfx) {
  $('#hint').textContent = '';
  return showFreeTotal($, total, {
    onTick: (pitch) => sfx.play('count_tick', { pitch }),
    onDone: () => sfx.play('fanfare_big'),
  });
}

/** 잭팟 근접 연출이 켜지는 연속 수 — 4연속이 조건이므로 3부터 알린다 */
const JACKPOT_NEAR = 3;
/** 우측 패널 둘째 줄 — 프리스핀은 배수, 레전더리는 쌓인 WILD 수 (지시 2026-09-05) */
const mult = (f) => (f.multiplier > 1 ? `×${f.multiplier}` : (f.stuck ? `WILD ${f.stuck.reduce((n, r) => n + r.length, 0)}` : ''));

export function bindHud($, slot, onChoose, onTrigger = null) {
  const choiceEl = $('#choice');
  const plateEl = $('.jackpot-bar');
  const listEl = $('#choice-list');
  const fsEl = $('#fs-status');

  /** 연출이 도는 중이면 true — 구독이 여러 번 울려도 연출을 겹쳐 걸지 않는다 */
  let pendingChoice = false;

  const showChoice = (options) => {
    renderChoice(listEl, options, (id) => {
      onChoose(id);
      choiceEl.classList.add('hidden');
    });
    choiceEl.classList.remove('hidden');
  };

  return slot.subscribe((s) => {
    $('#credit').textContent = fmt(s.credit);
    $('#bet').textContent = fmt(s.bet);

    // 프리스핀 러너가 도는 동안 사용자 입력만 차단한다. 잔액 잠금이 아니다.
    $('#spin').disabled = s.awaitingChoice || Boolean(s.freespin) || !s.canSpin;

    // 🔴 패널은 **늘 떠 있다** (대표님 지시 2026-08-27).
    //    걸리지 않았을 때는 숨기지 않고 가라앉혀, 조건이 무엇인지 계속 보여 준다.
    if (s.freespin) {
      fsEl.classList.remove('idle');
      $('#fs-left').textContent = s.freespin.left;
      $('#fs-mult').textContent = mult(s.freespin);
    } else {
      fsEl.classList.add('idle');
      $('#fs-left').textContent = '—';
      $('#fs-mult').textContent = '대기';
    }
    const featureMode = Boolean(s.freespin) && !(s.jackpot && s.jackpot.won);
    plateEl.classList.toggle('feature-mode', featureMode);
    fsEl.classList.toggle('bonus', featureMode && Boolean(s.freespin.stuck));

    // 🔴 누적액을 실시간으로 띄운다. 예전에는 **시드 고정값**이 박혀 있었다.
    if (s.jackpot) $('#jackpot').textContent = fmt(s.jackpot.value);

    // 🔴 근접 연출 (결재 2026-08-25) — 거북선 라벨을 붙이는 대신 택한 방식.
    //    조건에 가까워진 **그 순간에만** 액자가 알려준다. 매 스핀 떠들지 않는다.
    const run = s.result ? s.result.jackpotRun || 0 : 0;
    plateEl.classList.toggle('near', !s.spinning && run >= JACKPOT_NEAR);

    // 🔴 선택 화면은 **연출이 끝난 뒤에** 뜬다 (연출기획서 §4-2).
    //    상태(`awaitingChoice`)는 이미 바뀌어 있다 — 그래야 연출 중 스핀이 막힌다.
    //    바뀌는 것은 **화면을 언제 보여주는가** 뿐이다.
    if (s.awaitingChoice && choiceEl.classList.contains('hidden') && !pendingChoice) {
      pendingChoice = true;
      const reveal = () => { pendingChoice = false; showChoice(s.options); };
      if (onTrigger) onTrigger(reveal);
      else reveal();                      // 연출을 안 쓰면 예전 그대로 즉시 뜬다
    }
    if (!s.awaitingChoice) {
      choiceEl.classList.add('hidden');
      pendingChoice = false;
    }
  });
}

/**
 * 하단 진단 문구 — 에셋·사운드가 몇 개나 실제로 준비됐는지.
 *
 * 🔴 "로드했다" 가 아니라 **"몇 개가 준비됐는가"** 를 보여 준다.
 *    R5 로 실패를 삼키므로, 이 줄이 없으면 빠진 것을 알 방법이 없다.
 */
export function reportStatus($, assets, sfx, { loaded, failed }) {
  const miss = assets.failed.length
    ? ` · 이미지 ${assets.failed.length}종 없음 (${assets.failed.join(', ')})`
    : '';
  const s = sfx.status;
  $('#meta').textContent =
    `에셋 ${assets.loaded}/${assets.total}${miss}`
    + ` · 사운드 파일 ${loaded}종 · 절차생성 ${s.synthesized}종`
    + `${failed ? ` · ${failed}종 없음` : ''}`;
}
