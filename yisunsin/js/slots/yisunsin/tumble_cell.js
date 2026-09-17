export function tumbleCell(tumble, c, r, frac, rows) {
  if (!tumble) return null;

  if (tumble.phase === 'handoff') {
    const s = tumble.shift[c];
    const k = Math.round(s + frac);
    const src = r - k;
    if (src < 0 || src >= rows) return null;
    return { code: tumble.grid[c][src], dy: s + frac - k, scale: 1 };
  }
  if (r < 0 || r >= rows) return null;
  const code = tumble.grid[c][r];

  const dy = tumble.phase === 'drop' && tumble.fall ? -(1 - tumble.u) * tumble.fall[c][r] : 0;

  const broken = tumble.phase === 'break' && tumble.dead && tumble.dead.has(`${c},${r}`);
  return { code, dy, scale: 1, broken };
}
