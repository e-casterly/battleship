import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { BOARD_SIZE, FLEET_CONFIG } from "@utils/constants.ts";
import {
  getCoords,
  getIntegerCoordinate,
  getMargins,
  getStringCoordinate,
} from "@utils/helpers.ts";
import { getOccupiedCells } from "@utils/storeHelpers.ts";
import { generateShipPositions } from "@utils/generateShipPositions.ts";
import type {
  Coord,
  DragInfo,
  PreviewCells,
  ShipItemPosition,
  ShipType,
} from "@utils/gameTypes.ts";

interface PlacementState {
  direction: "h" | "v";
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
  previewShipPlacement: (coord: string) => void;
  confirmShipPlacement: (coord: string | null) => void;
  startDragFromPalette: (params: {
    shipId: string;
    variant: ShipType;
    index: number;
    x: number;
    y: number;
    cellSize: number;
  }) => void;
  startDragFromBoard: (params: {
    shipId: string;
    coord: string;
    x: number;
    y: number;
    cellSize: number;
  }) => void;
  setDragPos: (x: number, y: number) => void;
  resetDragInfo: () => void;
  switchDirection: () => void;
  setPreviewCells: (shipPosition: ShipItemPosition | null) => void;
}

type PlacementStore = PlacementState & PlacementActions;

const boardSize = BOARD_SIZE;
const fleetConfig = FLEET_CONFIG;

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

const computeShipPosition = (
  coord: string,
  dragInfo: DragInfo,
  direction: "h" | "v",
): ShipItemPosition | null => {
  const { shipVariant, indexCell, shipId, occupiedCells } = dragInfo;
  if (!shipVariant || !shipId) return null;

  const dir = direction === "h" ? [0, 1] : [1, 0];
  const points = getCoords(
    boardSize,
    getIntegerCoordinate(coord) as Coord,
    dir,
    fleetConfig[shipVariant].size,
    indexCell ?? 0,
  );

  if (points.length === 0) return null;

  for (const point of points) {
    if (occupiedCells[getStringCoordinate(point)] !== undefined) return null;
  }

  return {
    id: shipId,
    positions: points,
    margins: getMargins(boardSize, points),
    type: shipVariant,
  };
};

export const usePlacementStore = create<PlacementStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      direction: "h",
      layout: [],
      previewCells: {},
      dragPos: initialDragPos,
      dragInfo: { ...initialDragInfo },

      resetPlacementState: (layout) => {
        set(
          {
            direction: "h",
            layout,
            previewCells: {},
            dragPos: initialDragPos,
            dragInfo: { ...initialDragInfo },
          },
          false,
          "resetPlacementState",
        );
      },

      randomizeShipsLayout: () => {
        const layout = generateShipPositions(boardSize, fleetConfig);
        set({ layout }, false, "randomizeShipsLayout");
      },

      resetShipsLayout: () => {
        set({ layout: [] }, false, "resetShipsLayout");
      },

      removeShip: (shipId) => {
        const newLayout = get().layout.filter((s) => s.id !== shipId);
        set({ layout: newLayout }, false, "removeShip");
      },

      previewShipPlacement: (coord) => {
        const { dragInfo, direction } = get();
        const position = computeShipPosition(coord, dragInfo, direction);
        get().setPreviewCells(position);
      },

      confirmShipPlacement: (coord) => {
        get().setPreviewCells(null);
        if (!coord) return get().resetDragInfo();

        const { dragInfo, direction, layout: oldLayout } = get();
        const position = computeShipPosition(coord, dragInfo, direction);

        if (!position) return get().resetDragInfo();

        const newLayout = [...oldLayout.filter((s) => s.id !== position.id), position];

        set({ layout: newLayout }, false, "confirmShipPlacement");
        get().resetDragInfo();
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
              shipSize: fleetConfig[variant].size,
              cellSize,
            },
          },
          false,
          "startDragFromPalette",
        );
      },

      startDragFromBoard: ({ shipId, coord, x, y, cellSize }) => {
        const layout = get().layout;
        const ship = layout.find((s) => s.id === shipId);
        if (!ship) return;

        const integerCoord = getIntegerCoordinate(coord);
        const indexCell = ship.positions.findIndex(
          ([r, c]) => r === integerCoord[0] && c === integerCoord[1],
        );

        set(
          {
            dragPos: { x, y },
            dragInfo: {
              isDraggable: true,
              shipId,
              occupiedCells: getOccupiedCells(layout.filter((s) => s.id !== shipId)),
              shipVariant: ship.type,
              indexCell,
              shipSize: fleetConfig[ship.type].size,
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

      resetDragInfo: () => {
        set(
          { dragPos: initialDragPos, dragInfo: { ...initialDragInfo } },
          false,
          "resetDragInfo",
        );
      },

      switchDirection: () => {
        set(
          { direction: get().direction === "h" ? "v" : "h" },
          false,
          "switchDirection",
        );
      },

      setPreviewCells: (shipPosition) => {
        const previewCells: PreviewCells = {};
        if (shipPosition) {
          for (const pos of shipPosition.positions) {
            previewCells[getStringCoordinate(pos)] = "ship";
          }
          for (const pos of shipPosition.margins) {
            previewCells[getStringCoordinate(pos)] = "space";
          }
        }
        set({ previewCells }, false, "setPreviewCells");
      },
    })),
    { name: "PlacementStore" },
  ),
);
