/**
 * _devbuttons.js — 개발용 버튼 연결
 *
 * ⛔ **P8 QA 에서 이 파일과 다음 세 곳을 함께 삭제한다.**
 *      · `main.js` 의 import 와 `bindDevButtons()` 호출
 *      · `index.html` 의 `<p class="dev">` 블록
 *      · `slot.js` 의 `forceNextSpin()` 과 `_devtools.js` import
 *
 * 파일명을 `_` 로 시작한 이유가 그것이다 — 지울 대상임을 이름으로 표시한다.
 */

/**
 * @param {(sel: string) => HTMLElement|null} $
 * @param {object} o
 * @param {object} o.slot
 * @param {object} o.wallet
 * @param {() => void} o.doSpin
 * @param {(n: number) => string} o.fmt
 * @param {(msg: string) => void} o.say
 */
export function bindDevButtons($, { slot, wallet, doSpin, fmt, say }) {
  // 🔴 없는 요소에 리스너를 걸면 기동 자체가 죽는다.
  //    개발용 버튼은 배포 때 사라지므로 특히 확인해야 한다.
  const on = (sel, fn) => {
    const el = $(sel);
    if (el) el.addEventListener('click', fn);
  };

  on('#ledger', () => {
    const c = wallet.check();
    const l = wallet.ledger;
    say(c.ok
      ? `잔액 등식 정상 — 오차 0 · 베팅 ${fmt(l.debited)} / 당첨 ${fmt(l.credited)}`
      : `🔴 등식 붕괴 — 오차 ${c.drift}`);
  });

  const winButton = $('#cheat-win');
  const markNormalWin = (active) => {
    if (!winButton) return;
    winButton.textContent = `일반 WIN 연속: ${active ? 'ON' : 'OFF'}`;
    winButton.setAttribute('aria-pressed', String(active));
  };
  markNormalWin(slot.normalWinCheat);

  on('#cheat-win', () => {
    const active = !slot.normalWinCheat;
    if (!slot.setNormalWinCheat(active)) {
      say('일반 WIN 연속 모드는 기본 게임에서만 켤 수 있습니다');
      return;
    }
    markNormalWin(active);
    say(`일반 WIN 연속 모드 ${active ? 'ON' : 'OFF'}`);
  });

  // 트리거율이 1.29%(프리스핀)·0.47%(보너스)라 손으로 돌려서는 연출을 볼 수 없다
  for (const [sel, kind, label] of [
    ['#cheat-fs', 'freespin', '프리스핀'],
    ['#cheat-bonus', 'bonus', '보너스'],
    ['#cheat-jp', 'jackpot', '잭팟'],   // 1/69,767 — 손으로는 확인이 불가능하다
  ]) {
    on(sel, () => {
      slot.setNormalWinCheat(false);
      markNormalWin(false);
      slot.forceNextSpin(kind);
      say(`다음 스핀에 ${label} 트리거`);
      if (!slot.state.spinning && !slot.state.awaitingChoice) doSpin();
    });
  }
}
