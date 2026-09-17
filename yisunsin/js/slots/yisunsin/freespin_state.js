export function createFreespinState(FS, { sfx }) {

  let current = null;

  let awaitingChoice = false;

  return {

    get raw() { return current; },

    get active() { return Boolean(current); },

    get awaiting() { return awaitingChoice; },

    get busy() { return Boolean(current || awaitingChoice); },

    betOr(fallback) { return current ? current.bet : fallback; },

    get multiplier() { return current ? current.option.multiplier : 1; },

    project() {
      return {
        freespin: current && {
          option: current.option.id,
          multiplier: current.option.multiplier,
          left: current.left,
          won: current.won,
          stuck: current.stuck,
          retriggers: current.retriggers,
          retriggersLeft: current.option.retrigger - current.retriggers,
        },
        awaitingChoice,
        options: awaitingChoice ? FS.options : null,
      };
    },

    openChoice() { awaitingChoice = true; },

    choose(id, bet) {
      if (!awaitingChoice) return false;
      const option = FS.options.find((o) => o.id === id);
      if (!option) return false;

      awaitingChoice = false;
      current = { option, left: option.spins, retriggers: 0, won: 0, bet };
      sfx.play('freespin_select');
      return true;
    },

    begin(state) { current = state; },

    addWin(paid) { if (current) current.won += paid; },

    advance(result) {
      if (!current) return;
      current.left -= 1;

      const opt = current.option;
      const total = opt.spins + current.retriggers * FS.retriggerSpins;
      if (result.freespinTrigger
          && current.retriggers < opt.retrigger
          && total + FS.retriggerSpins <= FS.maxSpins) {
        current.retriggers += 1;
        current.left += FS.retriggerSpins;

      }

      if (current.left <= 0) current = null;
    },
  };
}
