import { syncRound } from './slots/yisunsin/legendary.js';
import { endFreespin } from './slots/yisunsin/ui.js';
import { freeTotal } from './slots/yisunsin/freespin_runner.js';

export function createRoundEnd(d) {
  const {
    $, slot, fx, play, free, sfx, renderer, strips, tactic,
  } = d;

  let wasFree = false;

  let freeWon = 0;

  let lastRetriggers = 0;

  let seenCells = null;

  return {

    sync(positions) {
      seenCells = syncRound(renderer, slot, strips, seenCells, positions);
    },

    finish(s) {

      const freeEnded = wasFree && !s.freespin && !s.awaitingChoice;

      const bonusIn = !wasFree && !s.awaitingChoice
        && Boolean(s.freespin && s.result && s.result.legendaryTrigger);
      if (bonusIn) play.stop();
      const hold = Math.max(fx.showWin(slot, play.fast, freeEnded),
        bonusIn ? fx.playBonusIntro(play.fast) : 0);

      if (freeEnded) {
        free.stop();
        endFreespin($, freeTotal(freeWon, s.win), sfx);
        freeWon = 0;
        play.onSpinEnd(false);
      } else if (!free.step(s, s.win > 0, hold)) {
        play.onSpinEnd(s.win > 0, hold);
      }

      const rt = s.freespin ? s.freespin.retriggers : 0;
      if (rt > lastRetriggers) fx.playTrigger({ retrigger: true, fast: play.fast, auto: true });
      lastRetriggers = rt;
      seenCells = syncRound(renderer, slot, strips, seenCells);
      tactic.update();
      wasFree = Boolean(s.freespin);
      if (s.freespin) freeWon = s.freespin.won;
    },
  };
}
