const isInt = (n) => Number.isInteger(n) && Number.isFinite(n);

export function createWallet(initial) {
  if (!isInt(initial) || initial < 0) {
    throw new TypeError(`wallet: 초기 잔액은 0 이상의 정수여야 한다 (받은 값: ${initial})`);
  }

  let balance = initial;
  let debited = 0;
  let credited = 0;

  const guard = (amount, who) => {
    if (!isInt(amount) || amount < 0) {
      throw new TypeError(`wallet.${who}: 0 이상의 정수여야 한다 (받은 값: ${amount})`);
    }
  };

  return {
    get balance() {
      return balance;
    },

    canAfford(amount) {
      guard(amount, 'canAfford');
      return balance >= amount;
    },

    debit(amount) {
      guard(amount, 'debit');
      if (balance < amount) return false;
      balance -= amount;
      debited += amount;
      return true;
    },

    credit(amount) {
      guard(amount, 'credit');
      balance += amount;
      credited += amount;
    },

    get ledger() {
      return { initial, debited, credited, balance };
    },

    check() {
      const expected = initial - debited + credited;
      return { ok: expected === balance, expected, actual: balance, drift: balance - expected };
    },
  };
}
