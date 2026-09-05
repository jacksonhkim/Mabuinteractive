/**
 * slot.js — 이순신 슬롯 진입점
 *
 * 🔴 경계 B3 (기획서 §2-5): 바깥에서 슬롯을 아는 방법은 `createSlot()` 하나뿐이다.
 *
 * 🔴 이 파일에 `import wallet` 이 없다는 것이 핵심이다.
 *    지갑은 **주입받는다.** 로비가 생기면 여러 슬롯이 같은 지갑을 나눠 쓰는데,
 *    그때 이 파일은 한 줄도 바뀌지 않아야 한다 (인수 테스트 ④).
 *
 * 🔴 결제 순서 (기획서 §11-3) — 크레딧이 움직이는 지점은 여기 하나다.
 *    P1 베팅 차감 → P2 결과 확정 → P3 당첨 지급 → P4 연출
 *    연출이 시작되기 **전에** 잔액이 확정된다. 연출 중 숫자가 흔들리면 안 된다.
 *
 * P0 범위: 베팅 차감까지. 릴 렌더는 P1, 스핀은 P2, 결과 산출은 P3.
 */

import { evaluateSpin } from './evaluator.js';
import { beginLegendary, suppressInFree, applySticky, stripsFor } from './legendary.js';
import { createDevForcer } from './_devtools.js';   // ⛔ P8 에서 제거

/**
 * @param {object} config           data/*.json 묶음 — { ...config.json, paytable, strips, symbols }
 * @param {object} services
 * @param {object} services.wallet  크레딧 지갑 — **슬롯 밖 소유**
 * @param {object} services.sfx     사운드 훅
 * @param {object} [services.rng]   게임 난수 (P2 부터)
 */
export function createSlot(config, services) {
  const { wallet, sfx: rawSfx, jackpot } = services;
  if (!wallet) throw new Error('createSlot: wallet 주입이 필요하다');
  if (!rawSfx) throw new Error('createSlot: sfx 주입이 필요하다');
  if (!jackpot) throw new Error('createSlot: jackpot 주입이 필요하다');   // 경계 B1 — 슬롯 밖 소유
  if (!config.paytable) throw new Error('createSlot: paytable 이 필요하다');
  if (!config.strips) throw new Error('createSlot: strips 가 필요하다');
  if (!services.rng) throw new Error('createSlot: rng 주입이 필요하다');

  /**
   * 🔴 R5 — 소리는 게임의 필수 조건이 아니다.
   *    재생이 터져도 스핀은 끝까지 가야 한다. 여기서 한 번 감싸 두면
   *    호출 지점마다 try 를 두르지 않아도 되고, P7 에서 절차적 생성이
   *    들어올 때도 그 예외가 게임을 멈추지 못한다.
   */
  const sfx = {
    play(id, opt) {
      try {
        return rawSfx.play(id, opt);
      } catch {
        return null;
      }
    },
  };

  // 🔴 라인 수의 정본은 paytable.json 이다. config.json 에 복사해 두면
  //    둘이 어긋나는 날이 오고, 그날 어느 쪽이 맞는지 아무도 모른다.
  const lines = config.paytable.lines;
  const steps = config.bet.steps;
  let betIndex = Math.max(0, steps.indexOf(config.bet.default));
  const listeners = new Set();

  const strips = config.strips.strips;
  const rng = services.rng;
  const devForce = createDevForcer({
    strips, rows: config.rows, rng, paylines: config.paytable.paylines,
  });

  /**
   * 릴마다 **정지 위치**를 하나 뽑는다. 화면은 거기서부터 rows 칸이다.
   *
   * 🔴 스트립을 **그대로** 쓴다. 결과를 만든 뒤 스트립에 끼워 맞추지 않는다.
   *    스트립이 곧 확률의 실체이고(strips.json), RTP 96.61% 는 이 배열에서 나온 값이다.
   *    여기서 손대는 순간 시뮬레이터가 측정한 수치와 게임이 어긋난다.
   *
   * 🔴 위치를 그대로 내보내는 이유
   *    릴 회전 연출은 "어느 칸에 멈추는가" 를 알아야 그 지점으로 감속할 수 있다.
   *    심볼 배열만 주면 연출이 스트립을 되짚어 위치를 역산해야 하고,
   *    같은 심볼이 여러 곳에 있으면 엉뚱한 칸에 멈춘다.
   */
  const spinPositions = () => strips.map((strip) => rng.int(strip.length));

  const gridAt = (pos, from = strips) => from.map((strip, i) =>
    Array.from({ length: config.rows }, (_, r) => strip[(pos[i] + r) % strip.length]));

  let positions = spinPositions();
  let grid = gridAt(positions);
  let spinning = false;
  /** 이번 스핀의 확정 결과. 연출은 이것을 **보여줄 뿐** 바꾸지 못한다. */
  let result = null;
  let lastWin = 0;
  let lastJackpot = 0;

  // ── 프리스핀 (기획서 §7-2 · paytable.freespin) ──
  const FS = config.paytable.freespin;
  /** @type {{option:object, left:number, retriggers:number, won:number, bet:number}|null} */
  let freespin = null;
  /** 트리거는 났지만 아직 선택지를 고르지 않은 상태 */
  let awaitingChoice = false;

  const evaluate = (g, bet, multiplier = 1) => evaluateSpin(g, {
    paylines: config.paytable.paylines,
    paytable: config.paytable.paytable,
    lineBet: bet / lines,
    totalBet: bet,
    multiplier,             // 🔴 라인 배당에만 곱해진다 (§6-4) — evaluator 가 처리
  });

  const state = () => ({
    credit: wallet.balance,
    bet: steps[betIndex],
    lineBet: steps[betIndex] / lines,
    canSpin: wallet.canAfford(steps[betIndex]) && !spinning,
    spinning,
    grid,
    positions,
    win: lastWin,
    jackpot: { value: jackpot.value, won: lastJackpot },
    result,
    freespin: freespin && {
      option: freespin.option.id,
      multiplier: freespin.option.multiplier,
      left: freespin.left,
      won: freespin.won,
      stuck: freespin.stuck,             // 🔴 화면이 고정 WILD 를 그리려면 필요하다
      retriggers: freespin.retriggers,   // 🔴 main.js 가 축약 연출 판정에 쓴다
      retriggersLeft: freespin.option.retrigger - freespin.retriggers,
    },
    awaitingChoice,
    options: awaitingChoice ? FS.options : null,
  });

  const emit = () => {
    const s = state();
    listeners.forEach((fn) => fn(s));
  };

  return {
    id: config.id,
    title: config.title,

    /** UI 가 여기에 붙어 상태 변화를 받는다. */
    subscribe(fn) {
      listeners.add(fn);
      fn(state());
      return () => listeners.delete(fn);
    },

    get state() {
      return state();
    },

    /** 현재 화면에 떠 있는 5×4 — grid[릴][행] */
    get grid() {
      return grid;
    },

    /** 릴별 정지 위치 — 회전 연출이 이 지점으로 감속한다 */
    get positions() {
      return positions;
    },

    changeBet(dir) {
      if (spinning) return false;          // 도는 중에 베팅이 바뀌면 결제 기준이 흔들린다
      const next = betIndex + (dir > 0 ? 1 : -1);
      if (next < 0 || next >= steps.length) return false;
      betIndex = next;
      sfx.play('bet_change', { variant: dir > 0 ? 1 : 0 });   // 0=감소 1=증가
      emit();
      return true;
    },

    /**
     * P1 — 베팅 차감.
     * 🔴 잔액이 모자라면 **아무것도 시작하지 않는다.** 스핀을 걸고 나서 실패하면
     *    릴은 돌았는데 돈은 안 빠진 상태가 되어 등식이 깨진다.
     */
    spin() {
      if (spinning) return { ok: false, reason: 'busy' };
      if (awaitingChoice) return { ok: false, reason: 'choice' };

      // 🔴 프리스핀 중에는 **베팅을 걷지 않는다.** 공짜 스핀이 공짜가 아니면 이름이 거짓이다.
      //    베팅액은 트리거 당시 값으로 고정한다 — 도중에 베팅을 올려
      //    배수를 키우는 구멍을 막는다.
      const inFree = Boolean(freespin);
      const bet = inFree ? freespin.bet : steps[betIndex];

      if (!inFree && !wallet.debit(bet)) {
        sfx.play('btn_click', { pitch: 0.7 });
        emit();
        return { ok: false, reason: 'insufficient' };
      }

      // 🔴 P2 — 결과 확정. **회전이 시작되기도 전에 이미 정해져 있다.**
      //    연출은 정해진 결과를 보여주는 절차일 뿐이며, 연출 도중 결과가 바뀌지 않는다.
      // 🔴 적립은 베팅이 실제로 빠진 뒤에 한다 (§10). 거절된 스핀은 적립도 없다.
      //    프리스핀은 베팅을 걷지 않으므로 적립할 재원 자체가 없다.
      if (!inFree) jackpot.contribute(bet);

      spinning = true;
      lastWin = 0;
      lastJackpot = 0;
      positions = devForce.positions(spinPositions(), {
        nextPositions: spinPositions,
        evaluatePositions: (pos) => evaluate(gridAt(pos), bet),
        totalBet: bet,
      });
      grid = applySticky(freespin, gridAt(positions, stripsFor(config.strips, freespin)), rng);
      result = evaluate(grid, bet, inFree ? freespin.option.multiplier : 1);

      result = suppressInFree(result, freespin);   // 결재 ③ + 잭팟 정지 (legendary.js)

      sfx.play('reel_start');
      emit();
      return { ok: true, bet, grid, positions, result, freespin: inFree };
    },

    /**
     * 프리스핀 선택지를 고른다 (§8-2).
     * 세 선택지는 **기대값이 같고**(스핀×배수 = 24) 분산만 다르다.
     */
    chooseFreespin(id) {
      if (!awaitingChoice) return false;
      const option = FS.options.find((o) => o.id === id);
      if (!option) return false;

      awaitingChoice = false;
      freespin = {
        option,
        left: option.spins,
        retriggers: 0,
        won: 0,
        bet: steps[betIndex],   // 트리거 당시 베팅으로 고정
      };
      sfx.play('freespin_select');
      emit();
      return true;
    },

    /**
     * 회전 연출이 끝났음을 알린다.
     *
     * 🔴 P3 — 지급은 **여기서** 일어난다 (기획서 §11-3 결제 순서).
     *    회전 중에 크레딧을 올리면 릴이 아직 도는데 숫자가 먼저 움직여,
     *    유저는 결과를 보기 전에 답을 알게 된다.
     */
    settle() {
      if (!spinning) return false;
      spinning = false;

      // 🔴 잭팟도 라인 배당과 **함께** 지급한다 — 연출이 시작되기 전에 잔액이 확정돼야 한다 (P3)
      lastJackpot = result && result.jackpotHit ? jackpot.claim() : 0;
      const paid = (result ? result.spinWin : 0) + lastJackpot;
      if (paid > 0) {
        wallet.credit(paid);
        lastWin = paid;
        if (freespin) freespin.won += paid;
      }

      if (freespin) {
        freespin.left -= 1;

        // 재트리거 — 한도와 상한을 모두 지킨다
        const opt = freespin.option;
        const total = opt.spins + freespin.retriggers * FS.retriggerSpins;
        if (result.freespinTrigger
            && freespin.retriggers < opt.retrigger
            && total + FS.retriggerSpins <= FS.maxSpins) {
          freespin.retriggers += 1;
          freespin.left += FS.retriggerSpins;
          // 🔴 소리는 여기서 울리지 않는다 — 연출(freetrigger.js)의 타격 박자에 맞춘다.
        }

        if (freespin.left <= 0) freespin = null;   // 프리스핀 종료
      } else if (result && result.freespinTrigger) {
        // 🔴 선택은 **연출이 끝난 뒤** 묻는다. 릴이 도는 중에 물으면
        //    결과를 보기도 전에 답을 알게 된다.
        awaitingChoice = true;
        // 🔴 소리는 여기서 울리지 않는다 — 연출이 끝나는 박자에 맞춰 fx 가 울린다.
      } else if (result && result.legendaryTrigger) {
        // 🔴 레전더리는 **묻지 않는다.** 선택지가 없는 것이 이 피처의 정체성이다.
        //    상태만 세우고 러너 기동은 화면 쪽(main.js)이 연출 뒤에 맡는다.
        freespin = beginLegendary(config.paytable.legendary, steps[betIndex]);
      }

      emit();
      return true;
    },

    // ⛔ 개발용 — P8 QA에서 아래 세 멤버를 함께 제거한다
    get normalWinCheat() { return devForce.normalWin; },

    setNormalWinCheat(on) {
      return devForce.setNormalWin(on, Boolean(freespin || awaitingChoice));
    },

    forceNextSpin(kind) { return devForce.forceNext(kind); },

    destroy() {
      listeners.clear();
    },
  };
}
