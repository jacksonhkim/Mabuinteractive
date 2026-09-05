/**
 * synth.js — 절차적 사운드 생성 (사운드기획서 §4)
 *
 * 🔴 왜 파일이 아니라 코드인가
 *    §4-1 카운트업 틱은 **금액에 따라 피치가 오른다.** 미리 만든 파일로는
 *    금액마다 다른 소리를 낼 수 없다. §4-2 릴 정지는 릴마다 +2%,
 *    §4-3 명중 스파크는 한 판에 90번 울린다 — 같은 파일이면 귀가 금방 지친다.
 *    이런 것들은 **매번 조금씩 달라야** 하므로 코드로 만든다. 용량도 0 이다.
 *
 * 🔴 난수는 자체 인스턴스를 쓴다 (rngFx)
 *    게임 난수(rngGame)를 소비하면 **소리를 켜고 끄는 것만으로 스핀 결과가 달라진다.**
 *    같은 시드가 다른 결과를 내면 재현도 검증도 불가능해진다.
 *    노이즈 한 번 만드는 데 게임의 결정론을 팔 수는 없다.
 */
import { createRng } from '../slots/yisunsin/rng.js';

const FX_SEED = 0x5eed;

export function createSynth(ctx) {
  const rngFx = createRng(FX_SEED);
  let noiseBuf = null;

  /** 노이즈는 한 번 만들어 재사용한다 — 매번 만들면 프레임을 잡아먹는다 */
  const noise = () => {
    if (!noiseBuf) {
      const n = Math.floor(ctx.sampleRate * 0.5);
      noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i += 1) d[i] = rngFx.next() * 2 - 1;
    }
    return noiseBuf;
  };

  /** 감쇠 엔벨로프. 0 으로 곧장 가면 딱 소리가 나므로 아주 작은 값까지만 내린다. */
  const env = (gain, t0, peak, dur, attack = 0.004) => {
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  };

  /** 노이즈 버스트 — 릴 정지·클릭처럼 '툭' 하는 소리 */
  function burst({ dur = 0.08, vol = 0.5, freq = 1800, q = 1.2, pitch = 1 }) {
    const t0 = ctx.currentTime;
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

  /** 단음 — 벨·확인음 */
  function tone({ freq = 880, dur = 0.15, vol = 0.3, type = 'triangle', pitch = 1, detune = 0 }) {
    const t0 = ctx.currentTime;
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

  /** 스윕 — 릴 가속처럼 '휘익' 올라가는 소리 */
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

  /**
   * ID 별 생성 레시피 (사운드기획서 §3-1 · §3-3 규격).
   * 두 번째 인자 opt 는 호출자가 넘기는 변조값 — pitch 가 대표적이다.
   */
  const RECIPES = {
    // 🔴 릴 회전 시작 — 기계가 물려 돌기 시작하는 느낌 (대표님 A안, 2026-08-23)
    //    파일 대신 코드로 두는 이유: 톤이 마음에 안 들면 숫자만 바꾸면 되고,
    //    바로 뒤를 reel_loop 이 받으므로 짧아도 된다.
    reel_start: () => {
      sweep({ from: 120, to: 480, dur: 0.26, vol: 0.16, type: 'sawtooth' });
      return burst({ dur: 0.07, vol: 0.22, freq: 900, q: 0.9 });   // 걸쇠가 풀리는 소리
    },

    // 🔴 릴 정지 — 릴마다 pitch 가 2% 씩 올라온다 (§4-2)
    reel_stop: (o) => burst({ dur: 0.09, vol: 0.42, freq: 1500, q: 1.0, pitch: o.pitch || 1 }),

    // 🔴 라인 점등 — 라인마다 피치 +1.5% (§3-1)
    line_light: (o) => tone({ freq: 1320, dur: 0.12, vol: 0.22, pitch: o.pitch || 1 }),

    // 🔴 카운트업 틱 — 금액이 커질수록 높아진다 (§4-1)
    count_tick: (o) => tone({ freq: 740, dur: 0.05, vol: 0.16, type: 'square', pitch: o.pitch || 1 }),

    win_small: () => tone({ freq: 660, dur: 0.3, vol: 0.26, detune: 6 }),

    // 보너스 게임 (§3-2)
    hit_spark: (o) => burst({ dur: 0.06, vol: 0.3, freq: 3200, q: 2.2, pitch: o.pitch || 1 }),
    ram_ready: () => sweep({ from: 300, to: 1200, dur: 0.3, vol: 0.2, type: 'triangle' }),
    player_hit: () => burst({ dur: 0.35, vol: 0.5, freq: 220, q: 0.7 }),
    boss_appear: () => sweep({ from: 180, to: 60, dur: 1.2, vol: 0.35, type: 'sawtooth' }),
    time_warning: () => tone({ freq: 990, dur: 0.12, vol: 0.3, type: 'square' }),

    // UI (§3-3)
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
