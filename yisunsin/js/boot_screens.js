import { buildInfoPlan } from './slots/yisunsin/infoplan.js';
import { createInfoScreen } from './infoscreen.js';
import { createSettingsScreen } from './settingsscreen.js';
import { createScreenGate } from './screen_gate.js';
import { liftOverlay } from './slots/yisunsin/overlay.js';

export function createScreens($, {
  paytable, symbols, audio, settings, sfx, slot, sea,
}) {
  const info = createInfoScreen($, buildInfoPlan({ paytable, symbols }));
  const panel = createSettingsScreen($, { settings, audio, sfx });

  const gate = createScreenGate({
    isSpinning: () => Boolean(slot.state.spinning),
    isAwaitingChoice: () => Boolean(slot.state.awaitingChoice),

    isJackpotShowing: () => {
      const b = $('#winbanner');
      return Boolean(b && !b.classList.contains('hidden'));
    },
    isInBattle: () => Boolean(sea && sea.active),
    battle: () => (sea && sea.active ? sea : null),
    now: () => performance.now(),
  });

  let drop = null;
  let openSel = null;

  const show = (sel) => {
    const el = $(sel);
    if (!el) return false;
    if (!gate.open()) return false;

    drop = liftOverlay($, sel);
    el.classList.remove('hidden');
    openSel = sel;

    const x = $(`${sel} [data-close]`);
    if (x && typeof x.focus === 'function') x.focus();
    return true;
  };

  const hide = () => {
    if (!openSel) return;
    const el = $(openSel);
    if (el) el.classList.add('hidden');
    if (drop) drop();
    drop = null;
    openSel = null;

    const wait = gate.close();
    if (!wait.countdownMs) { wait.finish(); return; }
    countdown(wait);
  };

  function countdown(wait) {
    const box = $('#resume-count');
    let left = Math.ceil(wait.countdownMs / 1000);
    const paint = () => { if (box) box.textContent = `${left}`; };
    if (box) box.classList.remove('hidden');
    paint();
    const id = setInterval(() => {
      left -= 1;
      if (left > 0) { paint(); return; }
      clearInterval(id);
      if (box) box.classList.add('hidden');
      wait.finish();
    }, 1000);
  }

  for (const sel of ['#info-screen', '#settings-screen']) {
    const x = $(`${sel} [data-close]`);
    if (x) x.addEventListener('click', hide);
  }
  window.addEventListener('keydown', (ev) => {
    if (!openSel) return;
    if (ev.key === 'Escape') { ev.preventDefault(); hide(); return; }

    if (openSel !== '#info-screen') return;
    if (ev.key === 'ArrowLeft') { ev.preventDefault(); info.move(-1); }
    if (ev.key === 'ArrowRight') { ev.preventDefault(); info.move(+1); }
  });

  return {
    openInfo() { info.build(); info.reset(); show('#info-screen'); },
    openSettings() { panel.build(); panel.sync(); show('#settings-screen'); },
    close: hide,
    get isOpen() { return Boolean(openSel); },
  };
}
