/**
 * 또또의 모험 - 개발 현황 보고 PPT 생성 스크립트
 * Role: 문서 제작 전문가 (Documentation Architect)
 * Design: Sophisticated Minimal (Mabu V4 CI)
 */
import pptxgen from 'pptxgenjs';
import { mkdirSync, existsSync } from 'fs';

// ============================================================
// 설정
// ============================================================
const ROOT_DIR = 'C:/Users/JACKSON/Desktop/앱 개발/안티그래비티 테스크/1.또또의 모험/사업';
const COMPANY_NAME = '마부 인터랙티브 (Mabu Interactive)';
const PROJECT_NAME = '또또의 모험 (The Adventure of Toto)';
const REPORT_TITLE = '개발 및 사업 현황 보고';
const AUTHOR = '문서 마스터 (Documentation Architect)';
const DATE = '2026-02-11';
const COPYRIGHT = '© 2026 Mabu Interactive. All rights reserved.';

// ============================================================
// V4 컬러 시스템 (Deep Neo)
// ============================================================
const C = {
    WHITE: 'ffffff',
    BG: 'ffffff',
    BG_SEC: 'f7f9fc',
    TEXT_MAIN: '2d3436',
    TEXT_SUB: '636e72',
    TEXT_LIGHT: 'b2bec3',
    CORAL: 'ff5e5e',
    PEACH: 'ffa568',
    MINT: '00bfa5',
    LINE: 'dfe6e9',
};

const FONT_MAIN = 'Malgun Gothic';
const FONT_EN = 'Arial';

// ============================================================
// 공통 유틸
// ============================================================
function mkPptx(title) {
    const p = new pptxgen();
    p.author = AUTHOR; p.company = COMPANY_NAME; p.title = title;
    p.layout = 'LAYOUT_WIDE';
    return p;
}

function slideBg(slide, color = C.WHITE) {
    slide.background = { fill: color };
}

function headerLine(slide) {
    slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.02, fill: { type: 'gradient', color: [C.CORAL, C.PEACH, C.MINT] } });
}

function footerInfo(slide) {
    slide.addText(COPYRIGHT, { x: 0.5, y: 7.3, w: 12, h: 0.2, fontSize: 8, color: C.TEXT_LIGHT, fontFace: FONT_EN });
}

function cover(pptx) {
    const s = pptx.addSlide();
    slideBg(s, C.WHITE);
    s.addText(PROJECT_NAME, { x: 0.5, y: 2.0, w: 12.33, h: 1, fontSize: 24, bold: true, color: C.MINT, fontFace: FONT_MAIN, align: 'center', letterSpacing: 5 });
    s.addText(REPORT_TITLE, { x: 0.5, y: 2.8, w: 12.33, h: 1.5, fontSize: 54, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN, align: 'center' });
    s.addShape('rect', { x: 5.66, y: 4.5, w: 2, h: 0.05, fill: { type: 'gradient', color: [C.CORAL, C.MINT] } });
    s.addText(`${AUTHOR}  |  ${DATE}`, { x: 0.5, y: 6.8, w: 12.33, h: 0.4, fontSize: 10, color: C.TEXT_LIGHT, fontFace: FONT_EN, align: 'center', letterSpacing: 2 });
}

function contentPage(pptx, section, title) {
    const s = pptx.addSlide();
    slideBg(s, C.WHITE);
    headerLine(s);
    s.addText(section, { x: 0.8, y: 0.5, w: 5, h: 0.25, fontSize: 9, color: C.MINT, fontFace: FONT_EN, letterSpacing: 3, bold: true });
    s.addText(title, { x: 0.8, y: 0.8, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
    footerInfo(s);
    return s;
}

const B = { fontSize: 14, color: C.TEXT_MAIN, fontFace: FONT_MAIN, lineSpacingMultiple: 1.6 };

// ============================================================
// 메인 실행
// ============================================================
async function run() {
    const p = mkPptx(REPORT_TITLE);

    // 1. 커버
    cover(p);

    // 2. 프로젝트 요약
    {
        const s = contentPage(p, '01. SUMMARY', '프로젝트 요약');
        const items = [
            { t: '브랜드 가치 통합', d: '마부 인터랙티브(Mabu Interactive) 신규 BI 및 전사적 브랜드 가이드라인 적용 완료' },
            { t: '기술적 지향점', d: 'HTML5 Canvas 기반 최고의 60FPS 픽셀 슈팅 퍼포먼스 및 8방향 비행 엔진 확보' },
            { t: '사업적 마일스톤', d: '스테이지 1 보스전 프로토타입 개발 진입 및 전 10스테이지 메인 시나리오 확정' }
        ];
        items.forEach((it, i) => {
            const y = 2.0 + i * 1.5;
            s.addShape('rect', { x: 0.8, y, w: 0.05, h: 1.0, fill: { color: C.MINT } });
            s.addText(it.t, { x: 1.1, y: y, w: 5, h: 0.4, fontSize: 18, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(it.d, { x: 1.1, y: y + 0.45, w: 11, h: 0.5, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN });
        });
    }

    // 3. 주요 개발 성과
    {
        const s = contentPage(p, '02. MILESTONES', '주요 개발 성과');
        const cols = [
            { t: 'Core Engine', d: '• 60FPS 최적화 엔진\n• 8방향 관성 비행 물리\n• 피셀 퍼펙트 충돌 판정', c: C.CORAL },
            { t: 'Visual & Art', d: '• 픽셀 아트 엔진 V2\n• 5단 패럴랙스 배경\n• God Rays 광원 효과', c: C.MINT },
            { t: 'Audio & UX', d: '• 실시간 사운드 합성기\n• 반응형 멀티 플랫폼 UI\n• 슬랙 연동 자동 보고', c: C.PEACH }
        ];
        cols.forEach((col, i) => {
            const x = 0.8 + i * 4.0;
            s.addShape('rect', { x, y: 2.2, w: 3.5, h: 0.05, fill: { color: col.c } });
            s.addText(col.t, { x, y: 2.3, w: 3.5, h: 0.6, fontSize: 20, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(col.d, { x, y: 3.0, w: 3.5, h: 3, fontSize: 13, color: C.TEXT_SUB, fontFace: FONT_MAIN, lineSpacingMultiple: 1.8 });
        });
    }

    // 4. 기획 단계 진행 상황
    {
        const s = contentPage(p, '03. PLANNING', '기획 및 콘텐츠 설계 현황');
        s.addText('7차 기획 회의 결과: 스테이지 및 보스 상세 설계 확정', { x: 0.8, y: 1.8, w: 11, h: 0.5, fontSize: 16, bold: true, color: C.MINT, fontFace: FONT_MAIN });

        const tableData = [
            [{ text: '스테이지', options: { bold: true, fill: C.BG_SEC } }, { text: '테마 명칭', options: { bold: true, fill: C.BG_SEC } }, { text: '대표 보스', options: { bold: true, fill: C.BG_SEC } }, { text: '핵심 기믹', options: { bold: true, fill: C.BG_SEC } }],
            ['Stage 1', '평화로운 시작', '대장 말벌 버즈', '직선 돌진 및 탄막'],
            ['Stage 5', '거미의 감옥', '여왕 거미 아라크네', '구속 및 소환'],
            ['Stage 10', '황금의 심판', '황금 말벌 황제', '3단 변신 탄막']
        ];
        s.addTable(tableData, { x: 0.8, y: 2.5, w: 11.7, colW: [1.5, 3.5, 3.5, 3.2], border: { type: 'none' }, fontSize: 12, fontFace: FONT_MAIN });
        s.addText('※ 총 10개 스테이지 및 20종 이상의 유니크 에너미 설계 완료', { x: 0.8, y: 5.5, w: 10, h: 0.4, fontSize: 11, color: C.TEXT_LIGHT, fontFace: FONT_MAIN, italic: true });
    }

    // 5. 향후 과제
    {
        const s = contentPage(p, '04. NEXT STEPS', '향후 주요 개발 과제');
        const steps = [
            { n: '01', t: 'Boss Prototype', d: '스테이지 1 보스 \'버즈\'의 복합 공격 패턴 및 AI 상태 머신 구현' },
            { n: '02', t: 'Optimization', d: '대규모 탄막 연산을 위한 오브젝트 풀링(Object Pooling) 시스템 도입' },
            { n: '03', t: 'Gimmick Dev', d: '스테이지별 고유 지형 지물 및 상호작용 가능한 환경 기믹 시스템 구축' }
        ];
        steps.forEach((step, i) => {
            const y = 2.0 + i * 1.4;
            s.addText(step.n, { x: 0.8, y: y, w: 1, h: 1, fontSize: 32, bold: true, color: C.LINE, fontFace: FONT_EN });
            s.addText(step.t, { x: 1.8, y: y + 0.1, w: 4, h: 0.4, fontSize: 18, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(step.d, { x: 1.8, y: y + 0.5, w: 9, h: 0.4, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN });
        });
    }

    // 6. 엔딩
    {
        const s = p.addSlide();
        slideBg(s, C.WHITE);
        s.addText('Thank You', { x: 1, y: 2.8, w: 11.33, h: 1.2, fontSize: 60, bold: true, color: C.TEXT_MAIN, fontFace: FONT_EN, align: 'center', letterSpacing: -2 });
        s.addText(`${COMPANY_NAME} | ${AUTHOR}`, { x: 1, y: 4.2, w: 11.33, h: 0.5, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN, align: 'center', letterSpacing: 2 });
    }

    if (!existsSync(ROOT_DIR)) mkdirSync(ROOT_DIR, { recursive: true });
    const fileName = `${ROOT_DIR}/또또의모험_개발현황보고_${DATE}.pptx`;
    await p.writeFile({ fileName });
    console.log(`✅ PPT 생성 성공: ${fileName}`);
}

run();
