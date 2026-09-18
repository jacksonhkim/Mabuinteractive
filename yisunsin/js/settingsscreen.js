const ROWS = [
  { key: 'master', label: '전체 소리' },
  { key: 'sfx', label: '효과음' },
  { key: 'bgm', label: '배경음' },
];

const pct = (v) => `${Math.round(v * 100)}%`;

export function createSettingsScreen($, { settings, audio, sfx }) {
  let built = false;

  const html = ROWS.map(({ key, label }) => {
    const v = settings.get(key);
    return `
      <div class="set-row">
        <label for="vol-${key}">${label}</label>
        <input id="vol-${key}" type="range" min="0" max="100" step="1"
               value="${Math.round(v * 100)}" data-vol="${key}"
               aria-label="${label} 크기">
        <output id="out-${key}">${pct(v)}</output>
      </div>`;
  }).join('');

  return {
    build() {
      if (built) return;
      $('#settings-body').innerHTML = `
        <div class="set-group">
          <h3>소리</h3>
          ${html}
          <p class="sheet-note">움직이면 바로 바뀝니다. 설정은 이 브라우저에 저장됩니다.</p>
        </div>`;

      $('#settings-body').addEventListener('input', (ev) => {
        const key = ev.target && ev.target.dataset && ev.target.dataset.vol;
        if (!key) return;
        const v = Number(ev.target.value) / 100;
        settings.set(key, v);
        audio.setVolume(key, v);
        const out = $(`#out-${key}`);
        if (out) out.textContent = pct(v);
      });

      $('#settings-body').addEventListener('change', (ev) => {
        const key = ev.target && ev.target.dataset && ev.target.dataset.vol;
        if (!key || Number(ev.target.value) === 0) return;
        sfx.play(key === 'bgm' ? 'btn_toggle' : 'reel_stop', { bus: key === 'bgm' ? 'bgm' : 'sfx' });
      });

      built = true;
    },

    sync() {
      for (const { key } of ROWS) {
        const el = $(`#vol-${key}`);
        const out = $(`#out-${key}`);
        const v = settings.get(key);
        if (el) el.value = String(Math.round(v * 100));
        if (out) out.textContent = pct(v);
      }
    },
  };
}
