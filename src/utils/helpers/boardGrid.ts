import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import { getCellTitle } from "@utils/helpers/getCellTitle.ts";
import type { CellId } from "@app-types/common.types.ts";

export function gridCellsId(rows: number, cols: number): CellId[] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => coordsToCellId([r, c])),
  ).flat();
}

export function gridCells(rows: number, cols: number) {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      cellId: coordsToCellId([r, c]),
      title: getCellTitle([r, c]),
    })),
  ).flat();
}