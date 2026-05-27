import type { Coord } from "@app-types/common.types.ts";

export const isPointInsideOfBoard = (
  point: Coord,
  boardSize: [number, number] = [10, 10],
) => {
  return point.every((item, index) => item >= 0 && item < boardSize[index]);
};
