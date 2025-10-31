import type { BoardSize, Coord } from "@utils/gameTypes.ts";
import { DIRS } from "@utils/constants.ts";

export const getStringCoordinate = (num: Coord): string =>
  `${num[0]},${num[1]}`;
export const getIntegerCoordinate = (s: string): Coord =>
  s.split(",").map(Number) as Coord;

export const titleOfCell = (num: Coord | string) => {
  const cell = typeof num === "string" ? getIntegerCoordinate(num) : num;
  return `${String.fromCharCode(65 + cell[0])}${cell[1] + 1}`;
};

export const shuffleDirs = (dirs: number[][] = DIRS): number[][] => {
  const arr = [...dirs];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const checkIsHorizontal = (points: Coord[]) =>
  points[0][0] === points[1][0];

export const getFreeCoordsSet = (boardSize: [number, number] = [10, 10]) => {
  const freeCoords = new Set<string>();
  for (let r = 0; r < boardSize[0]; r++) {
    for (let c = 0; c < boardSize[1]; c++) {
      freeCoords.add(getStringCoordinate([r, c]));
    }
  }
  return freeCoords;
};

export const isPointInsideOfBoard = (
  point: Coord,
  boardSize: [number, number] = [10, 10],
) => {
  return point.every((item, index) => item >= 0 && item < boardSize[index]);
};

export const getFreePointFromSet = (set: Set<string>) => {
  const freeIndex = Math.floor(Math.random() * set.size);
  let i = 0;
  for (const item of set) {
    if (i === freeIndex) return getIntegerCoordinate(item);
    i++;
  }
  return null;
};

export const getCoords = (
  boardSize: BoardSize,
  point: Coord,
  dir: number[],
  shipSize: number,
  indexCell: number = 0,
) => {
  let points: Coord[] = [point];
  const prePoints: Coord[] = [];
  const postPoints: Coord[] = [];
  for (let i = indexCell - 1; i >= 0; i--) {
    prePoints.push(
      point.map((item, index) => item - (i + 1) * dir[index]) as Coord,
    );
  }
  for (let i = 1; i < shipSize - indexCell; i++) {
    postPoints.push(point.map((item, index) => item + i * dir[index]) as Coord);
  }
  points = [...prePoints, ...points, ...postPoints];
  const isInsideOfBoard = points.every((pointItem) =>
    isPointInsideOfBoard(pointItem, boardSize),
  );
  if (!isInsideOfBoard) return [];
  return points;
};

export const getMargins = (boardSize: [number, number], points: Coord[]) => {
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

export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}
