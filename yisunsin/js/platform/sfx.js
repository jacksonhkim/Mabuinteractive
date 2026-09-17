import { createSynth } from './synth.js';

const NOOP_HANDLE = { stop() {} };

export function createSfx({ audio }) {

  const bank = new Map();

  let synth = null;
  let enabled = true;
  let master = 1.0;
  const missing = new Set();

  const trace = [];
  let tracing = false;

  const decode = async (ctx, url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    return ctx.decodeAudioData(await res.arrayBuffer());
  };

  return {

    define(manifest) {
      const sounds = (manifest && manifest.sounds) || {};
      for (const [id, def] of Object.entries(sounds)) {

        const list = Array.isArray(def.src) ? def.src : (def.src ? [def.src] : []);
        bank.set(id, { mode: def.mode || 'file', srcs: list, buffers: [], loop: Boolean(def.loop) });
      }
      return bank.size;
    },

    async preload() {
      const ctx = audio.context;
      if (!ctx) return { loaded: 0, failed: 0 };
      let loaded = 0;
      let failed = 0;
      await Promise.all([...bank.entries()].map(async ([id, def]) => {
        if (def.mode !== 'file' || !def.srcs.length || def.buffers.length) return;
        const got = await Promise.all(def.srcs.map(async (url) => {
          try {
            return await decode(ctx, url);
          } catch {
            return null;
          }
        }));
        def.buffers = got.filter(Boolean);
        if (def.buffers.length) loaded += def.buffers.length;
        if (def.buffers.length < def.srcs.length) {
          failed += def.srcs.length - def.buffers.length;
          missing.add(id);
        }
      }));
      return { loaded, failed };
    },

    play(id, opt = {}) {
      if (tracing) trace.push({ id, ...opt });
      if (!enabled) return NOOP_HANDLE;

      const def = bank.get(id);
      const ctx = audio.context;
      if (!def || !ctx || !audio.unlocked) return NOOP_HANDLE;

      if (!def.buffers.length) {
        if (!synth) synth = createSynth(ctx);
        return synth.play(id, opt) || NOOP_HANDLE;
      }

      const n = def.buffers.length;
      const pick = ((Math.floor(opt.variant || 0) % n) + n) % n;

      const src = ctx.createBufferSource();
      src.buffer = def.buffers[pick];
      src.playbackRate.value = opt.pitch || 1;
      src.loop = def.loop;

      const gain = ctx.createGain();
      gain.gain.value = (opt.volume == null ? 1 : opt.volume) * master;

      src.connect(gain).connect(ctx.destination);
      src.start();

      const stop = (fade = 0.12) => {
        try {
          const t = ctx.currentTime;
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
          src.stop(t + fade + 0.02);
        } catch {
          try { src.stop(); } catch {  }
        }
      };
      return { stop };
    },

    setEnabled(on) {
      enabled = Boolean(on);
    },

    setMasterVolume(v) {
      master = Math.min(1, Math.max(0, v));
    },

    startTrace() {
      tracing = true;
      trace.length = 0;
    },

    stopTrace() {
      tracing = false;
      return [...trace];
    },

    get status() {
      const defined = bank.size;
      const ready = [...bank.values()].reduce((a, d) => a + d.buffers.length, 0);
      const ctx = audio.context;
      if (ctx && !synth) synth = createSynth(ctx);
      const synthesized = synth
        ? [...bank.keys()].filter((id) => !bank.get(id).buffers.length && synth.has(id)).length
        : 0;
      return { defined, ready, synthesized, missing: [...missing], enabled };
    },
  };
}
