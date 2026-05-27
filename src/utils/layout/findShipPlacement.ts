import { pickRandomPoint } from "@utils/layout-helpers/pickRandomPoint.ts";
import { shuffleDirs } from "@utils/layout-helpers/shuffleDirs.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import { tryPlaceShipInDirection } from "@utils/layout/tryPlaceShipInDirection.ts";
import type { Coord } from "@app-types/common.types.ts";

export function findShipPlacement(
  boardSize: [number, number],
  shipSize: number,
  freeCells: Set<string>,
): { positions: Coord[]; margins: Coord[] } | null {
  const triedPoints = new Set(freeCells);

  while (triedPoints.size > 0) {
    const startPoint = pickRandomPoint(triedPoints);
    if (!startPoint) return null;

    for (const dir of shuffleDirs()) {
      const result = tryPlaceShipInDirection(boardSize, freeCells, startPoint, dir, shipSize);
      if (result) return result;
    }

    triedPoints.delete(coordsToCellId(startPoint));
  }

  return null;
}
