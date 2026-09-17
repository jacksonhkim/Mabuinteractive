import { createRng } from '../slots/yisunsin/rng.js';

const FX_SEED = 0x5eed;

export function createSynth(ctx) {
  const rngFx = createRng(FX_SEED);
  let noiseBuf = null;

  const noise = () => {
    if (!noiseBuf) {
      const n = Math.floor(ctx.sampleRate * 0.5);
      noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i += 1) d[i] = rngFx.next() * 2 - 1;
    }
    return noiseBuf;
  };

  const env = (gain, t0, peak, dur, attack = 0.004) => {
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  };

  function burst({
    dur = 0.08, vol = 0.5, freq = 1800, q = 1.2, pitch = 1, delay = 0,
  }) {
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = noise();
    src.playbackRate.value = pitch;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = freq * pitch;
    bp.Q.value = q;

    const g = ctx.createGain();
    src.connect(bp).connect(g).connect(ctx.destination);
    env(g, t0, vol, dur, 0.002);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    return { stop: () => src.stop() };
  }

  function tone({
    freq = 880, dur = 0.15, vol = 0.3, type = 'triangle', pitch = 1, detune = 0, delay = 0,
  }) {
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq * pitch;
    osc.detune.value = detune;

    const g = ctx.createGain();
    osc.connect(g).connect(ctx.destination);
    env(g, t0, vol, dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
    return { stop: () => osc.stop() };
  }

  function sweep({ from = 200, to = 900, dur = 0.2, vol = 0.25, type = 'sawtooth' }) {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), t0 + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(from * 4, t0);
    lp.frequency.exponentialRampToValueAtTime(Math.max(to * 4, 1), t0 + dur);

    const g = ctx.createGain();
    osc.connect(lp).connect(g).connect(ctx.destination);
    env(g, t0, vol, dur, 0.02);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
    return { stop: () => osc.stop() };
  }

  const DEBRIS = [
    [0.035, 3200, 0.22], [0.080, 2400, 0.17], [0.140, 2900, 0.12], [0.210, 1800, 0.08],
  ];

  const RECIPES = {

    reel_start: () => {
      sweep({ from: 120, to: 480, dur: 0.26, vol: 0.16, type: 'sawtooth' });
      return burst({ dur: 0.07, vol: 0.22, freq: 900, q: 0.9 });
    },

    reel_stop: (o) => burst({ dur: 0.09, vol: 0.42, freq: 1500, q: 1.0, pitch: o.pitch || 1 }),

    line_light: (o) => tone({ freq: 1320, dur: 0.12, vol: 0.22, pitch: o.pitch || 1 }),

    count_tick: (o) => tone({ freq: 740, dur: 0.05, vol: 0.16, type: 'square', pitch: o.pitch || 1 }),

    win_small: () => tone({ freq: 660, dur: 0.3, vol: 0.26, detune: 6 }),

    block_break: (o) => {
      const p = o.pitch || 1;
      burst({ dur: 0.028, vol: 0.30, freq: 2600, q: 1.4, pitch: p });
      DEBRIS.forEach(([delay, freq, vol]) => burst({
        dur: 0.018, vol, freq, q: 2.0, pitch: p, delay,
      }));
      return burst({ dur: 0.32, vol: 0.40, freq: 150, q: 0.5, pitch: p, delay: 0.01 });
    },

    block_land: () => burst({ dur: 0.08, vol: 0.26, freq: 300, q: 0.9 }),

    trigger_gather: () => {
      burst({ dur: 0.06, vol: 0.24, freq: 2200, q: 1.6 });
      return sweep({ from: 340, to: 1020, dur: 0.42, vol: 0.28, type: 'triangle' });
    },

    hit_spark: (o) => burst({ dur: 0.06, vol: 0.3, freq: 3200, q: 2.2, pitch: o.pitch || 1 }),
    ram_ready: () => sweep({ from: 300, to: 1200, dur: 0.3, vol: 0.2, type: 'triangle' }),
    player_hit: () => burst({ dur: 0.35, vol: 0.5, freq: 220, q: 0.7 }),
    boss_appear: () => sweep({ from: 180, to: 60, dur: 1.2, vol: 0.35, type: 'sawtooth' }),
    time_warning: () => tone({ freq: 990, dur: 0.12, vol: 0.3, type: 'square' }),

    wheel_tick: (o) => burst({ dur: 0.035, vol: 0.22, freq: 1100, q: 1.4, pitch: o.pitch || 1 }),

    wheel_stop: () => burst({ dur: 0.18, vol: 0.4, freq: 380, q: 0.9 }),

    time_reveal: () => sweep({ from: 420, to: 1180, dur: 0.55, vol: 0.3, type: 'triangle' }),

    btn_click: (o) => burst({ dur: 0.05, vol: 0.3, freq: 2400, q: 1.6, pitch: o.pitch || 1 }),
    btn_toggle: (o) => tone({ freq: 880, dur: 0.09, vol: 0.24, pitch: o.pitch || 1 }),
    bet_change: (o) => tone({ freq: 620, dur: 0.08, vol: 0.22, pitch: o.pitch || 1 }),
    freespin_select: () => tone({ freq: 520, dur: 0.4, vol: 0.3, detune: -8 }),
    screen_transition: () => sweep({ from: 900, to: 200, dur: 0.5, vol: 0.2 }),
  };

  return {
    has: (id) => Boolean(RECIPES[id]),
    play: (id, opt = {}) => (RECIPES[id] ? RECIPES[id](opt) : null),
  };
}
