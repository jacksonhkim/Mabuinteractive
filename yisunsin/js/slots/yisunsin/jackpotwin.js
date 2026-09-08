/**
 * jackpotwin.js — JACKPOT 의 **표시**만 (연출기획서 §6·§8)
 *
 * 🔴 왜 갈라졌나 (2026-08-30)
 *    `winshow.js` 가 287/300 줄이었다. 잭팟 배너에 「+ LINE WIN · TOTAL WIN」
 *    두 줄과 두 번째 카운트업을 넣으려면 30줄 이상이 필요해 H1 상한을 넘긴다.
 *    주석을 지워 줄이는 것은 본말전도다 — **파일이 스스로 선언한 경계**로 가른다.
 *
 *    이로써 잭팟은 셋으로 나뉜다:
 *      `jackpotplan.js`  계산 — 화면도 타이머도 모른다
 *      `jackpotfx.js`    재생 — 시간의 주인
 *      `jackpotwin.js`   표시 — **여기.** 숫자를 화면에 세운다
 *
 * 🔴 3단 합산 (대표님 지시 2026-08-30)
 *      ① JACKPOT      잭팟 상금
 *      ② + LINE WIN   릴(라인) 당첨
 *      ③ TOTAL WIN    합산 총액 ← **여기가 절정이다**
 *    전에는 배너가 잭팟만 말하고 총액은 하단 WIN 칸에만 있어,
 *    플레이어가 두 숫자를 **스스로 이어 붙여야** 했다.
 *
 * ⛔ 돈은 이미 `slot.settle()` 에서 지급됐다. 여기서 움직이지 않는다.
 * ⛔ `jackpot` 사운드를 여기서 울리지 않는다 — 소리의 주인은 연출이다 (주의사항 #42).
 */
import { playJackpotFx } from './jackpotfx.js';
import { easeJackpot, jackpotAmounts } from './jackpotplan.js';
import { liftOverlay } from './overlay.js';

const fmt = (n) => n.toLocaleString('ko-KR');

/** ① 잭팟 카운트업 이징 — 부드럽게 도착한다. 뜸 들이는 몫은 총액이 가져갔다 */
const easeArrive = (k) => 1 - (1 - k) ** 2;

export function jackpotShow($, sfx, jackpotWon, paidTotal, scale) {
  const el = $('#winbanner');
  const tierEl = $('#wb-tier');
  // 🔴 `paidTotal` 은 **이미 잭팟을 품는다** (`slot.js` 결제 순서 P3). 다시 더하지 않는다.
  const { total, jackpot, line } = jackpotAmounts(paidTotal, jackpotWon);
  const hasLine = line > 0;
  let raf = 0;

  const put = (sel, v) => { const e = $(sel); if (e) e.textContent = fmt(v); };
  const show = (sel) => { const e = $(sel); if (e) e.classList.remove('hidden'); };
  const hide = (sel) => { const e = $(sel); if (e) e.classList.add('hidden'); };

  // 🔴 **릴 밖으로 들어 올린다** (대표님 지시 2026-09-08 — 잭팟은 전체 화면).
  //    자리를 먼저 옮기고 클래스를 건다 — 반대로 하면 `wb-flash` 가 릴 안에서
  //    한 번 재생되고 옮겨져 첫 섬광이 릴 크기로 번쩍인다.
  //    ⛔ 되돌리기는 `onEnd` 가 반드시 부른다. `finish()` 가 취소·스킵·정상 종료
  //       **모든 경로**에서 `onEnd` 를 거치므로 릴에 되돌아오지 못하는 길이 없다.
  const restore = liftOverlay($, '#winbanner');
  if (el) {
    el.className = 'winbanner t-jackpot';
    el.classList.remove('hidden');
  }
  if (tierEl) tierEl.textContent = 'JACKPOT';
  // 🔴 **여기서 비운다.** 카운트업은 600ms 뒤에나 시작하는데, 그동안 지난 판 금액이
  //    그대로 떠 있었다 (영상 8.07~8.53s 에 직전 잭팟 5,002 노출).
  //    결과를 미리 보여주고 다시 세면 기대감이 통째로 죽는다.
  put('#wb-num', 0);
  put('#wb-line-num', 0);
  put('#wb-total-num', 0);
  // 🔴 두 줄은 **각자의 차례에** 나타난다. 미리 보이면 합산의 순서가 무너진다.
  hide('#wb-line');
  hide('#wb-total');

  /** 🔴 무슨 일이 있어도 최종 금액은 화면에 선다 (R5) */
  const setFinal = () => {
    if (raf) cancelAnimationFrame(raf);
    put('#wb-num', jackpot);
    if (hasLine) {
      show('#wb-line');
      put('#wb-line-num', line);
      show('#wb-total');
      put('#wb-total-num', total);
    }
    $('#win').textContent = fmt(total);
  };

  /**
   * 한 구간을 센다 — `from` 에서 `to` 까지.
   * ⛔ 길이를 받아 쓴다. **시간의 주인은 연출이다** (`jackpotfx.js`).
   * 🔴 배너와 하단 WIN 칸에 **같은 숫자**를 세운다 — 둘이 다른 이야기를 하면 안 된다.
   */
  const run = (dur, from, to, sel, ease) => {
    if (raf) cancelAnimationFrame(raf);
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1);
      const v = Math.round(from + (to - from) * ease(k));
      put(sel, v);
      $('#win').textContent = fmt(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const fx = playJackpotFx({
    $, sfx, fast: scale < 1, hasLine,
    // ① 잭팟 — 0 에서 잭팟 상금까지
    onCount: (dur) => run(dur, 0, jackpot, '#wb-num', easeArrive),
    // ② 라인 당첨 — 세지 않는다. **더해지는 값**이므로 한 번에 선다
    onLine: () => { show('#wb-line'); put('#wb-line-num', line); },
    // ③ 총액 — 🔴 잭팟에서 이어 올라 **타격 순간에 도착**한다 (§6-4)
    onTotal: (dur) => { show('#wb-total'); run(dur, jackpot, total, '#wb-total-num', easeJackpot); },
    onSettle: setFinal,
    onEnd: () => {
      if (el) el.classList.add('hidden');
      // ⛔ 다음 등급 배너(BIG·MEGA)에 **새지 않게** 걷는다.
      //    CSS 도 `.winbanner:not(.t-jackpot)` 로 막지만, 값까지 지워 두 겹으로 막는다.
      hide('#wb-line');
      hide('#wb-total');
      // 🔴 릴 안 제자리로 되돌린다 — 다음 BIG·MEGA 배너는 릴에서 떠야 한다
      restore();
    },
  });

  // 클릭하면 즉시 끝난다 (§6-2-4 스킵)
  if (el) el.addEventListener('pointerdown', fx.skip, { once: true });

  return { hold: fx.total, cancel: fx.cancel };
}
