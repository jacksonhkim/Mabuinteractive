export function shouldAskRotate({ portrait, coarsePointer }) {
  return Boolean(portrait) && Boolean(coarsePointer);
}

function listen(query, fn) {
  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', fn);
    return () => query.removeEventListener('change', fn);
  }
  if (typeof query.addListener === 'function') {
    query.addListener(fn);
    return () => query.removeListener(fn);
  }
  return () => {};
}

export function installOrientationGuard({
  win = globalThis.window,
  doc = globalThis.document,
  pause = () => {},
} = {}) {
  if (!win || !doc || typeof win.matchMedia !== 'function') return () => {};

  const el = doc.getElementById('rotate');
  if (!el) return () => {};

  const portraitQ = win.matchMedia('(orientation: portrait)');
  const coarseQ = win.matchMedia('(pointer: coarse)');
  let blocked = null;

  const tryLock = () => {
    const o = win.screen && win.screen.orientation;
    if (!o || typeof o.lock !== 'function') return;
    try {
      const p = o.lock('landscape');
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {  }
  };

  const sync = () => {
    const want = shouldAskRotate({
      portrait: portraitQ.matches,
      coarsePointer: coarseQ.matches,
    });
    if (want === blocked) return;
    blocked = want;
    el.classList.toggle('shown', want);
    doc.documentElement.classList.toggle('rotate-blocked', want);
    if (want) {
      pause();
      tryLock();
    }
  };

  sync();
  const off = [
    listen(portraitQ, sync),
    listen(coarseQ, sync),
  ];
  win.addEventListener('orientationchange', sync, { passive: true });
  win.addEventListener('resize', sync, { passive: true });

  return () => {
    for (const fn of off) fn();
    win.removeEventListener('orientationchange', sync);
    win.removeEventListener('resize', sync);
  };
}
