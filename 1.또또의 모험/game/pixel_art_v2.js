// ============================================================
// [BRIDGE] pixel_art_v2.js
// 리팩토링 브리지 — 새 그래픽 모듈에서 re-export
// 기존 import 호환성을 유지하면서 코드를 분리 모듈로 이전
// ============================================================
// 원본: 2181줄 → 6개 모듈로 분리
// - graphics/pixel_helpers.js     (공통 헬퍼)
// - graphics/pixel_hero.js        (플레이어 캐릭터 5종)
// - graphics/pixel_enemies.js     (적 캐릭터 6종)  
// - graphics/pixel_bosses.js      (보스 10종)
// - graphics/pixel_effects.js     (이펙트/아이템/UI)
// - graphics/pixel_bg.js          (배경 렌더링)
// - graphics/pixel_worldmap.js    (월드맵 UI)
// ============================================================

// ── 공통 헬퍼 ──
export { drawRect, drawCharImg, drawPixelGrid } from './graphics/pixel_helpers.js';

// ── 히어로 캐릭터 ──
export {
    drawPixelTotoV2, drawPixelTotoV5, drawBitBee,
    drawPixelLuluV2, drawPixelKakaV2, drawPixelMomoV2, drawPixelPipiV2
} from './graphics/pixel_hero.js';

// ── 적 캐릭터 ──
export {
    drawPixelWaspV2, drawPixelButterflyV2, drawPixelBeetleV2,
    drawPixelDroneV2, drawPixelGhostV2, drawPixelSlimeV2
} from './graphics/pixel_enemies.js';

// ── 보스 캐릭터 ──
export {
    drawPixelBossBuzzV2, drawPixelQueenArachne, drawPixelMetalOrochi,
    drawPixelStormFalcon, drawPixelPhantomMoth, drawPixelFlameSalamander,
    drawPixelJunkAmalgam, drawPixelToxicChimera,
    drawPixelSkyFortressCore, drawPixelEmperorV
} from './graphics/pixel_bosses.js';

// ── 이펙트/아이템/UI ──
export {
    drawPixelItemV2, drawPixelSafeGuard, drawPixelBombEffectV2,
    drawBranchSelectionUI,
    drawPixelTotoPortrait, drawPixelLuluPortrait, drawPixelKakaPortrait,
    drawPixelMomoPortrait, drawPixelPipiPortrait, drawPixelFairyPortrait
} from './graphics/pixel_effects.js';

// ── 배경 ──
export { drawPixelForestV2 } from './graphics/pixel_bg.js';

// ── 월드맵 ──
export { drawWorldMap } from './graphics/pixel_worldmap.js';
