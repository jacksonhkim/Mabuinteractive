import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();

// 공통 스타일
const MASTER_OPTS = {
    titleProps: { x: 0.5, y: 0.3, w: 9, h: 1, fontSize: 32, bold: true, color: "003366", fontFace: "Malgun Gothic" },
    bodyProps: { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 18, color: "333333", fontFace: "Malgun Gothic" },
};

// 1. 표지
let slide = pptx.addSlide();
slide.background = { color: "F0F8FF" };
slide.addText("The Adventure of Toto", { x: 1, y: 2, w: '80%', fontSize: 48, bold: true, color: "003366", align: "center" });
slide.addText("PROJECT: RE-BOOT (Tengai Style)", { x: 1, y: 3, w: '80%', fontSize: 24, color: "FF5E5E", align: "center", bold: true });
slide.addText("종합 기획서 V2.0", { x: 1, y: 4, w: '80%', fontSize: 18, color: "666666", align: "center" });
slide.addText("Mabu Interactive 기획팀", { x: 1, y: 4.5, w: '80%', fontSize: 14, color: "999999", align: "center" });

// 2. 기획 의도 & 레퍼런스
slide = pptx.addSlide();
slide.addText("1. 기획 의도 및 레퍼런스", MASTER_OPTS.titleProps);
slide.addText(
    "◈ 핵심 모티브: '텐가이 (Sengoku Blade)'\n" +
    "   - 단순 비행 슈팅을 넘어선 '캐릭터 액션 슈팅' 지향\n" +
    "   - 횡스크롤(Side-scrolling) 뷰의 장점을 살린 다이나믹한 연출\n\n" +
    "◈ 차별화 포인트 (Toto's Unique Selling Point)\n" +
    "   - 귀여운 픽셀 아트(V5)와 하드코어한 탄막 패턴의 조화 ('매운맛 꿀벌')\n" +
    "   - '차지 샷(Charge Shot)' 시스템을 통한 한 방 역전 쾌감\n" +
    "   - 자연물(곤충)과 기계(Mecha)가 결합된 독창적인 스팀펑크 세계관",
    MASTER_OPTS.bodyProps
);

// 3. 조작 방식 (Control Scheme)
slide = pptx.addSlide();
slide.addText("2. 조작 방식 (Control Mechanics)", MASTER_OPTS.titleProps);
slide.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.4, w: 9.0, h: 3.8, fill: "EFEFEF" });
slide.addText(
    "◈ 8방향 자유 이동 (Joystick / Arrow Keys)\n" +
    "   - 화면 전체를 아우르는 고속 이동\n\n" +
    "◈ 공격 시스템 (3-Button Action)\n" +
    "   1. [A] 기본 사격 (Shot): 연타 시 기관총처럼 발사. (파워업 아이템으로 3단계 강화)\n" +
    "   2. [A 길게 누르기] 차지 샷 (Charge Shot): '로얄 스팅어(Royal Stinger)' 발동.\n" +
    "      -> 캐릭터가 잠시 멈추고 거대한 에너지를 모아 전방을 관통하는 벌침 발사.\n" +
    "   3. [B] 폭탄 (Bomb): '허니 스톰(Honey Storm)'\n" +
    "      -> 위급 상황 회피기. 화면 전체에 꿀 폭풍을 일으켜 적 탄환 소거 및 데미지.",
    { x: 0.6, y: 1.5, w: 8.8, h: 3.6, fontSize: 16, color: "333333" }
);

// 4. 캐릭터 상세 (Toto & Options)
slide = pptx.addSlide();
slide.addText("3. 캐릭터 시스템 (Character & Options)", MASTER_OPTS.titleProps);
slide.addText(
    "◈ 주인공: 또또 (Toto)\n" +
    "   - 타입: 밸런스형 전천후 파이터\n" +
    "   - 특징: 이동 속도 빠름, 피격 판정이 작음 (가운데 점 하나)\n\n" +
    "◈ 보조 무기: '옵션' (Pet System)\n" +
    "   - 이름: 반딧불이 드론 (Firefly Drone)\n" +
    "   - 기능: 또또 주변을 공전하며 자동으로 적을 추적하여 레이저 발사.\n" +
    "   - 텐가이의 '펫' 시스템 처럼 주인공의 화력을 보조하고 특정 궤도로 움직임.\n\n" +
    "◈ 파워업 (Power-up)\n" +
    "   - P 아이템 획득 시: 샷 줄기 증가 -> 옵션 추가 -> 샷 관통력 증가",
    MASTER_OPTS.bodyProps
);

// 5. 보스 디자인 (Boss Design)
slide = pptx.addSlide();
slide.addText("4. 보스 디자인: 와스프 장군 (Mecha-Wasp)", MASTER_OPTS.titleProps);
slide.addText(
    "◈ 컨셉: 생체 병기 (Cyborg Insect)\n" +
    "   - 숲을 지배하려는 말벌 군단의 리더. 반은 곤충, 반은 강철.\n\n" +
    "◈ 페이즈 (Phase) 구성\n" +
    "   [Phase 1] 고속 비행 모드\n" +
    "     - 화면 뒤쪽에서 나타나 유도 미사일과 기총 소사.\n" +
    "   [Phase 2] 변신 (Transformation)\n" +
    "     - '인간형 메카' 형태로 변형. (텐가이 보스들의 특징)\n" +
    "     - 거대한 레이저 검과 탄막 패턴 구사.\n\n" +
    "◈ 격파 연출\n" +
    "   - 장갑이 파괴되며 내부의 기계 장치가 노출되고, 대폭발과 함께 아이템 대량 드랍.",
    MASTER_OPTS.bodyProps
);

// 6. 스테이지 구성 (Stage Roadmap)
slide = pptx.addSlide();
slide.addText("5. 스테이지 로드맵 (Roadmap)", MASTER_OPTS.titleProps);
slide.addTable(
    [
        [{ text: "Stage", options: { fill: "003366", color: "FFFFFF", bold: true } }, { text: "Title", options: { fill: "003366", color: "FFFFFF", bold: true } }, { text: "Concept", options: { fill: "003366", color: "FFFFFF", bold: true } }],
        ["1", "매직 포레스트", "평화롭지만 위험한 숲. 기본적인 적과 장애물 등장."],
        ["2", "스카이 루인 (Sky Ruins)", "구름 위의 고대 유적. 고속 스크롤 강제 진행 구간."],
        ["3", "메카 하이브 (Mecha Hive)", "적의 본거지. 기계화된 벌집 내부. 좁은 통로와 함정."],
        ["FINAL", "코어 챔버", "최종 보스와의 결전."]
    ],
    { x: 0.5, y: 1.5, w: 9, rowH: 0.8, fontSize: 14, border: { pt: 1, color: "CCCCCC" } }
);

// 7. 일정 계획
slide = pptx.addSlide();
slide.addText("6. 개발 일정 (Timeline)", MASTER_OPTS.titleProps);
slide.addText(
    "1주차: 차지 샷 및 폭탄 시스템 구현 (시스템 코어)\n" +
    "2주차: 스테이지 1 리뉴얼 및 적 패턴 다양화\n" +
    "3주차: 보스 '와스프 장군' AI 및 변신 애니메이션 구현 (V5 픽셀 아트)\n" +
    "4주차: 사운드 믹싱 및 최종 밸런스 테스트 (QA)",
    MASTER_OPTS.bodyProps
);

// 파일 저장
pptx.writeFile({ fileName: "Toto_Adventure_Plan_v2.pptx" })
    .then(fileName => {
        console.log(`PPT Created: ${fileName}`);
    })
    .catch(err => {
        console.error(err);
    });
