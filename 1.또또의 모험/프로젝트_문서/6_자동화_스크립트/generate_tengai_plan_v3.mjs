import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// 스타일 설정
const MASTER_OPTS = {
    titleProps: { x: 0.5, y: 0.3, w: 9, h: 1, fontSize: 32, bold: true, color: "003366", fontFace: "Malgun Gothic" },
    bodyProps: { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 18, color: "333333", fontFace: "Malgun Gothic" },
};

// 1. 표지
let slide = pptx.addSlide();
slide.background = { color: "F0F8FF" };
slide.addText("The Adventure of Toto", { x: 1, y: 2, w: '80%', fontSize: 48, bold: true, color: "003366", align: "center" });
slide.addText("PROJECT: TENGAI STYLE (Final)", { x: 1, y: 3, w: '80%', fontSize: 24, color: "FF5E5E", align: "center", bold: true });
slide.addText("종합 기획서 V3.0 (피드백 반영본)", { x: 1, y: 4, w: '80%', fontSize: 18, color: "666666", align: "center" });
slide.addText("Mabu Interactive 기획팀 & 리서치팀", { x: 1, y: 4.5, w: '80%', fontSize: 14, color: "999999", align: "center" });

// 2. 기획 의도 (텐가이 모티브 강화)
slide = pptx.addSlide();
slide.addText("1. 기획 의도: '텐가이'의 영혼 계승", MASTER_OPTS.titleProps);
slide.addText(
    "◈ 핵심 목표: '슈팅'과 '캐릭터 드라마'의 결합\n" +
    "   - 단순한 파괴의 재미를 넘어, 선택와 연출이 있는 슈팅 게임\n\n" +
    "◈ 차별화 포인트 (V3 업데이트)\n" +
    "   1. 분기 선택 (Branching): 플레이어의 선택에 따라 변화하는 전장\n" +
    "   2. 캐릭터 만담 (Dialogues): 스테이지 클리어 후 펼쳐지는 코믹 드라마\n" +
    "   3. 타격감 (Impact): '와스프 장군' 등 거대 보스의 부위 파괴 연출",
    MASTER_OPTS.bodyProps
);

// 3. 조작 및 시스템
slide = pptx.addSlide();
slide.addText("2. 조작 및 시스템 상세", MASTER_OPTS.titleProps);
slide.addText(
    "◈ 조작 체계 (3-Button Action)\n" +
    "   - [A] 샷: 연타 시 기본 공격, 누르고 있으면 '옵션'이 적을 추적\n" +
    "   - [A 해제] 차지 샷 (Charge): 모아쏘기로 강력한 '로얄 스팅어' 발사 (관통)\n" +
    "   - [B] 폭탄 (Bomb): '허니 스톰' - 위기 탈출용 전멸기\n\n" +
    "◈ 스코어링: '황금 코인' (Coin Mechanics)\n" +
    "   - 적 격파 시 금화 드랍 (회전 애니메이션)\n" +
    "   - 금화가 정면을 보며 '반짝'일 때 획득 시 최대 점수 (2000점) 획득\n" +
    "   - 타이밍을 맞추는 리듬감 있는 파밍 요소 추가",
    MASTER_OPTS.bodyProps
);

// 4. 스테이지 & 분기 (New)
slide = pptx.addSlide();
slide.addText("3. 스테이지 구성 & 분기 시스템", MASTER_OPTS.titleProps);
slide.addTable(
    [
        [{ text: "Stage", options: { fill: "003366", color: "FFFFFF", bold: true } }, { text: "Title", options: { fill: "003366", color: "FFFFFF", bold: true } }, { text: "Branch Option", options: { fill: "FF5E5E", color: "FFFFFF", bold: true } }],
        ["1", "매직 포레스트", "분기 없음 (튜토리얼 보스전)"],
        ["2", "고대 유적 입구", "[상단 루트] 구름 위 하늘성 (공중전 위주)\n[하단 루트] 지하 수로 (장애물 회피 위주)"],
        ["3", "메카 하이브", "선택한 루트에 따라 중간 보스 변경"],
        ["4", "코어 챔버", "최종 보스 '와스프 장군' (변신 패턴)"]
    ],
    { x: 0.5, y: 1.5, w: 9, rowH: 0.8, fontSize: 14, border: { pt: 1, color: "CCCCCC" } }
);

// 5. 스토리 & 연출 (New)
slide = pptx.addSlide();
slide.addText("4. 스토리텔링 & 만담 연출", MASTER_OPTS.titleProps);
slide.addText(
    "◈ '만담(Manzai)' 데모 시스템\n" +
    "   - 스테이지 클리어 시, 다음 스테이지로 넘어가기 전 짧은 컷신 재생\n" +
    "   - 또또(주인공)와 나비(라이벌)의 티키타카 대화\n" +
    "   - 예: '이봐 또또, 꿀은 내가 먼저 찾았어!' / '흥, 두고 보자!'\n\n" +
    "◈ 캐릭터 엔딩 (Ending)\n" +
    "   - 클리어 점수와 선택한 분기에 따라 '개그 엔딩' 또는 '진지 엔딩' 출력",
    MASTER_OPTS.bodyProps
);

// 파일 저장
pptx.writeFile({ fileName: "Toto_Adventure_Plan_v3_Tengai.pptx" })
    .then(fileName => {
        console.log(`PPT Created: ${fileName}`);
    })
    .catch(err => {
        console.error(err);
    });
