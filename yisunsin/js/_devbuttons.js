export function bindDevButtons($, { slot, wallet, doSpin, fmt, say }) {

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

  for (const [sel, kind, label] of [
    ['#cheat-fs', 'freespin', '프리스핀'],
    ['#cheat-bonus', 'bonus', '보너스'],
    ['#cheat-jp', 'jackpot', '잭팟'],
    ['#cheat-sea', 'seabattle', '해전'],
    ['#cheat-combo', 'combo', '5콤보'],
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
