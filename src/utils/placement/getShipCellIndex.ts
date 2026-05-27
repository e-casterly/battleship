import { cellIdToCoords } from "@utils/helpers/coordinateFormat.ts";
import type { CellId, ShipItemPosition } from "@app-types/common.types.ts";

export function getShipCellIndex(ship: ShipItemPosition, cellId: CellId) {
  const coordinate = cellIdToCoords(cellId);
  return ship.positions.findIndex(
    ([r, c]) => r === coordinate[0] && c === coordinate[1],
  );
}