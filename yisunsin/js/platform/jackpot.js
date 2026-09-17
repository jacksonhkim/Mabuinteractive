export function createJackpot({ seed, contributionRate }) {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new Error('createJackpot: seed 는 0 이상 정수여야 한다');
  }
  if (!(contributionRate > 0 && contributionRate < 1)) {
    throw new Error('createJackpot: contributionRate 는 0~1 사이여야 한다');
  }

  let pot = seed;

  let carry = 0;

  const ledger = { contributed: 0, paid: 0, claims: 0 };

  return {

    get value() {
      return pot;
    },

    get seed() {
      return seed;
    },

    get rate() {
      return contributionRate;
    },

    contribute(totalBet) {
      if (!(totalBet > 0)) return 0;
      const exact = totalBet * contributionRate + carry;
      const add = Math.floor(exact);
      carry = exact - add;
      pot += add;
      ledger.contributed += add;
      return add;
    },

    claim() {
      const won = pot;
      pot = seed;
      ledger.paid += won;
      ledger.claims += 1;
      return won;
    },

    get ledger() {
      return { ...ledger, carry };
    },

    check() {
      const expected = seed + ledger.contributed - ledger.paid + seed * ledger.claims;
      return { ok: expected === pot, expected, actual: pot, drift: pot - expected };
    },
  };
}
