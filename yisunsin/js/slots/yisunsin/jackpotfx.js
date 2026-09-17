import {
  RAYS, HIT_COINS, JP_FX_SEED, TOTAL_MS,
  planJackpot, planRain, planCoins, planBursts, planHitBursts,
} from './jackpotplan.js';
import { createRng } from './rng.js';

const styleOf = (o) => `--s:${o.size}vmin;--tilt:${o.tilt}deg;`
  + `--spin:${o.spin}ms;--d:${o.delay}ms`;

function rainSpan(c) {
  return `<span class="coin rain L${c.layer}${c.copper ? ' cu' : ''}" style="left:${c.x}%;`
    + `--drift:${c.drift}vw;--dur:${c.dur}ms;--stretch:${c.stretch};${styleOf(c)}"></span>`;
}

function coinSpan(c) {
  return `<span class="coin pop L${c.layer}${c.copper ? ' cu' : ''}" style="left:${c.x}%;`
    + `--dx:${c.dx};--rise:${c.rise};--fall:${c.fall};${styleOf(c)}"></span>`;
}

function burstHtml(b, big = false) {
  const rays = Array.from({ length: RAYS }, (_, i) => `<i style="--i:${i}"></i>`).join('');
  return `<span class="burst${big ? ' big' : ''}" `
    + `style="--bx:${b.x}%;--by:${b.y}%;--d:${b.delay}ms">${rays}</span>`;
}

const BANNER_CLASSES = ['jp-flash', 'jp-scale', 'jp-hit'];

export function playJackpotFx({
  $, sfx, timer = setTimeout, fast = false, auto = false,
  rngFx = createRng(JP_FX_SEED),
  onCount = () => {}, onSettle = () => {}, onEnd = () => {},
  onLine = () => {}, onTotal = () => {}, hasLine = true,
} = {}) {
  const plan = planJackpot({ fast, hasLine });

  const scale = plan.timeScale;
  let done = false;
  let settled = false;

  const safely = (fn) => { try { fn(); } catch {  } };

  const settle = () => {
    if (settled) return;
    settled = true;
    safely(onSettle);
  };

  const cleanup = () => {
    for (const c of BANNER_CLASSES) safely(() => $('#winbanner').classList.remove(c));
    safely(() => $('#jp-ring').classList.remove('jp-ring-on'));
    safely(() => $('.reel-panel').classList.remove('shake-2'));
    safely(() => $('#jp-sky').classList.remove('jp-lit'));

    safely(() => { $('#jp-sky').innerHTML = ''; });
    safely(() => { $('#jp-sky-hit').innerHTML = ''; });
  };

  const finish = () => {
    if (done) return;
    done = true;
    settle();
    cleanup();
    safely(onEnd);
  };

  const STEP = {

    flash: () => {
      $('#winbanner').classList.add('jp-flash');

      $('#jp-sky').style.setProperty('--lit', `${plan.total}ms`);
      $('#jp-sky').classList.add('jp-lit');
      sfx.play('jackpot');
    },
    scale: () => { $('#winbanner').classList.add('jp-scale'); },
    count: () => {
      const rain = planRain(rngFx, plan.rain, scale, plan.supply).map(rainSpan).join('');
      const pops = planCoins(rngFx, undefined, scale).map(coinSpan).join('');
      const bursts = planBursts(rngFx).map((b) => burstHtml(b)).join('');
      $('#jp-sky').innerHTML = rain + pops + bursts;
    },

    hit: () => {
      sfx.play('impact_promote');
      $('#winbanner').classList.add('jp-hit');
      $('#jp-ring').classList.add('jp-ring-on');
      $('.reel-panel').classList.add('shake-2');

      const coins = planCoins(rngFx, HIT_COINS, scale).map(coinSpan).join('');

      const big = planHitBursts().map((b) => burstHtml(b, true)).join('');
      $('#jp-sky-hit').innerHTML = coins + big;
    },

    line: () => {},
    total: () => {},
    hold: () => {},
  };

  let at = 0;
  for (const s of plan.steps) {
    const { id, ms } = s;
    timer(() => {
      if (done) return;

      if (id === 'count') safely(() => onCount(ms));
      if (id === 'line') safely(() => onLine(ms));
      if (id === 'total') safely(() => onTotal(ms));

      if (id === 'hit') settle();
      safely(STEP[id]);
    }, at);
    at += ms;
  }
  timer(finish, at);

  return {
    total: plan.total,

    skip() { if (!auto) finish(); },

    cancel: finish,
  };
}
