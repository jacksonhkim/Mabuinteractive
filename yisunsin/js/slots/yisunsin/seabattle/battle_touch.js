export const BLAST_BTN_R = 44;

export const BLAST_BTN_MARGIN = 80;

export function blastButtonAt(field) {
  return { x: field.w - BLAST_BTN_MARGIN, y: field.h - BLAST_BTN_MARGIN, r: BLAST_BTN_R };
}

export function createTouchControls(field) {
  const btn = blastButtonAt(field);

  const aim = { id: -1, on: false, x: 0, y: 0 };

  const blast = { id: -1, on: false };

  let blastLatch = false;

  const inButton = (x, y) => {
    const dx = x - btn.x;
    const dy = y - btn.y;
    return dx * dx + dy * dy <= btn.r * btn.r;
  };

  return {

    down(id, x, y) {

      if (!blast.on && inButton(x, y)) {
        blast.id = id;
        blast.on = true;
        blastLatch = true;
        return 'blast';
      }

      if (aim.on) return '';
      aim.id = id;
      aim.on = true;
      aim.x = x; aim.y = y;
      return 'aim';
    },

    move(id, x, y) {
      if (id === aim.id) { aim.x = x; aim.y = y; }
    },

    up(id) {
      if (id === aim.id) { aim.on = false; aim.id = -1; }
      else if (id === blast.id) { blast.on = false; blast.id = -1; }
    },

    release() {
      aim.on = false; aim.id = -1;
      blast.on = false; blast.id = -1;
      blastLatch = false;
    },

    apply(out) {
      if (aim.on) {
        out.firing = true;
        out.aimX = aim.x;
        out.aimY = aim.y;
      }
      if (blastLatch) { out.blast = true; blastLatch = false; }
      return out;
    },

    view() {
      return {
        aim: { on: aim.on, x: aim.x, y: aim.y },
        blast: { on: blast.on, x: btn.x, y: btn.y, r: btn.r },
      };
    },
  };
}
