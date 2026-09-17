import { FIELD_W, FIELD_H } from './battle_scene.js';
import { DRAW_SIZE as SHIP } from './battle_player.js';
import { drawShots } from './battle_shot_render.js';
import { ENEMIES, DRAW_SCALE } from './battle_enemy.js';
import {
  drawPlayerMark, drawBlastGauge, drawEnemyHp, drawBossHp, drawClockScore, drawTouchControls,
  drawBreachLine, drawBlastWave,
} from './battle_hud.js';
import { drawResult } from './battle_result.js';
import { createIntroRenderer } from './battle_intro_render.js';
import { computeView } from './battle_view.js';

const ENEMY_FALLBACK = ['#b8563f', '#8a4a6b', '#4a5f8a', '#d0762e'];

const BLINK_HZ = 10;

const EDGE_SHADE = 'rgba(3, 12, 20, 0.42)';

const EDGE_LINE = 'rgba(255, 226, 170, 0.20)';

const FIELD_DIM = 'rgba(5, 22, 36, 0.16)';

export function createBattleRenderer(canvas, assets) {
  const ctx = canvas.getContext('2d');

  let view = computeView(FIELD_W, FIELD_H, FIELD_W, FIELD_H);

  const intro = createIntroRenderer(assets, () => view);

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    view = computeView(r.width || FIELD_W, r.height || FIELD_H, FIELD_W, FIELD_H);
    canvas.width = Math.round(view.cssW * dpr);
    canvas.height = Math.round(view.cssH * dpr);
    const k = view.scale * dpr;
    ctx.setTransform(k, 0, 0, k, view.ox * dpr, view.oy * dpr);
  }

  function drawSea() {
    const { overX, overY } = view;
    const x = -overX;
    const y = -overY;
    const w = FIELD_W + overX * 2;
    const h = FIELD_H + overY * 2;
    const img = assets.get('bg_sea');
    if (img) {
      const k = Math.max(w / img.width, h / img.height);
      const dw = img.width * k;
      const dh = img.height * k;
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
      return;
    }
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, '#0d3b52');
    g.addColorStop(1, '#072634');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  function dimField() {
    ctx.fillStyle = FIELD_DIM;
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);
  }

  function drawEdge() {
    const { overX, overY } = view;
    if (overX < 0.5 && overY < 0.5) return;
    ctx.save();
    ctx.fillStyle = EDGE_SHADE;
    if (overX >= 0.5) {
      ctx.fillRect(-overX, -overY, overX, FIELD_H + overY * 2);
      ctx.fillRect(FIELD_W, -overY, overX, FIELD_H + overY * 2);
    }
    if (overY >= 0.5) {
      ctx.fillRect(0, -overY, FIELD_W, overY);
      ctx.fillRect(0, FIELD_H, FIELD_W, overY);
    }
    ctx.strokeStyle = EDGE_LINE;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, FIELD_W, FIELD_H);
    ctx.restore();
  }

  function drawPlayer(p) {
    const img = assets.get('p_geobukseon');
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.aim + Math.PI / 2);

    if (p.invulnT > 0) ctx.globalAlpha = Math.floor(p.invulnT * BLINK_HZ) % 2 ? 0.35 : 1;
    if (img) ctx.drawImage(img, -SHIP / 2, -SHIP / 2, SHIP, SHIP);
    else { ctx.fillStyle = '#c8a45a'; ctx.fillRect(-SHIP / 2, -SHIP / 2, SHIP, SHIP); }
    ctx.restore();
  }

  function drawEnemies(list) {
    for (const e of list) {
      if (!e.alive) continue;
      const size = e.radius * DRAW_SCALE;
      const img = assets.get(ENEMIES[e.grade].code);
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.dir + Math.PI / 2);
      if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
      else {
        ctx.fillStyle = ENEMY_FALLBACK[e.grade];
        ctx.fillRect(-size / 2, -size / 2, size, size);
      }
      ctx.restore();
    }
  }

  function drawBoss(b) {
    if (!b || !b.alive) return;
    const size = b.radius * DRAW_SCALE;
    const img = assets.get('b_flagship');
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.strokeStyle = 'rgba(255, 74, 52, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.rotate(b.dir + Math.PI / 2);
    if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
    else { ctx.fillStyle = '#6b2f2f'; ctx.fillRect(-size / 2, -size / 2, size, size); }
    ctx.restore();
  }

  function draw(scene, remainingMs, now = 0, touchView = null) {
    const view = scene.introView ? scene.introView(now) : null;
    if (view) { intro.draw(ctx, view, scene.plan, scene.wheel); return; }
    drawSea();
    dimField();
    drawEdge();

    drawBreachLine(ctx);

    if (scene.fx) scene.fx.drawUnder(ctx);

    drawPlayerMark(ctx, scene.player, now);

    drawEnemies(scene.enemies);
    drawEnemyHp(ctx, scene.enemies);

    drawBoss(scene.boss);
    drawBossHp(ctx, scene.boss);
    drawShots(ctx, scene.shots, assets.get('fx_cannonball'));
    drawPlayer(scene.player);

    drawBlastWave(ctx, scene.player);
    drawBlastGauge(ctx, scene.player);
    if (scene.fx) scene.fx.drawOver(ctx);
    if (scene.phase === 'battle') {
      drawClockScore(ctx, remainingMs, scene.score);

      if (touchView) drawTouchControls(ctx, touchView, scene.player);
    }

    else if (scene.phase === 'result') {
      drawResult(ctx, scene.result(), scene.resultElapsed(now), scene.fast, view);
    }
  }

  return { resize, draw, view: () => view, width: FIELD_W, height: FIELD_H };
}
