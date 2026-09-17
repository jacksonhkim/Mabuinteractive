import { createBattleScene, FIELD_W, FIELD_H } from './battle_scene.js';
import { createBattleFx } from './battle_fx.js';
import { createBattleRenderer } from './battle_render.js';
import { createBattleInput } from './battle_input.js';
import { ticksBetweenProgress } from './battle_wheel.js';
import { createTouchControls } from './battle_touch.js';
import { hasCoarsePointer } from '../../../layout_scale.js';

const BATTLE_BGM = 'bgm_battle';

export function createSeaBattle($, {
  assets, rng, rngFx, payout, bgm = null, sfx = null, touch = null,
}) {

  const isTouch = touch === null
    ? hasCoarsePointer(typeof window === 'undefined' ? null : window)
    : Boolean(touch);

  const fx = createBattleFx({ rng: rngFx, sfx, lite: isTouch });
  const panel = $('#seabattle');
  const canvas = $('#battle');

  const renderer = panel && canvas ? createBattleRenderer(canvas, assets) : null;

  let scene = null;
  let raf = 0;
  let finish = null;

  const touchPad = isTouch ? createTouchControls({ w: FIELD_W, h: FIELD_H }) : null;
  const touchView = () => (touchPad ? touchPad.view() : null);

  const input = canvas
    ? createBattleInput(canvas, { w: FIELD_W, h: FIELD_H },
      {
        onPause: () => togglePause(),
        touch: touchPad,

        view: renderer ? () => renderer.view() : null,
      })
    : null;
  let paused = false;

  let wheelU = 0;

  let lastView = '';

  function togglePause() {
    if (!scene) return;
    if (paused) { paused = false; resumeLoop(); } else { paused = true; pauseLoop(); }
  }

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  function pauseLoop() {
    if (!scene) return;
    scene.pause(performance.now());
    if (input) input.release();
    stop();
  }

  function resumeLoop() {
    if (!scene || raf) return;
    scene.resume(performance.now());
    raf = requestAnimationFrame(frame);
  }

  const onWindowResize = () => { if (renderer && scene) renderer.resize(); };

  function close() {
    stop();
    window.removeEventListener('resize', onWindowResize);
    if (input) input.detach();
    paused = false;
    wheelU = 0;
    lastView = '';
    const result = scene ? scene.result() : { award: 0 };
    scene = null;
    if (panel) panel.classList.add('hidden');

    if (bgm) bgm.pop();
    const cb = finish;
    finish = null;
    if (cb) cb(result);
  }

  function introFrame(now, view, inp) {
    if (view.name !== lastView) {

      if (view.name === 'reveal' && sfx) { sfx.play('wheel_stop'); sfx.play('time_reveal'); }
      if (view.name === 'wheel') wheelU = 0;
      lastView = view.name;
    }

    if (inp && inp.tap) { scene.skip(now); return; }
    if (view.name !== 'wheel') return;
    const n = ticksBetweenProgress(scene.wheel, wheelU, view.progress);
    wheelU = view.progress;
    if (n > 0 && sfx) sfx.play('wheel_tick');
  }

  const frame = (now) => {
    if (!scene) return;
    const inp = input ? input.read() : null;
    const view = scene.introView(now);
    if (view) introFrame(now, view, inp);

    else if (scene.phase === 'result') { if (inp && inp.tap) scene.skip(now); }
    else if (inp) scene.setInput(inp);
    scene.tick(now);
    renderer.draw(scene, scene.remainingMs(now), now, touchView());
    if (scene.phase === 'done') { close(); return; }
    raf = requestAnimationFrame(frame);
  };

  return {
    get active() { return Boolean(scene); },

    shouldEnter(state) {
      return Boolean(renderer && state.result && state.result.seaBattleTrigger);
    },

    enter(totalBet, onFinish, fast = false) {
      if (scene || !renderer) { onFinish({ award: 0 }); return; }
      finish = onFinish;

      fx.reset();
      scene = createBattleScene({ rng, totalBet, payout, fx, fast });
      if (input) input.attach();
      window.addEventListener('resize', onWindowResize, { passive: true });
      panel.classList.remove('hidden');

      if (bgm) bgm.push(BATTLE_BGM);
      renderer.resize();
      const now = performance.now();
      scene.start(now);
      renderer.draw(scene, scene.remainingMs(now), now, touchView());
      raf = requestAnimationFrame(frame);
    },

    pause() { paused = true; pauseLoop(); },

    resume() { if (paused) { paused = false; resumeLoop(); } },

    resize() { if (renderer && scene) renderer.resize(); },
  };
}
