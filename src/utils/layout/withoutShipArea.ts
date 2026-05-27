import type { Coord } from "@app-types/common.types.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";

export function withoutShipArea(
  freeCoords: Set<string>,
  positions: Coord[],
  margins: Coord[],
): Set<string> {
  const updated = new Set(freeCoords);
  for (const p of [...positions, ...margins]) {
    updated.delete(coordsToCellId(p));
  }
  return updated;
}