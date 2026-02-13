/**
 * 안티그래비티 - 전 부서 PPT 일괄 생성기
 * Black & White 모던 프레젠테이션 테마
 * 대표님 선호 양식: 모던, 흑백, 미니멀, 고급스러운 디자인
 */
import pptxgen from 'pptxgenjs';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// ============================================================
// 공통 디자인 시스템 (Black & White Modern Theme)
// ============================================================
const C = {
    BLACK: '111111',
    DARK: '1a1a1a',
    DARK2: '222222',
    DARK3: '2a2a2a',
    MID: '444444',
    GRAY: '888888',
    LIGHT: 'cccccc',
    LIGHTER: 'e0e0e0',
    WHITE: 'ffffff',
    BG_DARK: '0a0a0a',
    ACCENT: 'ffffff',      // 흰색 강조
    LINE: '333333',
};

// 공통 슬라이드 유틸
function setupPptx(title, author, subject) {
    const pptx = new pptxgen();
    pptx.author = author;
    pptx.company = '안티그래비티';
    pptx.subject = subject;
    pptx.title = title;
    pptx.layout = 'LAYOUT_WIDE';
    return pptx;
}

function bg(slide, color = C.BLACK) {
    slide.background = { fill: color };
}

function topLine(slide) {
    slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.02, fill: { color: C.WHITE } });
}

function bottomLine(slide) {
    slide.addShape('rect', { x: 0, y: 7.48, w: '100%', h: 0.02, fill: { color: C.MID } });
}

function pageNum(slide, num, total) {
    slide.addText(`${num} / ${total}`, { x: 11.5, y: 7.1, w: 1.5, h: 0.3, fontSize: 9, color: C.GRAY, fontFace: 'Arial', align: 'right' });
}

function sectionDivider(slide, partNum, partTitle, partSub) {
    bg(slide, C.BG_DARK);
    topLine(slide);
    bottomLine(slide);
    // Part number - 대형
    slide.addText(`Part ${partNum}`, { x: 0.8, y: 0.5, w: 5, h: 0.5, fontSize: 11, color: C.GRAY, fontFace: 'Arial', letterSpacing: 3 });
    // 제목 - 굵은 흰색
    slide.addText(partTitle, { x: 0.8, y: 2.0, w: 11, h: 1.5, fontSize: 40, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
    // 서브 타이틀
    if (partSub) {
        slide.addText(partSub, { x: 0.8, y: 3.8, w: 11, h: 0.6, fontSize: 14, color: C.GRAY, fontFace: 'Malgun Gothic' });
    }
    // 하단 구분선
    slide.addShape('rect', { x: 0.8, y: 3.5, w: 3, h: 0.015, fill: { color: C.MID } });
}

function coverSlide(pptx, title, subtitle, author, date) {
    const slide = pptx.addSlide();
    bg(slide, C.BG_DARK);
    topLine(slide);
    bottomLine(slide);

    // 제목 (중앙 약간 위)
    slide.addText(title, { x: 0.8, y: 2.0, w: 11, h: 1.5, fontSize: 44, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
    // 구분선
    slide.addShape('rect', { x: 0.8, y: 3.6, w: 4, h: 0.015, fill: { color: C.MID } });
    // 부제
    slide.addText(subtitle, { x: 0.8, y: 3.9, w: 11, h: 0.6, fontSize: 16, color: C.GRAY, fontFace: 'Malgun Gothic', italic: true });
    // 작성자 & 날짜
    slide.addText(`${author}  |  안티그래비티  |  ${date}`, { x: 0.8, y: 6.5, w: 11, h: 0.4, fontSize: 11, color: C.MID, fontFace: 'Arial' });
}

function contentSlide(pptx, sectionLabel, title) {
    const slide = pptx.addSlide();
    bg(slide, C.DARK);
    topLine(slide);
    bottomLine(slide);
    // 섹션 라벨
    slide.addText(sectionLabel, { x: 0.8, y: 0.4, w: 5, h: 0.3, fontSize: 10, color: C.GRAY, fontFace: 'Arial', letterSpacing: 2 });
    // 제목
    slide.addText(title, { x: 0.8, y: 0.8, w: 11, h: 0.7, fontSize: 26, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
    // 구분선
    slide.addShape('rect', { x: 0.8, y: 1.45, w: 2.5, h: 0.012, fill: { color: C.MID } });
    return slide;
}

function endSlide(pptx, teamName) {
    const slide = pptx.addSlide();
    bg(slide, C.BG_DARK);
    topLine(slide);
    bottomLine(slide);
    slide.addText('Thank You', { x: 1, y: 2.5, w: 11, h: 1.2, fontSize: 48, bold: true, color: C.WHITE, fontFace: 'Arial', align: 'center' });
    slide.addText(teamName, { x: 1, y: 4.0, w: 11, h: 0.6, fontSize: 16, color: C.GRAY, fontFace: 'Malgun Gothic', align: 'center' });
    slide.addText('안티그래비티 | 2026', { x: 1, y: 5.5, w: 11, h: 0.5, fontSize: 11, color: C.MID, fontFace: 'Arial', align: 'center' });
}

const BODY = { fontSize: 14, color: C.LIGHTER, fontFace: 'Malgun Gothic', lineSpacingMultiple: 1.5 };
const BODY_SM = { fontSize: 12, color: C.LIGHT, fontFace: 'Malgun Gothic', lineSpacingMultiple: 1.4 };

// ============================================================
// 1. 한순이 (아트 디렉터) - 디자인 시안 보고서
// ============================================================
async function generateDesignPPT() {
    const pptx = setupPptx('디자인 시안 보고서', '한순이 (아트 디렉터)', '캐릭터 및 보스 디자인');

    // 표지
    coverSlide(pptx, '디자인 시안 보고서', '캐릭터, 에너미, 보스 디자인 컨셉', '한순이 (아트 디렉터)', '2026.02.11');

    // 목차
    {
        const slide = contentSlide(pptx, 'CONTENTS', '목차');
        const items = [
            ['01', '주인공 일러스트 시안', '또또 캐릭터 최종 디자인'],
            ['02', '일반 적 디자인', '말벌 정찰병 / 춤추는 나비'],
            ['03', '보스 디자인', 'Stage 1 대장 말벌 버즈'],
            ['04', '배경 컨셉', '스테이지별 비주얼 가이드'],
        ];
        items.forEach((item, i) => {
            const y = 1.8 + i * 1.2;
            slide.addText(item[0], { x: 1, y, w: 0.8, h: 0.5, fontSize: 24, bold: true, color: C.WHITE, fontFace: 'Arial' });
            slide.addText(item[1], { x: 2, y, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(item[2], { x: 2, y: y + 0.4, w: 8, h: 0.3, fontSize: 11, color: C.GRAY, fontFace: 'Malgun Gothic' });
            slide.addShape('rect', { x: 2, y: y + 0.85, w: 10, h: 0.005, fill: { color: C.DARK3 } });
        });
    }

    // Part 1 - 주인공
    { const slide = pptx.addSlide(); sectionDivider(slide, '1', '주인공 일러스트 시안', '또또 캐릭터 최종 디자인'); }
    {
        const slide = contentSlide(pptx, 'PART 1', '또또 (주인공)');
        slide.addText('안경을 쓴 귀여운 꿀벌 디자인 확정', { x: 1, y: 1.8, w: 10, h: 0.5, ...BODY, fontSize: 16 });
        slide.addText('애니메이션 키포인트:', { x: 1, y: 2.6, w: 10, h: 0.4, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('• 날개 짓의 떨림과 안경의 반짝임 표현\n• 8방향 비행에 대응하는 자연스러운 기울기\n• 피격 시 깜빡임 + 감정 표현 변화 (평범, 놀람, 분노, 슬픔)', { x: 1.3, y: 3.1, w: 10, h: 1.5, ...BODY });
        // 우측에 이미지 영역 표시
        slide.addShape('rect', { x: 8, y: 1.8, w: 4, h: 4.5, fill: { color: C.DARK3 }, rectRadius: 0.05 });
        slide.addText('ch_player1.png\n(캐릭터 이미지)', { x: 8, y: 3.5, w: 4, h: 1, fontSize: 12, color: C.GRAY, fontFace: 'Malgun Gothic', align: 'center' });
    }

    // Part 2 - 일반 적 (Stage 1)
    { const slide = pptx.addSlide(); sectionDivider(slide, '2', 'Stage 1: 평화로운 시작 - 적군 시안', '총 6종의 곤충-스팀펑크 하이브리드 적군'); }
    {
        const slide = contentSlide(pptx, 'PART 2', 'Stage 1 일반 적군 리스트 (1-3)');
        const enemies = [
            ['1. Scout Wasp (정찰 말벌)', '스팀펑크 고글을 쓴 말벌. 직선 비행하며 하단으로 독침 1발 발사.'],
            ['2. Dancing Butterfly (춤추는 나비)', '화려하고 날카로운 날개. 사인파(Sine) 궤적으로 이동하며 충돌 유도.'],
            ['3. Steam Beetle (증기 딱정벌레)', '등에 증기 파이프가 달린 장갑 벌레. 느리지만 강력한 3방향 확산탄 발사.'],
        ];
        enemies.forEach((en, i) => {
            const y = 1.7 + i * 1.5;
            slide.addText(en[0], { x: 1, y, w: 4, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(en[1], { x: 1.3, y: y + 0.45, w: 8, h: 0.8, ...BODY_SM });
        });
    }
    {
        const slide = contentSlide(pptx, 'PART 2', 'Stage 1 일반 적군 리스트 (4-6)');
        const enemies = [
            ['4. Leaf Hopper (잎새 메뚜기)', '보호색을 띤 메뚜기. 화면 아래에서 위로 급격히 도약하여 기습.'],
            ['5. Pollen Bomber (꽃가루 폭탄벌)', '동그란 배에 꽃가루 폭탄 장착. 파괴 시 8방향으로 파편 탄환 비산.'],
            ['6. Drill Dragonfly (드릴 잠자리)', '가늘고 긴 엔진 몸체. 조준 후 순식간에 직선으로 돌진하는 고속기.'],
        ];
        enemies.forEach((en, i) => {
            const y = 1.7 + i * 1.5;
            slide.addText(en[0], { x: 1, y, w: 4, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(en[1], { x: 1.3, y: y + 0.45, w: 8, h: 0.8, ...BODY_SM });
        });
    }

    // Part 2 - 일반 적 (Stage 2)
    { const slide = pptx.addSlide(); sectionDivider(slide, '2', 'Stage 2: 안개 낀 풀숲 - 적군 시안', '야간 및 잠입 컨셉의 적군 6종'); }
    {
        const slide = contentSlide(pptx, 'PART 2', 'Stage 2 주요 적군 구성');
        const enemies = [
            ['1. Glow Moth (발광 나방)', '안갯속에서 빛나는 탄환 사격. 탄환 주변 시야 확보 기믹.'],
            ['2. Shadow Spider (그림자 거미)', '천장에서 하강. 끈적한 거미줄을 쏴서 플레이어 이동 범위 제한.'],
            ['3. Night Bat (밤의 박쥐)', '스팀펑크 음파 탐지기 장착. 링 형태의 음파로 플레이어 둔화.'],
            ['4. Silent Mosquito (침묵의 모기)', '매우 작고 빠른 기체. 지그재그로 이동하며 탄막 사이를 파고듦.'],
            ['5. Bio-Snail (발광 달팽이)', '배닥에 데미지를 입히는 빛나는 점막 생성.'],
            ['6. Neon Firefly (네온 반딧불이)', '5마리가 편대를 이뤄 V자 형태로 합동 공격.'],
        ];
        slide.addTable(enemies, { x: 0.8, y: 1.7, w: 11.5, h: 4.5, fontSize: 11, fontFace: 'Malgun Gothic', color: C.LIGHTER, border: { color: C.MID }, fill: { color: C.DARK2 } });
    }

    // Part 3 - 보스 (Full Roadmap)
    { const slide = pptx.addSlide(); sectionDivider(slide, '3', '보스 디자인: 1~10 스테이지 풀 로드맵', '텐가이 모티베이션: 매 스테이지 고유 보스전'); }
    {
        const slide = contentSlide(pptx, 'PART 3', '스테이지별 보스 리스트 (Stage 1-5)');
        const bosses = [
            ['STG 1: General Buzz', '말벌 장군. 개틀링 사격 및 돌진. (Armor Break 탑재)'],
            ['STG 2: Queen Arachne', '거미 여왕. 거미줄 트랩 및 독액 투척.'],
            ['STG 3: Metal Orochi', '금속 오로치. 다절체 뱀 로봇. 부위 파괴 패턴.'],
            ['STG 4: Storm Falcon', '폭풍 송골매. 고속 비행 및 깃털 탄막.'],
            ['STG 5: Phantom Moth', '환영 나방. 분신술 및 조작 반전 기믹.'],
        ];
        slide.addTable(bosses, { x: 0.8, y: 1.7, w: 11.5, h: 4, fontSize: 11, fontFace: 'Malgun Gothic', color: C.LIGHTER, border: { color: C.MID }, fill: { color: C.DARK2 } });
    }
    {
        const slide = contentSlide(pptx, 'PART 3', '스테이지별 보스 리스트 (Stage 6-10)');
        const bosses = [
            ['STG 6: Flame Salamander', '화염 살라만더. 지면 화염 방사 및 꼬리 전력 타격.'],
            ['STG 7: Junk Amalgam', '고철 합체 괴수. 고철 흡수 거대화 기믹.'],
            ['STG 8: Toxic Chimera', '독가스 키메라. 산성 용액 및 가스 구름 생성.'],
            ['STG 9: Sky Fortress Core', '하늘의 요새 코어. 전함 기믹, 유도 미사일 난사.'],
            ['STG 10: Emperor V', '황제 V (최종 보스). 3단계 변신 및 얼티밋 탄막.'],
        ];
        slide.addTable(bosses, { x: 0.8, y: 1.7, w: 11.5, h: 4, fontSize: 11, fontFace: 'Malgun Gothic', color: C.LIGHTER, border: { color: C.MID }, fill: { color: C.DARK2 } });
    }

    // Part 4 - 배경
    { const slide = pptx.addSlide(); sectionDivider(slide, '4', '배경 컨셉 및 스테이지 대화', '5중 패럴랙스 배경과 내러티브 시스템'); }
    {
        const slide = contentSlide(pptx, 'PART 4', '시각적 스타일 가이드');
        slide.addText('• Stage 1: 따뜻한 햇살, 숲 속 꽃밭 (Green/Yellow/Blue)\n• Stage 2: 몽환적인 밤의 숲 (Deep Blue/Purple/Cyan)\n• Stage 10: 황금빛 기계 공장 (Gold/Black/Red)', { x: 1, y: 1.8, w: 10, h: 2, ...BODY });
    }

    endSlide(pptx, '한순이 (아트 디렉터) — 디자인팀');
    await pptx.writeFile({ fileName: '디자인/디자인_시안_보고서.pptx' });
    console.log('✅ 한순이 - 디자인 시안 보고서.pptx 완료');
}

// ============================================================
// 2. 또또 (AI개발 매니저) - 개발 계획서
// ============================================================
async function generateDevPPT() {
    const pptx = setupPptx('개발 계획서', '또또 (AI개발 매니저)', '개발 로드맵 및 기술 노트');

    coverSlide(pptx, '개발 계획서', '프로젝트 개요, 로드맵, 기술 노트', '또또 (AI개발 매니저)', '2026.02.11');

    // 목차
    {
        const slide = contentSlide(pptx, 'CONTENTS', '목차');
        const items = [
            ['01', '프로젝트 개요', '장르, 개발 환경, 핵심 목표'],
            ['02', '개발 로드맵', 'Phase 1~3 단계별 계획'],
            ['03', '개발 노트', '이슈 트래킹 및 진행 상황'],
        ];
        items.forEach((item, i) => {
            const y = 1.8 + i * 1.4;
            slide.addText(item[0], { x: 1, y, w: 0.8, h: 0.5, fontSize: 24, bold: true, color: C.WHITE, fontFace: 'Arial' });
            slide.addText(item[1], { x: 2, y, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(item[2], { x: 2, y: y + 0.4, w: 8, h: 0.3, fontSize: 11, color: C.GRAY, fontFace: 'Malgun Gothic' });
            slide.addShape('rect', { x: 2, y: y + 0.85, w: 10, h: 0.005, fill: { color: C.DARK3 } });
        });
    }

    // 프로젝트 개요
    { const slide = pptx.addSlide(); sectionDivider(slide, '1', '프로젝트 개요', ''); }
    {
        const slide = contentSlide(pptx, 'PART 1', '프로젝트 개요');
        const tableRows = [
            [{ text: '항목', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '내용', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } }],
            [{ text: '프로젝트명', options: { color: C.WHITE } }, { text: '또또의 모험 (The Adventure of Toto)', options: { color: C.LIGHTER } }],
            [{ text: '장르', options: { color: C.WHITE } }, { text: '횡스크롤 픽셀 액션 슈팅 (웹 기반)', options: { color: C.LIGHTER } }],
            [{ text: '개발 환경', options: { color: C.WHITE } }, { text: 'HTML5 Canvas, Vanilla JavaScript', options: { color: C.LIGHTER } }],
            [{ text: '핵심 목표', options: { color: C.WHITE } }, { text: '고퀄리티 아트와 정교한 탄막 액션을 웹 브라우저 60fps로 구현', options: { color: C.LIGHTER } }],
        ];
        slide.addTable(tableRows, {
            x: 1, y: 1.7, w: 11, h: 3,
            fontSize: 13, fontFace: 'Malgun Gothic',
            border: { pt: 0.5, color: C.MID },
            colW: [2.5, 8.5],
            fill: { color: C.DARK2 },
        });
    }

    // 로드맵
    { const slide = pptx.addSlide(); sectionDivider(slide, '2', '개발 로드맵', 'Phase 1 ~ 3'); }
    {
        const slide = contentSlide(pptx, 'PART 2', '개발 로드맵');
        const phases = [
            { title: 'Phase 1: 코어 엔진 구축 (현재)', items: '• Canvas 기반 렌더링 엔진 최적화\n• 8방향 관성 비행 물리 로직\n• 픽셀 퍼펙트 히트박스 충돌 시스템' },
            { title: 'Phase 2: 콘텐츠 시스템 (예정)', items: '• 스테이지별 동적 리소스 로딩 (10스테이지)\n• 적 AI 및 탄막 패턴 알고리즘\n• 보스전 상태 머신(FSM) 설계' },
            { title: 'Phase 3: 폴리싱 및 배포', items: '• 크로스 브라우징 테스트\n• 모바일 최적화 및 터치 컨트롤' },
        ];
        phases.forEach((p, i) => {
            const y = 1.7 + i * 1.8;
            slide.addText(p.title, { x: 1, y, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(p.items, { x: 1.3, y: y + 0.45, w: 10, h: 1.2, ...BODY_SM });
        });
    }

    // 개발 노트
    { const slide = pptx.addSlide(); sectionDivider(slide, '3', '개발 노트', '2026-02-10'); }
    {
        const slide = contentSlide(pptx, 'PART 3', '개발 노트 (2026-02-10)');
        slide.addText('이슈', { x: 1, y: 1.7, w: 2, h: 0.4, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('웹 브라우저의 가비지 컬렉터로 인한 프레임 드랍 우려', { x: 3, y: 1.7, w: 8, h: 0.4, ...BODY_SM });
        slide.addText('해결', { x: 1, y: 2.5, w: 2, h: 0.4, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('오브젝트 풀링(Object Pooling) 기술 적용 → 메모리 할당 최소화', { x: 3, y: 2.5, w: 8, h: 0.4, ...BODY_SM });
        slide.addText('진행 상황', { x: 1, y: 3.3, w: 2, h: 0.4, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('• 기본 캔버스 레이아웃 설정 완료\n• game/ 폴더 내 index.html, style.css, game.js 기본 구조 구축\n• 8방향 관성 이동 시스템 프로토타입 구현', { x: 3, y: 3.3, w: 8, h: 1.5, ...BODY_SM });
    }

    endSlide(pptx, '또또 (AI개발 매니저) — 개발팀');
    await pptx.writeFile({ fileName: '개발/개발계획서.pptx' });
    console.log('✅ 또또 - 개발 계획서.pptx 완료');
}

// ============================================================
// 3. 사운드팀 - 사운드 리소스 명세서
// ============================================================
async function generateSoundPPT() {
    const pptx = setupPptx('사운드 리소스 명세서', '개발지원팀', '사운드 컨셉 및 기술 가이드');

    coverSlide(pptx, '사운드 리소스\n명세서', '사운드 컨셉, BGM, SFX, 기술 가이드', '개발지원팀 (사운드)', '2026.02.11');

    // 컨셉
    { const slide = pptx.addSlide(); sectionDivider(slide, '1', '사운드 컨셉 개요', '하이브리드 픽셀 사운드'); }
    {
        const slide = contentSlide(pptx, 'PART 1', '사운드 컨셉');
        slide.addText('장르: 뉴트로 픽셀 슈팅', { x: 1, y: 1.7, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('8비트 레트로 감성 + 현대적 오케스트레이션이 결합된\n\'하이브리드 픽셀 사운드\'\n\n꿀벌 또또의 경쾌함 ↔ 기계 제국의 묵직한 기계음 대조', { x: 1.3, y: 2.2, w: 10, h: 2, ...BODY });
        slide.addText('최적화 전략', { x: 1, y: 4.5, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('• Web Audio API 활용 오디오 스프라이트\n• .webp / .ogg (96kbps) 포맷 경량화', { x: 1.3, y: 5.0, w: 10, h: 1, ...BODY });
    }

    // BGM
    { const slide = pptx.addSlide(); sectionDivider(slide, '2', 'BGM 리스트', '스테이지별 배경 음악'); }
    {
        const slide = contentSlide(pptx, 'PART 2', '배경음악 (BGM)');
        const tableRows = [
            [{ text: '스테이지', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '테마', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '감정', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '사운드 특징', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } }],
            [{ text: 'Stage 1', options: { color: C.WHITE } }, { text: '평화로운 꽃밭', options: { color: C.LIGHTER } }, { text: '희망적, 경쾌', options: { color: C.LIGHTER } }, { text: '하이햇 비트, 밝은 신스', options: { color: C.LIGHTER } }],
            [{ text: 'Stage 3', options: { color: C.WHITE } }, { text: '은빛 폭포', options: { color: C.LIGHTER } }, { text: '웅장, 시원', options: { color: C.LIGHTER } }, { text: '물소리 환경음, 리버브', options: { color: C.LIGHTER } }],
            [{ text: 'Stage 6', options: { color: C.WHITE } }, { text: '불타는 고향', options: { color: C.LIGHTER } }, { text: '긴박, 비극', options: { color: C.LIGHTER } }, { text: '스트링 앙상블, 디스토션', options: { color: C.LIGHTER } }],
            [{ text: 'Stage 10', options: { color: C.WHITE } }, { text: '황금의 심판', options: { color: C.LIGHTER } }, { text: '비장, 절정', options: { color: C.LIGHTER } }, { text: '풀 오케스트라 + 8비트', options: { color: C.LIGHTER } }],
        ];
        slide.addTable(tableRows, {
            x: 0.8, y: 1.7, w: 11.5, h: 3.5,
            fontSize: 12, fontFace: 'Malgun Gothic',
            border: { pt: 0.5, color: C.MID },
            colW: [1.5, 2.5, 2, 5.5],
            fill: { color: C.DARK2 },
        });
    }

    // SFX
    { const slide = pptx.addSlide(); sectionDivider(slide, '3', '효과음 (SFX)', '우선순위 기반 설계'); }
    {
        const slide = contentSlide(pptx, 'PART 3', '효과음 (SFX) 설계');
        const tableRows = [
            [{ text: 'SFX 명칭', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '발생 조건', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '사운드 특징', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } },
            { text: '우선순위', options: { bold: true, color: C.BLACK, fill: { color: C.WHITE } } }],
            [{ text: 'Stinger Shot', options: { color: C.WHITE } }, { text: '플레이어 발사', options: { color: C.LIGHTER } }, { text: "'푝!' 경쾌한 고주파음", options: { color: C.LIGHTER } }, { text: 'High', options: { color: C.LIGHTER } }],
            [{ text: 'Enemy Explode', options: { color: C.WHITE } }, { text: '적 파괴', options: { color: C.LIGHTER } }, { text: "'콰쾅!' 묵직한 저음역", options: { color: C.LIGHTER } }, { text: 'High', options: { color: C.LIGHTER } }],
            [{ text: 'Hit Damage', options: { color: C.WHITE } }, { text: '플레이어 피격', options: { color: C.LIGHTER } }, { text: "'윽!' 짧은 둔탁 노이즈", options: { color: C.LIGHTER } }, { text: 'Very High', options: { color: C.LIGHTER } }],
            [{ text: 'Collect Item', options: { color: C.WHITE } }, { text: '아이템 획득', options: { color: C.LIGHTER } }, { text: "'띠링!' 맑은 상향식", options: { color: C.LIGHTER } }, { text: 'Medium', options: { color: C.LIGHTER } }],
            [{ text: 'Bee Wing', options: { color: C.WHITE } }, { text: '플레이어 이동', options: { color: C.LIGHTER } }, { text: "'위잉-' 미세한 고주파 루프", options: { color: C.LIGHTER } }, { text: 'Low', options: { color: C.LIGHTER } }],
        ];
        slide.addTable(tableRows, {
            x: 0.5, y: 1.7, w: 12, h: 4,
            fontSize: 11, fontFace: 'Malgun Gothic',
            border: { pt: 0.5, color: C.MID },
            colW: [2, 2, 5, 3],
            fill: { color: C.DARK2 },
        });
    }

    // 기술 가이드
    {
        const slide = contentSlide(pptx, 'PART 4', '기술적 가이드라인');
        const items = [
            ['Audio Sprite', '모든 SFX를 하나의 파일에 합쳐 로딩 횟수 단축 (0.1s 간격 배치)'],
            ['Dynamic Pitch', '탄환 발사 시 피치를 ±5% 랜덤화 → 청각적 피로도 감소'],
            ['Occlusion', '기계 스테이지에서 저역 통과 필터(LPF) → 공간감 부여'],
        ];
        items.forEach((item, i) => {
            const y = 1.7 + i * 1.5;
            slide.addText(item[0], { x: 1, y, w: 3, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(item[1], { x: 1.3, y: y + 0.45, w: 10, h: 0.6, ...BODY_SM });
        });
    }

    endSlide(pptx, '개발지원팀 (사운드)');
    await pptx.writeFile({ fileName: '개발지원/사운드_리소스_명세서.pptx' });
    console.log('✅ 사운드팀 - 사운드 리소스 명세서.pptx 완료');
}

// ============================================================
// 4. 피터 (사업PM) - 텐가이 시스템 분석 리서치
// ============================================================
async function generateResearchPPT() {
    const pptx = setupPptx('텐가이 시스템 분석', '피터 (총괄 사업PM)', '게임 디자인 심층 분석 리서치');

    coverSlide(pptx, '텐가이 시스템\n분석 리서치', '또또의 모험 설계를 위한 핵심 메커니즘 분석', '피터 (총괄 사업PM)', '2026.02.11');

    // Part 1 - 전투 시스템
    { const slide = pptx.addSlide(); sectionDivider(slide, '1', '전투 및 판정 시스템', 'Combat & Hitbox'); }
    {
        const slide = contentSlide(pptx, 'PART 1', '이원화된 피격 판정');
        const items = [
            ['탄환 피격', '즉시 생명력(라이프) 상실'],
            ['기체 충돌', '기절(Stun) + 파워업 1단계 하락 (웹 유저 친화적)'],
            ['피탄 판정', '캐릭터 중심부의 아주 작은 영역 → \'아슬아슬한 재미\' 극대화'],
        ];
        items.forEach((item, i) => {
            const y = 1.7 + i * 1.5;
            slide.addText(item[0], { x: 1, y, w: 2.5, h: 0.4, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(item[1], { x: 3.8, y, w: 8, h: 0.4, ...BODY_SM });
        });
    }
    {
        const slide = contentSlide(pptx, 'PART 1', '액션 레이어 구조');
        const layers = [
            ['1', '기본 샷', '4단계 파워업'],
            ['2', '보조 샷/옵션', '소환물 독자 궤적 공격'],
            ['3', '차지 공격', '근거리 참격, 소환물 돌진 등 다양'],
            ['4', '폭탄', '무적 시간 + 화면 전체 제어'],
        ];
        layers.forEach((l, i) => {
            const y = 1.7 + i * 1.2;
            slide.addText(l[0], { x: 1, y, w: 0.5, h: 0.5, fontSize: 22, bold: true, color: C.WHITE, fontFace: 'Arial' });
            slide.addText(l[1], { x: 1.8, y, w: 3, h: 0.4, fontSize: 14, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
            slide.addText(l[2], { x: 5, y, w: 7, h: 0.4, ...BODY_SM });
        });
    }

    // Part 2 - 레벨 디자인
    { const slide = pptx.addSlide(); sectionDivider(slide, '2', '레벨 디자인', 'Stage & Level Design'); }
    {
        const slide = contentSlide(pptx, 'PART 2', '동적 난이도 & 분기');
        slide.addText('동적 난이도', { x: 1, y: 1.7, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('• 첫 3개 스테이지: 4개 후보 중 무작위 순서로 등장\n• 동일 스테이지라도 순서에 따라 배경 시간대/적 밀도 변화\n• 루프(Loop) 시스템: 1회차 클리어 후 2주차 난이도 급상승', { x: 1.3, y: 2.2, w: 10, h: 1.5, ...BODY });
        slide.addText('서사적 분기 시스템', { x: 1, y: 4.0, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('• 5스테이지 선택지: 정면 돌파(기계) vs 비밀 통로(요괴)\n• 엔딩 및 획득 보상과 직결', { x: 1.3, y: 4.5, w: 10, h: 1, ...BODY });
    }

    // Part 3 - 스코어링
    { const slide = pptx.addSlide(); sectionDivider(slide, '3', '스코어링 시스템', 'Scoring & Economy'); }
    {
        const slide = contentSlide(pptx, 'PART 3', '스코어링 메커니즘');
        slide.addText('코인 로테이션 보너스', { x: 1, y: 1.7, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('코인 정면(넓은 면) 획득 = 2,000점 / 그 외 = 200~1,000점\n→ 탄막 회피 + 코인 타이밍 계산의 고급 플레이 유도', { x: 1.3, y: 2.2, w: 10, h: 1, ...BODY });
        slide.addText('리소스 비축 보너스', { x: 1, y: 3.5, w: 10, h: 0.4, fontSize: 16, bold: true, color: C.WHITE, fontFace: 'Malgun Gothic' });
        slide.addText('폭탄 게이지 만충 상태에서 폭탄 아이템 획득 = 10,000점\n→ \'사용 vs 비축\' 전략적 선택 강요', { x: 1.3, y: 4.0, w: 10, h: 1, ...BODY });
    }

    // PART 4 - 피터의 피드백 (New)
    { const slide = pptx.addSlide(); sectionDivider(slide, '4', '사업/전략팀 피드백', '기획팀 및 디자인팀 공통 피드백'); }
    {
        const slide = contentSlide(pptx, 'FEEDBACK', '텐가이 모티베이션 비교 분석');
        const feedback = [
            ['보스 배치', '텐가이는 전 스테이지 보스전이 핵심. 우리 게임도 1~10 스테이지 전체 보스 배치 확정 (우수)'],
            ['변신 연출', '보스 외갑 파괴(Armor Break) 메커니즘 반영 확인. 텐가이의 긴장감 재현 가능성 높음.'],
            ['분기 시스템', '현재 3개 스테이지 무작위 등장 외에, 특정 스테이지에서의 루트 분기(Branch) 기획 보강 권고.'],
        ];
        slide.addTable(feedback, { x: 0.8, y: 1.7, w: 11.5, h: 4, fontSize: 11, fontFace: 'Malgun Gothic', color: C.LIGHTER, border: { color: C.MID }, fill: { color: C.DARK2 } });
    }

    endSlide(pptx, '피터 (총괄 사업PM) — 사업팀');

    if (!existsSync('사업/리서치')) mkdirSync('사업/리서치', { recursive: true });
    await pptx.writeFile({ fileName: '사업/리서치/텐가이_시스템_분석.pptx' });
    console.log('✅ 피터 - 텐가이 시스템 분석.pptx 완료');
}

// ============================================================
// 5. 기획팀장 보 (Bo) - 종합 기획 보고서 V3
// ============================================================
async function generatePlanningPPT() {
    const pptx = setupPptx('종합 기획 보고서', '기획팀장 보 (Bo)', '전 스테이지 보스 통합 기획안');

    coverSlide(pptx, '종합 기획 보고서\n[전 스테이지 보스]', '텐가이 스타일의 보스 중심 레벨 디자인', '기획팀장 보 (Bo)', '2026.02.11');

    { const slide = pptx.addSlide(); sectionDivider(slide, '1', '스테이지별 보스 기획안', '1~10 스테이지 고유 보스 메커니즘'); }
    {
        const slide = contentSlide(pptx, 'PART 1', '보스 기획 포인트');
        slide.addText('• 전 스테이지 보스 배치: 텐가이의 아케이드 감성 극대화\n• Phase 시스템: 모든 보스에 최소 2단계 이상의 페이즈 전환 적용\n• 보스 보상: 보스 격파 시 대량의 코인 및 특수 파워템 드랍', { x: 1.3, y: 1.7, w: 10, h: 3, ...BODY });
    }

    endSlide(pptx, '기획팀장 보 (Bo) — 기획팀');
    if (!existsSync('기획')) mkdirSync('기획', { recursive: true });
    await pptx.writeFile({ fileName: '기획/또또의모험_종합기획서_V3.pptx' });
    console.log('✅ 보 - 종합 기획 보고서 V3.pptx 완료');
}

// ============================================================
// 실행
// ============================================================
async function main() {
    console.log('📊 안티그래비티 전 부서 PPT 일괄 생성 시작...\n');
    console.log('🎨 테마: Black & White Modern\n');

    await generateDesignPPT();
    await generateDevPPT();
    await generateSoundPPT();
    await generateResearchPPT();
    await generatePlanningPPT();

    console.log('\n🎉 전 부서 PPT 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 디자인/디자인_시안_보고서.pptx  (한순이)');
    console.log('📁 개발/개발계획서.pptx            (또또)');
    console.log('📁 개발지원/사운드_리소스_명세서.pptx (사운드팀)');
    console.log('📁 사업/리서치/텐가이_시스템_분석.pptx (피터)');
    console.log('📁 기획/또또의모험_종합기획서_V3.pptx (뽀)');
}

main();
