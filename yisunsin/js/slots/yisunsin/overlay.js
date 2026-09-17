export function showStage() {
  try {
    if (window.scrollY > 0) window.scrollTo(0, 0);
  } catch {  }
}

export function liftOverlay($, sel, hostSel = '#stage') {
  const el = $(sel);
  const host = $(hostSel);

  if (!el || !host || el.parentElement === host) return () => {};

  const home = el.parentElement;
  const next = el.nextSibling;
  let lifted = false;
  try {
    host.appendChild(el);
    lifted = true;
  } catch {  }

  return () => {
    if (!lifted) return;
    lifted = false;
    try {

      if (next && next.parentNode === home) home.insertBefore(el, next);
      else home.appendChild(el);
    } catch {  }
  };
}
