/**
 * _devtools.js — 개발용 강제 트리거
 *
 * 🔴 왜 필요한가
 *    프리스핀 트리거율은 1.29%, BONUS 는 0.47% 다.
 *    손으로 돌려서는 각각 77스핀·213스핀에 한 번꼴로만 만난다.
 *    연출을 확인하려면 강제로 띄울 수단이 있어야 한다.
 *
 * ⛔ **P8 QA 에서 이 파일과 호출부를 함께 삭제한다.**
 *    파일명을 `_` 로 시작한 이유가 그것이다 — 지울 대상임을 이름으로 표시한다.
 *    삭제할 곳: `slot.js` 의 import 와 `forceNextSpin()`, `index.html` 의 .dev 버튼,
 *    `main.js` 의 버튼 연결.
 */

import { findNormalWinPositions } from './_normalwincheat.js';

const FREE = 's5_free';
const BONUS = 's3_bonus';
const GEO = 'h2_geobukseon';
const WILD = 's1_wild';
const JACKPOT_REELS = 4;   // 거북선 4연속 (기획서 §10)

/** 그 릴의 화면 rows 칸 안에 해당 심볼이 들어오는 시작 위치들 */
function positionsShowing(strip, rows, code) {
  const out = [];
  for (let p = 0; p < strip.length; p += 1) {
    for (let r = 0; r < rows; r += 1) {
      if (strip[(p + r) % strip.length] === code) {
        out.push(p);
        break;
      }
    }
  }
  return out;
}

/**
 * 지정한 트리거가 나오도록 릴 위치를 고른다.
 *
 * FREE 는 위치 무관 3개(§7-2), BONUS 는 릴0~2 연속(§7-3)이므로
 * 어느 쪽이든 **앞 세 릴**에 심볼을 심으면 조건이 선다.
 *
 * @param {string[][]} strips
 * @param {number} rows
 * @param {{int:(n:number)=>number}} rng
 * 🔴 잭팟만 다르다. 위치 무관이 아니라 **같은 페이라인 위에서 좌→우 4연속**이어야 하므로,
 *    라인 하나를 골라 그 라인이 지나는 행에 정확히 심는다.
 *    릴0 에는 WILD 가 없으므로(§7-1) 첫 칸은 반드시 진짜 거북선을 찾는다.
 *
 * 🔴 **거북선을 먼저 찾는다** (대표님 지시 2026-09-08 — *"와일드 당첨보다 거북선 4개가 좋겠다"*).
 *    예전에는 거북선과 WILD 를 **한 바구니에 담아 무작위로** 뽑았다. 릴1~3 의 후보는
 *    거북선 2 + WILD 7 = 9개라 거북선이 뽑힐 확률이 릴당 2/9 뿐이고,
 *    **세 릴 모두 거북선일 확률은 (2/9)³ = 1.1%** — 사실상 늘 WILD 로 섰다.
 *    WILD 는 **대체재**다. 거북선이 그 행에 설 자리가 있으면 그것을 쓴다.
 *    ⛔ 게임 규칙은 그대로다 — 실제 잭팟은 여전히 WILD 대체를 허용한다(기획서 §10).
 *       여기서 바뀌는 것은 **개발용 강제 스핀이 무엇을 보여주는가** 뿐이다.
 *
 * @param {'freespin'|'bonus'|'jackpot'} kind
 * @param {number[]} base 손대지 않을 기본 위치
 * @param {number[][]} [paylines] 잭팟 강제에만 쓴다
 */
function forcedPositions(strips, rows, rng, kind, base, paylines) {
  const pos = [...base];

  if (kind === 'jackpot') {
    const line = (paylines && paylines[0]) || [0, 0, 0, 0, 0];
    for (let i = 0; i < JACKPOT_REELS; i += 1) {
      // 🔴 거북선 → WILD 순서로 **따로** 찾는다. 한 바구니에 담으면 개수 비율에 밀린다.
      for (const code of (i === 0 ? [GEO] : [GEO, WILD])) {
        const cands = [];
        for (let p = 0; p < strips[i].length; p += 1) {
          if (strips[i][(p + line[i]) % strips[i].length] === code) cands.push(p);
        }
        if (cands.length) {
          pos[i] = cands[rng.int(cands.length)];
          break;                       // 거북선을 찾았으면 WILD 는 보지 않는다
        }
      }
    }
    return pos;
  }

  const code = kind === 'bonus' ? BONUS : FREE;
  for (let i = 0; i < 3; i += 1) {
    const cands = positionsShowing(strips[i], rows, code);
    if (cands.length) pos[i] = cands[rng.int(cands.length)];
  }
  return pos;
}

/** 1회 특수 강제와 일반 WIN 연속 모드의 우선순위를 한곳에서 관리한다. */
export function createDevForcer({
  strips, rows, rng, paylines,
}) {
  let next = null;
  let normalWin = false;

  return {
    get normalWin() { return normalWin; },
    setNormalWin(on, blocked = false) {
      if (on && blocked) return false;
      normalWin = Boolean(on);
      return true;
    },
    forceNext(kind) {
      normalWin = false;
      next = kind;
      return true;
    },
    positions(base, {
      nextPositions, evaluatePositions, totalBet,
    }) {
      let chosen = base;
      if (next) chosen = forcedPositions(strips, rows, rng, next, base, paylines);
      else if (normalWin) {
        // 🔴 여기서 예외가 새면 **베팅이 이미 빠진 뒤**라 잔액만 잃고 게임이 잠긴다.
        //    개발용 장치가 게임 루프를 멈추는 것은 R5 에 어긋난다. 자연 결과로 물러선다.
        try {
          chosen = findNormalWinPositions(nextPositions, evaluatePositions, totalBet);
        } catch {
          normalWin = false;   // 켜둔 채로는 스핀마다 4096회를 헛돈다
        }
      }
      next = null;
      return chosen;
    },
  };
}
