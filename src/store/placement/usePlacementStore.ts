import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { BOARD_SIZE, FLEET_CONFIG } from "@utils/constants.ts";
import type { Store } from "@store/placement/types.ts";
import { buildPreviewCells } from "@utils/placement/buildPreviewCells.ts";
import { computeShipPosition } from "@utils/placement/computeShipPosition.ts";
import type { DragInfo, PreviewCells } from "@app-types/placement.types.ts";
import { getOccupiedCells } from "@utils/placement/getOccupiedCells.ts";
import { getShipCellIndex } from "@utils/placement/getShipCellIndex.ts";
import { generateFleetLayout } from "@utils/layout/generateFleetLayout.ts";

const initialDragInfo: DragInfo = {
  isDraggable: false,
  shipId: null,
  occupiedCells: {},
  indexCell: 0,
  shipVariant: null,
  shipSize: 0,
  cellSize: 0,
};

const initialDragPos = { x: 0, y: 0 };

const getResetDragState = () => ({
  dragPos: initialDragPos,
  dragInfo: { ...initialDragInfo },
  previewCells: {} as PreviewCells,
});

export const usePlacementStore = create<Store>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      direction: "h",
      layout: [],
      previewCells: {},
      dragPos: initialDragPos,
      dragInfo: { ...initialDragInfo },

      resetPlacementState: (layout) => {
        set(
          { direction: "h", layout, ...getResetDragState() },
          false,
          "resetPlacementState",
        );
      },

      randomizeShipsLayout: () => {
        const layout = generateFleetLayout(BOARD_SIZE, FLEET_CONFIG);
        set({ layout }, false, "randomizeShipsLayout");
      },

      resetShipsLayout: () => {
        set({ layout: [] }, false, "resetShipsLayout");
      },

      removeShip: (shipId) => {
        const newLayout = get().layout.filter((s) => s.id !== shipId);
        set({ layout: newLayout }, false, "removeShip");
      },

      previewShipPlacement: (cellId) => {
        const { dragInfo, direction } = get();
        const position = computeShipPosition(cellId, dragInfo, direction);
        set(
          { previewCells: buildPreviewCells(position) },
          false,
          "previewShipPlacement",
        );
      },

      confirmShipPlacement: (cellId) => {
        if (!cellId) return set(getResetDragState(), false, "resetDrag");

        const { dragInfo, direction, layout: oldLayout } = get();
        const position = computeShipPosition(cellId, dragInfo, direction);

        if (!position) return set(getResetDragState(), false, "resetDrag");

        const newLayout = [
          ...oldLayout.filter((s) => s.id !== position.id),
          position,
        ];
        set(
          { layout: newLayout, ...getResetDragState() },
          false,
          "confirmShipPlacement",
        );
      },

      startDragFromPalette: ({ shipId, variant, index, x, y, cellSize }) => {
        set(
          {
            dragPos: { x, y },
            dragInfo: {
              isDraggable: true,
              shipId,
              occupiedCells: getOccupiedCells(get().layout),
              shipVariant: variant,
              indexCell: index,
              shipSize: FLEET_CONFIG[variant].size,
              cellSize,
            },
          },
          false,
          "startDragFromPalette",
        );
      },

      startDragFromBoard: ({ shipId, cellId, x, y, cellSize }) => {
        const layout = get().layout;
        const ship = layout.find((s) => s.id === shipId);
        if (!ship) return;

        set(
          {
            dragPos: { x, y },
            dragInfo: {
              isDraggable: true,
              shipId,
              occupiedCells: getOccupiedCells(
                layout.filter((s) => s.id !== shipId),
              ),
              shipVariant: ship.type,
              indexCell: getShipCellIndex(ship, cellId),
              shipSize: FLEET_CONFIG[ship.type].size,
              cellSize,
            },
          },
          false,
          "startDragFromBoard",
        );
      },

      setDragPos: (x, y) => {
        set({ dragPos: { x, y } }, false, "setDragPos");
      },

      switchDirection: () => {
        set(
          { direction: get().direction === "h" ? "v" : "h" },
          false,
          "switchDirection",
        );
      },
    })),
    { name: "PlacementStore" },
  ),
);
