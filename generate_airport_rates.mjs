
import ExcelJS from 'exceljs';
import path from 'path';

const outputDir = "C:\\Users\\JACKSON\\Desktop\\앱 개발\\안티그래비티 테스크\\Company_Mabu\\사업";
const fileName = "인천공항_출발_전국_편도요금표_2026.xlsx";
const targetPath = path.join(outputDir, fileName);

async function createRatesExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('편도요금표');

    // 1. 헤더 스타일 및 설정
    sheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: '권역', key: 'region', width: 12 },
        { header: '주요 도시', key: 'city', width: 15 },
        { header: '기준 거리(km)', key: 'dist', width: 15 },
        { header: '협력사 공급단가(원)', key: 'cost', width: 22 },
        { header: '최종 예약가(원)', key: 'price', width: 22 },
        { header: '회사 수익(원)', key: 'profit', width: 20 }
    ];

    // 2. 상단 마진 시스템 (B3:C3에 마진율 설정)
    sheet.insertRow(1, ['인천공항 출발 전국 편도 요금 체계 (2026)', '', '', '', '', '', '']);
    sheet.insertRow(2, ['설정 마진율', 0.15, '', '', '', '', '']); // 15% 마진 기본값
    sheet.insertRow(3, []); // 공백

    // 머지 및 스타일
    sheet.mergeCells('A1:G1');
    const titleCell = sheet.getCell('A1');
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    const marginLabel = sheet.getCell('A2');
    marginLabel.font = { bold: true };
    marginLabel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1F5FE' } };

    const marginValue = sheet.getCell('B2');
    marginValue.numFmt = '0%';
    marginValue.font = { bold: true, color: { argb: 'FFD32F2F' } };

    // 4. 전국 주요 도시 데이터 셋업 (임시 기준값)
    const data = [
        ['수도권', '서울 전역', 60, 75000],
        ['수도권', '인천(시내)', 30, 45000],
        ['수도권', '수원/용인', 80, 95000],
        ['강원권', '춘천', 130, 210000],
        ['강원권', '강릉', 240, 320000],
        ['충청권', '대전', 180, 240000],
        ['충청권', '천안', 120, 160000],
        ['호남권', '광주', 310, 400000],
        ['호남권', '전주', 230, 310000],
        ['영남권', '부산', 410, 520000],
        ['영남권', '대구', 340, 440000],
        ['영남권', '울산', 390, 490000],
    ];

    // 헤더 행 위치 (A4)
    const headerRow = sheet.getRow(4);
    headerRow.values = ['No', '권역', '주요 도시', '기준 거리(km)', '협력사 공급단가(원)', '최종 예약가(원)', '회사 수익(원)'];
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

    // 수식 입력 루프
    data.forEach((item, idx) => {
        const rowIndex = idx + 5;
        const row = sheet.getRow(rowIndex);

        row.getCell(1).value = idx + 1; // No
        row.getCell(2).value = item[0]; // 권역
        row.getCell(3).value = item[1]; // 도시
        row.getCell(4).value = item[2]; // 거리
        row.getCell(5).value = item[3]; // 공급단가

        // 수식: [최종 예약가] = 공급단가 * (1 + 마진율) -> $B$2 절대 참조
        row.getCell(6).value = { formula: `E${rowIndex}*(1+$B$2)` };

        // 수식: [회사 수익] = 최종 예약가 - 공급단가
        row.getCell(7).value = { formula: `F${rowIndex}-E${rowIndex}` };

        // 서식 (천단위 구분)
        row.getCell(5).numFmt = '#,##0';
        row.getCell(6).numFmt = '#,##0';
        row.getCell(7).numFmt = '#,##0';
    });

    // 테두리 설정
    sheet.eachRow((row, rowNum) => {
        if (rowNum >= 4) {
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        }
    });

    try {
        await workbook.xlsx.writeFile(targetPath);
        console.log(`[문서 제작 완료] 엑셀 파일이 저장되었습니다: ${targetPath}`);
    } catch (err) {
        console.error("파일 저장 중 오류 발생:", err);
    }
}

createRatesExcel();
