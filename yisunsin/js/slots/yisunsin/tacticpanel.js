/**
 * tacticpanel.js — N2 좌측 전략 패널을 화면에 반영한다
 *
 * 🔴 판정은 `tacticplan.js`(순수 함수)가 하고, 여기서는 **보여 주기만** 한다.
 *    같은 분리를 `jackpotplan`/`jackpotfx`, `winfxplan`/`winfxrender` 에서 썼다.
 *
 * 🔴 왜 별도 파일인가 — `main.js` 가 299/300(H1)이다. 새 기능은 처음부터 밖에 짓는다.
 *
 * ⛔ 이동 없이 **투명도만** 바꾼다 (연출기획서 §7-2 — 이동 금지).
 */
import { planTactic, SCREENS, TICK_MS } from './tacticplan.js';

/**
 * @param {(sel:string)=>Element} $ 선택자 헬퍼
 * @param {{state:object}} slot
 * @returns {{update:Function, stop:Function}}
 */
export function createTacticPanel($, slot) {
  // ⛔ 가짜 DOM 은 실물보다 모자라다 — `querySelectorAll` 이 없을 수 있다.
  //    없는 것을 부르면 기동이 통째로 끊긴다(boot 스모크에서 실측).
  const root = $('#tactic');
  const ok = root && typeof root.querySelectorAll === 'function';
  if (!ok) return { update() {}, stop() {} };

  const frames = new Map();
  for (const el of root.querySelectorAll('.tc-frame')) {
    frames.set(el.dataset.screen, el);
  }
  const dots = [...root.querySelectorAll('.tc-dots li')];

  let shown = null;
  let timer = 0;
  const start = Date.now();

  const paint = () => {
    const { screen } = planTactic(slot.state, Date.now() - start);
    if (screen === shown) return;
    shown = screen;
    for (const [name, el] of frames) el.classList.toggle('tc-on', name === screen);
    const i = SCREENS.indexOf(screen);
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };

  paint();
  // 🔴 자주 다시 판정한다. 화면은 5초 주기지만 **모드 전환·근접은 언제든 끼어들 수 있어서**
  //    주기에 맞춰 재우면 그 순간을 놓친다.
  timer = setInterval(paint, TICK_MS);

  return {
    /** 상태가 바뀌었을 때 화면 쪽에서 즉시 부른다 — 다음 tick 을 기다리지 않는다 */
    update: paint,
    stop() { if (timer) { clearInterval(timer); timer = 0; } },
  };
}
