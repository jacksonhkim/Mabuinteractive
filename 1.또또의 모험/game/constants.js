// 게임 시스템 상수 및 설정
export const CONFIG = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: 720,
    PLAYER_SPEED: 2.5,
    FRICTION: 0.9,
    FPS: 60,
    GAME_SPEED: 1.0
};

export const CHARACTERS = [
    { id: 'toto', name: '또또', speed: 4.0, power: '일반', range: '광역', shotDelay: 200, color: '#ffcc00' },
    { id: 'lulu', name: '루루', speed: 5.5, power: '일반', range: '좁음', shotDelay: 130, color: '#F06292' },
    { id: 'kaka', name: '카카', speed: 2.8, power: '강력', range: '중앙', shotDelay: 350, color: '#4E342E' },
    { id: 'momo', name: '모모', speed: 3.5, power: '일반', range: '광역', shotDelay: 220, color: '#D32F2F' },
    { id: 'pipi', name: '피피', speed: 4.5, power: '일반', range: '유도', shotDelay: 180, color: '#2E7D32' }
];

export const ENEMY_TYPES = {
    SCOUT_WASP: 0,
    DANCING_BUTTERFLY: 1,
    BEETLE: 2,
    DRONE: 3,
    GHOST: 4,
    SLIME: 5,
    BOSS_BULLET: 99
};

export const STAGE_ENEMIES = {
    1: [ENEMY_TYPES.SCOUT_WASP, ENEMY_TYPES.DANCING_BUTTERFLY],
    2: [ENEMY_TYPES.SCOUT_WASP, ENEMY_TYPES.BEETLE],
    3: [ENEMY_TYPES.DANCING_BUTTERFLY, ENEMY_TYPES.BEETLE],
    4: [ENEMY_TYPES.DRONE],
    5: [ENEMY_TYPES.GHOST],
    6: [ENEMY_TYPES.BEETLE],
    7: [ENEMY_TYPES.DRONE, ENEMY_TYPES.SLIME],
    8: [ENEMY_TYPES.SLIME, ENEMY_TYPES.SCOUT_WASP],
    9: [ENEMY_TYPES.DRONE, ENEMY_TYPES.SCOUT_WASP],
    10: [ENEMY_TYPES.GHOST, ENEMY_TYPES.DRONE]
};

export const BOSS_DATA = {
    1: { type: 1, name: "General Buzz", width: 300, height: 250, hp: 100, maxHp: 100 },
    2: { type: 2, name: "Queen Arachne", width: 350, height: 300, hp: 400, maxHp: 400 },
    3: { type: 3, name: "Metal Orochi", width: 450, height: 220, hp: 800, maxHp: 800 },
    4: { type: 4, name: "Storm Falcon", width: 300, height: 240, hp: 1000, maxHp: 1000 },
    5: { type: 5, name: "Phantom Moth", width: 400, height: 280, hp: 1200, maxHp: 1200 },
    6: { type: 6, name: "Flame Salamander", width: 500, height: 250, hp: 1600, maxHp: 1600 },
    7: { type: 7, name: "Junk Amalgam", width: 400, height: 400, hp: 2000, maxHp: 2000 },
    8: { type: 8, name: "Toxic Chimera", width: 450, height: 320, hp: 2400, maxHp: 2400 },
    9: { type: 9, name: "Sky Fortress Core", width: 600, height: 600, hp: 3000, maxHp: 3000 },
    10: { type: 10, name: "Emperor V", width: 350, height: 480, hp: 3200, maxHp: 3200 }
};

// 스테이지별 대화 데이터
export const STAGE_DIALOGUES = {
    1: [
        { name: "또또", text: "드디어 모험의 시작이야! 평화로운 숲을 지켜내겠어.", side: "left" },
        { name: "요정", text: "또또, 조심해! 말벌 부대가 나타났다는 보고야.", side: "right" }
    ],
    2: [
        { name: "또또", text: "밤이 되니 공기가 차가워졌어. 더 위험한 녀석들이 오겠군.", side: "left" },
        { name: "요정", text: "적들의 공격이 더 거세질 거야. 집중해!", side: "right" }
    ],
    3: [
        { name: "또또", text: "이 붉은 황혼... 보스가 가까이 있는 것 같아.", side: "left" },
        { name: "요정", text: "여기서 밀리면 끝장이야. 내가 옆에서 지원할게!", side: "right" }
    ],
    4: [ // Stage 4: Storm Falcon
        { name: "또또", text: "바람이 거세지고 있어! 중심 잡기가 힘들어.", side: "left" },
        { name: "요정", text: "협곡의 주인이 나타날 시간이야. 속도에 주의해!", side: "right" }
    ],
    5: [ // Stage 5: Phantom Moth
        { name: "또또", text: "앞이 잘 안 보여... 뭔가 흐릿한데.", side: "left" },
        { name: "요정", text: "환각 가루야! 진짜와 가짜를 구별해야 해!", side: "right" }
    ],
    6: [ // Stage 6: Flame Salamander
        { name: "또또", text: "앗 뜨거! 숲이 불타고 있어!", side: "left" },
        { name: "요정", text: "불길을 뚫고 원흉을 제거해야 해. 시간이 없어!", side: "right" }
    ],
    7: [ // Stage 7: Junk Amalgam
        { name: "또또", text: "이 고철덩어리들은 뭐지? 쓰레기장인가?", side: "left" },
        { name: "요정", text: "놈들이 버려진 기계들을 흡수하고 있어. 핵을 노려!", side: "right" }
    ],
    8: [ // Stage 8: Toxic Chimera
        { name: "또또", text: "우웩, 냄새가 지독해! 숨을 못 쉬겠어.", side: "left" },
        { name: "요정", text: "방독면 써! 놈이 독가스를 뿜고 있어!", side: "right" }
    ],
    9: [ // Stage 9: Sky Fortress Core
        { name: "또또", text: "저게 적들의 본거지인가? 엄청나게 크잖아!", side: "left" },
        { name: "요정", text: "최종 방어선이야. 저걸 뚫어야 황제를 만날 수 있어!", side: "right" }
    ],
    10: [ // Stage 10: Emperor "V"
        { name: "Emperor V", text: "여기까지 오다니. 가상하구나, 작은 벌레여.", side: "right" },
        { name: "또또", text: "숲을 원래대로 돌려놔! 네 야망은 끝이다!", side: "left" },
        { name: "Emperor V", text: "나의 위대한 계획을 이해하지 못하는군. 사라져라!", side: "right" }
    ]
};
