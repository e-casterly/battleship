import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import type { BoardSize } from "@app-types/common.types.ts";

export const getRemainingCells = (boardSize: BoardSize = [10, 10]) => {
  const remainingCells = new Set<string>();
  for (let r = 0; r < boardSize[0]; r++) {
    for (let c = 0; c < boardSize[1]; c++) {
      remainingCells.add(coordsToCellId([r, c]));
    }
  }
  return remainingCells;
};
