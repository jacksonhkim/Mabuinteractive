/**
 * QA팀 - QA 체크리스트 엑셀 생성기
 * 또또의 모험 게임 테스트 체크리스트
 */
import ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();
workbook.creator = 'QA팀';
workbook.created = new Date();

// ============================================================
// 공통 스타일
// ============================================================
const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D2D2D' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Malgun Gothic' };
const BODY_FONT = { size: 10, name: 'Malgun Gothic' };
const PASS_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
const FAIL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
const PENDING_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF8E1' } };
const CATEGORY_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
const BORDER_STYLE = {
    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
};

function styleHeader(row) {
    row.eachCell(cell => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = BORDER_STYLE;
    });
    row.height = 30;
}

function styleBody(row, statusCol = 6) {
    row.eachCell((cell, colNumber) => {
        cell.font = BODY_FONT;
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = BORDER_STYLE;
    });
    row.height = 28;
}

// ============================================================
// Sheet 1: 기능 테스트 체크리스트
// ============================================================
const funcSheet = workbook.addWorksheet('기능 테스트', {
    properties: { tabColor: { argb: 'FF4CAF50' } }
});

funcSheet.columns = [
    { header: 'No.', key: 'no', width: 6 },
    { header: '카테고리', key: 'category', width: 15 },
    { header: '테스트 항목', key: 'item', width: 35 },
    { header: '테스트 상세', key: 'detail', width: 45 },
    { header: '우선순위', key: 'priority', width: 10 },
    { header: '상태', key: 'status', width: 10 },
    { header: '담당자', key: 'tester', width: 10 },
    { header: '비고', key: 'note', width: 25 },
];

styleHeader(funcSheet.getRow(1));

const funcItems = [
    // 플레이어 조작
    ['플레이어', '8방향 이동', '상/하/좌/우/대각선 이동이 정상 동작하는지', 'High', '미테스트', '', ''],
    ['플레이어', '관성 이동', '이동 후 관성으로 미끄러지다 정지하는지', 'High', '미테스트', '', ''],
    ['플레이어', '화면 경계', '캐릭터가 화면 밖으로 나가지 않는지', 'High', '미테스트', '', ''],
    ['플레이어', '기본 슈팅', '스페이스바 누르면 탄환 발사되는지', 'High', '미테스트', '', ''],
    ['플레이어', '연사 딜레이', '탄환 발사 간격(200ms)이 정상 적용되는지', 'Medium', '미테스트', '', ''],
    ['플레이어', '무적 시간', '피격 후 2초간 무적 상태가 되는지', 'High', '미테스트', '', ''],
    ['플레이어', '깜빡임 효과', '무적 상태에서 캐릭터 깜빡임 연출', 'Low', '미테스트', '', ''],
    ['플레이어', '이미지 렌더링', 'ch_player1.png가 정상 표시되는지', 'High', '미테스트', '', ''],
    // 적 시스템
    ['적 시스템', '말벌 스폰', '말벌 정찰병이 화면 우측에서 생성되는지', 'High', '미테스트', '', ''],
    ['적 시스템', '나비 스폰', '춤추는 나비가 사인파 궤적으로 이동하는지', 'High', '미테스트', '', ''],
    ['적 시스템', '적 피격', '탄환 적중 시 HP가 정상 감소하는지', 'High', '미테스트', '', ''],
    ['적 시스템', '적 파괴', 'HP 0 도달 시 파괴 + 점수 +100', 'High', '미테스트', '', ''],
    ['적 시스템', '폭발 이펙트', '적 파괴 시 파티클 효과 발생하는지', 'Medium', '미테스트', '', ''],
    ['적 시스템', '화면 이탈', '화면 왼쪽으로 나간 적이 배열에서 제거되는지', 'Medium', '미테스트', '', ''],
    // 충돌
    ['충돌 판정', '플레이어-적 충돌', '충돌 시 생명력 감소하는지', 'High', '미테스트', '', ''],
    ['충돌 판정', '탄환-적 충돌', '탄환이 적에 정확히 명중하는지', 'High', '미테스트', '', ''],
    ['충돌 판정', '히트박스 정확도', '시각적 크기와 히트박스가 일치하는지', 'Medium', '미테스트', '', ''],
    // UI
    ['UI', '점수 표시', '점수가 6자리로 정상 표시되는지', 'Medium', '미테스트', '', ''],
    ['UI', '생명력 표시', '하트 아이콘이 생명 수만큼 표시되는지', 'Medium', '미테스트', '', ''],
    ['UI', '게임 오버', 'Lives 0일 때 게임 오버 처리되는지', 'High', '미테스트', '', ''],
    // 타이틀
    ['타이틀 화면', '배경 렌더링', '하늘 그라데이션 + 구름 장식이 표시되는지', 'Medium', '미테스트', '', ''],
    ['타이틀 화면', '또또 애니메이션', '중앙의 또또가 둥둥 떠있는 효과가 작동하는지', 'Low', '미테스트', '', ''],
    ['타이틀 화면', '게임 시작', '클릭/키보드로 게임이 시작되는지', 'High', '미테스트', '', ''],
    ['타이틀 화면', 'UI 전환', '시작 후 start-screen 숨김 + ui-layer 표시', 'High', '미테스트', '', ''],
    // 사운드
    ['사운드', 'BGM 재생', '게임 시작 시 배경음악이 재생되는지', 'Medium', '미테스트', '', ''],
    ['사운드', '발사 효과음', '탄환 발사 시 효과음이 재생되는지', 'Medium', '미테스트', '', ''],
    ['사운드', '폭발 효과음', '적 파괴 시 폭발음이 재생되는지', 'Medium', '미테스트', '', ''],
    // 성능
    ['성능', '60FPS 유지', '게임 루프가 60FPS를 안정적으로 유지하는지', 'High', '미테스트', '', ''],
    ['성능', '메모리 누수', '장시간 플레이 시 메모리 증가 없는지', 'Medium', '미테스트', '', ''],
    ['성능', '반응형 스케일링', '브라우저 리사이즈 시 캔버스가 정상 스케일되는지', 'Medium', '미테스트', '', ''],
];

funcItems.forEach((item, i) => {
    const row = funcSheet.addRow({
        no: i + 1,
        category: item[0],
        item: item[1],
        detail: item[2],
        priority: item[3],
        status: item[4],
        tester: item[5],
        note: item[6],
    });
    styleBody(row);
    // 카테고리 셀 스타일
    row.getCell(2).fill = CATEGORY_FILL;
    row.getCell(2).font = { ...BODY_FONT, bold: true };
    // 우선도 색상
    if (item[3] === 'High') row.getCell(5).font = { ...BODY_FONT, color: { argb: 'FFD32F2F' }, bold: true };
    if (item[3] === 'Medium') row.getCell(5).font = { ...BODY_FONT, color: { argb: 'FFE65100' } };
});

// 조건부 서식 (상태 열 드롭다운)
for (let i = 2; i <= funcItems.length + 1; i++) {
    funcSheet.getCell(`F${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"통과,실패,미테스트,보류"'],
    };
}

// ============================================================
// Sheet 2: 호환성 테스트
// ============================================================
const compatSheet = workbook.addWorksheet('호환성 테스트', {
    properties: { tabColor: { argb: 'FF2196F3' } }
});

compatSheet.columns = [
    { header: 'No.', key: 'no', width: 6 },
    { header: '환경', key: 'env', width: 18 },
    { header: '브라우저/기기', key: 'browser', width: 20 },
    { header: '테스트 항목', key: 'item', width: 30 },
    { header: '상태', key: 'status', width: 10 },
    { header: '이슈 내용', key: 'issue', width: 40 },
];

styleHeader(compatSheet.getRow(1));

const compatItems = [
    ['PC', 'Chrome (최신)', '게임 정상 실행 및 60FPS', '미테스트', ''],
    ['PC', 'Firefox (최신)', '게임 정상 실행 및 60FPS', '미테스트', ''],
    ['PC', 'Edge (최신)', '게임 정상 실행 및 60FPS', '미테스트', ''],
    ['PC', 'Safari (최신)', '게임 정상 실행 여부', '미테스트', ''],
    ['모바일', 'iOS Safari', '터치 컨트롤 정상 동작', '미테스트', ''],
    ['모바일', 'Android Chrome', '터치 컨트롤 정상 동작', '미테스트', ''],
    ['모바일', '삼성 인터넷', '게임 정상 실행 여부', '미테스트', ''],
    ['해상도', '1920x1080', '16:9 비율 정상 스케일링', '미테스트', ''],
    ['해상도', '1280x720', '기본 해상도 정상 렌더링', '미테스트', ''],
    ['해상도', '2560x1440', '고해상도 스케일링', '미테스트', ''],
    ['해상도', '모바일 세로', '세로 모드 대응 여부', '미테스트', ''],
];

compatItems.forEach((item, i) => {
    const row = compatSheet.addRow({
        no: i + 1,
        env: item[0],
        browser: item[1],
        item: item[2],
        status: item[3],
        issue: item[4],
    });
    styleBody(row);
    row.getCell(2).fill = CATEGORY_FILL;
    row.getCell(2).font = { ...BODY_FONT, bold: true };
});

for (let i = 2; i <= compatItems.length + 1; i++) {
    compatSheet.getCell(`E${i}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: ['"통과,실패,미테스트,보류"'],
    };
}

// ============================================================
// Sheet 3: 버그 트래커
// ============================================================
const bugSheet = workbook.addWorksheet('버그 트래커', {
    properties: { tabColor: { argb: 'FFF44336' } }
});

bugSheet.columns = [
    { header: 'Bug ID', key: 'id', width: 10 },
    { header: '발견일', key: 'date', width: 12 },
    { header: '심각도', key: 'severity', width: 10 },
    { header: '카테고리', key: 'category', width: 13 },
    { header: '버그 제목', key: 'title', width: 30 },
    { header: '재현 방법', key: 'repro', width: 40 },
    { header: '상태', key: 'status', width: 10 },
    { header: '담당자', key: 'assignee', width: 10 },
    { header: '해결일', key: 'resolved', width: 12 },
];

styleHeader(bugSheet.getRow(1));

// 샘플 버그 데이터
const sampleBugs = [
    ['BUG-001', '2026-02-10', 'Critical', '렌더링', 'drawSprite 함수 미정의 오류', '게임 시작 후 적이 스폰되면 콘솔에 drawSprite is not defined 에러 발생', '수정완료', '또또', '2026-02-11'],
    ['BUG-002', '2026-02-11', 'Major', 'UI', '타이틀 화면 구름 위치 이탈', '16:9 이외의 해상도에서 구름 장식이 화면 밖으로 이동', '확인중', '', ''],
    ['BUG-003', '2026-02-11', 'Minor', '사운드', '효과음 지연 현상', '빠른 연사 시 발사 효과음이 밀리는 현상', '접수', '', ''],
];

sampleBugs.forEach(bug => {
    const row = bugSheet.addRow({
        id: bug[0], date: bug[1], severity: bug[2], category: bug[3],
        title: bug[4], repro: bug[5], status: bug[6], assignee: bug[7], resolved: bug[8],
    });
    styleBody(row);
    // 심각도 색상
    if (bug[2] === 'Critical') row.getCell(3).font = { ...BODY_FONT, color: { argb: 'FFD32F2F' }, bold: true };
    if (bug[2] === 'Major') row.getCell(3).font = { ...BODY_FONT, color: { argb: 'FFE65100' }, bold: true };
});

for (let i = 2; i <= sampleBugs.length + 1; i++) {
    bugSheet.getCell(`C${i}`).dataValidation = {
        type: 'list', allowBlank: true,
        formulae: ['"Critical,Major,Minor,Trivial"'],
    };
    bugSheet.getCell(`G${i}`).dataValidation = {
        type: 'list', allowBlank: true,
        formulae: ['"접수,확인중,수정중,수정완료,테스트완료,보류"'],
    };
}

// ============================================================
// Sheet 4: 테스트 요약 대시보드
// ============================================================
const dashSheet = workbook.addWorksheet('테스트 요약', {
    properties: { tabColor: { argb: 'FF9C27B0' } }
});

dashSheet.columns = [
    { header: '항목', key: 'item', width: 25 },
    { header: '값', key: 'value', width: 20 },
];

styleHeader(dashSheet.getRow(1));

const dashData = [
    ['프로젝트명', '또또의 모험 (The Adventure of Toto)'],
    ['버전', 'v0.1 Alpha'],
    ['테스트 기간', '2026.02.11 ~'],
    ['총 테스트 항목', `${funcItems.length + compatItems.length}개`],
    ['기능 테스트', `${funcItems.length}개`],
    ['호환성 테스트', `${compatItems.length}개`],
    ['등록된 버그', `${sampleBugs.length}건`],
    ['QA 담당', 'QA팀'],
    ['마지막 업데이트', '2026-02-11'],
];

dashData.forEach(d => {
    const row = dashSheet.addRow({ item: d[0], value: d[1] });
    styleBody(row);
    row.getCell(1).font = { ...BODY_FONT, bold: true };
});

// ============================================================
// 저장
// ============================================================
const outputPath = 'QA/또또의모험_QA체크리스트.xlsx';

import { mkdirSync, existsSync } from 'fs';
if (!existsSync('QA')) mkdirSync('QA', { recursive: true });

workbook.xlsx.writeFile(outputPath)
    .then(() => {
        console.log(`\n✅ QA 체크리스트 엑셀 생성 완료!`);
        console.log(`📁 저장 위치: ${outputPath}`);
        console.log(`📊 시트 구성:`);
        console.log(`   - 기능 테스트 (${funcItems.length}개 항목)`);
        console.log(`   - 호환성 테스트 (${compatItems.length}개 항목)`);
        console.log(`   - 버그 트래커 (샘플 ${sampleBugs.length}건)`);
        console.log(`   - 테스트 요약 대시보드`);
    })
    .catch(err => console.error('엑셀 생성 실패:', err));
