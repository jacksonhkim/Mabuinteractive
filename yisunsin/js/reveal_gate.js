export function createRevealGate(run) {
  let busy = false;
  let pending = null;

  return {

    hold() { busy = true; },

    want(reveal) {
      if (busy) pending = reveal;
      else run(reveal);
    },

    release() {
      busy = false;
      const reveal = pending;
      pending = null;
      if (reveal) run(reveal);
    },

    get waiting() { return Boolean(pending); },
  };
}
