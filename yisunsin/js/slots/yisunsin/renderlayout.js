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
