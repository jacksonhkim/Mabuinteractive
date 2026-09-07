/**
 * renderlayout.js — 릴 격자 논리 좌표
 *
 * 🔴 칸은 **정사각**이다. WEB·모바일이 같은 872×664 를 쓴다.
 *    예전에는 모바일만 칸 폭을 2.4배로 넓혔는데(폰 가로 화면의 남는 폭을
 *    칸 사이 여백으로 메우려던 것), 심볼은 칸 **높이** 기준이라 함께 커지지
 *    않아 심볼이 칸 폭의 36.7% 만 차지하고 나머지가 빈칸으로 남았다.
 *    남는 가로는 이제 프레임 기둥과 좌우 패널이 가져간다 (UI기획서 §16).
 */
export function resolveRenderLayout(base, cols, rows) {
  const cell = base.cell;

  return {
    cellWidth: cell,
    cellHeight: cell,
    pitch: cell + base.cellGap,
    width: cols * cell + (cols - 1) * base.reelGap + base.padding * 2,
    height: rows * cell + (rows - 1) * base.cellGap,
    symbolSize: cell * base.symbolScale,
  };
}
