import { createWallet } from './platform/wallet.js';
import { createJackpot } from './platform/jackpot.js';
import { createAudio } from './platform/audio.js';
import { createSfx } from './platform/sfx.js';
import { createSlot } from './slots/yisunsin/slot.js';
import { createRng } from './slots/yisunsin/rng.js';
import { loadAssets } from './slots/yisunsin/assets.js';
import { createRenderer } from './slots/yisunsin/render.js';
import { createReels } from './slots/yisunsin/reels.js';
import { createTacticPanel } from './slots/yisunsin/tacticpanel.js';
import { bindHud, reportStatus } from './slots/yisunsin/ui.js';
import { createFx } from './slots/yisunsin/fx.js';
import { createAutoplay } from './slots/yisunsin/autoplay.js';
import { createFreespinRunner } from './slots/yisunsin/freespin_runner.js';
import { installLayoutScale } from './layout_scale.js';
import { bindControls } from './boot_controls.js';
import { createBgm } from './bgm.js';
import { createRoundEnd } from './round_end.js';
import { createRevealGate } from './reveal_gate.js';
import { createSeaBattle } from './slots/yisunsin/seabattle/battle_bind.js';

installLayoutScale();

const SLOT = 'js/slots/yisunsin/data';
const BGM_VOLUME = 0.22;

const SEA_SEED = 0x5ea1;
const SEA_FX_SEED = 0x5ea1f8;

const json = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} — ${res.status}`);
  return res.json();
};

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => n.toLocaleString('ko-KR');

const showBootError = (msg) => {
  const el = $('#boot-error');
  const sub = $('#title-sub');
  if (sub) sub.textContent = '';
  if (el) {
    el.textContent = msg;
    el.classList.add('shown');
  }
};

async function boot() {
  const [platform, manifest, config, paytable, strips, symbols] = await Promise.all([
    json('assets/platform.json'),
    json('assets/sounds.json'),
    json(`${SLOT}/config.json`),
    json(`${SLOT}/paytable.json`),
    json(`${SLOT}/strips.json`),
    json(`${SLOT}/symbols.json`),
  ]);

  const wallet = createWallet(platform.wallet.initial);

  const jackpot = createJackpot(paytable.jackpot);
  const audio = createAudio();
  const sfx = createSfx({ audio });
  sfx.define(manifest);
  sfx.setMasterVolume(platform.audio.masterVolume);

  const rng = createRng(platform.rngSeed || Date.now() >>> 0);

  const slot = createSlot(
    { ...config, paytable, strips, symbols },
    { wallet, sfx, rng, jackpot },
  );

  document.title = slot.title;
  $('#title-name').textContent = slot.title;
  $('#title-sub').textContent = '에셋 불러오는 중…';

  const assets = await loadAssets(symbols, (done, total) => {
    $('#title-sub').textContent = `에셋 ${done} / ${total}`;
  });

  const renderer = createRenderer($('#reels'), {
    config, symbols, assets, strips: strips.strips,
  });
  renderer.resize();

  const settled = strips.strips.map(() => true);

  let spinLoop = null;

  const bgm = createBgm(sfx, { volume: BGM_VOLUME });
  const stopSpinLoop = () => {
    if (spinLoop) {
      spinLoop.stop();
      spinLoop = null;
    }
  };

  const reels = createReels({
    stripLens: strips.strips.map((s) => s.length),

    onReelStop: (i) => {
      settled[i] = true;

      sfx.play('reel_stop', { variant: i, pitch: 1 + i * 0.02 });
    },
    onDone: () => {
      stopSpinLoop();

      gate.hold();
      slot.settle();

      const s = slot.state;

      const after = () => {
        if (sea.shouldEnter(s)) {
          play.stop();

          sea.enter(s.bet, (r) => { slot.creditBattle(r.award); gate.release(); round.finish(s); }, play.fast);
          return;
        }
        gate.release();
        round.finish(s);
      };

      const wait = fx.playTumble(slot, play.fast);
      if (wait > 0) setTimeout(after, wait); else after();
    },
  });

  reels.set(slot.positions);

  const fx = createFx($, {
    renderer, reels, settled, paylines: paytable.paylines, sfx,
  });

  const sea = createSeaBattle($, {
    assets, rng: createRng(SEA_SEED), rngFx: createRng(SEA_FX_SEED),
    payout: paytable.seaBattle, bgm, sfx,
  });

  const mark = (sel, on) => $(sel).setAttribute('aria-pressed', String(on));
  const play = createAutoplay({
    onSpin: () => doSpin(),

    canSpin: () => slot.state.canSpin && !slot.state.awaitingChoice && !slot.state.freespin,
    onFastChange: (on) => mark('#fast', on),
    onAutoChange: (on) => mark('#auto', on),
  });

  const free = createFreespinRunner({ onSpin: () => doSpin(), isFast: () => play.fast });

  const report = (r) => reportStatus($, assets, sfx, r);
  let raf = 0;
  const loop = (now) => {
    const spinning = reels.update(now);
    fx.draw(now);
    raf = (spinning || fx.hasGlow(slot)) ? requestAnimationFrame(loop) : 0;
  };
  fx.draw();

  const panel = $('.reel-panel');
  for (const [k, v] of [['--reel-w', renderer.width], ['--reel-h', renderer.height]]) panel.style.setProperty(k, `${v}`);
  $('#title-sub').textContent = '화면을 눌러 시작';

  const tactic = createTacticPanel($, slot);

  const round = createRoundEnd({ $, slot, fx, play, free, sfx, renderer, strips, tactic });

  const gate = createRevealGate((reveal) => fx.playTrigger({
    fast: play.fast, auto: Boolean(play.auto), showChoice: reveal,
  }));
  bindHud($, slot, (id) => {
    slot.chooseFreespin(id);
    play.stop();
    free.begin();
  }, (reveal) => {

    gate.want(reveal);
  });

  $('#title').addEventListener('pointerdown', () => {
    audio.unlock();
    $('#title').classList.add('gone');
    $('#stage').classList.remove('hidden');
    renderer.resize();
    fx.draw(performance.now());
    if (!raf) raf = requestAnimationFrame(loop);

    report({ loaded: 0, failed: 0 });
    audio.onUnlock(() => sfx.preload().then((r) => {
      report(r);
      bgm.play('bgm_main');
    }));
  }, { once: true });

  function doSpin() {
    const r = slot.spin();
    if (!r.ok) {
      $('#hint').textContent = (r.reason === 'busy' || r.reason === 'choice')
        ? '' : '잔액이 부족합니다';
      if (r.reason === 'insufficient') play.stop();
      return;
    }
    $('#hint').textContent = '';
    settled.fill(false);
    fx.resetForSpin();
    if (!slot.state.freespin) $('#win').textContent = '0';
    round.sync(r.positions);
    stopSpinLoop();
    spinLoop = sfx.play('reel_loop', {
      volume: play.fast ? 0.3 : 0.45,
      pitch: play.fast ? 1.4 : 1,
    });
    reels.start(r.positions, performance.now(), play.scale);
    if (!raf) raf = requestAnimationFrame(loop);
  }

  bindControls($, {
    slot, wallet, sfx, audio, play, free, fx, renderer, doSpin, fmt,

    onResize: () => {
      fx.draw(performance.now());
      if (!raf && fx.hasGlow(slot)) raf = requestAnimationFrame(loop);
    },
    stopSpinLoop,
    getBgm: () => bgm,
  });
}

boot().catch((e) => {
  showBootError(
    `기동 실패 — ${e.message}\n`
    + 'start.bat 으로 실행하셨는지 확인해 주세요. '
    + 'index.html 을 직접 열면 브라우저가 모듈을 차단합니다.',
  );
});

window.addEventListener('error', (ev) => {
  if (ev.message) showBootError(`오류 — ${ev.message}`);
});
