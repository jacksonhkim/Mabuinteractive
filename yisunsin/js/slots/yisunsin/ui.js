import { showWin } from './winshow.js';

const LINE_MS = 600;
const COUNT_MIN_MS = 400;
const COUNT_MAX_MS = 1600;

function layoutWins(result, paylines) {
  const cells = new Set();
  const lines = [];
  for (const w of result.wins || []) {
    const rowsOfLine = paylines[w.line];
    if (!rowsOfLine) continue;

    for (let reel = 0; reel < w.count; reel += 1) cells.add(`${reel},${rowsOfLine[reel]}`);
    lines.push({ rows: rowsOfLine, count: w.count, no: w.line, pay: w.pay });
  }

  lines.sort((a, b) => b.pay - a.pay);
  return { cells, lines };
}

export function lineAtTime(lines, now, t0) {
  if (!lines.length) return null;
  return lines[Math.floor((now - t0) / LINE_MS) % lines.length];
}

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
        onTick(0.85 + eased * 0.9);
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

    b.append(spec, trait);
    b.addEventListener('click', () => onPick(o.id));
    listEl.appendChild(b);
  }
}

const fmt = (n) => n.toLocaleString('ko-KR');

const FS_TOTAL_HOLD_MS = 2200;

function showFreeTotal($, total, hooks = {}) {
  const el = $('#fs-total');
  const num = $('#fs-total-num');

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

export function presentWin($, s, paylines, sfx, fast = false, freeEnded = false) {
  const laid = layoutWins(s.result, paylines);

  const shown = showWin($, sfx, {

    win: s.win, totalBet: s.bet, fast, inFree: Boolean(s.freespin) || freeEnded, roundEnd: freeEnded,
    jackpotWon: s.jackpot ? s.jackpot.won : 0,
  });

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

export function endFreespin($, total, sfx) {
  $('#hint').textContent = '';
  return showFreeTotal($, total, {
    onTick: (pitch) => sfx.play('count_tick', { pitch }),
    onDone: () => sfx.play('fanfare_big'),
  });
}

const JACKPOT_NEAR = 3;

const mult = (f) => (f.multiplier > 1 ? `×${f.multiplier}` : (f.stuck ? `WILD ${f.stuck.reduce((n, r) => n + r.length, 0)}` : ''));

export function bindHud($, slot, onChoose, onTrigger = null) {
  const choiceEl = $('#choice');
  const plateEl = $('.jackpot-bar');
  const listEl = $('#choice-list');
  const fsEl = $('#fs-status');

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

    $('#spin').disabled = s.awaitingChoice || Boolean(s.freespin) || !s.canSpin;

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

    if (s.jackpot) $('#jackpot').textContent = fmt(s.jackpot.value);

    const run = s.result ? s.result.jackpotRun || 0 : 0;
    plateEl.classList.toggle('near', !s.spinning && run >= JACKPOT_NEAR);

    if (s.awaitingChoice && choiceEl.classList.contains('hidden') && !pendingChoice) {
      pendingChoice = true;
      const reveal = () => { pendingChoice = false; showChoice(s.options); };
      if (onTrigger) onTrigger(reveal);
      else reveal();
    }
    if (!s.awaitingChoice) {
      choiceEl.classList.add('hidden');
      pendingChoice = false;
    }
  });
}

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
