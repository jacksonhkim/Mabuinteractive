/**
 * evaluator.js — 라인 평가 · 당첨 산출 (기획서 §6 · §7)
 *
 * 🔴 이 파일은 게임과 RTP 시뮬레이터가 **공유**한다.
 *    (RTP시뮬레이터 기획서 v1.1 §12-1 — 교차 검증 요구사항을 없앤 근거)
 *
 * ⛔ 공유의 전제 조건 — 반드시 지킬 것:
 *    - DOM · Canvas · 전역 상태에 의존하지 않는다
 *    - 입력을 변형하지 않는다 (순수 함수)
 *    - 같은 입력이면 언제나 같은 결과 (결정론)
 *
 * 격자 표현: grid[reel][row] — 릴 5개 × 행 4개 (기획서 §3-1)
 * 페이라인 : [[r0, r1, r2, r3, r4], ...] — 릴별 행 인덱스
 */

export const WILD = "s1_wild";
export const SCATTER = "s2_scatter";
export const BONUS = "s3_bonus";

/**
 * 프리스핀 트리거 — 난중일기 (결재 2026-08-25)
 *
 * 🔴 왜 SCATTER 와 나누는가
 *    함대(SCATTER)는 "흩어져 있어도 배당"이라는 뜻이고, 프리스핀은 별개 개념이다.
 *    한 심볼이 둘을 겸하면 유저는 무엇 때문에 무엇을 받았는지 알 수 없다.
 *    난중일기가 트리거만, 함대가 배당만 맡는다.
 *
 * ⛔ 이 심볼은 **배당을 갖지 않는다.** 트리거 심볼에 배당까지 주면
 *    23번째 심볼이 RTP 를 밀어 올려 이미 과한 총 RTP 가 더 커진다.
 */
export const FREE = "s5_free";

/** 라인 배당에 참여하지 않는 특수 심볼 */
const SPECIAL = new Set([WILD, SCATTER, BONUS, FREE]);

/** 최소 연속 수 (R2) */
export const MIN_RUN = 3;

/**
 * 프리스핀 트리거 FREE 개수 (§7-2)
 *
 * ⛔ 이름을 `SCATTER_TRIGGER` 에서 바꾼 것은 단순 개명이 아니다.
 *    세는 대상이 함대에서 난중일기로 **바뀌었다.** 옛 이름을 남겨 두면
 *    부르는 쪽이 예전 의미로 착각한다.
 */
export const FREE_TRIGGER = 3;

/**
 * **보너스 게임** 트리거 — BONUS(보물상자) **개수** (대표님 결재 2026-09-05)
 *
 * 📌 코드 식별자는 `legendary` 로 남아 있다 (legendary.js 머리말 참조).
 *
 * 🔴 세는 방식이 바뀌었다. 예전에는 「페이라인 3연속」이었다.
 *    위치 제약이 사라졌으므로 같은 3 이라도 훨씬 자주 성립한다 —
 *    50칸 그대로 두면 1/20 이 된다(실측). 릴 칸수를 18 로 줄여 1/348 로 맞췄다.
 *
 * ⛔ 보물상자는 이제 **해전을 열지 않는다.** 해전은 SCATTER_TRIGGER 의 몫이다.
 */
export const BONUS_TRIGGER = 3;

/**
 * **해전 미니게임** 트리거 — SCATTER(함대) **개수** (대표님 결재 2026-09-05)
 *
 * ⛔ 이 게임에서 「보너스 게임」은 **보물상자 3개 → 무료 스핀 10회**를 뜻한다.
 *    탑뷰 슈팅은 「해전 미니게임」이다 — 2026-09-05 에 이름이 뒤집혔다.
 *
 * 🔴 함대는 배당(2·12·58배)을 박탈당하고 트리거 전용이 되었다.
 *    특수 심볼 셋이 모두 「트리거만, 배당은 없음」으로 통일된다.
 *    실측 1/203 — 보너스게임 기획서 §1 목표 1/150~1/250 안이다.
 */
export const SCATTER_TRIGGER = 3;

/**
 * 잭팟 트리거 — 거북선 연속 수 (기획서 §10 · 결재 2026-08-25)
 *
 * 🔴 기획서 원안은 **5연속**이었으나 실측 500만 스핀에 **0회**였다.
 *    거북선은 릴당 2칸이라 특정 라인 다섯 칸이 모두 거북선일 확률이 10⁻¹⁰ 수준이다.
 *    액자만 걸려 있고 영원히 열리지 않는 잭팟이 된다.
 *
 *    **4연속 + WILD 대체 허용**으로 확정했다 — 실측 1/69,767, 평균 누적 748배.
 *    최대 단일 당첨(657배)을 막 넘어서므로 게임에서 가장 큰 것이 되면서 터무니없지 않다.
 */
export const JACKPOT = "h2_geobukseon";
export const JACKPOT_RUN = 4;

/**
 * 페이라인 경로가 지나는 심볼 5개를 읽는다.
 * @param {string[][]} grid
 * @param {number[]} line 릴별 행 인덱스
 * @returns {string[]}
 */
function readLine(grid, line) {
  const out = new Array(line.length);
  for (let reel = 0; reel < line.length; reel++) {
    out[reel] = grid[reel][line[reel]];
  }
  return out;
}

/**
 * 라인 스캔 — 배당표와 무관하게 **성립한 연속**만 찾는다 (기획서 §6-2 알고리즘 · R1~R6)
 *
 * 🔴 RTP 시뮬레이터의 히트 카운트가 이 함수를 그대로 쓴다.
 *    (RTP시뮬레이터 기획서 §3-1 — 발생 횟수는 릴 스트립에만 의존하고 배당표와 독립이다)
 *    평가 로직이 한 곳에만 있으므로 도구와 게임이 어긋날 수 없다.
 *
 * @param {string[][]} grid
 * @param {number[][]} paylines
 * @returns {Array<{line:number, symbol:string, count:number}>}
 */
export function scanLines(grid, paylines) {
  const hits = [];

  for (let li = 0; li < paylines.length; li++) {
    const syms = readLine(grid, paylines[li]);

    // (1) 기준 심볼 — 왼쪽부터 훑어 최초로 등장하는 '일반 심볼'
    let base = null;
    for (const s of syms) {
      if (!SPECIAL.has(s)) { base = s; break; }
    }
    if (base === null) continue;          // R6 — 라인 전체가 특수 심볼

    // (2) 좌측 시작 조건 — 릴0이 base 이거나 WILD 여야 한다 (R1)
    if (syms[0] !== WILD && syms[0] !== base) continue;

    // (3) 연속 길이 — 릴0부터 끊길 때까지 (R5 WILD 대체)
    let n = 0;
    for (const s of syms) {
      if (s === base || s === WILD) n++;
      else break;
    }

    // 라인당 최장 1건만 기록한다 (R2 · R3 · R4)
    if (n < MIN_RUN) continue;
    hits.push({ line: li, symbol: base, count: n });
  }

  return hits;
}

/**
 * 라인 당첨 평가 (기획서 §6-2 · R1~R7)
 *
 * @param {string[][]} grid
 * @param {number[][]} paylines
 * @param {Object} paytable  { 심볼코드: { 3: n, 4: n, 5: n } }
 * @param {number} lineBet
 * @returns {{ total: number, wins: Array<{line:number, symbol:string, count:number, pay:number}> }}
 */
export function evaluateLines(grid, paylines, paytable, lineBet) {
  const wins = [];
  let total = 0;

  for (const h of scanLines(grid, paylines)) {
    const pay = (paytable[h.symbol]?.[h.count] ?? 0) * lineBet;
    if (pay <= 0) continue;
    wins.push({ ...h, pay });
    total += pay;                          // R7 — 라인 간 합산
  }

  return { total, wins };
}

/**
 * SCATTER 개수 (§7-2 · R8) — 위치 무관, 격자 전체에서 센다.
 * WILD 는 SCATTER 를 대체하지 않는다.
 * @param {string[][]} grid
 * @returns {number}
 */
export function countScatter(grid) {
  return countOf(grid, SCATTER);
}

/**
 * FREE(난중일기) 개수 — 프리스핀 트리거 판정용. 위치 무관.
 * WILD 는 FREE 를 대체하지 않는다 (SCATTER 와 같은 이유 — 트리거율이 통제 불능이 된다).
 * @param {string[][]} grid
 * @returns {number}
 */
export function countFree(grid) {
  return countOf(grid, FREE);
}

/** 격자 전체에서 특정 심볼을 센다 */
function countOf(grid, code) {
  let n = 0;
  for (const reel of grid) {
    for (const s of reel) {
      if (s === code) n++;
    }
  }
  return n;
}

/**
 * BONUS(보물상자) 개수 — 레전더리 스핀 트리거 판정용. 위치 무관.
 *
 * ⛔ WILD 는 BONUS 를 대체하지 않는다 (결재 2026-08-22 ②).
 *    대체를 허용하면 트리거 빈도가 통제 불능이 된다.
 *
 * @param {string[][]} grid
 * @returns {number}
 */
export function countBonus(grid) {
  return countOf(grid, BONUS);
}

/**
 * 잭팟 트리거 판정 (기획서 §10)
 *
 * 🔴 BONUS 와 달리 **WILD 대체를 허용한다.**
 *    허용하지 않으면 실측상 트리거가 나오지 않기 때문이다 (위 주석).
 *
 * 📌 릴0 에는 WILD 가 없다 (§7-1). 따라서 첫 칸은 반드시 진짜 거북선이며,
 *    WILD 만으로 이루어진 연속은 성립할 수 없다.
 *
 * @param {string[][]} grid
 * @param {number[][]} paylines
 * @returns {{ hit: boolean, lines: number[], maxRun: number }}
 */
export function detectJackpot(grid, paylines) {
  const lines = [];
  let maxRun = 0;

  for (let li = 0; li < paylines.length; li++) {
    const syms = readLine(grid, paylines[li]);
    let n = 0;
    for (const s of syms) {
      if (s === JACKPOT || s === WILD) n++;
      else break;
    }
    if (n > maxRun) maxRun = n;
    if (n >= JACKPOT_RUN) lines.push(li);
  }

  return { hit: lines.length > 0, lines, maxRun };
}

/**
 * 1회 스핀 종합 판정 (§6-4 총 당첨 계산식)
 *
 * @param {string[][]} grid
 * @param {Object} cfg
 * @param {number[][]} cfg.paylines
 * @param {Object} cfg.paytable
 * @param {number} cfg.lineBet
 * @param {number} cfg.totalBet
 * @param {number} [cfg.multiplier=1] 프리스핀 배수 — 라인 당첨에만 적용
 * @returns {Object}
 */
export function evaluateSpin(grid, cfg) {
  const {
    paylines, paytable, lineBet, multiplier = 1,
  } = cfg;

  const line = evaluateLines(grid, paylines, paytable, lineBet);
  const scatterCount = countScatter(grid);
  const freeCount = countFree(grid);
  const bonusCount = countBonus(grid);
  const jack = detectJackpot(grid, paylines);

  // 📌 프리스핀 배수는 라인 당첨에만 적용한다 (§6-4)
  const lineWin = line.total * multiplier;

  return {
    lineWin,
    // 🔴 함대 배당이 박탈되어 spinWin 은 라인 당첨뿐이다 (결재 2026-09-05)
    spinWin: lineWin,
    scatterCount,
    freeCount,
    bonusCount,
    // 🔴 심볼 하나가 트리거 하나를 연다 — 난중일기/함대/보물상자 순
    freespinTrigger: freeCount >= FREE_TRIGGER,
    seaBattleTrigger: scatterCount >= SCATTER_TRIGGER,
    legendaryTrigger: bonusCount >= BONUS_TRIGGER,
    jackpotHit: jack.hit,
    jackpotLines: jack.lines,
    // 🔴 근접 연출용 — 3개까지 붙으면 액자가 반짝인다 (라벨 대신 택한 방식)
    jackpotRun: jack.maxRun,
    wins: line.wins,
  };
}
