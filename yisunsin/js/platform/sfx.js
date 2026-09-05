/**
 * sfx.js — 사운드 훅
 *
 * 🔴 대표님 지시 (2026-08-23): **사운드는 나중에 전량 교체할 수 있어야 한다.**
 *    그 요구가 이 파일 하나에 걸려 있다. 규칙은 사운드기획서 §11 이다.
 *
 *    R1  **코드에 파일명을 쓰지 않는다.** 코드는 `play('reel_stop')` 만 안다.
 *        어느 파일이 울릴지는 `sounds.json` 이 정한다 → 교체 = JSON 한 줄
 *    R4  절차적 생성 항목도 파일로 덮어쓸 수 있다 (mode 를 바꾸기만 하면 된다)
 *    R5  **로드에 실패해도 게임은 멈추지 않는다.** 소리는 게임의 필수 조건이 아니다
 *    R6  길이 규격은 권장이지 강제가 아니다
 *
 * 🔴 왜 P0 에 심는가
 *    나중에 붙이면 재생 지점을 찾으러 **전 파일을 다시 뒤져야 한다.**
 *    훅이 먼저 있으면 각 단계에서 제 자리에 한 줄씩 놓고 지나갈 수 있다.
 *
 * 🔴 **게임 난수**를 쓰지 않는다
 *    릴마다 피치를 달리하는 것 같은 변조는 **호출자가 값을 넘긴다.**
 *    게임 난수열을 소비하면 **소리를 켜고 끄는 것만으로 스핀 결과가 달라진다.**
 *    절차적 생성(synth.js)이 노이즈를 만들 때도 자체 rngFx 를 쓰는 이유가 같다.
 */

import { createSynth } from './synth.js';

const NOOP_HANDLE = { stop() {} };

/**
 * @param {object} services
 * @param {ReturnType<import('./audio.js').createAudio>} services.audio
 */
export function createSfx({ audio }) {
  /** @type {Map<string, {mode: string, src?: string, buffer?: AudioBuffer}>} */
  const bank = new Map();
  /** 절차적 생성기. AudioContext 가 생긴 뒤에야 만들 수 있다. */
  let synth = null;
  let enabled = true;
  let master = 1.0;
  const missing = new Set();

  /** 재생 요청 이력 — 연출 단계에서 "울려야 할 때 울렸는가" 를 검증한다. */
  const trace = [];
  let tracing = false;

  const decode = async (ctx, url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    return ctx.decodeAudioData(await res.arrayBuffer());
  };

  return {
    /**
     * 매니페스트를 읽어 정의를 세운다. 실제 디코딩은 잠금 해제 후로 미룬다.
     * @param {{sounds: Record<string, {mode: string, src?: string}>}} manifest
     */
    define(manifest) {
      const sounds = (manifest && manifest.sounds) || {};
      for (const [id, def] of Object.entries(sounds)) {
        // 🔴 src 는 문자열 또는 **배열**이다.
        //    배열이면 같은 사건에 쓸 변형이 여럿이라는 뜻 — 릴 정지음이 대표적이다.
        //    다섯 릴이 같은 소리로 멈추면 정지가 하나로 뭉뚱그려 들린다.
        const list = Array.isArray(def.src) ? def.src : (def.src ? [def.src] : []);
        bank.set(id, { mode: def.mode || 'file', srcs: list, buffers: [], loop: Boolean(def.loop) });
      }
      return bank.size;
    },

    /**
     * 파일 항목을 디코딩한다. 실패는 삼킨다 — R5.
     * 잠금 해제 전이면 아무 것도 하지 않고, onUnlock 으로 다시 불리게 둔다.
     */
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
          missing.add(id);   // 조용히 폴백으로 넘어간다
        }
      }));
      return { loaded, failed };
    },

    /**
     * @param {string} id 사운드 ID — **파일명이 아니다**
     * @param {{volume?: number, pitch?: number, variant?: number}} [opt] 변조는 호출자가 정한다
     */
    play(id, opt = {}) {
      if (tracing) trace.push({ id, ...opt });
      if (!enabled) return NOOP_HANDLE;

      const def = bank.get(id);
      const ctx = audio.context;
      if (!def || !ctx || !audio.unlocked) return NOOP_HANDLE;

      // 🔴 파일이 먼저다 (R4). 파일이 없으면 절차적 생성으로 내려간다.
      //    mode 가 procedural 이어도, 나중에 src 를 채우면 그날부터 파일이 울린다.
      if (!def.buffers.length) {
        if (!synth) synth = createSynth(ctx);
        return synth.play(id, opt) || NOOP_HANDLE;
      }

      // 변형이 여럿이면 호출자가 준 번호로 고른다 (릴 번호 등). 없으면 첫 번째.
      const n = def.buffers.length;
      const pick = ((Math.floor(opt.variant || 0) % n) + n) % n;

      const src = ctx.createBufferSource();
      src.buffer = def.buffers[pick];
      src.playbackRate.value = opt.pitch || 1;
      src.loop = def.loop;          // 회전음·해면 앰비언스는 끊기지 않고 이어져야 한다

      const gain = ctx.createGain();
      gain.gain.value = (opt.volume == null ? 1 : opt.volume) * master;

      src.connect(gain).connect(ctx.destination);
      src.start();

      // 🔴 루프를 뚝 끊으면 딱 소리가 난다. 짧게 줄이며 멈춘다.
      const stop = (fade = 0.12) => {
        try {
          const t = ctx.currentTime;
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + fade);
          src.stop(t + fade + 0.02);
        } catch {
          try { src.stop(); } catch { /* 이미 멈춤 */ }
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

    /** 연출 검증용 — "끄고 켜도 결과 동일" (P7) 을 확인할 때 쓴다. */
    startTrace() {
      tracing = true;
      trace.length = 0;
    },

    stopTrace() {
      tracing = false;
      return [...trace];
    },

    /** 진단 — 무엇이 정의되고 무엇이 빠졌는가. */
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
