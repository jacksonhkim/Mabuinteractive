# 📄 DEV_LOG.md - 개발 로그 (Ver 1.0)
> **Managed by:** 또또 (Tech Lead)

## 📌 [Phase 4: Final Battle] - Technical Specification

### 1. Boss State Machine (Phase Transition)
- **Phase 1 (Throne):** Static Position -> Laser Pattern (X-Ray)
  - `boss.state = 'THRONE_PHASE'`
- **Phase 2 (Transform):** Animation (Shake + Explode) -> Mobile (Movement)
  - `boss.state = 'TRANSFORM_PHASE'` -> `boss.state = 'MOBILE_PHASE'`
- **Phase 3 (Berserk):** HP < 30% -> High-Density Danmaku (Bullet Hell)
  - `boss.state = 'BERSERK_MODE'`

### 2. Bullet Pooling Optimization
- **Limit:** 500 active bullets (Max). If > 500, oldest removed.
- **Rendering:** Batch Draw (Canvas 2D Path)
  - `ctx.beginPath()` -> `ctx.rect()` Loop -> `ctx.fill()` (Single Call)

### 3. Ending Sequence Logic
- **Trigger:** `boss.hp <= 0` && `boss.type === 10`
- **Effect:**
  1. `createMegaExplosion(x, y)` (Particle Count: 200)
  2. `startEndingCutscene()`
  3. `showCredits()`

### 4. Code Structure
- **Game Loop:**
  - `updateBoss()`: Handle Phase Logic
  - `drawPixelEmperorV()`: Handle Visuals based on Phase

---

> *Pending Code Review (By Peter)*
