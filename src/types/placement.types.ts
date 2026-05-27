import type { CellId, ShipId, ShipType } from "@app-types/common.types.ts";

export type PlacementCells = Record<CellId, ShipId | "space">; // used for collision detection
export type PreviewCells = Record<CellId, "ship" | "space">;

export type DragInfo = {
  isDraggable: boolean;
  shipId: ShipId | null;
  occupiedCells: PlacementCells;
  indexCell: number;
  shipVariant: ShipType | null;
  shipSize: number;
  cellSize: number;
};
