/**
 * main.js — 부트스트랩
 *
 * 조립 순서가 곧 경계다 (기획서 §2-5).
 *
 *   플랫폼: 지갑 · 오디오 · 사운드   ← 로비가 생기면 로비가 소유한다
 *      ↓ 주입
 *   슬롯:   createSlot(config, services)
 *
 * 화살표가 한 방향인 것이 요점이다. 슬롯은 플랫폼을 import 하지 않는다.
 */
import { createWallet } from './platform/wallet.js';
import { createJackpot } from './platform/jackpot.js';
import { createAudio } from './platform/audio.js';
import { createSfx } from './platform/sfx.js';
import { createSlot } from './slots/yisunsin/slot.js';
import { createRng } from './slots/yisunsin/rng.js';
import { loadAssets } from './slots/yisunsin/assets.js';
import { createRenderer } from './slots/yisunsin/render.js';
import { createReels } from './slots/yisunsin/reels.js';
import { syncRound } from './slots/yisunsin/legendary.js';
import { createTacticPanel } from './slots/yisunsin/tacticpanel.js';   // 좌측 전략 패널 (N2)
import { bindHud, reportStatus, endFreespin } from './slots/yisunsin/ui.js';
import { createFx } from './slots/yisunsin/fx.js';
import { createAutoplay } from './slots/yisunsin/autoplay.js';
import { createFreespinRunner, freeTotal } from './slots/yisunsin/freespin_runner.js';
import { bindDevButtons } from './_devbuttons.js';   // ⛔ P8 에서 제거
import { installLayoutScale, installOrientationGuard } from './layout_scale.js';

installLayoutScale();

const SLOT = 'js/slots/yisunsin/data';
const BGM_VOLUME = 0.22;   // 효과음보다 확실히 낮게 — 배경은 배경이어야 한다

const json = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} — ${res.status}`);
  return res.json();
};

const $ = (sel) => document.querySelector(sel);
const fmt = (n) => n.toLocaleString('ko-KR');

const showBootError = (msg) => {
  const el = $('#boot-error');
  const sub = $('#title-sub');
  if (sub) sub.textContent = '';
  if (el) {
    el.textContent = msg;
    el.classList.add('shown');
  }
};

async function boot() {
  const [platform, manifest, config, paytable, strips, symbols] = await Promise.all([
    json('assets/platform.json'),
    json('assets/sounds.json'),
    json(`${SLOT}/config.json`),
    json(`${SLOT}/paytable.json`),
    json(`${SLOT}/strips.json`),
    json(`${SLOT}/symbols.json`),
  ]);

  const wallet = createWallet(platform.wallet.initial);
  // 🔴 잭팟도 슬롯 밖 소유다 (경계 B1) — 로비가 붙어도 slot.js 는 안 바뀐다
  const jackpot = createJackpot(paytable.jackpot);
  const audio = createAudio();
  const sfx = createSfx({ audio });
  sfx.define(manifest);
  sfx.setMasterVolume(platform.audio.masterVolume);

  // 🔴 게임 난수는 슬롯 전용이다. 연출·사운드가 이 난수를 소비하면
  //    같은 시드가 다른 결과를 내어 결정론이 깨진다.
  const rng = createRng(platform.rngSeed || Date.now() >>> 0);

  const slot = createSlot(
    { ...config, paytable, strips, symbols },
    { wallet, sfx, rng, jackpot },
  );

  document.title = `${slot.title} — 슬롯`;
  $('#title-name').textContent = slot.title;
  $('#title-sub').textContent = '에셋 불러오는 중…';

  // ── 에셋 ──
  const assets = await loadAssets(symbols, (done, total) => {
    $('#title-sub').textContent = `에셋 ${done} / ${total}`;
  });

  const renderer = createRenderer($('#reels'), {
    config, symbols, assets, strips: strips.strips,
  });
  renderer.resize();

  // ── 릴 회전 ──
  // 🔴 릴이 멈추는 **그 순간** 그 릴의 특수 심볼을 켠다 (레퍼런스 연출).
  //    전부 멈춘 뒤 한꺼번에 켜면 "하나만 더" 하는 기대의 시간이 사라진다.
  const settled = strips.strips.map(() => true);

  // 🔴 회전 중 루프. 시작음은 0.2초뿐이라 이것이 없으면 1.5초 동안 무음이 된다.
  let spinLoop = null;
  let bgm = null;
  let wasFree = false;
  let freeWon = 0;
  /** 재트리거는 선택 화면이 없다 — 횟수가 늘어난 것으로만 알 수 있다 */
  let lastRetriggers = 0;
  const stopSpinLoop = () => {
    if (spinLoop) {
      spinLoop.stop();
      spinLoop = null;
    }
  };

  const reels = createReels({
    stripLens: strips.strips.map((s) => s.length),
    // 🔴 릴마다 피치를 2% 씩 올린다 (사운드기획서 §4-2).
    //    다섯 번 같은 소리가 나면 정지가 하나로 뭉뚱그려 들린다.
    onReelStop: (i) => {
      settled[i] = true;
      // 변형 3종을 릴 번호로 돌려 쓰고, 거기에 피치도 2% 씩 올린다 (§4-2)
      sfx.play('reel_stop', { variant: i, pitch: 1 + i * 0.02 });
    },
    onDone: () => {
      stopSpinLoop();
      slot.settle();                    // 🔴 지급은 여기서 (결제 순서 P3)

      const s = slot.state;

      // 🔴 연출을 **먼저** 재생하고 자동 스핀이 그만큼 기다린다 — 반대면 MEGA(3.5초) 도중에 릴이 다시 돈다 (§6-2)
      // 🔴 마지막 프리스핀은 settle 이 이미 `freespin` 을 지운 뒤다. 그 사실을 알려야
      //    ① 그 스핀만의 카운트업이 합산 연출과 겹치지 않고
      //    ② 총 획득에서 마지막 스핀 지급이 빠지지 않는다 (2026-08-30 실측 결함)
      const freeEnded = wasFree && !s.freespin && !s.awaitingChoice;
      const hold = fx.showWin(slot, play.fast, freeEnded);
      // 프리스핀이 방금 끝났다면 **합산 연출**을 띄운다 (대표님 지시 2026-08-25)
      if (freeEnded) {
        free.stop();
        endFreespin($, freeTotal(freeWon, s.win), sfx);
        freeWon = 0;
        play.onSpinEnd(false);          // AUTO 였다면 여기서 다시 이어간다
      } else if (!free.step(s, s.win > 0, hold)) {
        play.onSpinEnd(s.win > 0, hold);
      }
      // 🔴 재트리거 — 선택 화면이 없으므로 축약 연출만 얹는다 (연출기획서 §4-4)
      const rt = s.freespin ? s.freespin.retriggers : 0;
      if (rt > lastRetriggers) fx.playTrigger({ retrigger: true, fast: play.fast, auto: true });
      lastRetriggers = rt;
      // 🔴 레전더리는 선택 화면이 없다 (결재 2026-09-05). 프리스핀은 `awaitingChoice` 를
      //    거쳐 오지만 이쪽은 곧바로 상태가 서므로, 시작을 여기서 알아채고
      //    유저 AUTO 를 물린다 — 여기서부터는 러너가 몬다.
      if (!wasFree && s.freespin && !s.awaitingChoice) {
        play.stop();
        fx.playTrigger({ retrigger: true, fast: play.fast, auto: true });
      }
      seenCells = syncRound(renderer, slot, strips, seenCells); tactic.update();   // 🔴 이번에 열린 칸
      wasFree = Boolean(s.freespin);
      if (s.freespin) freeWon = s.freespin.won;
    },
  });
  reels.set(slot.positions);

  // 🔴 당첨 표시 상태와 그리기는 fx.js 가 소유한다 (Phase 0 분리).
  //    이 파일은 조립과 배선만 한다 — 연출이 늘어나도 여기가 두꺼워지지 않는다.
  const fx = createFx($, {
    renderer, reels, settled, paylines: paytable.paylines, sfx,
  });

  // ── FAST · AUTO — 규칙은 autoplay.js 가, 버튼 연결은 여기가 한다 ──
  const mark = (sel, on) => $(sel).setAttribute('aria-pressed', String(on));
  const play = createAutoplay({
    onSpin: () => doSpin(),
    // ⛔ 선택 대기·프리스핀 중에는 유저 AUTO 가 끼어들지 않는다.
    //    프리스핀은 freespin_runner 가 몰고 간다 (멈추는 조건이 정반대다).
    canSpin: () => slot.state.canSpin && !slot.state.awaitingChoice && !slot.state.freespin,
    onFastChange: (on) => mark('#fast', on),
    onAutoChange: (on) => mark('#auto', on),
  });

  const free = createFreespinRunner({ onSpin: () => doSpin(), isFast: () => play.fast });

  const report = (r) => reportStatus($, assets, sfx, r);
  let raf = 0, seenCells = null;   // 🔴 seenCells — 직전까지 보이던 고정 칸(신규 판정용)
  const loop = (now) => {
    const spinning = reels.update(now);
    fx.draw(now);
    raf = (spinning || fx.hasGlow(slot)) ? requestAnimationFrame(loop) : 0;
  };
  fx.draw();

  // 릴 캔버스의 종횡비를 CSS 에 알린다 — 논리 크기는 렌더러가 정한다
  const panel = $('.reel-panel');
  for (const [k, v] of [['--reel-w', renderer.width], ['--reel-h', renderer.height]]) panel.style.setProperty(k, `${v}`);
  $('#title-sub').textContent = '화면을 눌러 시작';

  // HUD · 프리스핀 표시 · 선택 화면은 ui.js 가 맡는다.
  // 여기서 릴을 그리지 않는다 — 그건 애니메이션 루프의 일이다.
  const tactic = createTacticPanel($, slot);   // N2 좌측 전략 패널
  bindHud($, slot, (id) => {
    slot.chooseFreespin(id);
    play.stop();              // 유저 AUTO 를 물린다 — 여기서부터는 러너가 몬다
    free.begin();             // 진입 연출 뒤 스스로 돌기 시작한다
  }, (reveal) => {
    // 🔴 선택 화면을 **연출이 끝난 뒤** 띄운다 (연출기획서 §4-2)
    fx.playTrigger({ fast: play.fast, auto: Boolean(play.auto), showChoice: reveal });
  });

  // 화면을 누르면 연출을 건너뛴다. ⛔ AUTO 중에는 무시된다 (freetrigger.js)
  $('.reel-panel').addEventListener('click', () => fx.skipTrigger());

  // ── 오디오 잠금 해제 — 브라우저는 첫 제스처 전까지 소리를 막는다 ──
  $('#title').addEventListener('pointerdown', () => {
    audio.unlock();
    $('#title').classList.add('gone');
    $('#stage').classList.remove('hidden');
    renderer.resize();
    fx.draw(performance.now());
    if (!raf) raf = requestAnimationFrame(loop);
    // 🔴 잠금 해제는 **비동기**다 (iOS). 반환값을 믿지 말고 onUnlock 에 맡긴다.
    //    BGM 은 디코딩이 끝난 뒤 — 먼저 걸면 버퍼가 없어 조용히 실패한다.
    report({ loaded: 0, failed: 0 });
    audio.onUnlock(() => sfx.preload().then((r) => {
      report(r);
      bgm = sfx.play('bgm_main', { volume: BGM_VOLUME });
    }));
  }, { once: true });

  // ── 입력 — 마우스·터치 동시 지원 (기획서 §1 대응 환경) ──
  function doSpin() {
    const r = slot.spin();
    if (!r.ok) {
      $('#hint').textContent = (r.reason === 'busy' || r.reason === 'choice')
        ? '' : '잔액이 부족합니다';
      if (r.reason === 'insufficient') play.stop();
      return;
    }
    $('#hint').textContent = '';
    settled.fill(false);          // 새 스핀 — 이전 강조를 끈다
    fx.resetForSpin();
    if (!slot.state.freespin) $('#win').textContent = '0';   // 라운드 중엔 누적 유지
    seenCells = syncRound(renderer, slot, strips, seenCells, r.positions);   // 🔴 회전 중 WILD
    stopSpinLoop();
    spinLoop = sfx.play('reel_loop', {
      volume: play.fast ? 0.3 : 0.45,
      pitch: play.fast ? 1.4 : 1,
    });
    reels.start(r.positions, performance.now(), play.scale);
    if (!raf) raf = requestAnimationFrame(loop);
  }

  $('#spin').addEventListener('click', doSpin);

  $('#fast').addEventListener('click', () => {
    sfx.play('btn_toggle', { pitch: play.toggleFast() ? 1.12 : 0.9 });
  });

  $('#auto').addEventListener('click', () => {
    sfx.play('btn_toggle', { pitch: play.toggleAuto() ? 1.12 : 0.9 });
  });
  $('#bet-up').addEventListener('click', () => slot.changeBet(+1));
  $('#bet-down').addEventListener('click', () => slot.changeBet(-1));

  // ⛔ 개발용 — P8 QA 에서 이 줄과 _devbuttons.js 를 함께 지운다
  bindDevButtons($, { slot, wallet, doSpin, fmt, say: (m) => { $('#hint').textContent = m; } });

  window.addEventListener('resize', () => {
    renderer.resize();
    fx.draw(performance.now());
    if (!raf && fx.hasGlow(slot)) raf = requestAnimationFrame(loop);
  });

  installOrientationGuard({ pause: () => { play.stop(); free.stop(); fx.cancelTrigger(); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.suspend();
      play.stop();         // 탭을 떠난 사이 크레딧이 계속 빠지면 안 된다
      free.stop();         // 프리스핀도 멈춘다 — 안 보는 사이 다 써 버리면 안 된다
      fx.cancelTrigger();  // 연출도 걷는다 — 돌아왔을 때 화면이 어두운 채로 있으면 안 된다
    } else {
      audio.resume();
    }
  });

  window.addEventListener('pagehide', () => {   // 창을 닫을 때 소리가 남지 않게
    stopSpinLoop();
    if (bgm) bgm.stop();
  });
}

boot().catch((e) => {
  showBootError(
    `기동 실패 — ${e.message}\n`
    + 'start.bat 으로 실행하셨는지 확인해 주세요. '
    + 'index.html 을 직접 열면 브라우저가 모듈을 차단합니다.',
  );
});

// 모듈 자체가 못 뜨는 경우(문법 오류·차단)도 화면에 남긴다
window.addEventListener('error', (ev) => {
  if (ev.message) showBootError(`오류 — ${ev.message}`);
});
