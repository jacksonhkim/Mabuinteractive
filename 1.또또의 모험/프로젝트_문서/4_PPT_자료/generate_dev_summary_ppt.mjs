/**
 * 피터(전략 및 품질 관리)의 개발 현황 종합 보고 PPT 생성기
 */
import pptxgen from 'pptxgenjs';

const pptx = new pptxgen();

// 프레젠테이션 기본 설정
pptx.author = '피터 (전략/QA 매니저)';
pptx.company = 'Mabu Interactive';
pptx.subject = '또또의 모험 - 개발 현황 보고';
pptx.title = '또또의 모험 개발 현황 종합 보고서';
pptx.layout = 'LAYOUT_WIDE';

// 색상 팔레트 (Mabu Interactive CI 기반)
const C = {
    BLACK: '0D1117',
    DARK_BLUE: '0A192F',
    CYAN: '64FFDA',
    GOLD: 'FFD700',
    WHITE: 'F8F9FA',
    ACCENT: 'E94560',
    GRAY: '8892B0'
};

const TITLE_STYLE = { fontSize: 36, bold: true, color: C.CYAN, fontFace: 'Malgun Gothic' };
const CONTENT_STYLE = { fontSize: 16, color: C.WHITE, fontFace: 'Malgun Gothic', lineSpacingMultiple: 1.5 };
const SUB_STYLE = { fontSize: 13, color: C.GRAY, fontFace: 'Malgun Gothic' };

function addSlideHeader(slide, title) {
    slide.background = { fill: C.DARK_BLUE };
    slide.addText(title, { x: 0.5, y: 0.4, w: 12, h: 0.8, ...TITLE_STYLE });
    slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.1, w: 1, h: 0.05, fill: { color: C.GOLD } });
}

// 1. 표지
{
    const slide = pptx.addSlide();
    slide.background = { fill: C.BLACK };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: C.CYAN } });

    slide.addText('🐝 또또의 모험', { x: 0, y: 2.5, w: '100%', h: 1, fontSize: 54, bold: true, color: C.GOLD, align: 'center', fontFace: 'Malgun Gothic' });
    slide.addText('주간 개발 현황 및 QA 전수 점검 보고', { x: 0, y: 3.6, w: '100%', h: 0.6, fontSize: 24, color: C.WHITE, align: 'center', fontFace: 'Malgun Gothic' });

    slide.addText('2026. 02. 12', { x: 0, y: 5.5, w: '100%', h: 0.5, fontSize: 14, color: C.GRAY, align: 'center', fontFace: 'Malgun Gothic' });
    slide.addText('MABU INTERACTIVE - 피터 (Peter)', { x: 0, y: 6.0, w: '100%', h: 0.5, fontSize: 16, color: C.CYAN, align: 'center', fontFace: 'Malgun Gothic', bold: true });
}

// 2. 개발 완료 내역 (Dev)
{
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🛠️ 개발팀 (또또) 주요 성과');

    const achievements = [
        ['보스 스폰 시스템 최적화', 'bossSpawnedInStage 플래그 도입으로 중복 스폰 원천 차단'],
        ['스테이지 전환 로직 정교화', '보스 처치 후 3초 간의 클리어 연출 및 자동 다음 스테이지 로드'],
        ['적 스폰 위치 버그 해결', '화면 밖 자연스러운 진입을 위한 X좌표 보정 및 상하 여백 확보'],
        ['폭탄 아이템 프리징 해결', '오디오 컨텍스트 호환성 패치 및 사운드 트리거 로직 개선']
    ];

    achievements.forEach((item, i) => {
        const y = 1.8 + i * 1.2;
        slide.addText(`✔ ${item[0]}`, { x: 0.8, y, w: 5, h: 0.5, fontSize: 20, bold: true, color: C.GOLD, fontFace: 'Malgun Gothic' });
        slide.addText(`- ${item[1]}`, { x: 1.2, y: y + 0.5, w: 11, h: 0.4, ...CONTENT_STYLE });
    });
}

// 3. 디자인 & 비주얼 (Hansooni)
{
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🎨 디자인팀 (한순이) 비주얼 고도화');

    const items = [
        ['아이템 가독성 대폭 강화', '히트박스 30% 확대 (40px) 및 상징 문자 가독성 향상'],
        ['아이템 특수 효과 추가', '반짝이는 오로라(Aura) 연출로 습득 욕구 자극'],
        ['스테이지 클리어 UI', '건버드 스타일의 역동적 그라데이션 및 오버레이 적용'],
        ['캐릭터 피드백 반영', '또또 캐릭터의 100% 픽셀 퍼펙트 정합성 확보 진행']
    ];

    items.forEach((item, i) => {
        const y = 1.8 + i * 1.2;
        slide.addText(`✨ ${item[0]}`, { x: 0.8, y, w: 6, h: 0.5, fontSize: 20, bold: true, color: C.CYAN, fontFace: 'Malgun Gothic' });
        slide.addText(`- ${item[1]}`, { x: 1.2, y: y + 0.5, w: 11, h: 0.4, ...CONTENT_STYLE });
    });
}

// 4. QA 및 통합 피드백 (Peter)
{
    const slide = pptx.addSlide();
    addSlideHeader(slide, '📋 통합 QA 및 전략 피드백');

    slide.addText('사전 점검 결과: 모든 크리티컬 버그(프리징, 무한 스폰) 해결 승인', { x: 0.8, y: 1.8, w: 11, h: 0.6, fontSize: 18, color: C.GOLD, bold: true, fontFace: 'Malgun Gothic' });

    const feedbacks = [
        ['피터', '디자인 완성도 최상급. 스테이지 3 이후 BGM 템포 상향 및 배경 계조 변화 제안'],
        ['보 (기획)', '스테이지 전환 로직 합격. 차기 버전에서 \'분기점\' 시스템 기획 예정'],
        ['사운드', '폭발 및 획득음 딜레이 제거 완료. 타격감 대폭 향상 확인'],
        ['QA 실무', '플레이어 무적 시간 깜빡임 이펙트 선명도 강화 권고 (다음 스프린트)']
    ];

    feedbacks.forEach((item, i) => {
        const y = 2.8 + i * 1.0;
        slide.addText(`${item[0]}:`, { x: 1.0, y, w: 1.5, h: 0.4, fontSize: 16, bold: true, color: C.CYAN, fontFace: 'Malgun Gothic' });
        slide.addText(`"${item[1]}"`, { x: 2.2, y, w: 10, h: 0.4, ...CONTENT_STYLE, italic: true });
    });
}

// 5. 향후 로드맵
{
    const slide = pptx.addSlide();
    addSlideHeader(slide, '🚀 향후 프로젝트 로드맵');

    const roadmap = [
        { task: '스테이지 4~10 확장', desc: '고유 보스 패턴 및 테마 배경 제작' },
        { task: '슬랙 스코어보드 연동', desc: '실시간 랭킹 시스템 구축 및 채널 알림' },
        { task: '로컬 협동 모드 R&D', desc: '2인 플레이 동기화 및 밸런싱' },
        { task: '모바일 컨트롤 최적화', desc: '가상 패드 조작감 정밀 튜닝' }
    ];

    roadmap.forEach((item, i) => {
        const y = 1.8 + i * 1.2;
        slide.addText(`Phase ${i + 1}: ${item.task}`, { x: 0.8, y, w: 6, h: 0.5, fontSize: 20, bold: true, color: C.GOLD, fontFace: 'Malgun Gothic' });
        slide.addText(`- ${item.desc}`, { x: 1.2, y: y + 0.5, w: 11, h: 0.4, ...CONTENT_STYLE });
    });
}

// 6. 엔딩
{
    const slide = pptx.addSlide();
    slide.background = { fill: C.BLACK };
    slide.addText('우리는 재미의 끝을 봅니다.', { x: 0, y: 3.0, w: '100%', h: 1, fontSize: 32, italic: true, color: C.CYAN, align: 'center', fontFace: 'Malgun Gothic' });
    slide.addText('MABU INTERACTIVE', { x: 0, y: 4.2, w: '100%', h: 1, fontSize: 44, bold: true, color: C.GOLD, align: 'center', fontFace: 'Malgun Gothic' });
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 7.3, w: '100%', h: 0.15, fill: { color: C.CYAN } });
}

const outputPath = 'c:/Users/JACKSON/Desktop/앱 개발/안티그래비티 테스크/1.또또의 모험/프로젝트_문서/4_PPT_자료/개발현황_종합보고서_피터.pptx';
pptx.writeFile({ fileName: outputPath })
    .then(() => console.log(`\n✅ PPT 생성 완료!\n📁 저장 위치: ${outputPath}`))
    .catch(err => console.error('PPT 생성 실패:', err));
