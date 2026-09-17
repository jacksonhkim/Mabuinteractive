import { jackpotShow } from './jackpotwin.js';

const MS_WIN = 800;
const MS_BIG = 2000;
const MS_MEGA = 3500;
const MS_LEGENDARY = 5000;

const X_BIG = 10;
const X_MEGA = 30;
const X_LEGENDARY = 100;

const PROMOTE_FLASH_MS = 150;
const PROMOTE_PAUSE_MS = 200;
const POP_RISE_PX = 34;

const TIERS = [
  { id: 'win', label: '', min: 1, ms: MS_WIN, sfx: 'win_small', shake: 0 },
  { id: 'big', label: 'BIG WIN', min: X_BIG, ms: MS_BIG, sfx: 'fanfare_big', shake: 1 },
  { id: 'mega', label: 'MEGA WIN', min: X_MEGA, ms: MS_MEGA, sfx: 'fanfare_mega', shake: 2 },
  {
    id: 'legendary', label: 'LEGENDARY WIN', min: X_LEGENDARY,
    ms: MS_LEGENDARY, sfx: 'fanfare_legendary', shake: 3,
  },
];

export function tierOf(win, totalBet) {
  const x = totalBet > 0 ? win / totalBet : 0;
  let hit = TIERS[0];
  for (const t of TIERS) if (x >= t.min) hit = t;
  return hit;
}

export function effectOf(win, totalBet, { inFree = false, jackpotWon = 0, roundEnd = false } = {}) {
  if (jackpotWon > 0) return 'jackpot';

  if (roundEnd) return null;
  const id = tierOf(win, totalBet).id;
  return id === 'win' && inFree ? null : id;
}

const fmt = (n) => n.toLocaleString('ko-KR');

function ease(id, k) {
  if (id === 'legendary') return k < 0.9 ? k / 0.9 * 0.82 : 0.82 + (k - 0.9) / 0.1 * 0.18;
  if (id === 'mega') return 1 - (1 - k) ** 3;
  if (id === 'big') return 1 - (1 - k) ** 2;
  return k;
}

export function showWin($, sfx, { win, totalBet, fast = false, inFree = false, jackpotWon = 0, roundEnd = false }) {
  const scale = fast ? 0.4 : 1;
  const effect = effectOf(win, totalBet, { inFree, jackpotWon, roundEnd });

  if (effect === 'jackpot') {
    return { ...jackpotShow($, sfx, jackpotWon, win, scale), effect };
  }
  const setNum = (v) => { $('#win').textContent = fmt(v); };

  if (!effect) return { hold: 0, cancel: () => {}, effect: null };

  if (effect === 'win') return { ...small($, sfx, win, scale, setNum), effect };
  return { ...grand($, sfx, { win, totalBet, scale, setNum }), effect };
}

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

function grand($, sfx, { win, totalBet, scale, setNum }) {
  const el = $('#winbanner');
  const tierEl = $('#wb-tier');
  const numEl = $('#wb-num');
  const panel = $('#reels') && $('#reels').closest('.reel-panel');

  const final = tierOf(win, totalBet);
  const dur = final.ms * scale;

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
      pauseUntil = now + PROMOTE_PAUSE_MS * scale;
    }

    if (k < 1) raf = requestAnimationFrame(step);
    else finish();
  };
  raf = requestAnimationFrame(step);

  if (el) el.addEventListener('pointerdown', finish, { once: true });

  return { hold: dur, cancel: finish };
}
