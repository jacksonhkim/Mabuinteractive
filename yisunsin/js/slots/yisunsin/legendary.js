import { WILD } from './evaluator.js';

/**
 * legendary.js — **보너스 게임** (무료 스핀 10회 · WILD 좌측 누적)
 *
 * 🔴 **화면·문서 표기는 「보너스 게임」이다** (대표님 결재 2026-09-05).
 *    코드 식별자만 `legendary` 로 남겼다 — 옛 `bonus` 키(지금은 `seaBattle`)와
 *    이름을 맞바꾸면 한 곳만 놓쳐도 해전 캡이 이쪽에 물린다.
 *    ⛔ 예전에는 「보너스 게임」이 **해전 탑뷰 슈팅**을 가리켰다. 뒤집혔으니 옛 문서 주의.
 *
 * 🔴 무엇인가
 *    보물상자(BONUS) 3개 이상이면 **10회 무료 스핀**이 즉시 시작된다.
 *    선택 화면이 없고 **배수도 없다**(×1) — 난중일기 프리스핀과 갈리는 지점이 여기다.
 *
 * 🔴 배수 대신 무엇이 있는가 — **스티키 WILD**
 *    등장한 WILD 가 **그 자리에 고정**되어 남은 스핀 동안 유지된다.
 *    뒤로 갈수록 화면이 WILD 로 차오르므로, 고정된 숫자 배수가 아니라
 *    **플레이어가 눈으로 보는 누적**이 배당을 키운다.
 *    실측 — 실효 배수 ×5.16 · 라운드당 총베팅 45.1배 · 10스핀 누적 WILD 평균 3.94개
 *          (0개로 끝날 확률은 1.48% 뿐이다 — 10회이기에 사실상 항상 쌓인다).
 *
 * 🔴 왜 기존 프리스핀 구조를 그대로 쓰는가
 *    `slot.js` 의 프리스핀 상태(`{option, left, retriggers, won, bet}`)와
 *    러너·정산·총액 합산이 이미 완성돼 있다. 모양만 맞춰 주면
 *    **한 줄도 새로 짜지 않고** 5회가 돌아간다.
 *    재트리거도 공짜로 막힌다 — 조건이 `retriggers < option.retrigger` 이므로
 *    `retrigger: 0` 이면 `0 < 0` 이 되어 **구조적으로** 성립하지 않는다.
 *
 * 🔴 왜 파일을 나눴는가
 *    `slot.js` 가 297/300(H1)이라 자리가 없다. 그리고 이 규칙들은
 *    DOM·타이머를 모르는 순수 계산이라 밖에 두는 편이 맞다
 *    (`jackpotplan.js`·`winfxplan.js` 선례).
 */

/**
 * 트리거 직후의 레전더리 스핀 상태를 만든다.
 *
 * ⛔ 설정을 **베껴 담는다.** 그대로 물리면 `data/paytable.json` 에서 읽어 온
 *    객체를 게임이 들고 다니게 되어, 한 번의 실수로 정본이 오염된다.
 *
 * @param {{spins:number, multiplier:number, retrigger:number}} cfg `paytable.legendary`
 * @param {number} bet 트리거 당시 총베팅 — 프리스핀과 같은 규칙으로 고정한다
 * @returns {{option:object, left:number, retriggers:number, won:number, bet:number}}
 */
export function beginLegendary(cfg, bet) {
  return {
    option: { ...cfg },
    left: cfg.spins,
    retriggers: 0,
    won: 0,
    bet,
    // 🔴 릴별로 **고정된 행 번호**를 담는다. 스티키가 아니면 아예 만들지 않는다 —
    //    없는 것과 빈 것을 구별해야 프리스핀이 실수로 스티키가 되지 않는다.
    stuck: cfg.sticky ? [[], [], [], [], []] : null,
  };
}

/**
 * 이번 스핀에 열 칸 수를 정한다.
 *
 * 🔴 왜 「보장」이 아니라 「배분」인가 (대표님 지시 2026-09-05)
 *    옛 방식은 *끝까지 안 나오면 그때* 심었다(`landed + left <= 3`).
 *    실측 — 강제 배치의 **100% 가 마지막 3스핀**에 몰려 앞 3스핀 0.50릴 vs
 *    뒤 3스핀 1.94릴(**4배**)이 됐고, 화면에서는 「갑툭튀」로 보였다.
 *    이제 **매 스핀 반드시** 정해진 칸수가 열린다 — 0칸 스핀이 없다.
 *
 * 📌 스핀1·2 는 기본 1칸씩 확정, 그 뒤로는 1~3칸을 가중 확률로 뽑는다.
 *    가중 70:25:5 → 스핀당 평균 1.35칸 · 종료 12.8칸(64%)으로
 *    **직전 방식의 최종 밀도(12.5칸)를 거의 그대로 유지**하면서 편중만 사라진다.
 *
 * @param {object} round 진행 중인 레전더리 상태
 * @param {{int:(n:number)=>number}} rng 결정론 난수
 * @returns {number} 이번 스핀에 열 칸 수
 */
export function planFill(round, rng) {
  const plan = round && round.option && round.option.fillPlan;
  if (!plan) return 0;

  const spun = (round.option.spins || 0) - round.left;   // 0-based
  if (spun < (plan.openingSpins || 0)) return plan.opening || 1;

  const w = plan.weights || [1];
  let t = rng.int(w.reduce((a, b) => a + b, 0));
  let k = 0;
  while (k < w.length - 1 && t >= w[k]) { t -= w[k]; k += 1; }
  return k + 1;
}

/**
 * 고정된 WILD 를 격자에 적용한다.
 *
 * 두 가지를 한 번에 한다 —
 *   ① 이번 스핀 몫(`planFill`)만큼 **왼쪽 열부터, 열 안에서는 위→아래**로 연다
 *   ② 지금까지 열린 칸을 전부 **WILD 로 덮는다**
 *
 * 🔴 **좌측부터 세로 누적** (대표님 지시). 왼쪽이 채워질수록 기대가 커지는 구조가
 *    이 게임의 라인 규칙(R1 — 릴0 부터 이어져야 성립)과 맞는다.
 *    릴0 이 열리는 순간 25라인 전부가 시작 조건을 통과한다.
 *
 * ⚠️ **`rng` 가 없으면 새로 열지 않는다.** 치트 탐색(`evaluatePositions`)처럼
 *    같은 라운드를 여러 번 재보는 쪽이 판을 바꾸면 안 된다.
 *
 * ⛔ 입력 격자는 변형하지 않고 **새 격자를 돌려준다.**
 * 📌 `round.stuck` 에는 **기록한다** — 그것이 「누적」의 실체다.
 *
 * @param {object|null} round `slot.js` 의 프리스핀 상태
 * @param {string[][]} grid 이번 스핀 격자
 * @param {{int:(n:number)=>number}} [rng] 있으면 이번 스핀 몫을 새로 연다
 */
export function applySticky(round, grid, rng) {
  if (!round || !round.stuck || !grid) return grid;

  const reels = grid.length;
  const rows = grid[0] ? grid[0].length : 0;
  const out = grid.map((reel) => reel.slice());

  if (rng) {
    let n = planFill(round, rng);
    for (let c = 0; c < reels && n > 0; c++) {
      for (let r = 0; r < rows && n > 0; r++) {
        if (!round.stuck[c].includes(r)) { round.stuck[c].push(r); n -= 1; }
      }
    }
  }

  for (let c = 0; c < reels; c++) {
    for (const r of round.stuck[c] || []) out[c][r] = WILD;
  }
  return out;
}

/**
 * 진행 중인 라운드에서 성립하면 안 되는 판정을 지운다.
 *
 * 🔴 **프리스핀·레전더리 중 — 레전더리·해전 트리거 불가** (결재 2026-08-22 ③).
 *    배수와 보너스 캡이 겹치면 RTP 상단이 통제되지 않는다.
 *    동시 성립 확률은 약 1/26,000 이라 체감 손해가 사실상 없다.
 *
 * 🔴 **레전더리 중 — 잭팟 판정 정지** (2026-09-05 실측 결함).
 *    `detectJackpot` 은 WILD 대체를 허용하되 **「릴0 에는 WILD 가 없다」** 는
 *    전제 위에 서 있다(evaluator.js §7-1 주석). 그래야 첫 칸이 진짜 거북선이라
 *    WILD 만으로 이루어진 연속이 성립하지 않는다.
 *    ⛔ **십자 확장이 릴0 에 WILD 를 만들면서 그 전제가 깨졌다.**
 *       실측 — 레전더리 중 잭팟이 **1/2 스핀**(베이스 1/69,767 의 39,403배),
 *       그중 **100% 가 WILD 4개만으로** 성립했다. 잭팟 풀이 즉시 고갈된다.
 *    막는 논리는 위 결재와 같다 — 인위적으로 쌓은 판이 확률 설계를 무너뜨린다.
 *
 * ⛔ 원본을 변형하지 않는다. 결과 객체는 여러 곳이 돌려 보므로
 *    여기서 자리에 고쳐 쓰면 나중에 원인을 찾을 수 없는 어긋남이 된다.
 *
 * @param {object|null} result `evaluateSpin` 결과
 * @param {object|null} round 진행 중인 프리스핀 상태 (레전더리면 `stuck` 을 갖는다)
 */
export function suppressInFree(result, round) {
  if (!result || !round) return result;
  const out = { ...result, legendaryTrigger: false, seaBattleTrigger: false };
  if (round.stuck) {
    out.jackpotHit = false;
    out.jackpotLines = [];
  }
  return out;
}

/**
 * 이 라운드가 읽어야 할 릴을 고른다.
 *
 * 🔴 레전더리는 **전용 릴**을 쓴다 (`paytable.legendary.strips`).
 *    본편 릴(WILD 릴당 7칸)로 십자 확장을 돌리면 화면이 뒤덮여
 *    라운드 획득이 852배·RTP 기여 239%p 로 폭발한다(실측).
 *
 * ⛔ 길이는 본편과 같다(치환). 그래서 `positions` 를 그대로 쓸 수 있고
 *    릴 회전 연출도 손댈 필요가 없다.
 *
 * @param {object} all `data/strips.json` 전체
 * @param {object|null} round 현재 프리스핀 상태
 */
export function stripsFor(all, round) {
  const name = round && round.option && round.option.strips;
  return (name && all[name]) || all.strips;
}

/**
 * 화면(렌더러)에 이번 라운드의 릴과 고정 칸을 알린다.
 *
 * 🔴 **판정과 화면이 같은 것을 봐야 한다.** `render.js` 는 `state.grid` 가 아니라
 *    스트립에서 직접 심볼을 뽑으므로, 이 동기화가 없으면 **쌓인 WILD 가 화면에
 *    보이지 않는다** — 계산만 맞고 플레이어는 아무것도 못 본다.
 *
 * 📌 `main.js` 가 300줄(H1)에 닿아 있어 여기에 둔다.
 *
 * @param {{setRound:Function}} renderer
 * @param {{state:object}} slot
 * @param {object} all `data/strips.json` 전체
 */
export function syncRound(renderer, slot, all, seen = null, positions = null) {
  const f = slot.state.freespin;
  if (!f || !f.stuck) {
    renderer.setRound(null, null);
    renderer.setPending(null, null);
    return null;
  }
  const cells = new Set();
  for (let c = 0; c < f.stuck.length; c += 1) {
    for (const r of f.stuck[c]) cells.add([c, r].join(','));
  }
  const fresh = new Set();
  for (const key of cells) if (!seen || !seen.has(key)) fresh.add(key);
  const reels = all.legendaryStrips || all.strips;

  if (positions) {
    // 🔴 **스핀 시작** — 이미 열린 칸만 고정으로 두고, 이번에 열릴 칸은
    //    **정지 위치에 실어** 보낸다. 그래야 회전 중 WILD 가 흘러 내려온다.
    renderer.setRound(reels, seen || new Set());
    renderer.setPending(fresh, positions);
  } else {
    // 🔴 **스핀 종료** — 실려 온 WILD 를 고정 칸으로 편입하고 신규 강조를 건다
    renderer.setRound(reels, cells, fresh);
    renderer.setPending(null, null);
  }
  return cells;
}
