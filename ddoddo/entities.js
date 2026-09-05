// ============================================================
// [BRIDGE] entities.js
// 리팩토링 브리지 — 새 서비스 모듈에서 re-export
// 기존 import 호환성을 유지하면서 코드를 분리 모듈로 이전
// ============================================================
// 원본: 742줄 → 3개 모듈로 분리
// - services/player.js    (플레이어 이동/사격/차지샷/폭탄/피격)
// - services/enemies.js   (적 스폰/이동AI/사격/충돌)
// - services/boss.js      (보스 스폰/AI상태머신/사격/충돌)
// - services/combat.js    (총알/폭탄/아이템/파티클/배경)
// ============================================================

// ── 플레이어 ──
export { updatePlayer, shoot, fireCharacterChargeShot, useBomb } from './services/player.js';
export { playerHit } from './services/shared.js';

// ── 적 ──
export { spawnEnemy, updateEnemies, enemyShoot } from './services/enemies.js';

// ── 보스 ──
export { spawnBoss, updateBoss, bossShoot } from './services/boss.js';

// ── 전투 시스템 (총알/폭탄/아이템/파티클/배경) ──
export {
    updateBackground, updateBullets, updateBombs,
    updateItems, updateEnemyBullets, updateParticles,
    createExplosion, spawnItem
} from './services/combat.js';
