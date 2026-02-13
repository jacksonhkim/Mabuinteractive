
import ExcelJS from 'exceljs';

const filePath = "C:\\Users\\JACKSON\\Desktop\\앱 개발\\안티그래비티 테스크\\Company_Mabu\\ETC\\GK_2026년 협력사 리스트&요금표_한지연_260211.xlsx";

async function analyzeExcel() {
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(filePath);

        console.log(`[분석 보고서] 파일명: ${filePath.split('\\').pop()}`);

        workbook.eachSheet((worksheet, sheetId) => {
            console.log(`\n### 시트명: ${worksheet.name}`);

            // 헤더 찾기 (첫 번째 행 가정)
            const headers = [];
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell, colNumber) => {
                headers[colNumber] = cell.value;
            });
            console.log(`- 헤더: ${headers.filter(h => h).join(' | ')}`);

            // 데이터 요약 (최대 20개 행)
            console.log(`- 데이터 요약 (상위 20개):`);
            let count = 0;
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // 헤더 스킵
                if (count >= 20) return;

                const rowData = [];
                row.eachCell((cell, colNumber) => {
                    // 셀 값이 객체(수식 등)일 경우 result나 text 추출
                    let val = cell.value;
                    if (val && typeof val === 'object') {
                        val = val.result || val.text || JSON.stringify(val);
                    }
                    rowData.push(`${headers[colNumber] || 'Col' + colNumber}: ${val}`);
                });
                console.log(`  [Row ${rowNumber}] ${rowData.join(', ')}`);
                count++;
            });
            console.log(`  ... (총 ${worksheet.actualRowCount}행)`);
        });

    } catch (error) {
        console.error("엑셀 파일 읽기 실패:", error.message);
    }
}

analyzeExcel();
