import { lineAtTime, presentWin } from './ui.js';
import { playFreeTrigger } from './freetrigger.js';
import { playBonusIntro as runBonusIntro } from './bonusintro.js';
import { showStage } from './overlay.js';
import { createRng } from './rng.js';
import { planTumbleShow, frameAt, finalGrid, comboLabel, lineAt } from './tumble_view.js';
import { createComboHud, dimFor } from './combo_hud.js';
import { createWinFxPlan, sampleWinFx } from './winfxplan.js';

const PULSE_MS = 1400;
const WIN_FX_SEED = 0x51a7;
const RNG_SPAN = 0x100000000;

export function createFx($, { renderer, reels, settled, paylines, sfx }) {

  const canvasEl = $('#reels');

  const rngFx = createRng(WIN_FX_SEED);

  let trigger = null;

  let bonusIn = null;

  let winCells = new Set();

  let winLines = [];

  let lineT0 = 0;

  let cancelCount = null;

  let winFx = null;

  let show = null;
  let showT0 = 0;

  let tumbleGrid = null;

  let segAt = -1;

  let landed = false;

  let stepFx = null;

  let showFast = false;

  let handoff = null;
  const hud = createComboHud($);

  const stopCount = () => {
    if (cancelCount) {
      cancelCount();
      cancelCount = null;
    }
  };

  return {

    resetForSpin() {
      winCells = new Set();
      winLines = [];
      lineT0 = 0;
      winFx = null;
      show = null;

      handoff = tumbleGrid ? reels.positions.slice() : null;
      segAt = -1;
      stepFx = null;
      hud.hide();
      stopCount();
    },

    playTumble(slot, fast = false) {
      const chain = slot.state.result && slot.state.result.tumble;
      if (!chain || !chain.steps || !chain.steps.length) return 0;
      show = planTumbleShow(chain, paylines, fast);
      showT0 = performance.now();
      tumbleGrid = finalGrid(chain);
      handoff = null;
      segAt = -1;
      showFast = fast;
      return show.total;
    },

    showWin(slot, fast, freeEnded = false) {
      const s = slot.state;
      if (s.win <= 0) return 0;
      stopCount();
      const shown = presentWin($, s, paylines, sfx, fast, freeEnded);

      winCells = tumbleGrid ? new Set() : shown.cells;
      winLines = tumbleGrid ? [] : shown.lines;
      cancelCount = shown.cancel;
      lineT0 = 0;
      winFx = shown.effect === 'win' ? {
        plan: createWinFxPlan(winCells, {
          fast, seed: Math.floor(rngFx.next() * RNG_SPAN),
        }),
        t0: performance.now(),
      } : null;
      return shown.hold;
    },

    draw(now = 0) {

      let handing = null;
      if (tumbleGrid && handoff) {
        const shift = handoff.map((p0, i) => p0 - reels.positions[i]);
        if (Math.min(...shift) >= renderer.rows) {
          tumbleGrid = null;
          handoff = null;
        } else {
          handing = { grid: tumbleGrid, phase: 'handoff', shift };
        }
      }

      const frame = show ? frameAt(show, now - showT0) : null;
      if (show && !frame) show = null;
      if (frame) {

        if (frame.from !== segAt) {
          segAt = frame.from;
          landed = false;
          if (frame.phase === 'hold') {

            stepFx = {
              plan: createWinFxPlan(frame.dead, {
                fast: showFast, seed: Math.floor(rngFx.next() * RNG_SPAN),
              }),
              t0: now,
            };
            sfx.play('line_light', { pitch: 1 + (frame.combo - 1) * 0.06 });
            if (frame.combo >= 2) sfx.play('count_tick', { pitch: 1 + (frame.combo - 1) * 0.15 });
          } else if (frame.phase === 'settle') {

            sfx.play('trigger_gather');
          } else if (frame.phase === 'break') {

            sfx.play('block_break', { pitch: 1 + (frame.combo - 1) * 0.08 });
          }
        }

        if (frame.phase === 'drop' && !landed && frame.u >= 0.75) {
          landed = true;
          sfx.play('block_land');
        }

        if (frame.phase === 'settle') hud.feature(frame);
        else hud.combo(comboLabel(frame));
        hud.dim(dimFor(frame));
        const hold = frame.phase === 'hold';

        const lit = hold || frame.phase === 'settle';
        renderer.draw(
          reels.positions, null, settled, (now % PULSE_MS) / PULSE_MS,
          lit ? frame.dead : null,
          hold ? lineAt(frame, paylines) : null,
          0,
          hold && stepFx ? sampleWinFx(stepFx.plan, now - stepFx.t0) : null,
          frame,
        );
        return;
      }
      if (!show) hud.hide();

      if (winLines.length && lineT0 === 0) lineT0 = now;
      const line = lineAtTime(winLines, now, lineT0);
      let winFrame = null;
      if (winFx) {
        winFrame = sampleWinFx(winFx.plan, now - winFx.t0);
        if (!winFrame.active) winFx = null;
      }

      const boost = canvasEl.classList.contains('fx-glow') ? 1 : 0;
      renderer.draw(
        reels.positions, reels.speeds, settled,
        (now % PULSE_MS) / PULSE_MS, winCells, line, boost, winFrame,

        handing || (tumbleGrid ? { grid: tumbleGrid, phase: 'settled', u: 1 } : null),
      );
    },

    playTrigger(o = {}) {
      showStage();
      if (trigger) trigger.cancel();
      trigger = playFreeTrigger({ $, sfx, ...o });
      return trigger;
    },

    playBonusIntro(fast = false) {
      showStage();
      if (bonusIn) bonusIn.cancel();
      bonusIn = runBonusIntro({ $, sfx, fast });
      return bonusIn.total;
    },

    skipTrigger() { if (trigger) trigger.skip(); },

    cancelTrigger() {
      if (trigger) trigger.cancel();
      if (bonusIn) bonusIn.cancel();
    },

    hasGlow(slot) {

      if (show) return true;
      return winCells.size > 0 || winLines.length > 0
        || slot.grid.some((reel) => reel.some((c) => c.startsWith('s')));
    },
  };
}
