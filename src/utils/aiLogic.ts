import type { Coord } from "@utils/gameTypes.ts";
import {
  checkIsHorizontal,
  getFreePointFromSet,
  getIntegerCoordinate,
  getStringCoordinate,
  isPointInsideOfBoard,
  shuffleDirs,
} from "@utils/helpers.ts";
import { DIRS, HORIZONTAL_DIRS, VERTICAL_DIRS } from "@utils/constants.ts";

const getDirections = (coords: Coord[]) => {
  if (coords.length > 1) {
    const isHorizontal = checkIsHorizontal(coords);
    return isHorizontal ? HORIZONTAL_DIRS : VERTICAL_DIRS;
  }
  return [...DIRS];
};

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

// Filters hunt coords to a diagonal stripe pattern with the given step.
// Any run of `step` consecutive cells in a row or column contains exactly
// one selected cell, so no ship of size >= step can be missed.
const getHuntCoords = (remainingCoords: Set<string>, step: number): Set<string> => {
  const filtered = new Set<string>();
  for (const coord of remainingCoords) {
    const [r, c] = getIntegerCoordinate(coord);
    if ((r + c) % step === 0) filtered.add(coord);
  }
  return filtered.size > 0 ? filtered : remainingCoords;
};

export const getNextPoint = (
  remainingCoords: Set<string>,
  focusCoords: Coord[],
  minShipSize: number,
) => {
  if (focusCoords.length) {
    const dirs = getDirections(focusCoords);
    const shuffledDirs = shuffleDirs(dirs);
    const sideCoords: Coord[] = getSidePoints(focusCoords);
    let newPoint: Coord;
    for (const dir of shuffledDirs) {
      for (const sidePoint of sideCoords) {
        newPoint = sidePoint.map((item, index) => item + dir[index]) as Coord;
        const isInside = isPointInsideOfBoard(newPoint);
        const isFree = remainingCoords.has(getStringCoordinate(newPoint));
        if (isInside && isFree) {
          return newPoint;
        }
      }
    }
  }
  return getFreePointFromSet(getHuntCoords(remainingCoords, minShipSize));
};
