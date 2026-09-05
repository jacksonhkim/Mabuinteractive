/**
 * wallet.js — 크레딧 지갑
 *
 * 🔴 경계 B1 (기획서 §2-5): **지갑은 슬롯 밖에 있다.**
 *    슬롯은 지갑을 import 하지 않는다. 주입받아 쓸 뿐이다.
 *    로비가 생기면 여러 슬롯이 이 지갑 하나를 공유한다 — 그때 슬롯 코드는 한 줄도 바뀌지 않는다.
 *
 * 🔴 왜 스스로 장부를 쓰는가
 *    P3 의 종료 조건은 **1,000 스핀 잔액 등식 오차 0** 이다.
 *
 *        최종잔액 == 초기잔액 − 총베팅 + 총당첨 + 보너스환산액
 *
 *    이걸 밖에서 검증하려면 테스트가 모든 입출금을 따라다녀야 한다.
 *    지갑이 직접 누적을 들고 있으면 `check()` 한 번으로 끝난다.
 *    등식이 깨지는 순간을 **그 자리에서** 잡는 것이 목적이다.
 *
 * 🔴 정수만 다룬다
 *    크레딧에 부동소수점을 쓰면 0.1 + 0.2 !== 0.3 이 잔액 오차로 나타난다.
 *    P3 의 "오차 0" 은 부동소수점으로는 달성할 수 없다.
 */

const isInt = (n) => Number.isInteger(n) && Number.isFinite(n);

/**
 * @param {number} initial 초기 잔액 (정수)
 */
export function createWallet(initial) {
  if (!isInt(initial) || initial < 0) {
    throw new TypeError(`wallet: 초기 잔액은 0 이상의 정수여야 한다 (받은 값: ${initial})`);
  }

  let balance = initial;
  let debited = 0;   // 누적 출금 (베팅)
  let credited = 0;  // 누적 입금 (당첨 + 보너스 환산)

  const guard = (amount, who) => {
    if (!isInt(amount) || amount < 0) {
      throw new TypeError(`wallet.${who}: 0 이상의 정수여야 한다 (받은 값: ${amount})`);
    }
  };

  return {
    get balance() {
      return balance;
    },

    /** 이 금액을 낼 수 있는가. debit 을 부르기 전에 확인한다. */
    canAfford(amount) {
      guard(amount, 'canAfford');
      return balance >= amount;
    },

    /**
     * 출금. 잔액이 모자라면 **아무것도 바꾸지 않고** false 를 돌려준다.
     * 잔액 부족은 예외가 아니라 정상적인 게임 흐름이므로 throw 하지 않는다.
     */
    debit(amount) {
      guard(amount, 'debit');
      if (balance < amount) return false;
      balance -= amount;
      debited += amount;
      return true;
    },

    /** 입금. 당첨·보너스 환산이 여기로 들어온다. */
    credit(amount) {
      guard(amount, 'credit');
      balance += amount;
      credited += amount;
    },

    /** 장부 스냅샷 — 검증과 표시에 쓴다. */
    get ledger() {
      return { initial, debited, credited, balance };
    },

    /**
     * 잔액 등식 검증. P3 의 종료 조건 그 자체다.
     * @returns {{ok: boolean, expected: number, actual: number, drift: number}}
     */
    check() {
      const expected = initial - debited + credited;
      return { ok: expected === balance, expected, actual: balance, drift: balance - expected };
    },
  };
}
