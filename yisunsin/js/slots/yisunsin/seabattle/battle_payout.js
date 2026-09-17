export function convertScore(score, totalBet, payout) {
  const raw = score * payout.conversionRate;
  const mult = Math.min(payout.capHigh, Math.max(payout.capLow, raw));
  return {

    award: Math.round(mult * totalBet),
    mult,

    capped: raw >= payout.capHigh,
  };
}
