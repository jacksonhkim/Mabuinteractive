/**
 * 마부 인터랙티브 - 전 부서 PPT 일괄 재생성 (v2.3_FIX)
 * Sophisticated Minimal Strategy
 * 
 * 변경사항:
 * 1. 로고: V4 (Infinite Flow) 컨셉 반영
 * 2. 디자인: 여백 중심의 미니멀리즘, 타이포그래피 강조
 * 3. 컬러: Deep Neo Gradient (Tech Mint Accent)
 */
import pptxgen from 'pptxgenjs';
import { mkdirSync, existsSync } from 'fs';

// ============================================================
// 설정
// ============================================================
const ROOT_DIR = 'C:/Users/JACKSON/Desktop/앱 개발/안티그래비티 테스크/Company_Mabu';
const COMPANY_NAME = '마부 인터랙티브';
const LOGO_TEXT = 'MABU INTERACTIVE';
const LOGO_SUB = 'Driving Interactive Experiences';
const COPYRIGHT = '© 2026 Mabu Interactive. All rights reserved.';

// ============================================================
// V4 컬러 시스템 (Deep Neo)
// ============================================================
const C = {
    WHITE: 'ffffff',
    BG: 'ffffff',         // 완전한 화이트 배경 (High-End)
    BG_SEC: 'f7f9fc',     // 극도로 연한 쿨 그레이
    TEXT_MAIN: '2d3436',  // 진한 차콜
    TEXT_SUB: '636e72',   // 미디엄 그레이
    TEXT_LIGHT: 'b2bec3', // 라이트 그레이
    CORAL: 'ff5e5e',      // Deep Coral
    PEACH: 'ffa568',      // Soft Peach
    MINT: '00bfa5',       // Tech Mint
    LINE: 'dfe6e9',       // 매우 연한 라인
};

const FONT_MAIN = 'Malgun Gothic';
const FONT_EN = 'Arial';

// ============================================================
// 공통 유틸 (Minimal Style)
// ============================================================
function mkPptx(title, author, subject) {
    const p = new pptxgen();
    p.author = author; p.company = COMPANY_NAME; p.subject = subject; p.title = title;
    p.layout = 'LAYOUT_WIDE';
    return p;
}

function slideBg(slide, color = C.WHITE) {
    slide.background = { fill: color };
}

function headerLine(slide) {
    slide.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.02, fill: { type: 'gradient', color: [C.CORAL, C.PEACH, C.MINT] } });
}

function footerInfo(slide, text) {
    slide.addText(text, { x: 0.5, y: 7.3, w: 12, h: 0.2, fontSize: 8, color: C.TEXT_LIGHT, fontFace: FONT_EN });
}

function cover(pptx, title, subtitle, author, date) {
    const s = pptx.addSlide();
    slideBg(s, C.WHITE);
    s.addText(title, { x: 0.5, y: 2.5, w: 12.33, h: 2, fontSize: 54, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN, align: 'center' });
    s.addShape('rect', { x: 5.66, y: 4.5, w: 2, h: 0.05, fill: { type: 'gradient', color: [C.CORAL, C.MINT] } });
    s.addText(subtitle, { x: 0.5, y: 4.8, w: 12.33, h: 0.6, fontSize: 18, color: C.TEXT_SUB, fontFace: FONT_MAIN, align: 'center' });
    s.addText(`${author}  |  ${COMPANY_NAME}  |  ${date}`, { x: 0.5, y: 6.8, w: 12.33, h: 0.4, fontSize: 10, color: C.TEXT_LIGHT, fontFace: FONT_EN, align: 'center', letterSpacing: 2 });
}

function sectionSlide(pptx, partNum, title, sub) {
    const s = pptx.addSlide();
    slideBg(s, C.BG_SEC);
    s.addText(partNum, { x: 0.8, y: 0.5, w: 2, h: 2, fontSize: 120, bold: true, color: C.LINE, fontFace: FONT_EN, align: 'left', transparency: 70 });
    s.addText(title, { x: 2.0, y: 1.8, w: 10, h: 1.2, fontSize: 40, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
    s.addShape('rect', { x: 2.0, y: 3.1, w: 1.5, h: 0.05, fill: { type: 'gradient', color: [C.CORAL, C.MINT] } });
    if (sub) s.addText(sub, { x: 2.0, y: 3.4, w: 10, h: 0.5, fontSize: 16, color: C.TEXT_SUB, fontFace: FONT_MAIN });
    footerInfo(s, COPYRIGHT);
}

function contentPage(pptx, section, title) {
    const s = pptx.addSlide();
    slideBg(s, C.WHITE);
    headerLine(s);
    s.addText(section, { x: 0.8, y: 0.5, w: 5, h: 0.25, fontSize: 9, color: C.MINT, fontFace: FONT_EN, letterSpacing: 3, bold: true });
    s.addText(title, { x: 0.8, y: 0.8, w: 11, h: 0.8, fontSize: 28, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
    footerInfo(s, COPYRIGHT);
    return s;
}

function endPage(pptx, team) {
    const s = pptx.addSlide();
    slideBg(s, C.WHITE);
    s.addText('Thank You', { x: 1, y: 2.8, w: 11.33, h: 1.2, fontSize: 60, bold: true, color: C.TEXT_MAIN, fontFace: FONT_EN, align: 'center', letterSpacing: -2 });
    s.addText(team, { x: 1, y: 4.2, w: 11.33, h: 0.5, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN, align: 'center', letterSpacing: 2 });
    s.addText(`${COMPANY_NAME}`, { x: 1, y: 6.8, w: 11.33, h: 0.5, fontSize: 10, color: C.TEXT_LIGHT, fontFace: FONT_EN, align: 'center', letterSpacing: 4 });
}

const B = { fontSize: 14, color: C.TEXT_MAIN, fontFace: FONT_MAIN, lineSpacingMultiple: 1.6 };
const BS = { fontSize: 12, color: C.TEXT_SUB, fontFace: FONT_MAIN, lineSpacingMultiple: 1.5 };

// 테이블 셀 스타일
function headerCell(text, color = C.TEXT_MAIN) {
    return { text, options: { bold: true, color: color, fill: { color: C.BG_SEC }, fontSize: 10, fontFace: FONT_MAIN, align: 'left', border: { b: { pt: 1, color: C.CORAL }, t: { pt: 0 }, l: { pt: 0 }, r: { pt: 0 } } } };
}
function bodyCell(text) {
    return { text, options: { color: C.TEXT_SUB, fontSize: 11, fontFace: FONT_MAIN, fill: { color: C.WHITE }, align: 'left', border: { b: { pt: 0.5, color: C.LINE }, t: { pt: 0 }, l: { pt: 0 }, r: { pt: 0 } } } };
}

// ----------------------------------------------------------------------------
// 1. 기획
async function gen기획() {
    const p = mkPptx('종합 기획서', '뽀 (기획팀장)', '또또의 모험 종합 기획서');
    cover(p, '🐝 또또의 모험\n종합 기획서', '시나리오 · 시스템 · 콘텐츠 · UI/UX', '뽀 (기획팀장)', '2026.02.11');
    {
        const s = contentPage(p, 'CONTENTS', '목차');
        const toc = [
            { n: '01', t: '시나리오 기획서', d: '메인 시놉시스, 10 스테이지 서사' },
            { n: '02', t: '시스템 기획서', d: '조작, 아이템, 속성 변신 시스템' },
            { n: '03', t: '콘텐츠 기획서', d: '맵 디자인, 수집 요소' },
            { n: '04', t: 'UI/UX 기획서', d: 'HUD, 대화창, 메뉴' },
        ];
        toc.forEach((item, i) => {
            const y = 2.0 + i * 1.3;
            s.addShape('line', { x1: 0.8, y1: y, x2: 1.5, y2: y, line: { color: C.MINT, width: 2 } });
            s.addText(item.n, { x: 0.8, y: y + 0.1, w: 1, h: 0.5, fontSize: 12, bold: true, color: C.MINT, fontFace: FONT_EN });
            s.addText(item.t, { x: 2.0, y: y, w: 5, h: 0.4, fontSize: 18, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(item.d, { x: 2.0, y: y + 0.5, w: 8, h: 0.3, fontSize: 12, color: C.TEXT_LIGHT, fontFace: FONT_MAIN });
        });
    }
    sectionSlide(p, '01', '시나리오 기획서', '메인 시놉시스 및 스테이지별 서사');
    {
        const s = contentPage(p, 'SYNOPSIS', '메인 스토리');
        s.addText('“', { x: 0.5, y: 1.5, w: 1, h: 1, fontSize: 80, color: C.BG_SEC, fontFace: FONT_EN });
        s.addText('평화로운 꿀벌 마을의 최고 비행사 \'또또\'.\n어느 날 말벌 부대와 정체불명의 드론들이 마을을 습격하여 여왕벌과 동료들을 납치한다.\n또또는 그들의 배후에 숲을 기계 공장으로 만들려는 \'기계 제국\'이 있음을 알게 되고, 홀로 제국의 심장부로 향한다.', { x: 1.5, y: 2.2, w: 10, h: 3, ...B, fontSize: 16 });
    }
    sectionSlide(p, '02', '시스템 기획서', '조작 · 아이템 · 속성 변신');
    {
        const s = contentPage(p, 'SYSTEM', '속성 변신 아이템');
        const items = [
            { emoji: '🔥', nm: '파이어 칠리', eff: '전방 화염 방사', str: 'Stage 2, 8', c: C.CORAL },
            { emoji: '❄️', nm: '아이스 민트', eff: '3갈래 유도 얼음', str: 'Stage 1, 6', c: C.MINT },
            { emoji: '⚡', nm: '썬더 레몬', eff: '관통 레이저', str: 'Stage 3, 7, 9', c: C.PEACH },
        ];
        items.forEach((it, i) => {
            const y = 1.8 + i * 1.6;
            s.addShape('rect', { x: 1, y, w: 0.05, h: 1.2, fill: { color: it.c } });
            s.addText(it.emoji, { x: 1.2, y, w: 1, h: 1, fontSize: 32 });
            s.addText(it.nm, { x: 2.2, y: y + 0.1, w: 4, h: 0.5, fontSize: 18, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(`${it.eff}  |  추천: ${it.str}`, { x: 2.2, y: y + 0.6, w: 8, h: 0.3, ...BS });
        });
    }
    endPage(p, '뽀 (기획팀장) — 기획팀');
    if (!existsSync(`${ROOT_DIR}/기획`)) mkdirSync(`${ROOT_DIR}/기획`, { recursive: true });
    await p.writeFile({ fileName: `${ROOT_DIR}/기획/또또의모험_종합기획서.pptx` });
    console.log('✅ 뽀 - 종합 기획서 (Sophisticated)');
}

// ----------------------------------------------------------------------------
// 2. 디자인
async function gen디자인() {
    const p = mkPptx('디자인 시안 보고서', '한순이 (아트 디렉터)', '캐릭터 및 보스 디자인');
    cover(p, '디자인 시안 보고서', '캐릭터 · 에너미 · 보스 · 배경 컨셉', '한순이 (아트 디렉터)', '2026.02.11');
    sectionSlide(p, '01', '캐릭터 디자인', '또또 (Toto)');
    {
        const s = contentPage(p, 'PART 1', '또또 (주인공)');
        s.addShape('rect', { x: 1, y: 1.5, w: 6, h: 4.5, fill: { color: C.BG_SEC } });
        s.addText('• 안경을 쓴 귀여운 꿀벌 디자인 확정\n• 날개 짓의 떨림 + 안경 반짝임 애니메이션\n• 8방향 비행 기울기 대응\n• 표정 변화: 평범, 놀람, 분노, 슬픔', { x: 1.3, y: 1.7, w: 5.5, h: 3, ...B });
        s.addShape('rect', { x: 7.5, y: 1.5, w: 4.5, h: 4.5, fill: { color: C.WHITE }, line: { color: C.LINE } });
        s.addText('📎 ch_player1.png', { x: 7.5, y: 3.5, w: 4.5, h: 0.5, fontSize: 11, color: C.TEXT_LIGHT, fontFace: FONT_MAIN, align: 'center' });
    }
    endPage(p, '한순이 (아트 디렉터) — 디자인팀');
    if (!existsSync(`${ROOT_DIR}/디자인`)) mkdirSync(`${ROOT_DIR}/디자인`, { recursive: true });
    await p.writeFile({ fileName: `${ROOT_DIR}/디자인/디자인_시안_보고서.pptx` });
    console.log('✅ 한순이 - 디자인 시안 보고서 (Sophisticated)');
}

// ----------------------------------------------------------------------------
// 3. 개발
async function gen개발() {
    const p = mkPptx('개발 계획서', '또또 (AI개발 매니저)', '개발 로드맵');
    cover(p, '개발 계획서', '프로젝트 개요 · 로드맵 · 기술 노트', '또또 (AI개발 매니저)', '2026.02.11');
    sectionSlide(p, '01', '개발 로드맵', 'Phase 1 ~ 3');
    {
        const s = contentPage(p, 'ROADMAP', '개발 일정');
        const phases = [
            { t: 'Phase 1: 코어 엔진', items: 'Canvas 렌더링 최적화, 8방향 관성 비행 물리', c: C.CORAL },
            { t: 'Phase 2: 콘텐츠 시스템', items: '동적 리소스 로딩, 적 AI 탄막 패턴, 보스전 FSM', c: C.PEACH },
            { t: 'Phase 3: 폴리싱 & 배포', items: '크로스 브라우징 테스트, 모바일 터치 최적화', c: C.MINT },
        ];
        phases.forEach((ph, i) => {
            const y = 1.6 + i * 1.6;
            s.addShape('rect', { x: 1, y, w: 11, h: 1.2, fill: { color: C.BG_SEC }, rectRadius: 0.1 });
            s.addShape('rect', { x: 1, y, w: 0.1, h: 1.2, fill: { color: ph.c } });
            s.addText(ph.t, { x: 1.5, y: y + 0.2, w: 10, h: 0.35, fontSize: 14, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
            s.addText(ph.items, { x: 1.5, y: y + 0.6, w: 10, h: 0.5, ...BS });
        });
    }
    endPage(p, '또또 (AI개발 매니저) — 개발팀');
    if (!existsSync(`${ROOT_DIR}/개발`)) mkdirSync(`${ROOT_DIR}/개발`, { recursive: true });
    await p.writeFile({ fileName: `${ROOT_DIR}/개발/개발계획서.pptx` });
    console.log('✅ 또또 - 개발 계획서 (Sophisticated)');
}

// ----------------------------------------------------------------------------
// 4. 사운드
async function gen사운드() {
    const p = mkPptx('사운드 리소스 명세서', '개발지원팀', '사운드 컨셉 및 기술 가이드');
    cover(p, '사운드 리소스\n명세서', 'BGM · SFX · 기술 가이드', '개발지원팀 (사운드)', '2026.02.11');
    sectionSlide(p, '01', 'BGM 리스트', '스테이지별 배경 음악');
    endPage(p, '개발지원팀 (사운드)');
    if (!existsSync(`${ROOT_DIR}/개발지원`)) mkdirSync(`${ROOT_DIR}/개발지원`, { recursive: true });
    await p.writeFile({ fileName: `${ROOT_DIR}/개발지원/사운드_리소스_명세서.pptx` });
    console.log('✅ 사운드팀 - 명세서 (Sophisticated)');
}

// ----------------------------------------------------------------------------
// 5. 리서치
async function gen리서치() {
    const p = mkPptx('텐가이 시스템 분석', '피터 (총괄 사업PM)', '심층 리서치');
    cover(p, '텐가이 시스템\n분석 리서치', '핵심 메커니즘 심층 분석', '피터 (총괄 사업PM)', '2026.02.11');
    sectionSlide(p, '01', '전투 및 판정 시스템', '');
    endPage(p, '피터 (총괄 사업PM) — 사업팀');
    if (!existsSync(`${ROOT_DIR}/사업/리서치`)) mkdirSync(`${ROOT_DIR}/사업/리서치`, { recursive: true });
    await p.writeFile({ fileName: `${ROOT_DIR}/사업/리서치/텐가이_시스템_분석.pptx` });
    console.log('✅ 피터 - 텐가이 분석 (Sophisticated)');
}

// ----------------------------------------------------------------------------
// 6. 브로슈어
async function gen브로슈어() {
    const p = mkPptx('마부 인터랙티브 회사 브로슈어', '피터 (총괄 사업PM)', '회사 소개 브로슈어');

    // 표지
    {
        const s = p.addSlide();
        slideBg(s, C.WHITE);
        s.addText(LOGO_TEXT, { x: 0.8, y: 3.0, w: 10, h: 0.8, fontSize: 16, color: C.MINT, fontFace: FONT_EN, letterSpacing: 8, bold: true });
        s.addText(COMPANY_NAME, { x: 0.8, y: 3.8, w: 10, h: 1.5, fontSize: 60, bold: true, color: C.TEXT_MAIN, fontFace: FONT_MAIN });
        s.addShape('line', { x1: 0.8, y1: 5.5, x2: 2.8, y2: 5.5, line: { color: C.CORAL, width: 3 } });
        s.addText('회사 소개 브로슈어', { x: 0.8, y: 5.8, w: 8, h: 0.6, fontSize: 18, color: C.TEXT_SUB, fontFace: FONT_MAIN });
        footerInfo(s, COPYRIGHT);
    }
    // 회사 개요
    {
        const s = contentPage(p, 'ABOUT US', 'We Drive Experience.');
        s.addText('마부 인터랙티브는 유저의 경험을 주도하는\n차세대 게임 개발 스튜디오입니다.', { x: 0.8, y: 2.0, w: 10, h: 1.5, fontSize: 24, color: C.TEXT_MAIN, fontFace: FONT_MAIN, bold: true, lineSpacingMultiple: 1.4 });
        s.addText('"마부(Mabu)"처럼 게임이라는 마차를 능숙하게 이끌어\n누구나 즐길 수 있는 최고의 여정을 선사합니다.', { x: 0.8, y: 3.5, w: 10, h: 2.0, fontSize: 16, color: C.TEXT_SUB, fontFace: FONT_MAIN, lineSpacingMultiple: 1.6 });
        const vals = ['EST. 2026', 'INTERACTIVE WEB', 'FIRST TITLE: TOTO'];
        vals.forEach((v, i) => {
            const x = 0.8 + i * 3.5;
            s.addText(v, { x, y: 5.5, w: 3, h: 0.5, fontSize: 12, color: C.TEXT_LIGHT, fontFace: FONT_EN, bold: true, letterSpacing: 2 });
            s.addShape('rect', { x, y: 6.0, w: 0.5, h: 0.02, fill: { color: C.MINT } });
        });
    }
    // 비전 & 미션
    {
        const s = contentPage(p, 'VISION & MISSION', 'Global Leader in Interactive Gaming');
        s.addText('VISION', { x: 0.8, y: 2.5, w: 4, h: 0.4, fontSize: 14, color: C.CORAL, fontFace: FONT_EN, bold: true, letterSpacing: 2 });
        s.addText('혁신적인 기술로\n전 세계를 연결하다', { x: 0.8, y: 3.0, w: 4.5, h: 2, fontSize: 24, color: C.TEXT_MAIN, fontFace: FONT_MAIN, bold: true });
        s.addShape('line', { x1: 6.66, y1: 2.5, x2: 6.66, y2: 5.5, line: { color: C.LINE, width: 1 } });
        s.addText('MISSION', { x: 7.5, y: 2.5, w: 4, h: 0.4, fontSize: 14, color: C.MINT, fontFace: FONT_EN, bold: true, letterSpacing: 2 });
        const missions = ['Connection: 사람과 기술의 연결', 'Innovation: 웹 기술의 한계를 넘는 혁신', 'Enjoyment: 순수한 즐거움의 추구'];
        missions.forEach((m, i) => {
            s.addText(m, { x: 7.5, y: 3.2 + (i * 0.8), w: 5, h: 0.5, fontSize: 14, color: C.TEXT_SUB, fontFace: FONT_MAIN });
            s.addShape('ellipse', { x: 7.3, y: 3.35 + (i * 0.8), w: 0.08, h: 0.08, fill: { color: C.MINT } });
        });
    }
    // 팀 소개
    {
        const s = contentPage(p, 'OUR TEAM', 'Experts');
        const team = [
            { role: 'Planning', name: 'Bo', desc: 'System & Level', c: C.CORAL },
            { role: 'Art', name: 'Hansuni', desc: 'Character Art', c: C.PEACH },
            { role: 'Dev', name: 'Toto', desc: 'Engine & Server', c: C.MINT },
            { role: 'Business', name: 'Peter', desc: 'Strategy', c: C.TEXT_MAIN },
        ];
        team.forEach((t, i) => {
            const x = 0.8 + i * 3.0;
            s.addShape('rect', { x, y: 2.5, w: 2.5, h: 0.02, fill: { color: t.c } });
            s.addText(t.name, { x, y: 2.8, w: 2.5, h: 0.5, fontSize: 20, bold: true, color: C.TEXT_MAIN, fontFace: FONT_EN });
            s.addText(t.role, { x, y: 3.3, w: 2.5, h: 0.3, fontSize: 12, color: C.TEXT_LIGHT, fontFace: FONT_EN, letterSpacing: 2 });
            s.addText(t.desc, { x, y: 3.8, w: 2.5, h: 0.5, fontSize: 12, color: C.TEXT_SUB, fontFace: FONT_EN });
        });
    }
    // 연락처 (다크)
    {
        const s = p.addSlide();
        slideBg(s, C.TEXT_MAIN);
        s.addText('MABU', { x: 5.5, y: 2.5, w: 6, h: 2, fontSize: 80, bold: true, color: C.MINT, fontFace: FONT_EN, letterSpacing: -2, align: 'right', transparency: 80 });
        s.addText('CONTACT', { x: 0.8, y: 2.0, w: 4, h: 0.5, fontSize: 12, color: C.CORAL, fontFace: FONT_EN, letterSpacing: 4, bold: true });
        s.addText('Start Your Journey\nWith Us.', { x: 0.8, y: 2.8, w: 8, h: 2, fontSize: 40, bold: true, color: C.WHITE, fontFace: FONT_EN });
        s.addText('contact@mabu.interactive', { x: 0.8, y: 5.5, w: 6, h: 0.5, fontSize: 14, color: C.TEXT_LIGHT, fontFace: FONT_EN });
        s.addText('www.mabu.interactive', { x: 0.8, y: 6.0, w: 6, h: 0.5, fontSize: 14, color: C.TEXT_LIGHT, fontFace: FONT_EN });
    }

    if (!existsSync(`${ROOT_DIR}/사업`)) mkdirSync(`${ROOT_DIR}/사업`, { recursive: true });
    await p.writeFile({ fileName: `${ROOT_DIR}/사업/마부인터랙티브_회사브로슈어.pptx` });
    console.log('✅ 피터 - 회사 브로슈어 PPT (Sophisticated)');
}

async function main() {
    console.log(`📊 ${COMPANY_NAME} 전 부서 PPT 재생성 (Sophisticated Minimal)\n`);
    if (!existsSync(ROOT_DIR)) mkdirSync(ROOT_DIR, { recursive: true });
    await gen기획();
    await gen디자인();
    await gen개발();
    await gen사운드();
    await gen리서치();
    await gen브로슈어();
    console.log('\n🎉 전체 완료!');
    console.log(`📂 저장 위치: ${ROOT_DIR}`);
}
main();
