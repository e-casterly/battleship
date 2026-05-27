import { isPointInsideOfBoard } from "@utils/layout-helpers/isPointInsideOfBoard.ts";
import type { BoardSize, Coord } from "@app-types/common.types.ts";

export const buildShipCells = (
  boardSize: BoardSize,
  startPoint: Coord,
  dir: number[],
  shipSize: number,
  indexCell: number = 0,
) => {
  let points: Coord[] = [startPoint];
  const prePoints: Coord[] = [];
  const postPoints: Coord[] = [];
  for (let i = indexCell - 1; i >= 0; i--) {
    prePoints.push(
      startPoint.map((item, index) => item - (i + 1) * dir[index]) as Coord,
    );
  }
  for (let i = 1; i < shipSize - indexCell; i++) {
    postPoints.push(
      startPoint.map((item, index) => item + i * dir[index]) as Coord,
    );
  }
  points = [...prePoints, ...points, ...postPoints];
  const isInsideOfBoard = points.every((pointItem) =>
    isPointInsideOfBoard(pointItem, boardSize),
  );
  if (!isInsideOfBoard) return [];
  return points;
};
