import type { Coord } from "@app-types/common.types.ts";
import { buildShipCells } from "@utils/layout-helpers/buildShipCells.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import { getMargins } from "@utils/layout-helpers/getMargins.ts";

export function canPlaceShip(freeCoords: Set<string>, positions: Coord[]): boolean {
  return positions.every((p) => freeCoords.has(coordsToCellId(p)));
}

export function tryPlaceShipInDirection(
  boardSize: [number, number],
  freeCoords: Set<string>,
  startPoint: Coord,
  dir: number[],
  shipSize: number,
): { positions: Coord[]; margins: Coord[] } | null {
  const positions = buildShipCells(boardSize, startPoint, dir, shipSize);
  if (positions.length === 0 || !canPlaceShip(freeCoords, positions)) return null;

  const margins = getMargins(boardSize, positions);
  return { positions, margins };
}
