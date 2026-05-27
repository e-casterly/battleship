import type { Coord } from "@app-types/common.types.ts";
import { shuffleDirs } from "@utils/layout-helpers/shuffleDirs.ts";
import { isPointInsideOfBoard } from "@utils/layout-helpers/isPointInsideOfBoard.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import { DIRS, HORIZONTAL_DIRS, VERTICAL_DIRS } from "@utils/constants.ts";

const checkIsHorizontal = (points: Coord[]) =>
  points.length >= 2 && points.every((p) => p[0] === points[0][0]);

const getSidePoints = (coords: Coord[]) => {
  if (coords.length > 1) {
    const isHorizontal = checkIsHorizontal(coords);
    const sortedCoords = isHorizontal
      ? [...coords].sort((a, b) => a[1] - b[1])
      : [...coords].sort((a, b) => a[0] - b[0]);
    return [sortedCoords[0], sortedCoords[sortedCoords.length - 1]];
  }
  return coords;
};

const getDirections = (coords: Coord[]) => {
  if (coords.length > 1) {
    const isHorizontal = checkIsHorizontal(coords);
    return isHorizontal ? HORIZONTAL_DIRS : VERTICAL_DIRS;
  }
  return [...DIRS];
};

export const pickFocusTarget = (
  remainingCells: Set<string>,
  focusCoords: Coord[],
): Coord | null => {
  const dirs = shuffleDirs(getDirections(focusCoords));
  const sideCoords = getSidePoints(focusCoords);

  for (const dir of dirs) {
    for (const sidePoint of sideCoords) {
      const candidate = sidePoint.map((v, i) => v + dir[i]) as Coord;
      if (
        isPointInsideOfBoard(candidate) &&
        remainingCells.has(coordsToCellId(candidate))
      ) {
        return candidate;
      }
    }
  }
  return null;
};