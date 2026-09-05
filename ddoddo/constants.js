// 게임 시스템 상수 및 설정
export const CONFIG = {
    SCREEN_WIDTH: 1280,
    SCREEN_HEIGHT: 720,
    PLAYER_SPEED: 9.0,
    FRICTION: 0.9,
    FPS: 60,
    GAME_SPEED: 1.0
};

export const CHARACTERS = [
    { id: 'toto', name: '또또', speed: 6.8, power: '일반', range: '광역', shotDelay: 200, color: '#ffcc00' },
    { id: 'lulu', name: '루루', speed: 9.5, power: '일반', range: '좁음', shotDelay: 130, color: '#F06292' },
    { id: 'kaka', name: '카카', speed: 5.2, power: '강력', range: '중앙', shotDelay: 350, color: '#4E342E' },
    { id: 'momo', name: '모모', speed: 5.8, power: '일반', range: '광역', shotDelay: 220, color: '#D32F2F' },
    { id: 'pipi', name: '피피', speed: 7.5, power: '일반', range: '유도', shotDelay: 180, color: '#2E7D32' }
];

export const ENEMY_TYPES = {
    // Stage 1
    S1_A: 10, S1_B: 11, S1_C: 12, S1_D: 13,
    // Stage 2
    S2_A: 20, S2_B: 21, S2_C: 22, S2_D: 23,
    // Stage 3
    S3_A: 30, S3_B: 31, S3_C: 32, S3_D: 33,
    // Stage 4
    S4_A: 40, S4_B: 41, S4_C: 42, S4_D: 43,
    // Stage 5
    S5_A: 50, S5_B: 51, S5_C: 52, S5_D: 53,
    // Stage 6
    S6_A: 60, S6_B: 61, S6_C: 62, S6_D: 63,
    // Stage 7
    S7_A: 70, S7_B: 71, S7_C: 72, S7_D: 73,
    // Stage 8
    S8_A: 80, S8_B: 81, S8_C: 82, S8_D: 83,
    // Stage 9
    S9_A: 90, S9_B: 91, S9_C: 92, S9_D: 93,
    // Stage 10
    S10_A: 100, S10_B: 101, S10_C: 102, S10_D: 103,

    BOSS_BULLET: 99
};

export const STAGE_ENEMIES = {
    1: [ENEMY_TYPES.S1_A, ENEMY_TYPES.S1_B, ENEMY_TYPES.S1_C, ENEMY_TYPES.S1_D],
    2: [ENEMY_TYPES.S2_A, ENEMY_TYPES.S2_B, ENEMY_TYPES.S2_C, ENEMY_TYPES.S2_D],
    3: [ENEMY_TYPES.S3_A, ENEMY_TYPES.S3_B, ENEMY_TYPES.S3_C, ENEMY_TYPES.S3_D],
    4: [ENEMY_TYPES.S4_A, ENEMY_TYPES.S4_B, ENEMY_TYPES.S4_C, ENEMY_TYPES.S4_D],
    5: [ENEMY_TYPES.S5_A, ENEMY_TYPES.S5_B, ENEMY_TYPES.S5_C, ENEMY_TYPES.S5_D],
    6: [ENEMY_TYPES.S6_A, ENEMY_TYPES.S6_B, ENEMY_TYPES.S6_C, ENEMY_TYPES.S6_D],
    7: [ENEMY_TYPES.S7_A, ENEMY_TYPES.S7_B, ENEMY_TYPES.S7_C, ENEMY_TYPES.S7_D],
    8: [ENEMY_TYPES.S8_A, ENEMY_TYPES.S8_B, ENEMY_TYPES.S8_C, ENEMY_TYPES.S8_D],
    9: [ENEMY_TYPES.S9_A, ENEMY_TYPES.S9_B, ENEMY_TYPES.S9_C, ENEMY_TYPES.S9_D],
    10: [ENEMY_TYPES.S10_A, ENEMY_TYPES.S10_B, ENEMY_TYPES.S10_C, ENEMY_TYPES.S10_D]
};

export const BOSS_DATA = {
    1: { type: 1, name: "General Buzz", width: 300, height: 250, hp: 20, maxHp: 20 },
    2: { type: 2, name: "Queen Arachne", width: 350, height: 300, hp: 20, maxHp: 20 },
    3: { type: 3, name: "Metal Orochi", width: 450, height: 220, hp: 20, maxHp: 20 },
    4: { type: 4, name: "Storm Falcon", width: 300, height: 240, hp: 20, maxHp: 20 },
    5: { type: 5, name: "Phantom Moth", width: 400, height: 280, hp: 20, maxHp: 20 },
    6: { type: 6, name: "Flame Salamander", width: 500, height: 250, hp: 20, maxHp: 20 },
    7: { type: 7, name: "Junk Amalgam", width: 400, height: 400, hp: 20, maxHp: 20 },
    8: { type: 8, name: "Toxic Chimera", width: 450, height: 320, hp: 20, maxHp: 20 },
    9: { type: 9, name: "Sky Fortress Core", width: 600, height: 600, hp: 20, maxHp: 20 },
    10: { type: 10, name: "Emperor V", width: 350, height: 480, hp: 20, maxHp: 20 }
};

// ──────────────────────────────────────────────
// 스테이지별 동료 배정 (스테이지마다 다른 동료 등장)
// ──────────────────────────────────────────────
export const STAGE_COMPANION = {
    1: 'lulu', 2: 'kaka', 3: 'pipi', 4: 'momo',
    5: 'lulu', 6: 'kaka', 7: 'pipi', 8: 'momo',
    9: 'lulu', 10: 'kaka'
};

// ──────────────────────────────────────────────
// 스테이지 진입 나레이션 (선택 캐릭터 + 동료 대화)
// getStageDialogue(stage, playerId) 로 호출
// ──────────────────────────────────────────────
export function getStageDialogue(stage, playerId) {
    const companion = STAGE_COMPANION[stage] || 'lulu';
    const companionName = CHARACTERS.find(c => c.id === companion)?.name || companion;
    const playerName = CHARACTERS.find(c => c.id === playerId)?.name || '???';

    // 플레이어 대사 분기 함수
    const playerLine = (lines) => lines[playerId] || lines['toto'];

    const dialogues = {
        1: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '드디어 모험의 시작이야! 평화로운 숲을 내가 지킨다!',
                    lulu: '흠, 적들이 보여? 내 레이저로 싹 쓸어버릴게!',
                    kaka: '…모험이라. 나는 힘으로 길을 열겠다.',
                    momo: '두근두근~! 모든 친구들을 지켜낼 거야!',
                    pipi: '빠르게 해치우고 빠르게 돌아오는 거야!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '말벌 부대가 숲 입구를 막고 있어. 첫 관문이야, 같이 돌파하자!' }
        ],
        2: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '밤이 되니 적들이 더 은밀하게 움직이잖아.',
                    lulu: '어두워도 내 레이저는 빗나가지 않아.',
                    kaka: '어두울수록 소리로 적을 잡는다. 집중.',
                    momo: '다들 무사한 거지? 조심해야 해…',
                    pipi: '야간 전투야. 내 속도가 빛나는 순간이지!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '적들의 야간 공격 패턴이 달라. 방심하면 순식간에 포위당해!' }
        ],
        3: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '이 붉은 황혼… 뭔가 불길한 느낌이야.',
                    lulu: '황혼빛이 예쁘긴 한데… 적도 많네.',
                    kaka: '황혼이 지나면 더 강한 놈들이 온다.',
                    momo: '저 노을 보니까 집이 그립다… 아, 집중해야지!',
                    pipi: '황혼전에 빠르게 끝내버리자!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '여기서 밀리면 보스와 맞닥뜨려. 지금 전력을 다해야 해!' }
        ],
        4: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '바람이 너무 강해! 날아갈 것 같아!',
                    lulu: '이 바람, 내 탄도가 흔들리잖아. 짜증나!',
                    kaka: '바람 정도는 무시한다. 앞으로.',
                    momo: '으아, 바람에 날리면 어떡해! 꽉 잡아야지!',
                    pipi: '바람도 나보단 느려!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '협곡의 주인 Storm Falcon이 나타날 시간이야. 기류를 조심해!' }
        ],
        5: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '눈앞이 뿌옇게 흐려지는 것 같아…',
                    lulu: '환각이야? 쳇, 내 눈을 속이다니.',
                    kaka: '정신 집중. 흔들리지 마.',
                    momo: '저게 진짜야, 가짜야? 무서워…!',
                    pipi: '빠르게 움직이면 환각도 못 따라와!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: 'Phantom Moth의 환각 가루야. 진짜와 가짜를 구별해야 살아남아!' }
        ],
        6: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '앗 뜨거! 숲 전체가 불타고 있어!',
                    lulu: '내 레이저보다 더 뜨거운 게 있다고?!',
                    kaka: '불이라면 두렵지 않다. 뚫고 나간다.',
                    momo: '모두 화상 입으면 안 돼! 내가 치유할게!',
                    pipi: '불꽃보다 빠르게 달리면 돼!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '불길을 뚫어야 해. Flame Salamander가 불을 지르고 있어. 시간이 없다!' }
        ],
        7: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '여기가 쓰레기장이야? 뭔가 꿈틀거리잖아!',
                    lulu: '이 고철 덩어리들, 내 레이저로 녹여버리겠어.',
                    kaka: '버려진 기계들… 슬프지만 적이라면 부순다.',
                    momo: '이 녀석들도 원래는 착했을 텐데… 어쩔 수 없어.',
                    pipi: '느린 고철 녀석들이야. 약점을 빠르게 찾아!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: 'Junk Amalgam이 폐기물을 흡수 중이야. 핵을 노려서 일격에!' }
        ],
        8: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '우웩, 냄새가 지독해! 독가스야!',
                    lulu: '내 옷에 묻으면 어떡해! 빨리 끝내자.',
                    kaka: '독은 버텨낸다. 몸으로 밀어붙인다.',
                    momo: '다들 숨 참아! 내가 해독할게!',
                    pipi: '독가스보다 빠르면 맞지 않아!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: 'Toxic Chimera의 독가스 지역이야. 함부로 멈추지 마!' }
        ],
        9: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '저게 적들의 본거지야? 엄청나게 크잖아…!',
                    lulu: '저 거대한 요새… 내 레이저로 뚫어줄게.',
                    kaka: '…크다. 하지만 부수지 못할 건 없다.',
                    momo: '여기까지 왔어. 다 같이 돌파하는 거야!',
                    pipi: '빠르게 침투해서 핵을 파괴한다!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '최종 방어선 Sky Fortress Core야. 저걸 뚫으면 황제와 맞붙어!' }
        ],
        10: [
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '드디어 황제 앞까지 왔어. 여기서 끝낸다!',
                    lulu: '황제 폐하~? 내 레이저 받아봐.',
                    kaka: '황제여. 네 군대는 내가 다 부쉈다. 각오해라.',
                    momo: '우리 모두의 힘을 모아서 이길 거야!',
                    pipi: '이 싸움, 내가 마침표를 찍는다!'
                })
            },
            { name: companionName, charId: companion, side: 'right', text: '마지막 결전이야. 우리 여기까지 왔잖아. 반드시 이긴다!' }
        ]
    };
    return dialogues[stage] || dialogues[1];
}

// ──────────────────────────────────────────────
// 보스 등장 씬 대화 데이터
// getBossDialogue(stage, playerId) 로 호출
// ──────────────────────────────────────────────
export function getBossDialogue(stage, playerId) {
    const playerName = CHARACTERS.find(c => c.id === playerId)?.name || '???';
    const boss = BOSS_DATA[stage];
    const bossName = boss?.name || 'BOSS';

    const playerLine = (lines) => lines[playerId] || lines['toto'];

    const dialogues = {
        1: [
            { name: bossName, charId: 'boss', side: 'right', text: '네놈들이 감히 내 말벌 부대를 건드렸냐! 후회하게 해주지!' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '네가 장군이냐! 숲을 돌려놔, 지금 당장!',
                    lulu: '말벌 장군? 내 레이저 맛 좀 봐라!',
                    kaka: '…대화는 필요 없다. 부순다.',
                    momo: '왜 이런 짓을 하는 거야! 멈춰!',
                    pipi: '느린 장군이네. 빠르게 끝내줄게!'
                })
            }
        ],
        2: [
            { name: bossName, charId: 'boss', side: 'right', text: '웹에 걸린 먹잇감들이 발버둥치는군. 귀엽기도 해라.' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '거미 여왕! 네 거미줄은 나한테 안 통해!',
                    lulu: '징그러운 거미 다리들, 다 잘라줄게.',
                    kaka: '독을 가졌군. 내가 먼저 으깨주겠다.',
                    momo: '거미도 생명인데… 하지만 막아야만 해!',
                    pipi: '느린 거미줄은 나한테 아무 소용없어!'
                })
            }
        ],
        3: [
            { name: bossName, charId: 'boss', side: 'right', text: '크하하! 8개의 머리 중 어느 걸 먼저 노릴 테냐?' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '다 부숴버리면 되잖아! 각오해라, Metal Orochi!',
                    lulu: '8개? 하나씩 레이저로 청소해줄게!',
                    kaka: '머리가 많아도 몸통은 하나다. 정중앙.',
                    momo: '저렇게 많은 머리라니… 겁나지만 해낼 거야!',
                    pipi: '8개? 8배 더 빠르게 쓰러뜨리면 돼!'
                })
            }
        ],
        4: [
            { name: bossName, charId: 'boss', side: 'right', text: '이 하늘은 내 영역이다! 지면의 벌레들은 꺼져라!' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '하늘이 누구 것? 지금 보여줄게!',
                    lulu: '하늘 위 레이저는 더 잘 보이겠네?',
                    kaka: '공중이라도 피하지 못한다.',
                    momo: '하늘을 전쟁터로 만들지 마!',
                    pipi: '하늘이라면 나야말로 홈이야!'
                })
            }
        ],
        5: [
            { name: bossName, charId: 'boss', side: 'right', text: '…내가 진짜인지, 환상인지도 모르게 해주지.' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '어느 게 진짜든 상관없어. 다 쓰러뜨리면 되니까!',
                    lulu: '레이저는 진짜와 가짜를 구분 안 해.',
                    kaka: '눈 감고도 잡아낸다.',
                    momo: '두렵지만… 친구들을 위해 싸울 거야!',
                    pipi: '빠르게 움직이면 환각도 못 속여!'
                })
            }
        ],
        6: [
            { name: bossName, charId: 'boss', side: 'right', text: '이 불길 속에서 살아남을 생각은 버려라. 재가 될 때까지 태워주지!' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '불꽃 따위에 지지 않아! 덤벼라!',
                    lulu: '내 레이저가 더 뜨겁거든!',
                    kaka: '불이 두렵지 않다. 정면돌파.',
                    momo: '이 불을 끄고 숲을 원래대로 돌려놓을 거야!',
                    pipi: '화염보다 빠르면 타지 않아!'
                })
            }
        ],
        7: [
            { name: bossName, charId: 'boss', side: 'right', text: '나는 버려진 모든 것들의 분노다! 너희도 쓰레기로 만들어주지!' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '분노는 이해해. 하지만 이 방법은 틀렸어!',
                    lulu: '쓰레기 덩어리가 말을 하네. 흥미롭긴 한데.',
                    kaka: '감정은 힘이 되지 않는다. 멈춰라.',
                    momo: '네 슬픔이 느껴져… 하지만 막아야 해.',
                    pipi: '말 많은 보스네. 빠르게 끝낼게!'
                })
            }
        ],
        8: [
            { name: bossName, charId: 'boss', side: 'right', text: '부패를 두려워하느냐? 너희도 곧 내 독에 녹아들 것이다.' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '독 따위엔 지지 않아! 해독제는 내 주먹이야!',
                    lulu: '역겨운 냄새! 빨리 끝내고 목욕이나 해야겠어.',
                    kaka: '독에 강한 몸이다. 두렵지 않다.',
                    momo: '독으로 모두를 괴롭히다니 용납 못 해!',
                    pipi: '독 구름 피하면서 공격하는 건 식은 죽 먹기!'
                })
            }
        ],
        9: [
            { name: bossName, charId: 'boss', side: 'right', text: '무의미하다… 나는 이미 모든 결과를 계산했다. 너희의 패배를.' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '네 계산엔 이 마음이 빠져있어! 포기 안 해!',
                    lulu: '계산이 빗나가는 게 인생이야!',
                    kaka: '계산이 아니라 의지다.',
                    momo: '희망을 계산할 수 있어? 우리는 절대 포기 안 해!',
                    pipi: '계산보다 내가 빠를 거야!'
                })
            }
        ],
        10: [
            { name: bossName, charId: 'boss', side: 'right', text: '여기까지 오다니, 가상하구나 작은 벌레들이여. 하지만 끝이다.' },
            {
                name: playerName, charId: playerId, side: 'left', text: playerLine({
                    toto: '숲을 원래대로 돌려놔! 네 야망은 오늘 끝이야!',
                    lulu: '황제 폐하? 내 레이저에 왕관이 날아갈 거야.',
                    kaka: '황제여. 이 주먹이 네 군림의 끝을 알린다.',
                    momo: '당신이 얼마나 강해도, 우리의 우정이 이길 거야!',
                    pipi: '황제도 내 속도를 따라올 순 없어!'
                })
            },
            { name: bossName, charId: 'boss', side: 'right', text: '하하… 재미있는 벌레들이군. 좋다, 전력으로 상대해주지!' }
        ]
    };
    return dialogues[stage] || [];
}

