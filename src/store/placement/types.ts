import type { DragInfo, PreviewCells } from "@app-types/placement.types.ts";
import type {
  CellId,
  Orientation,
  ShipId,
  ShipItemPosition,
  ShipType,
} from "@app-types/common.types.ts";

interface PlacementState {
  direction: Orientation;
  layout: ShipItemPosition[];
  previewCells: PreviewCells;
  dragPos: { x: number; y: number };
  dragInfo: DragInfo;
}

interface PlacementActions {
  resetPlacementState: (layout: ShipItemPosition[]) => void;
  randomizeShipsLayout: () => void;
  resetShipsLayout: () => void;
  removeShip: (shipId: string) => void;
  previewShipPlacement: (cellId: CellId) => void;
  confirmShipPlacement: (cellId: CellId | null) => void;
  startDragFromPalette: (params: {
    shipId: ShipId;
    variant: ShipType;
    index: number;
    x: number;
    y: number;
    cellSize: number;
  }) => void;
  startDragFromBoard: (params: {
    shipId: ShipId;
    cellId: CellId;
    x: number;
    y: number;
    cellSize: number;
  }) => void;
  setDragPos: (x: number, y: number) => void;
  switchDirection: () => void;
}

export type Store = PlacementState & PlacementActions;