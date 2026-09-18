const FEATURES = [
  {
    id: 'wild',
    code: 's1_wild',
    name: '장군 (WILD)',
    how: '다른 심볼을 대신해 줄을 잇는다. 다만 함대·보물상자·난중일기는 대신하지 못한다',
  },
  {
    id: 'tumble',
    code: null,
    name: '연환격',
    how: '당첨된 칸이 부서지고 위 칸이 내려와 다시 판정한다. '
      + '이어질 때마다 배수가 오르고, 끝까지 이으면 해전·프리스핀·보너스 게임 가운데 '
      + '하나가 반드시 열린다',
  },
  {
    id: 'freespin',
    code: 's5_free',
    name: '프리스핀',
    how: '난중일기 3개 이상으로 열린다. 시작 전에 회수와 배수의 조합을 고를 수 있고, '
      + '진행 중 다시 모으면 회수가 더해진다',
  },
  {
    id: 'seabattle',
    code: 's2_scatter',
    name: '해전',
    how: '함대 3개 이상으로 울돌목에 나아간다. 제한 시간 안에 왜선을 격침한 만큼 '
      + '전공이 쌓이고, 전공은 크레딧으로 환산된다',
  },
  {
    id: 'legendary',
    code: 's3_bonus',

    name: '보너스 게임',
    how: '보물상자 3개 이상으로 열린다. 왼쪽 열부터 장군이 자리를 넓혀 가며, '
      + '자리 잡은 장군은 라운드가 끝날 때까지 남는다',
  },
  {
    id: 'jackpot',
    code: 'h2_geobukseon',
    name: '잭팟',
    how: '거북선이 연달아 서면 그동안 쌓인 잭팟을 통째로 가져간다',
  },
];

export function buildInfoPlan({ paytable, symbols }) {
  const byCode = new Map((symbols.reelSymbols || []).map((s) => [s.code, s]));

  const features = FEATURES.map((f) => {
    const s = f.code ? byCode.get(f.code) : null;
    return {
      id: f.id,
      name: f.name,
      how: f.how,
      code: f.code,

      asset: s ? s.asset : null,
    };
  });

  return {
    pages: [
      {
        id: 'paylines',
        title: `페이라인 ${paytable.lines}줄`,
        note: '왼쪽 릴부터 이어질 때 성립한다',
        lines: paytable.paylines || [],
        gridReels: paytable.reels,
        gridRows: paytable.rows,
      },
      {
        id: 'features',
        title: '기능',
        note: '심볼이 모이면 열린다',
        rows: features,
      },
    ],
  };
}
