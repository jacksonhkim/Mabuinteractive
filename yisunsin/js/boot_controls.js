import { bindDevButtons } from './_devbuttons.js';
import { installOrientationGuard } from './layout_scale.js';

export function bindControls($, {
  slot, wallet, sfx, audio, play, free, fx, renderer,
  doSpin, fmt, onResize, stopSpinLoop, getBgm,
}) {

  $('.reel-panel').addEventListener('click', () => fx.skipTrigger());

  $('#spin').addEventListener('click', doSpin);

  $('#fast').addEventListener('click', () => {
    sfx.play('btn_toggle', { pitch: play.toggleFast() ? 1.12 : 0.9 });
  });

  $('#auto').addEventListener('click', () => {
    sfx.play('btn_toggle', { pitch: play.toggleAuto() ? 1.12 : 0.9 });
  });
  $('#bet-up').addEventListener('click', () => slot.changeBet(+1));
  $('#bet-down').addEventListener('click', () => slot.changeBet(-1));

  bindDevButtons($, { slot, wallet, doSpin, fmt, say: (m) => { $('#hint').textContent = m; } });

  window.addEventListener('resize', () => {
    renderer.resize();
    onResize();
  });

  installOrientationGuard({ pause: () => { play.stop(); free.stop(); fx.cancelTrigger(); } });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
      play.stop();
      free.stop();
      fx.cancelTrigger();
    } else {
      audio.resume();
    }
  });

  window.addEventListener('pagehide', () => {
    stopSpinLoop();
    const bgm = getBgm();
    if (bgm) bgm.stop();
  });
}
