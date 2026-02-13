/**
 * 뽀(기획팀장)의 기획서 PPT 생성기
 * 또또의 모험 - 종합 기획서 PPT
 */
import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();

// ============================================================
// 0. 프레젠테이션 기본 설정
// ============================================================
pptx.author = '뽀 (기획팀장)';
pptx.company = '안티그래비티';
pptx.subject = '또또의 모험 - 종합 기획서';
pptx.title = '또또의 모험 종합 기획서';
pptx.layout = 'LAYOUT_WIDE'; // 16:9

// 색상 팔레트
const C = {
    BLACK: '1a1a2e',
    DARK: '16213e',
    BLUE: '0f3460',
    ACCENT: 'e94560',
    YELLOW: 'f5c518',
    WHITE: 'ffffff',
    LIGHT_GRAY: 'f0f0f0',
    GREEN: '2ecc71',
    ORANGE: 'e67e22',
    STAGE_BG: '0d1b2a',
};

// 재사용 스타일
const TITLE_STYLE = { fontSize: 36, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' };
const SUBTITLE_STYLE = { fontSize: 18, color: C.YELLOW, fontFace: 'Malgun Gothic' };
const BODY_STYLE = { fontSize: 14, color: C.WHITE, fontFace: 'Malgun Gothic', lineSpacingMultiple: 1.4 };
const SECTION_TITLE = { fontSize: 28, bold: true, color: C.YELLOW, fontFace: 'Malgun Gothic' };

function addBgToSlide(slide, color = C.DARK) {
    slide.background = { fill: color };
}

// ============================================================
// 1. 표지 슬라이드
// ============================================================
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.BLACK);

    // 상단 장식 라인
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.05, fill: { color: C.YELLOW } });

    // 타이틀
    slide.addText('🐝 또또의 모험', { x: 1, y: 1.5, w: 11, h: 1.5, ...TITLE_STYLE, fontSize: 48, align: 'center' });
    slide.addText('The Adventure of Toto', { x: 1, y: 2.8, w: 11, h: 0.8, ...SUBTITLE_STYLE, fontSize: 22, align: 'center', italic: true });

    // 구분선
    slide.addShape(pptx.ShapeType.rect, { x: 4, y: 3.8, w: 5, h: 0.03, fill: { color: C.ACCENT } });

    // 부제
    slide.addText('종합 기획서 v1.0', { x: 1, y: 4.2, w: 11, h: 0.8, fontSize: 20, color: C.WHITE, fontFace: 'Malgun Gothic', align: 'center' });

    // 하단 정보
    slide.addText('기획: 뽀 (기획팀장) | 안티그래비티 게임 개발팀\n2026.02.11', {
        x: 1, y: 6.0, w: 11, h: 0.8,
        fontSize: 12, color: 'aaaaaa', fontFace: 'Malgun Gothic', align: 'center'
    });

    // 하단 장식 라인
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.45, w: '100%', h: 0.05, fill: { color: C.ACCENT } });
}

// ============================================================
// 2. 목차 슬라이드
// ============================================================
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.DARK);

    slide.addText('📋 목차', { x: 0.8, y: 0.4, w: 11, h: 0.8, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 1.1, w: 2, h: 0.03, fill: { color: C.YELLOW } });

    const toc = [
        { num: '01', title: '시나리오 기획서', desc: '메인 시놉시스 및 스테이지별 핵심 서사' },
        { num: '02', title: '시스템 기획서', desc: '캐릭터 조작, 아이템 시스템, 스테이지 구성' },
        { num: '03', title: '콘텐츠 기획서', desc: '스테이지 및 맵 디자인, 수집 요소' },
        { num: '04', title: 'UI/UX 기획서', desc: 'HUD, 대화창, 메뉴 설계' },
    ];

    toc.forEach((item, i) => {
        const y = 1.5 + i * 1.3;
        slide.addText(item.num, { x: 1, y, w: 1, h: 0.8, fontSize: 28, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
        slide.addText(item.title, { x: 2.2, y, w: 6, h: 0.5, fontSize: 20, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText(item.desc, { x: 2.2, y: y + 0.45, w: 8, h: 0.4, fontSize: 13, color: 'aaaaaa', fontFace: 'Malgun Gothic' });
        slide.addShape(pptx.ShapeType.rect, { x: 2.2, y: y + 0.95, w: 9, h: 0.01, fill: { color: '333355' } });
    });
}

// ============================================================
// 3. 시나리오 기획서
// ============================================================

// 3-1 섹션 표지
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.BLUE);
    slide.addText('01', { x: 1, y: 1.5, w: 3, h: 1.5, fontSize: 72, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('시나리오 기획서', { x: 1, y: 3.2, w: 10, h: 1, ...TITLE_STYLE });
    slide.addText('메인 시놉시스 및 스테이지별 핵심 서사', { x: 1, y: 4.2, w: 10, h: 0.6, ...SUBTITLE_STYLE });
}

// 3-2 메인 시놉시스
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('📖 메인 시놉시스', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 2.5, h: 0.03, fill: { color: C.YELLOW } });

    slide.addText(
        '평화로운 꿀벌 마을의 최고 비행사 \'또또\'.\n\n' +
        '어느 날 말벌 부대와 정체불명의 드론들이 마을을 습격하여\n여왕벌과 동료들을 납치한다.\n\n' +
        '또또는 그들의 배후에 숲을 기계 공장으로 만들려는\n\'기계 제국\'이 있음을 알게 되고, 홀로 제국의 심장부로 향한다.',
        { x: 1, y: 1.3, w: 11, h: 4.5, ...BODY_STYLE, fontSize: 16, lineSpacingMultiple: 1.6 }
    );
}

// 3-3 ~ 3-6 스테이지별 서사 (Phase별 슬라이드)
const phases = [
    {
        title: 'Phase 1: 숲의 변질과 음모 발견',
        stages: [
            { name: 'Stage 1 - 평화로운 시작', desc: '꿀을 따러 나간 또또, 평소와 다른 숲의 분위기를 감지함.', quote: '"오늘따라 숲이 너무 조용한 걸? 저기 보이는 건... 말벌 정찰대?!"' },
            { name: 'Stage 2 - 안개 낀 풀숲', desc: '말벌들의 습격을 피해 깊은 풀숲으로 숨어들며 장수말벌의 음모를 엿들음.', quote: '"기계 녀석들과 손을 잡았다고? 숲이 위험해!"' },
            { name: 'Stage 3 - 은빛 폭포', desc: '폭포 뒤에 숨겨진 비밀 통로를 발견하지만, 수문장 거미가 앞을 가로막음.', quote: '"이곳은 아무도 지나갈 수 없다. 꿀벌 꼬맹이야!"' },
        ]
    },
    {
        title: 'Phase 2: 비극과 결의',
        stages: [
            { name: 'Stage 4 - 바람의 협곡', desc: '강력한 인공 돌풍이 불어오는 협곡. 누군가 숲의 지형을 바꾸고 있음을 확신함.', quote: '"이 바람... 자연적인 게 아니야. 기계 장치의 냄새가 나!"' },
            { name: 'Stage 5 - 거미의 감옥', desc: '사로잡힌 동료 꿀벌들을 발견하고 구출하는 긴박한 탈출극.', quote: '"또또야! 조심해, 천장에 거대한 여왕이 살고 있어!"' },
            { name: 'Stage 6 - 불타는 고향', desc: '돌아온 마을은 이미 기계 드론의 공격으로 불바다가 되어 있음.', quote: '"감히 우리 마을을... 절대로 용서하지 않겠어!"' },
        ]
    },
    {
        title: 'Phase 3: 반격과 침투',
        stages: [
            { name: 'Stage 7 - 고철의 무덤', desc: '파괴된 드론들의 잔해를 지나 기계 제국의 본거지로 향하는 비장한 행보.', quote: '"이 거대한 고철들이 우리 숲을 갉아먹고 있었군."' },
            { name: 'Stage 8 - 독가스 플랜트', desc: '숲을 말려 죽이려는 기계 제국의 가스 살포 계획을 저지하기 위한 사투.', quote: '"3분 안에 중앙 제어 장치를 파괴해야 해. 숨이 막혀...!"' },
        ]
    },
    {
        title: 'Phase 4: 최후의 결전',
        stages: [
            { name: 'Stage 9 - 하늘의 요새', desc: '공중 부선을 타고 제국의 심장부로 돌격. 말벌 배신자와의 최후의 문답.', quote: '"황금 말벌! 넌 숲의 자존심도 버린 거냐!"' },
            { name: 'Stage 10 - 황금의 심판', desc: '제국 황제와의 결전. 숲의 정령들과 동료들의 힘을 모아 진정한 평화를 되찾음.', quote: '"모두의 희망을 이 독침에 담았다! 숲으로 돌아가라!"' },
        ]
    },
];

phases.forEach(phase => {
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText(`🗡️ ${phase.title}`, { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE, fontSize: 24 });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 3, h: 0.03, fill: { color: C.YELLOW } });

    phase.stages.forEach((stage, i) => {
        const y = 1.2 + i * 1.8;
        // 스테이지 이름
        slide.addText(`▶ ${stage.name}`, { x: 1, y, w: 10, h: 0.5, fontSize: 18, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
        // 설명
        slide.addText(stage.desc, { x: 1.3, y: y + 0.5, w: 10, h: 0.4, ...BODY_STYLE });
        // 대사
        slide.addText(stage.quote, { x: 1.3, y: y + 1.0, w: 10, h: 0.4, fontSize: 13, italic: true, color: C.YELLOW, fontFace: 'Malgun Gothic' });
    });
});

// 연출 가이드
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('🎬 연출 가이드', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 2, h: 0.03, fill: { color: C.YELLOW } });

    const items = [
        ['대화창 (Dialogue Box)', '텐가이나 건버드 스타일로 캐릭터 포트레이트와 함께 하단에 출력.'],
        ['컷신 (Cutscene)', '스테이지 시작 및 보스 조우 시 짧은 대화 연출. (스킵 가능)'],
        ['감정 표현', '상황에 따라 또또의 표정(평범, 놀람, 분노, 슬픔) 변화 필수.'],
    ];
    items.forEach((item, i) => {
        const y = 1.3 + i * 1.5;
        slide.addText(`● ${item[0]}`, { x: 1, y, w: 10, h: 0.5, fontSize: 18, bold: true, color: C.GREEN, fontFace: 'Malgun Gothic' });
        slide.addText(item[1], { x: 1.3, y: y + 0.5, w: 10, h: 0.5, ...BODY_STYLE });
    });
}

// ============================================================
// 4. 시스템 기획서
// ============================================================
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.BLUE);
    slide.addText('02', { x: 1, y: 1.5, w: 3, h: 1.5, fontSize: 72, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('시스템 기획서', { x: 1, y: 3.2, w: 10, h: 1, ...TITLE_STYLE });
    slide.addText('캐릭터 조작, 아이템 시스템, 스테이지 구성', { x: 1, y: 4.2, w: 10, h: 0.6, ...SUBTITLE_STYLE });
}

// 조작 시스템
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('🎮 캐릭터 조작 시스템', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 3, h: 0.03, fill: { color: C.YELLOW } });

    const controls = [
        ['이동', '8방향 비행 (상, 하, 좌, 우 및 대각선)'],
        ['기본 슈팅', '일반 탄환 발사'],
        ['차지 샷', '벌침(Stinger)을 이용한 강력한 관통 공격 (기 모으기 필요)'],
        ['특수 스킬', '꿀(Honey) 폭탄 - 일정 범위 적 이동 속도 감소'],
    ];

    // 테이블 형태로 
    const tableRows = [
        [{ text: '액션', options: { bold: true, color: C.BLACK, fill: { color: C.YELLOW } } },
        { text: '설명', options: { bold: true, color: C.BLACK, fill: { color: C.YELLOW } } }],
        ...controls.map(c => [
            { text: c[0], options: { color: C.WHITE } },
            { text: c[1], options: { color: C.WHITE } }
        ])
    ];
    slide.addTable(tableRows, {
        x: 1, y: 1.3, w: 11, h: 3,
        fontSize: 14, fontFace: 'Malgun Gothic',
        border: { pt: 1, color: '444466' },
        rowH: [0.5, 0.5, 0.5, 0.7, 0.7],
        colW: [2.5, 8.5],
        fill: { color: '222244' },
    });
}

// 아이템 시스템
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('💎 속성 변신 아이템 시스템', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 3.5, h: 0.03, fill: { color: C.YELLOW } });

    const items = [
        { emoji: '🔥', name: '파이어 칠리 (Fire Chili)', effect: '전방 화염 방사 (적 탄막 상쇄 가능)', strength: '자연물, 거미줄, 가스 태워 없앰', stages: 'Stage 2, 8 추천', color: 'ff4444' },
        { emoji: '❄️', name: '아이스 민트 (Ice Mint)', effect: '3갈래 유도 얼음 발사 (적 빙결/둔화)', strength: '화염, 고속 적 식히거나 멈춤', stages: 'Stage 1, 6 추천', color: '4488ff' },
        { emoji: '⚡', name: '썬더 레몬 (Thunder Lemon)', effect: '초고속 관통 레이저 (즉발 데미지)', strength: '기계, 금속, 물 전도 & 합선', stages: 'Stage 3, 7, 9 추천', color: 'ffcc00' },
    ];

    items.forEach((item, i) => {
        const y = 1.2 + i * 1.9;
        slide.addText(`${item.emoji} ${item.name}`, { x: 1, y, w: 10, h: 0.5, fontSize: 18, bold: true, color: item.color, fontFace: 'Malgun Gothic' });
        slide.addText(`효과: ${item.effect}`, { x: 1.3, y: y + 0.5, w: 10, h: 0.35, ...BODY_STYLE });
        slide.addText(`상성 우위: ${item.strength}`, { x: 1.3, y: y + 0.85, w: 10, h: 0.35, ...BODY_STYLE });
        slide.addText(`추천: ${item.stages}`, { x: 1.3, y: y + 1.2, w: 10, h: 0.35, fontSize: 13, italic: true, color: C.GREEN, fontFace: 'Malgun Gothic' });
    });
}

// 기본 아이템
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('📦 기본 아이템', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 2, h: 0.03, fill: { color: C.YELLOW } });

    slide.addText('🌸 파워 업 꽃가루', { x: 1, y: 1.3, w: 10, h: 0.5, fontSize: 20, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('3단계 사격 강화 (기본 탄환 굵기 및 데미지 증가)', { x: 1.3, y: 1.8, w: 10, h: 0.5, ...BODY_STYLE });

    slide.addText('🍯 로열 젤리', { x: 1, y: 2.8, w: 10, h: 0.5, fontSize: 20, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('체력(하트) 1칸 회복 + 2초 무적', { x: 1.3, y: 3.3, w: 10, h: 0.5, ...BODY_STYLE });

    // 뽀의 코멘트
    slide.addShape(pptx.ShapeType.rect, { x: 1, y: 4.5, w: 11, h: 2, fill: { color: '1a1a3e' }, rectRadius: 0.1 });
    slide.addText('💬 기획자 뽀의 전략 코멘트', { x: 1.3, y: 4.6, w: 10, h: 0.5, fontSize: 16, bold: true, color: C.YELLOW, fontFace: 'Malgun Gothic' });
    slide.addText(
        '"대표님의 결정대로 \'힌트 없는 하드코어/레트로 감성\'으로 갑니다!\n유저가 직접 화염 나방에게 타죽어보고, 다음 판에 \'아하, 아이스 민트를 챙겨야겠구나!\' 하고\n깨닫는 유레카 모먼트(Eureka Moment)를 설계하겠습니다."',
        { x: 1.3, y: 5.1, w: 10.5, h: 1.3, fontSize: 13, italic: true, color: 'cccccc', fontFace: 'Malgun Gothic', lineSpacingMultiple: 1.4 }
    );
}

// ============================================================
// 5. 콘텐츠 기획서
// ============================================================
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.BLUE);
    slide.addText('03', { x: 1, y: 1.5, w: 3, h: 1.5, fontSize: 72, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('콘텐츠 기획서', { x: 1, y: 3.2, w: 10, h: 1, ...TITLE_STYLE });
    slide.addText('스테이지 및 맵 디자인, 수집 요소', { x: 1, y: 4.2, w: 10, h: 0.6, ...SUBTITLE_STYLE });
}

// 스테이지 맵 디자인 (테이블)
const stageData = [
    ['Stage 1', '평화로운 시작', '초록빛 숲, 파란 하늘', '튜토리얼, 장애물 없음'],
    ['Stage 2', '안개 낀 풀숲', '짙은 녹색, 안개 효과', '거미줄(이동속도 감소)'],
    ['Stage 3', '은빛 폭포', '폭포수 뒤편 동굴', '낙수 밀림 효과'],
    ['Stage 4', '바람의 협곡', '붉은 바위, 모래바람', '강풍 밀림'],
    ['Stage 5', '거미의 감옥', '거미줄 동굴, 횃불', '독액, 동료 구출'],
    ['Stage 6', '불타는 고향', '불타는 숲, 검은 연기', '화염 지대 회피'],
    ['Stage 7', '고철의 무덤', '녹슨 기계, 비', '컨베이어, 즉사 함정'],
    ['Stage 8', '독가스 플랜트', '녹색 파이프 공장', '독가스, 환기구 파괴'],
    ['Stage 9', '하늘의 요새', '구름 위 공중 전함', '고속 스크롤, 추락'],
    ['Stage 10', '황금의 심판', '황금 알현실', '보스 전용, 레이저 탄막'],
];

// 2페이지로 나누기
for (let page = 0; page < 2; page++) {
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText(`🗺️ 스테이지 맵 디자인 (${page + 1}/2)`, { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE, fontSize: 22 });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 3, h: 0.03, fill: { color: C.YELLOW } });

    const header = [
        { text: '스테이지', options: { bold: true, color: C.BLACK, fill: { color: C.YELLOW } } },
        { text: '이름', options: { bold: true, color: C.BLACK, fill: { color: C.YELLOW } } },
        { text: '배경', options: { bold: true, color: C.BLACK, fill: { color: C.YELLOW } } },
        { text: '기믹', options: { bold: true, color: C.BLACK, fill: { color: C.YELLOW } } },
    ];

    const start = page * 5;
    const rows = [header, ...stageData.slice(start, start + 5).map(row =>
        row.map(cell => ({ text: cell, options: { color: C.WHITE } }))
    )];

    slide.addTable(rows, {
        x: 0.5, y: 1.2, w: 12, h: 4,
        fontSize: 12, fontFace: 'Malgun Gothic',
        border: { pt: 1, color: '444466' },
        colW: [1.5, 2.2, 3.8, 4.5],
        fill: { color: '222244' },
    });
}

// 수집 요소
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('🏆 수집 요소 및 도전 과제', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 3, h: 0.03, fill: { color: C.YELLOW } });

    slide.addText('🍯 황금 꿀단지', { x: 1, y: 1.5, w: 10, h: 0.5, fontSize: 20, bold: true, color: C.YELLOW, fontFace: 'Malgun Gothic' });
    slide.addText('각 스테이지 숨겨진 장소에 1개씩 존재.\n모두 모으면 진 엔딩(True Ending) 조건 달성.', { x: 1.3, y: 2.0, w: 10, h: 0.8, ...BODY_STYLE });

    slide.addText('🐝 동료 구출', { x: 1, y: 3.2, w: 10, h: 0.5, fontSize: 20, bold: true, color: C.GREEN, fontFace: 'Malgun Gothic' });
    slide.addText('포로가 된 꿀벌 구출 시 보너스 점수 및 엔딩 일러스트 추가.', { x: 1.3, y: 3.7, w: 10, h: 0.5, ...BODY_STYLE });
}

// ============================================================
// 6. UI/UX 기획서
// ============================================================
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.BLUE);
    slide.addText('04', { x: 1, y: 1.5, w: 3, h: 1.5, fontSize: 72, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('UI/UX 기획서', { x: 1, y: 3.2, w: 10, h: 1, ...TITLE_STYLE });
    slide.addText('HUD, 대화창, 메뉴 설계', { x: 1, y: 4.2, w: 10, h: 0.6, ...SUBTITLE_STYLE });
}

// HUD 설계
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('📊 화면 구성 (HUD)', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 2.5, h: 0.03, fill: { color: C.YELLOW } });

    const hudItems = [
        { title: 'Score (점수)', desc: '좌측 상단. 6자리 숫자 (예: SCORE: 001500)\n적 처치 시 실시간 업데이트 효과.', color: C.YELLOW },
        { title: 'Lives (생명력)', desc: '우측 상단. 하트 아이콘(❤) 3개로 표시.\n피격 시 깨지는 애니메이션 후 사라짐.', color: C.ACCENT },
        { title: 'Boss HP (보스 체력바)', desc: '보스전 진입 시 화면 하단 중앙에\n긴 바 형태로 등장.', color: C.GREEN },
    ];

    hudItems.forEach((item, i) => {
        const y = 1.2 + i * 1.8;
        slide.addText(`● ${item.title}`, { x: 1, y, w: 10, h: 0.5, fontSize: 18, bold: true, color: item.color, fontFace: 'Malgun Gothic' });
        slide.addText(item.desc, { x: 1.3, y: y + 0.5, w: 10, h: 0.8, ...BODY_STYLE });
    });
}

// 대화창 & 메뉴
{
    const slide = pptx.addSlide();
    addBgToSlide(slide);
    slide.addText('💬 대화창 & 메뉴 설계', { x: 0.8, y: 0.3, w: 11, h: 0.7, ...SECTION_TITLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.8, y: 0.9, w: 3, h: 0.03, fill: { color: C.YELLOW } });

    slide.addText('📝 대화창 (Dialogue Box)', { x: 1, y: 1.3, w: 10, h: 0.5, fontSize: 18, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('위치: 화면 하단 1/3 영역\n좌측: 화자(캐릭터) 일러스트 포트레이트 (표정 변화)\n우측: 대사 텍스트 출력 영역 (타이핑 효과)\n기능: 터치 시 대사 넘김, \'Skip\' 버튼 제공', { x: 1.3, y: 1.8, w: 10, h: 1.5, ...BODY_STYLE });

    slide.addText('📱 모바일 컨트롤러', { x: 1, y: 3.5, w: 10, h: 0.5, fontSize: 18, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('D-PAD: 좌측 하단 반투명 십자 키 (터치 영역 넉넉하게)\nAction Button: 우측 하단 [A: 공격] [B: 폭탄/스킬]', { x: 1.3, y: 4.0, w: 10, h: 0.8, ...BODY_STYLE });

    slide.addText('📋 메뉴 시스템', { x: 1, y: 5.2, w: 10, h: 0.5, fontSize: 18, bold: true, color: C.ACCENT, fontFace: 'Malgun Gothic' });
    slide.addText('Title Screen: Start Game, Options, Credits\nPause Menu: Resume, Restart, Exit (ESC 또는 일시정지 버튼)\nGame Over: 점수 집계 및 \'Try Again\' 버튼 강조', { x: 1.3, y: 5.7, w: 10, h: 1, ...BODY_STYLE });
}

// ============================================================
// 7. 감사 페이지
// ============================================================
{
    const slide = pptx.addSlide();
    addBgToSlide(slide, C.BLACK);
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.05, fill: { color: C.YELLOW } });
    slide.addText('감사합니다', { x: 1, y: 2.5, w: 11, h: 1.2, fontSize: 44, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic', align: 'center' });
    slide.addText('🐝 또또의 모험 - 기획팀 뽀 드림', { x: 1, y: 4.0, w: 11, h: 0.6, fontSize: 18, color: C.YELLOW, fontFace: 'Malgun Gothic', align: 'center' });
    slide.addText('안티그래비티 게임 개발팀 | 2026', { x: 1, y: 5.5, w: 11, h: 0.5, fontSize: 12, color: 'aaaaaa', fontFace: 'Malgun Gothic', align: 'center' });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.45, w: '100%', h: 0.05, fill: { color: C.ACCENT } });
}

// ============================================================
// 파일 저장
// ============================================================
const outputPath = './또또의모험_종합기획서.pptx';
pptx.writeFile({ fileName: outputPath })
    .then(() => console.log(`\n✅ PPT 생성 완료!\n📁 저장 위치: ${outputPath}`))
    .catch(err => console.error('PPT 생성 실패:', err));
