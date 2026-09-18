const RETRY_EVENTS = ['pointerdown', 'touchend', 'click'];

export function createAudio() {
  let ctx = null;
  let unlocked = false;
  let retryArmed = false;
  const waiting = [];

  const vol = { master: 1, sfx: 1, bgm: 1 };
  let masterGain = null;
  const buses = { sfx: null, bgm: null };

  const clamp01 = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
  };

  const ensureGraph = () => {
    if (masterGain || !ctx) return masterGain;
    masterGain = ctx.createGain();
    masterGain.gain.value = vol.master;
    masterGain.connect(ctx.destination);
    for (const kind of ['sfx', 'bgm']) {
      const bus = ctx.createGain();
      bus.gain.value = vol[kind];
      bus.connect(masterGain);
      buses[kind] = bus;
    }
    return masterGain;
  };

  const win = typeof window !== 'undefined' ? window : null;
  const Ctor = win ? (win.AudioContext || win.webkitAudioContext) : null;

  const settle = () => {
    if (unlocked || !ctx || ctx.state !== 'running') return false;
    unlocked = true;
    disarmRetry();
    while (waiting.length) waiting.shift()(ctx);
    return true;
  };

  const onRetry = () => { unlockNow(); };

  function disarmRetry() {
    if (!retryArmed || !win) return;
    retryArmed = false;
    for (const type of RETRY_EVENTS) win.removeEventListener(type, onRetry, true);
  }

  function armRetry() {
    if (retryArmed || unlocked || !win) return;
    retryArmed = true;

    for (const type of RETRY_EVENTS) {
      win.addEventListener(type, onRetry, { capture: true, passive: true });
    }
  }

  const claimPlaybackSession = () => {
    const session = typeof navigator !== 'undefined' ? navigator.audioSession : null;
    if (!session) return;
    try { session.type = 'playback'; } catch {  }
  };

  const primeSilently = () => {
    try {
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      src.connect(ctx.destination);
      src.start(0);
    } catch {  }
  };

  function unlockNow() {
    if (unlocked || !Ctor) return unlocked;
    if (!ctx) {
      claimPlaybackSession();
      ctx = new Ctor();

      if (typeof ctx.addEventListener === 'function') {
        ctx.addEventListener('statechange', settle);
      }
    }
    primeSilently();

    if (ctx.state === 'suspended') {
      const p = ctx.resume();
      if (p && typeof p.then === 'function') p.then(settle, () => {});
    }

    if (!settle()) armRetry();
    return unlocked;
  }

  return {
    get supported() {
      return Boolean(Ctor);
    },

    get unlocked() {
      return unlocked;
    },

    get context() {
      return ctx;
    },

    get master() {
      return ensureGraph();
    },

    busFor(kind) {
      ensureGraph();
      return buses[kind] || null;
    },

    setVolume(kind, v) {
      if (!(kind in vol)) return;
      vol[kind] = clamp01(v);
      ensureGraph();
      const node = kind === 'master' ? masterGain : buses[kind];
      if (node) node.gain.value = vol[kind];
    },

    getVolume(kind) {
      return vol[kind];
    },

    unlock() {
      return unlockNow();
    },

    onUnlock(fn) {
      if (unlocked) fn(ctx);
      else waiting.push(fn);
    },

    suspend() {
      if (ctx && ctx.state === 'running') ctx.suspend();
    },

    resume() {
      if (!ctx) return;
      if (ctx.state !== 'suspended') return;
      const p = ctx.resume();
      if (p && typeof p.then === 'function') p.then(settle, () => {});
    },
  };
}
