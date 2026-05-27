import type { Coord } from "@app-types/common.types.ts";
import {
  cellIdToCoords,
} from "@utils/helpers/coordinateFormat.ts";
import { pickRandomPoint } from "@utils/layout-helpers/pickRandomPoint.ts";
import { pickFocusTarget } from "@utils/ai/pickFocusTarget.ts";

// Filters hunt coords to a diagonal stripe pattern with the given step.
// Any run of `step` consecutive cells in a row or column contains exactly
// one selected cell, so no ship of size >= step can be missed.
const toDiagonalPattern = (
  remainingCells: Set<string>,
  step: number,
): Set<string> => {
  const filtered = new Set<string>();
  for (const cell of remainingCells) {
    const [r, c] = cellIdToCoords(cell);
    if ((r + c) % step === 0) filtered.add(cell);
  }
  return filtered.size > 0 ? filtered : remainingCells;
};

export const pickAiTarget = (
  remainingCells: Set<string>,
  focusCoords: Coord[],
  minShipSize: number,
) => {
  if (focusCoords.length) {
    const target = pickFocusTarget(remainingCells, focusCoords);
    if (target) return target;
  }
  return pickRandomPoint(toDiagonalPattern(remainingCells, minShipSize));
};