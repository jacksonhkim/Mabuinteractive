import { FIELD_W, FIELD_H } from './battle_scene.js';
import { SEGMENTS, angleAt } from './battle_wheel.js';
import { drawWheelFace, WHEEL_R } from './battle_wheel_render.js';

const VOID_FILL = '#0b1730';
const GOLD = '#e8c66a';
const GOLD_DIM = '#9c8340';

const DEG = Math.PI / 180;

const TOP = -90 * DEG;

const CONTROLS = [
  { keys: ['MOUSE'], label: '조준 — 위쪽 반원만' },
  { keys: ['L-CLICK'], label: '함포 사격' },
  { keys: ['SPACE'], label: '일제사격 — 게이지가 차면' },
  { keys: ['!'], label: '아래로 흘려보내면 시간을 잃는다' },
];

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

const easeOut = (v) => 1 - (1 - clamp01(v)) ** 3;

export function createIntroRenderer(assets, getView = null) {

  function screenRect() {
    const v = getView ? getView() : null;
    const ox = v && v.overX > 0 ? v.overX : 0;
    const oy = v && v.overY > 0 ? v.overY : 0;
    return { x: -ox, y: -oy, w: FIELD_W + ox * 2, h: FIELD_H + oy * 2 };
  }

  function cover(ctx, code) {
    const r = screenRect();
    const img = assets.get(code);
    if (!img) {
      ctx.fillStyle = VOID_FILL;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      return;
    }
    const k = Math.max(r.w / img.width, r.h / img.height);
    const w = img.width * k;
    const h = img.height * k;
    ctx.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  }

  function veil(ctx, alpha) {
    const r = screenRect();
    ctx.fillStyle = `rgba(4, 10, 22, ${alpha})`;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }

  function title(ctx, text, y, size, color = GOLD) {
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillText(text, FIELD_W / 2 + 2, y + 2);
    ctx.fillStyle = color;
    ctx.fillText(text, FIELD_W / 2, y);
  }

  function keycap(ctx, text, x, y, h) {
    const pad = text.length > 1 ? 14 : 10;
    ctx.font = `600 ${Math.round(h * 0.46)}px system-ui, sans-serif`;
    const w = ctx.measureText(text).width + pad * 2;
    ctx.beginPath();
    ctx.roundRect(x, y - h / 2, w, h, 7);
    ctx.fillStyle = 'rgba(10, 18, 34, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = GOLD_DIM;
    ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + 1);
    return w;
  }

  function drawBrief(ctx, p) {
    cover(ctx, 'sea_brief');
    veil(ctx, 0.3);
    const a = easeOut(p / 0.6);
    ctx.globalAlpha = a;
    title(ctx, '출 정', FIELD_H / 2 - 18 - (1 - a) * 14, 68);
    ctx.font = '500 24px system-ui, sans-serif';
    ctx.fillStyle = '#dfe7f5';
    ctx.textAlign = 'center';
    ctx.fillText('왜 함대가 나타났다', FIELD_W / 2, FIELD_H / 2 + 40);
    ctx.globalAlpha = 1;
  }

  function drawControls(ctx, p) {
    cover(ctx, 'sea_controls');
    veil(ctx, 0.58);
    title(ctx, '조 작', 86, 46);

    const top = 160;
    const gap = 62;
    const capH = 40;
    CONTROLS.forEach((row, i) => {
      const a = easeOut((p - i * 0.08) / 0.35);
      if (a <= 0) return;
      ctx.globalAlpha = a;
      const y = top + i * gap;
      let x = FIELD_W / 2 - 210;
      for (const k of row.keys) x += keycap(ctx, k, x, y, capH) + 8;
      ctx.font = '500 23px system-ui, sans-serif';
      ctx.fillStyle = '#e6ecf8';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.label, FIELD_W / 2 - 40, y + 1);
      ctx.globalAlpha = 1;
    });

    ctx.font = '500 18px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(220, 230, 245, 0.72)';
    ctx.textAlign = 'center';
    ctx.fillText('아무 곳이나 눌러 넘기기', FIELD_W / 2, FIELD_H - 34);
  }

  const WHEEL_CY = FIELD_H / 2 - 6;

  function drawWheel(ctx, p, wheel, winner = 0, hint = true) {
    cover(ctx, 'sea_brief');
    veil(ctx, 0.72);

    title(ctx, '제한 시간', 48, 32);
    if (hint) title(ctx, '칸에 적힌 초가 이번 해전의 시간이다', 72, 16, 'rgba(226, 236, 250, 0.72)');
    const cx = FIELD_W / 2;
    const angle = angleAt(wheel, p);
    drawWheelFace(ctx, cx, WHEEL_CY, angle, winner, assets.get('ui_wheel'));
  }

  function drawReveal(ctx, p, wheel, plan) {

    drawWheel(ctx, 1, wheel, plan.band, false);
    const cx = FIELD_W / 2;

    const halo = assets.get('fx_shockwave');
    const grow = easeOut(p / 0.5);
    if (halo) {
      const r = WHEEL_R * (1 + grow * 1.1);
      ctx.globalAlpha = (1 - grow) * 0.8;
      ctx.drawImage(halo, cx - r, WHEEL_CY - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
    }

    const seg = SEGMENTS[plan.band - 1];

    ctx.globalAlpha = easeOut(p / 0.3);
    title(ctx, `${plan.seconds}초`, FIELD_H - 66, 62, '#fff3d0');
    title(ctx, `${seg.min}~${seg.max}초 구간 · ${seg.deg > 0 ? Math.round(seg.deg / 3.6) : 0}%`,
      FIELD_H - 24, 18, GOLD_DIM);

    const tagY = FIELD_H - 108;
    if (plan.band === SEGMENTS.length) title(ctx, '최 장 해 전', tagY, 26);
    else if (plan.hasBoss) title(ctx, '대장함 출현', tagY, 24, GOLD_DIM);
    ctx.globalAlpha = 1;
  }

  return {

    draw(ctx, view, plan, wheel) {
      const p = clamp01(view.progress);
      if (view.name === 'brief') drawBrief(ctx, p);
      else if (view.name === 'controls') drawControls(ctx, p);
      else if (view.name === 'wheel') drawWheel(ctx, p, wheel);
      else drawReveal(ctx, p, wheel, plan);
    },
  };
}
