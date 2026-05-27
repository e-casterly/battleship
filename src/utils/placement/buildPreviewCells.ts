import type { ShipItemPosition } from "@app-types/common.types.ts";
import type { PreviewCells } from "@app-types/placement.types.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";

export const buildPreviewCells = (
  shipPosition: ShipItemPosition | null,
): PreviewCells => {
  const previewCells: PreviewCells = {};
  if (shipPosition) {
    for (const pos of shipPosition.positions) {
      previewCells[coordsToCellId(pos)] = "ship";
    }
    for (const pos of shipPosition.margins) {
      previewCells[coordsToCellId(pos)] = "space";
    }
  }
  return previewCells;
};
