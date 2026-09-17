import { planTactic, SCREENS, TICK_MS } from './tacticplan.js';

export function createTacticPanel($, slot) {

  const root = $('#tactic');
  const ok = root && typeof root.querySelectorAll === 'function';
  if (!ok) return { update() {}, stop() {} };

  const frames = new Map();
  for (const el of root.querySelectorAll('.tc-frame')) {
    frames.set(el.dataset.screen, el);
  }
  const dots = [...root.querySelectorAll('.tc-dots li')];

  let shown = null;
  let timer = 0;
  const start = Date.now();

  const paint = () => {
    const { screen } = planTactic(slot.state, Date.now() - start);
    if (screen === shown) return;
    shown = screen;
    for (const [name, el] of frames) el.classList.toggle('tc-on', name === screen);
    const i = SCREENS.indexOf(screen);
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };

  paint();

  timer = setInterval(paint, TICK_MS);

  return {

    update: paint,
    stop() { if (timer) { clearInterval(timer); timer = 0; } },
  };
}
