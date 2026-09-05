/**
 * reels.js — 릴 회전 상태 머신
 *
 * 🔴 위치는 **줄어드는 방향**으로 움직인다.
 *    렌더러는 `pos` 의 소수부만큼 심볼을 위로 밀어 그린다. 따라서 pos 를 늘리면
 *    심볼이 위로 빨려 올라가 거꾸로 도는 것처럼 보인다. 실제 슬롯은 위에서 아래로 흐른다.
 *
 * 🔴 목표까지의 **총 이동량을 미리 정한다.**
 *    "일단 돌리다가 멈출 때 목표를 찾는" 방식은, 목표가 바로 뒤에 있으면 한 바퀴를
 *    더 돌아야 해서 정지 시각이 릴마다 들쭉날쭉해진다. 여기서는 시간 T 를 고정하고
 *    그 안에 `laps*스트립길이 + 목표까지거리` 를 소화한다. 정지 시각이 정확해진다.
 *
 * 🔴 릴별 0.15초 시차 (인수인계서 §9-2 P2)
 *    T_i = 기준시간 + i × 0.15. 왼쪽부터 차례로 멈춘다.
 */

// ── 회전 파라미터 (2026-08-23 대표님 화면 검수 2회 반영) ──
//
// 🔴 왜 시간만 늘려서는 해결되지 않았나
//    처음에는 스트립을 **2바퀴(132칸)** 돌렸다. 목표까지 거리를 더하면 총 165칸이고,
//    이걸 1.5초에 소화하면 60fps 기준 **프레임당 1.8칸**씩 건너뛴다.
//    심볼이 뭉개지는 게 당연하고, 시간을 늘려도 이동량이 그대로라 여전히 빨랐다.
//
//    → 바퀴 수를 없앴다. **목표까지 필요한 거리만** 간다(평균 33칸).
//
// 🔴 감속은 **비율이 아니라 절대 칸수**로 잡는다
//    "마지막 25% 만큼 이동" 같은 비율은 총 이동량에 끌려다닌다.
//    사람 눈에 보이는 것은 **멈추기 직전 몇 칸이 어떻게 지나가는가** 뿐이므로,
//    그 구간을 8칸으로 고정하고 시간을 넉넉히 준다. 등속 구간이 얼마나 빠르든
//    어차피 읽히지 않으며, 체감 속도는 감속 구간이 결정한다.

// 🔴 아래 값은 **레퍼런스 실측**이다 (2026-08-23, `6.도구/asset_qc/reel_timing.py`).
//    대표님 제공 "Money Blessing" 영상 7스핀을 위상 상관으로 측정한 결과:
//
//      릴 간 정지 간격   0.37 ~ 0.50s  (중앙값 0.37)
//      릴0 회전 시간     약 1.45s
//      감속 구간 비율    약 17%
//      최고 이동량       0.51칸/프레임
//
//    🔴 가장 중요한 발견: **"천천히 멈춘다" 는 감속 곡선이 아니라 시차의 문제였다.**
//       우리 0.15초 간격에서는 다섯 릴이 0.6초 안에 다 멈춰 한꺼번에 선 것처럼 보였다.
//       레퍼런스는 0.4초씩 벌려 1.6초에 걸쳐 하나씩 세운다. 그래서 순차 정지가 읽힌다.
const SPIN_BASE = 1.45;    // 릴0 총 회전 시간(초)
const STAGGER = 0.40;      // 릴 간 정지 간격(초) — 실측 반영
const MIN_TRAVEL = 14;     // 최소 이동량. 이보다 짧으면 한 바퀴를 더 돈다
const CRUISE = 50;         // 순항 속도(칸/초). 이동량이 많으면 시간도 그만큼 준다
const BOUNCE_CELLS = 0.3;  // 목표를 지나치는 폭(칸)
const MS_PER_SEC = 1000;

// ── 속도 곡선: 가속 → 등속 → 감속. 세 구간의 **속도가 이어진다** ──
//
// 🔴 이전 설계는 감속 구간의 이동 칸수를 고정했다가, 그 구간 시작 속도가
//    등속 속도와 무관하게 정해져 **20 → 36칸/초로 튀었다** (대표님 지적).
//    "줄다가 갑자기 빨라진다" 는 현상의 정체가 이것이다.
//
//    이제 등속 속도 v 를 기준으로 세 구간을 잇는다.
//      가속: 0 → v   (거리 v·ACC/2)
//      등속: v       (거리 v·CRUISE_PART)
//      감속: v → 0   (거리 v·DEC/3, 3제곱 감속)
//    세 구간의 경계에서 기울기가 모두 v 로 같아 이음매가 없다.
const ACC = 0.12;                        // 가속에 쓰는 시간 비율
const DEC = 0.32;                        // 감속에 쓰는 시간 비율
const CRUISE_PART = 1 - ACC - DEC;       // 등속 비율
const AREA = ACC / 2 + CRUISE_PART + DEC / 3;   // 정규화 총 이동 면적

/**
 * 경과 비율 x 에서 **지금까지 이동한 칸 수**를 돌려준다.
 * x=0 이면 0, x=1 이면 total 이며 그 사이 속도는 끊기지 않는다.
 */
function travelled(x, total) {
  const v = 1 / AREA;          // 전체 거리를 1 로 볼 때의 등속 속도
  let p;
  if (x < ACC) {
    p = v * x * x / (2 * ACC);
  } else if (x < ACC + CRUISE_PART) {
    p = v * (ACC / 2 + (x - ACC));
  } else {
    const u = Math.min((x - ACC - CRUISE_PART) / DEC, 1);
    p = v * (ACC / 2 + CRUISE_PART + (DEC / 3) * (1 - (1 - u) ** 3));

    // 🔴 튕김을 **감속 곡선 안에** 넣는다.
    //    별도 단계로 두면 회전이 속도 0 으로 끝난 뒤 튕김이 7칸/초로 다시 출발해,
    //    멈췄다가 되튀는 것처럼 보인다 (대표님 지적의 두 번째 원인).
    //    sin² 은 시작과 끝에서 값도 기울기도 0 이라 이음매가 생기지 않는다.
    if (u > 0.6) {
      const w = Math.sin(((u - 0.6) / 0.4) * Math.PI);
      return p * total + BOUNCE_CELLS * w * w;
    }
  }
  return p * total;
}

/**
 * @param {object} o
 * @param {number[]} o.stripLens  릴별 스트립 길이
 * @param {(i:number)=>void} [o.onReelStop]  릴 하나가 멈출 때
 * @param {()=>void} [o.onDone]              전부 멈췄을 때
 */
export function createReels({ stripLens, onReelStop, onDone }) {
  const n = stripLens.length;
  const positions = stripLens.map(() => 0);
  const speeds = new Array(n).fill(0);

  /** @type {{from:number,total:number,target:number,dur:number,done:boolean}[]} */
  let plans = [];
  let t0 = 0;
  let running = false;

  return {
    get positions() {
      return positions;
    },
    get speeds() {
      return speeds;
    },
    get busy() {
      return running;
    },

    /** 애니메이션 없이 위치를 맞춘다 (초기 표시·즉시 정지) */
    set(targets) {
      targets.forEach((v, i) => {
        positions[i] = v;
        speeds[i] = 0;
      });
      plans = [];
      running = false;
    },

    /**
     * @param {number[]} targets 릴별 정지 위치
     * @param {number} now
     * @param {number} [scale=1] 시간 배율. FAST 모드는 0.4 (UI기획서 §6-1)
     */
    start(targets, now, scale = 1) {
      t0 = now;
      running = true;
      const totals = targets.map((target, i) => {
        const len = stripLens[i];
        // 줄어드는 방향으로 목표까지 남은 거리 (0 이상 len 미만)
        let d = ((positions[i] - target) % len + len) % len;
        while (d < MIN_TRAVEL) d += len;   // 너무 짧으면 뚝 멈춘 것처럼 보인다
        return d;
      });

      // 🔴 여유 시간은 **모든 릴에 똑같이** 준다.
      //    릴마다 이동량이 달라 각자 시간을 늘리면 정지 간격이 0.15초에서 어긋난다
      //    (실측 0.096초까지 좁아졌다). 가장 먼 릴을 기준으로 일괄 적용한다.
      const extra = Math.max(0, Math.max(...totals) - MIN_TRAVEL) / CRUISE;

      plans = targets.map((target, i) => ({
        from: positions[i],
        target,
        total: totals[i],
        // 🔴 시차(STAGGER)도 함께 줄인다. 회전만 빠르게 하고 간격을 두면
        //    전체 시간이 거의 안 줄어 FAST 가 빨라진 느낌을 주지 못한다.
        dur: (SPIN_BASE + i * STAGGER + extra) * scale,
        done: false,
      }));
    },

    /** @returns {boolean} 아직 도는 중인가 */
    update(now) {
      if (!running) return false;
      const t = (now - t0) / MS_PER_SEC;
      let alive = false;

      plans.forEach((p, i) => {
        if (t < p.dur) {
          const prev = positions[i];
          positions[i] = p.from - travelled(t / p.dur, p.total);
          speeds[i] = Math.abs(positions[i] - prev) * 60;   // 잔상 강도용
          alive = true;
          return;
        }

        // 🔴 `p.target` 이 아니라 **회전이 실제로 끝나는 위치**를 쓴다.
        //    둘은 스트립 길이의 배수만큼 차이가 나 화면상 같은 심볼이지만,
        //    값이 점프하면 속도 계산과 디버깅이 어긋난다. 위치는 연속이어야 한다.
        positions[i] = p.from - p.total;
        speeds[i] = 0;
        if (!p.done) {
          p.done = true;
          if (onReelStop) onReelStop(i);
        }
      });

      if (!alive) {
        running = false;
        if (onDone) onDone();
      }
      return running;
    },
  };
}
