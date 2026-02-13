/**
 * 또또의 모험 - 캐릭터 시스템 및 개발 진척 보고 PPT 생성 스크립트
 * Role: 문서 제작 전문가 (Documentation Architect)
 */
import pptxgen from 'pptxgenjs';
import { mkdirSync, existsSync } from 'fs';

const ROOT_DIR = 'C:/Users/JACKSON/Desktop/앱 개발/안티그래비티 테스크/1.또또의 모험/프로젝트_문서/4_PPT_자료';
const COMPANY_NAME = '마부 인터랙티브 (Mabu Interactive)';
const PROJECT_NAME = '또또의 모험 (The Adventure of Toto)';
const REPORT_TITLE = '캐릭터 시스템 확장 및 개발 현황 보고';
const AUTHOR = 'AI 개발 매니저 또또 (Ttotto)';
const DATE = '2026-02-12';
const COPYRIGHT = '© 2026 Mabu Interactive. All rights reserved.';

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

async function run() {
    const p = mkPptx(REPORT_TITLE);
    cover(p);

    // 1. 개발 개요
    {
        const s = contentPage(p, '01. OVERVIEW', '개발 개요 및 주요 업데이트');
        const items = [
            { t: '캐릭터 시스템 확장', d: '기존 또또(Toto) 외 4종의 신규 플레이어 캐릭터 추가 및 고유 스탯 부여' },
            { t: 'UI/UX 고도화', d: '게임 시작 전 캐릭터 선택 시스템(Character Selection) 구축 및 픽셀 아트 반영' },
            { t: '엔진 성능 최적화', d: '캐릭터별 탄환 물리 연산 최적화 및 상태 머신 고도화' }
        ];
        items.forEach((it, i) => {
            const y = 2.0 + i * 1.5;
            s.addShape('rect', { x: 0.8, y, w: 0.05, h: 1.0, fill: { color: C.MINT } });
            s.addText(it.t, { x: 1.1, y: y, w: 5, h: 0.4, fontSize: 18, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(it.d, { x: 1.1, y: y + 0.45, w: 11, h: 0.5, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN });
        });
    }

    // 2. 신규 캐릭터 라인업
    {
        const s = contentPage(p, '02. CHARACTERS', '신규 플레이어 캐릭터 상세');
        const chars = [
            { name: 'Lulu', type: 'Speed', skill: 'High Fire Rate', color: C.CORAL },
            { name: 'Kaka', type: 'Power', skill: 'Heavy Damage', color: C.PEACH },
            { name: 'Momo', type: 'Defense', skill: 'Wide Shot', color: C.MINT },
            { name: 'Pipi', type: 'Special', skill: 'Homing/Dragonfly', color: C.LINE }
        ];
        chars.forEach((c, i) => {
            const x = 0.8 + i * 3.0;
            s.addShape('rect', { x, y: 2.2, w: 2.5, h: 3.5, fill: { color: C.BG_SEC } });
            s.addText(c.name, { x, y: 2.5, w: 2.5, h: 0.5, fontSize: 24, bold: true, color: c.color, align: 'center', fontFace: FONT_MAIN });
            s.addText(`Type: ${c.type}\n\nSkill:\n${c.skill}`, { x: x + 0.2, y: 3.2, w: 2.1, h: 2, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN });
        });
    }

    // 3. QA 및 버그 수정 내역
    {
        const s = contentPage(p, '03. QA & STABILITY', '주요 버그 수정 및 안정성 개선');
        const bugs = [
            { t: '보스 중복 스폰 해결', d: '스테이지 전환 시 보스 개체가 잔류하던 리소스 누수 및 중복 생성 버그 수정' },
            { t: '탄환 판정 정밀도 향상', d: '픽셀 퍼펙트 충돌 알고리즘 개선을 통해 피격 판정 신뢰도 99% 달성' },
            { t: '사운드 지연 레이턴시 제거', d: 'AudioBuffer 캐싱 시스템 도입으로 탄환 발사 시 사운드 딜레이 해결' }
        ];
        bugs.forEach((b, i) => {
            const y = 2.2 + i * 1.5;
            s.addText(b.t, { x: 1.0, y, w: 5, h: 0.4, fontSize: 16, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(b.d, { x: 1.0, y: y + 0.4, w: 10, h: 0.4, fontSize: 13, color: C.TEXT_SUB, fontFace: FONT_MAIN });
        });
    }

    // 4. 향후 과제
    {
        const s = contentPage(p, '04. NEXT STEPS', '다음 단계 로드맵');
        s.addText('• 스테이지 2-10 밸런싱 테스트\n• 캐릭터별 고유 필살기(Bomb) 연출 고도화\n• 전사 슬랙 연동을 통한 실시간 버그 리포팅 시스템 구축', { x: 1.0, y: 2.5, w: 10, h: 3, fontSize: 18, color: C.TEXT_SUB, fontFace: FONT_MAIN, lineSpacingMultiple: 2 });
    }

    // 5. 엔딩
    {
        const s = p.addSlide();
        slideBg(s, C.WHITE);
        s.addText('Thank You', { x: 1, y: 2.8, w: 11.33, h: 1.2, fontSize: 60, bold: true, color: C.TEXT_MAIN, fontFace: FONT_EN, align: 'center', letterSpacing: -2 });
        s.addText(`${COMPANY_NAME} | ${AUTHOR}`, { x: 1, y: 4.2, w: 11.33, h: 0.5, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN, align: 'center', letterSpacing: 2 });
    }

    if (!existsSync(ROOT_DIR)) mkdirSync(ROOT_DIR, { recursive: true });
    const fileName = `${ROOT_DIR}/또또의모험_캐릭터_시스템_및_개발현황보고_${DATE}.pptx`;
    await p.writeFile({ fileName });
    console.log(`✅ PPT 생성 성공: ${fileName}`);
}

run();
