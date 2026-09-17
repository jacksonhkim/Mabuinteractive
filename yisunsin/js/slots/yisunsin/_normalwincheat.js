const MAX_ATTEMPTS = 4096;

export function isNormalWinResult(result, totalBet) {
  if (!result || !(totalBet > 0)) return false;
  const wins = Array.isArray(result.wins) ? result.wins : [];
  return result.spinWin > 0
    && result.spinWin < totalBet * 10
    && result.lineWin === result.spinWin
    && wins.length === 1
    && wins[0].count === 3
    && !result.freespinTrigger
    && !result.seaBattleTrigger
    && !result.legendaryTrigger
    && !result.jackpotHit;
}

export function findNormalWinPositions(
  nextPositions,
  evaluatePositions,
  totalBet,
  maxAttempts = MAX_ATTEMPTS,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const positions = nextPositions();
    if (isNormalWinResult(evaluatePositions(positions), totalBet)) return positions;
  }
  throw new Error(`일반 WIN 강제 후보를 ${maxAttempts}회 안에 찾지 못했습니다`);
}
