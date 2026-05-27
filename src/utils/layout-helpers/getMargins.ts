import type { BoardSize, Coord } from "@app-types/common.types.ts";

export const getMargins = (boardSize: BoardSize, points: Coord[]) => {
  if (points.length === 0) return [];
  const [rows, cols] = boardSize;

  let minR = Infinity,
    maxR = -Infinity,
    minC = Infinity,
    maxC = -Infinity;
  for (const [r, c] of points) {
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }

  const r0 = Math.max(0, minR - 1);
  const r1 = Math.min(rows - 1, maxR + 1);
  const c0 = Math.max(0, minC - 1);
  const c1 = Math.min(cols - 1, maxC + 1);

  const result: Coord[] = [];

  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const insideShipRect = r >= minR && r <= maxR && c >= minC && c <= maxC;
      if (!insideShipRect) {
        result.push([r, c]);
      }
    }
  }
  return result;
};
