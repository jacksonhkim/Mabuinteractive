export function createBgm(sfx, { volume = 1 } = {}) {

  let handle = null;

  let current = null;

  const stack = [];

  function start(id) {
    if (!sfx || !id) return;
    if (current === id) return;
    if (handle) handle.stop();

    handle = sfx.play(id, { volume, bus: 'bgm' });
    current = id;
  }

  function halt() {
    if (handle) handle.stop();
    handle = null;
    current = null;
  }

  return {

    get current() { return current; },

    play(id) { start(id); },

    push(id) {
      stack.push(current);
      start(id);
    },

    pop() {
      if (!stack.length) return;
      const prev = stack.pop();
      if (prev) start(prev);
      else halt();
    },

    stop() {
      stack.length = 0;
      halt();
    },
  };
}
