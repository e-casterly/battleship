import type { ShipItemPosition } from "@app-types/common.types.ts";
import type { PlacementCells } from "@app-types/placement.types.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";

export const getOccupiedCells = (
  layout: ShipItemPosition[],
): PlacementCells => {
  const occupied: PlacementCells = {};
  for (const ship of layout) {
    for (const pos of ship.positions) {
      occupied[coordsToCellId(pos)] = ship.id;
    }
    for (const pos of ship.margins) {
      occupied[coordsToCellId(pos)] = "space";
    }
  }
  return occupied;
};