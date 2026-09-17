export const TOTAL_MS = 3000;

export const FAST_SCALE = 0.4;
export const FAST_MIN_MS = 900;

export function planBonusIntro(fast = false) {
  if (!fast) return TOTAL_MS;
  return Math.max(Math.round(TOTAL_MS * FAST_SCALE), FAST_MIN_MS);
}

export function playBonusIntro({ $, sfx, timer = setTimeout, fast = false } = {}) {
  const total = planBonusIntro(fast);
  let done = false;

  const safely = (fn) => { try { fn(); } catch {  } };

  const el = $('#bonus-intro');

  safely(() => {
    el.style.setProperty('--bi-dur', `${total}ms`);
    for (const sel of ['.bi-chest', '.bi-title', '.bi-sub']) {
      const e = el.querySelector(sel);
      if (e) e.style.animationDuration = `${total}ms`;
    }

    el.classList.remove('hidden');
    void el.offsetWidth;
  });

  safely(() => sfx.play('trigger_legendary'));

  const finish = () => {
    if (done) return;
    done = true;
    safely(() => $('#bonus-intro').classList.add('hidden'));
  };

  timer(finish, total);
  return { total, cancel: finish };
}
