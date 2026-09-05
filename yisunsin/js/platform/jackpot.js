/**
 * jackpot.js — 누적 보너스 (기획서 §10)
 *
 * 🔴 지갑과 같은 층에 있다. **슬롯 밖 소유**다.
 *    §2-5 모듈 계약이 `jackpot: { value(), contribute(n), claim() }` 을
 *    주입 서비스로 이미 규정해 두었다. 슬롯은 이 세 함수만 부른다.
 *
 *    지금은 슬롯별 독립이지만, 로비가 붙어 **여러 슬롯이 하나의 잭팟을 나눠 쓰는 날**
 *    바뀌는 것은 이 파일 하나뿐이고 `slot.js` 는 한 줄도 안 바뀐다.
 *    지갑을 밖으로 뺀 것과 정확히 같은 이유다 (경계 B1).
 *
 * 🔴 적립분은 RTP 를 낮추지 않는다 (§10).
 *    쌓인 것은 획득 시점에 전액 돌아간다. 하우스가 가져가는 몫이 아니다.
 */

/**
 * @param {object} cfg
 * @param {number} cfg.seed             시드 — 초기값이자 획득 후 재시작 값
 * @param {number} cfg.contributionRate 적립률 (0.01 = 총베팅의 1%)
 */
export function createJackpot({ seed, contributionRate }) {
  if (!Number.isInteger(seed) || seed < 0) {
    throw new Error('createJackpot: seed 는 0 이상 정수여야 한다');
  }
  if (!(contributionRate > 0 && contributionRate < 1)) {
    throw new Error('createJackpot: contributionRate 는 0~1 사이여야 한다');
  }

  let pot = seed;

  /**
   * 🔴 소수점 이월분.
   *    최소 베팅 20 에 1% 면 0.2 다. 매번 버림하면 **영원히 0 원이 적립된다.**
   *    남은 소수를 들고 있다가 1 이 되는 순간 넣는다 — 장기 적립률이 정확히 1% 가 된다.
   */
  let carry = 0;

  // 장부는 스스로 센다. 밖에서 따로 집계하면 두 숫자가 어긋나는 날이 온다.
  const ledger = { contributed: 0, paid: 0, claims: 0 };

  return {
    /** 현재 누적액 — 화면 상단이 이 값을 띄운다 */
    get value() {
      return pot;
    },

    get seed() {
      return seed;
    },

    get rate() {
      return contributionRate;
    },

    /**
     * 총베팅의 일정 비율을 적립한다.
     *
     * ⛔ 프리스핀 중에는 부르지 않는다 — 베팅을 걷지 않으므로 적립할 재원이 없다.
     *    그 판단은 `slot.js` 가 한다. 이 파일은 시키는 대로 넣을 뿐이다.
     *
     * @param {number} totalBet
     * @returns {number} 이번에 실제로 들어간 정수 금액
     */
    contribute(totalBet) {
      if (!(totalBet > 0)) return 0;
      const exact = totalBet * contributionRate + carry;
      const add = Math.floor(exact);
      carry = exact - add;
      pot += add;
      ledger.contributed += add;
      return add;
    },

    /**
     * 전액을 내주고 시드로 되돌린다.
     * @returns {number} 지급액
     */
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

    /**
     * 장부 정합 검사.
     * `시드 + 적립 − 지급 + (되돌린 시드 × 지급 횟수) = 현재액`
     *
     * 🔴 지급할 때마다 시드가 새로 들어가므로 그 몫을 더해야 등식이 선다.
     *    이걸 빼고 세면 지급이 일어난 뒤부터 계속 어긋난 값이 나온다.
     */
    check() {
      const expected = seed + ledger.contributed - ledger.paid + seed * ledger.claims;
      return { ok: expected === pot, expected, actual: pot, drift: pot - expected };
    },
  };
}
