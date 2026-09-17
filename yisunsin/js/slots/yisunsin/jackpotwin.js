import { playJackpotFx } from './jackpotfx.js';
import { easeJackpot, jackpotAmounts } from './jackpotplan.js';
import { liftOverlay, showStage } from './overlay.js';

const fmt = (n) => n.toLocaleString('ko-KR');

const easeArrive = (k) => 1 - (1 - k) ** 2;

export function jackpotShow($, sfx, jackpotWon, paidTotal, scale) {
  const el = $('#winbanner');
  const tierEl = $('#wb-tier');

  const { total, jackpot, line } = jackpotAmounts(paidTotal, jackpotWon);
  const hasLine = line > 0;
  let raf = 0;

  const put = (sel, v) => { const e = $(sel); if (e) e.textContent = fmt(v); };
  const show = (sel) => { const e = $(sel); if (e) e.classList.remove('hidden'); };
  const hide = (sel) => { const e = $(sel); if (e) e.classList.add('hidden'); };

  showStage();
  const restore = liftOverlay($, '#winbanner');
  if (el) {
    el.className = 'winbanner t-jackpot';
    el.classList.remove('hidden');
  }
  if (tierEl) tierEl.textContent = 'JACKPOT';

  put('#wb-num', 0);
  put('#wb-line-num', 0);
  put('#wb-total-num', 0);

  hide('#wb-line');
  hide('#wb-total');

  const setFinal = () => {
    if (raf) cancelAnimationFrame(raf);
    put('#wb-num', jackpot);
    if (hasLine) {
      show('#wb-line');
      put('#wb-line-num', line);
      show('#wb-total');
      put('#wb-total-num', total);
    }
    $('#win').textContent = fmt(total);
  };

  const run = (dur, from, to, sel, ease) => {
    if (raf) cancelAnimationFrame(raf);
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1);
      const v = Math.round(from + (to - from) * ease(k));
      put(sel, v);
      $('#win').textContent = fmt(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const fx = playJackpotFx({
    $, sfx, fast: scale < 1, hasLine,

    onCount: (dur) => run(dur, 0, jackpot, '#wb-num', easeArrive),

    onLine: () => { show('#wb-line'); put('#wb-line-num', line); },

    onTotal: (dur) => { show('#wb-total'); run(dur, jackpot, total, '#wb-total-num', easeJackpot); },
    onSettle: setFinal,
    onEnd: () => {
      if (el) el.classList.add('hidden');

      hide('#wb-line');
      hide('#wb-total');

      restore();
    },
  });

  if (el) el.addEventListener('pointerdown', fx.skip, { once: true });

  return { hold: fx.total, cancel: fx.cancel };
}
