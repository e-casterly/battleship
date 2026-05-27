import type { CellId, Coord } from "@app-types/common.types.ts";

export const coordsToCellId = (num: Coord): CellId =>
  `${num[0]},${num[1]}`;

export const cellIdToCoords = (cellId: CellId): Coord =>
  cellId.split(",").map(Number) as Coord;
