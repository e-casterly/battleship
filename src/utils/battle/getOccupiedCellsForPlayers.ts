import type { ShipItemPosition } from "@app-types/common.types.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import type {
  PlayerId,
  ShipCells,
  ShipsLayout,
} from "@app-types/game.types.ts";

export const getShipCells = (layout: ShipItemPosition[]): ShipCells => {
  const occupied: ShipCells = {};
  for (const ship of layout) {
    for (const pos of ship.positions) {
      occupied[coordsToCellId(pos)] = ship.id;
    }
  }
  return occupied;
};

export const getOccupiedCellsForPlayers = (
  playersIds: PlayerId[],
  layouts: ShipsLayout,
): Record<PlayerId, ShipCells> =>
  Object.fromEntries(playersIds.map((id) => [id, getShipCells(layouts[id])]));
