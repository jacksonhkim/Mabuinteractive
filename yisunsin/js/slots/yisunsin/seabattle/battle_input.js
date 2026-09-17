import { toFieldPoint } from './battle_view.js';

export function createBattleInput(canvas, field, { onPause, touch = null, view = null } = {}) {
  const state = {
    firing: false,

    blast: false,

    tap: false,
    aimX: field.w / 2,
    aimY: field.h / 2 - 1,
  };

  const pointAt = (ev) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return null;

    const v = view ? view() : null;
    if (v && v.scale > 0) return toFieldPoint(v, r, ev.clientX, ev.clientY);
    return {
      x: ((ev.clientX - r.left) / r.width) * field.w,
      y: ((ev.clientY - r.top) / r.height) * field.h,
    };
  };

  const toField = (ev) => {
    const p = pointAt(ev);
    if (p) { state.aimX = p.x; state.aimY = p.y; }
  };

  let captureOk = true;
  const capture = (ev) => {
    if (!captureOk || typeof canvas.setPointerCapture !== 'function') return;
    try { canvas.setPointerCapture(ev.pointerId); } catch { captureOk = false; }
  };

  const onKeyDown = (ev) => {
    if (ev.code === 'Escape') { if (onPause) onPause(); return; }
    state.tap = true;
    if (ev.code !== 'Space') return;
    state.blast = true;
    ev.preventDefault();
  };

  const onPointerDown = (ev) => {
    state.tap = true;
    if (touch) {
      const p = pointAt(ev);
      if (!p) return;
      capture(ev);
      touch.down(ev.pointerId, p.x, p.y);
      ev.preventDefault();
      return;
    }
    if (ev.button === 2) state.blast = true;
    else if (ev.button === 0) state.firing = true;
    toField(ev);
  };

  const onPointerUp = (ev) => {
    if (touch) { touch.up(ev.pointerId); return; }
    if (ev.button === 0) state.firing = false;
  };

  const onPointerCancel = (ev) => { if (touch) touch.up(ev.pointerId); };

  const onPointerMove = (ev) => {
    if (touch) {
      const p = pointAt(ev);
      if (p) touch.move(ev.pointerId, p.x, p.y);
      return;
    }
    toField(ev);
  };

  const onContextMenu = (ev) => ev.preventDefault();

  const release = () => {
    state.firing = false;
    state.blast = false;
    state.tap = false;
    if (touch) touch.release();
  };

  function attach() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', release);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointercancel', onPointerCancel);
    canvas.addEventListener('contextmenu', onContextMenu);
  }

  function detach() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('blur', release);
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointercancel', onPointerCancel);
    canvas.removeEventListener('contextmenu', onContextMenu);
    release();
  }

  return {
    attach,
    detach,
    release,

    read() {
      const blast = state.blast;
      const tap = state.tap;
      state.blast = false;
      state.tap = false;
      const out = {
        firing: state.firing, blast, tap, aimX: state.aimX, aimY: state.aimY,
      };

      return touch ? touch.apply(out) : out;
    },
  };
}
