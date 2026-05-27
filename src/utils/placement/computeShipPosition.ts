import { buildShipCells } from "@utils/layout-helpers/buildShipCells.ts";
import { BOARD_SIZE, FLEET_CONFIG } from "@utils/constants.ts";
import { getMargins } from "@utils/layout-helpers/getMargins.ts";
import type { DragInfo } from "@app-types/placement.types.ts";
import type {
  CellId,
  Orientation,
  ShipItemPosition,
  ShipType,
} from "@app-types/common.types.ts";
import {
  cellIdToCoords,
  coordsToCellId,
} from "@utils/helpers/coordinateFormat.ts";

export const computeShipPosition = (
  cellId: CellId,
  dragInfo: DragInfo,
  direction: Orientation,
): ShipItemPosition | null => {
  const { shipVariant, indexCell, shipId, occupiedCells } = dragInfo;
  if (!shipVariant || !shipId) return null;

  const dir = direction === "h" ? [0, 1] : [1, 0];
  const points = buildShipCells(
    BOARD_SIZE,
    cellIdToCoords(cellId),
    dir,
    FLEET_CONFIG[shipVariant as ShipType].size,
    indexCell,
  );

  if (points.length === 0) return null;

  for (const point of points) {
    if (occupiedCells[coordsToCellId(point)] !== undefined) return null;
  }

  return {
    id: shipId,
    positions: points,
    margins: getMargins(BOARD_SIZE, points),
    type: shipVariant,
  };
};
