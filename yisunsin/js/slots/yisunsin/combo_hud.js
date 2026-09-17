export const DIM = [0, 0, 0.22, 0.30, 0.38, 0.46];

export const DIM_SETTLE = 0.55;

export function dimFor(frame) {
  if (!frame) return 0;
  if (frame.phase === 'settle') return DIM_SETTLE;
  const base = DIM[Math.min(frame.combo, DIM.length - 1)] || 0;
  return frame.phase === 'hold' ? base : base / 2;
}

export const FEATURE_NAME = {
  seabattle: '해 전',
  freespin: '프리스핀',
  legendary: '보너스 게임',
};

export function createComboHud($) {
  const el = $('#combo');
  const dimEl = $('#combo-dim');
  const pop = () => {
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  };

  const once = (key) => {
    if (el.dataset.at === key) return false;
    el.dataset.at = key;
    return true;
  };

  return {
    hide() {
      if (el) el.hidden = true;
      if (dimEl) { dimEl.hidden = true; dimEl.style.setProperty('--dim', '0'); }
    },

    dim(level) {
      if (!dimEl) return;
      dimEl.hidden = !(level > 0);
      dimEl.style.setProperty('--dim', String(level));
    },

    combo(label) {
      if (!el) return;
      el.hidden = !label;
      if (!label) return;
      el.textContent = label.text;
      el.dataset.why = 'combo';
      if (once(String(label.combo))) pop();
    },

    feature(frame) {
      if (!el) return;
      const name = FEATURE_NAME[frame.kinds && frame.kinds[0]];
      if (!name) { el.hidden = true; return; }
      el.hidden = false;
      el.textContent = name;
      el.dataset.why = frame.capped ? 'cap' : 'chain';
      if (once('feature')) pop();
    },
  };
}
