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
  OccupiedCells,
  OccupiedCellsPlacementPreview,
  ShipItemPosition,
  ShipType,
} from "@utils/gameTypes.ts";

interface PlacementState {
  direction: "h" | "v";
  layout: ShipItemPosition[];
  occupiedCells: OccupiedCells;
  occupiedCellsPlacementPreview: OccupiedCellsPlacementPreview;
  dragInfo: DragInfo;
}

interface PlacementActions {
  resetPlacementState: (layout: ShipItemPosition[]) => void;
  randomizeShipsLayout: () => void;
  customizeShipsLayout: () => void;
  removeShip: (shipId: string) => void;
  shipPlacement: (coord: string | null, isPreview?: boolean) => void;
  onStartDragging: (params: {
    variant: ShipType | undefined;
    index: number | undefined;
    shipId: string;
    coord: string;
    x: number;
    y: number;
    cellSize: number;
  }) => void;
  resetDragInfo: () => void;
  updateDragInfo: (info: Partial<DragInfo>) => void;
  switchDirection: () => void;
  setPreviewCells: (shipPosition: ShipItemPosition | null) => void;
}

type PlacementStore = PlacementState & PlacementActions;

const boardSize = BOARD_SIZE;
const fleetConfig = FLEET_CONFIG;

const initialDragInfo: DragInfo = {
  isDraggable: false,
  pos: { x: 0, y: 0 },
  shipId: null,
  occupiedCells: {},
  startPoint: null,
  indexCell: 0,
  shipVariant: null,
  shipSize: 0,
  cellSize: 0,
};

export const usePlacementStore = create<PlacementStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      direction: "h",
      layout: [],
      occupiedCells: {},
      occupiedCellsPlacementPreview: {},
      dragInfo: { ...initialDragInfo },

      resetPlacementState: (layout) => {
        set(
          {
            direction: "h",
            layout,
            occupiedCells: getOccupiedCells(layout),
            occupiedCellsPlacementPreview: {},
            dragInfo: { ...initialDragInfo },
          },
          false,
          "resetPlacementState",
        );
      },

      randomizeShipsLayout: () => {
        const layout = generateShipPositions(boardSize, fleetConfig);
        set(
          {
            layout,
            occupiedCells: getOccupiedCells(layout),
          },
          false,
          "randomizeShipsLayout",
        );
      },

      customizeShipsLayout: () => {
        set(
          { layout: [], occupiedCells: {} },
          false,
          "customizeShipsLayout",
        );
      },

      removeShip: (shipId) => {
        const newLayout = get().layout.filter((s) => s.id !== shipId);
        set(
          {
            layout: newLayout,
            occupiedCells: getOccupiedCells(newLayout),
          },
          false,
          "removeShip",
        );
      },

      shipPlacement: (coord, isPreview = false) => {
        if (!isPreview) get().setPreviewCells(null);

        const { direction } = get();
        const { shipVariant, indexCell, shipId, occupiedCells } = get().dragInfo;
        if (!coord || !shipVariant) {
          return get().resetDragInfo();
        }

        const integerCoord: Coord = getIntegerCoordinate(coord);
        const dir = direction === "h" ? [0, 1] : [1, 0];
        const shipSize = fleetConfig[shipVariant].size;

        const points = getCoords(
          boardSize,
          integerCoord,
          dir,
          shipSize,
          indexCell !== null ? indexCell : 0,
        );

        if (points.length === 0 && !isPreview) return get().resetDragInfo();
        if (points.length === 0 && isPreview) return;

        const oldLayout = get().layout;
        const layoutIdx =
          shipId !== null ? oldLayout.findIndex((s) => s.id === shipId) : -1;
        const isPlacedShip = layoutIdx >= 0;

        for (const point of points) {
          const stringPoint = getStringCoordinate(point);
          if (occupiedCells[stringPoint] !== undefined) {
            if (!isPreview) return get().resetDragInfo();
            return;
          }
        }

        const margins = getMargins(boardSize, points);
        const newId = isPlacedShip
          ? shipId!
          : (shipId ?? `${shipVariant}-${get().layout.filter((s) => s.type === shipVariant).length}`);
        const newShipPosition: ShipItemPosition = {
          id: newId,
          margins,
          positions: points,
          type: shipVariant,
        };

        if (isPreview) {
          return get().setPreviewCells(newShipPosition);
        }

        const newLayout = isPlacedShip
          ? [
              ...oldLayout.slice(0, layoutIdx),
              newShipPosition,
              ...oldLayout.slice(layoutIdx + 1),
            ]
          : [...oldLayout, newShipPosition];

        set(
          {
            layout: newLayout,
            occupiedCells: getOccupiedCells(newLayout),
          },
          false,
          "shipPlacement",
        );

        get().resetDragInfo();
      },

      onStartDragging: ({ variant, index, shipId, coord, x, y, cellSize }) => {
        let shipVariant = variant;
        let indexCell = index;

        const oldLayout = get().layout;
        const layoutIdx = shipId
          ? oldLayout.findIndex((s) => s.id === shipId)
          : -1;

        if (layoutIdx >= 0) {
          const layoutInfo = oldLayout[layoutIdx];
          if (!layoutInfo) return;
          shipVariant = layoutInfo.type;
          if (coord) {
            const integerCoord = getIntegerCoordinate(coord);
            indexCell = layoutInfo.positions.findIndex(
              (item) =>
                item[0] === integerCoord[0] && item[1] === integerCoord[1],
            );
          }
        }
        if (!shipVariant || indexCell === undefined) return;

        const actualOccupiedCells =
          layoutIdx >= 0
            ? getOccupiedCells([
                ...oldLayout.slice(0, layoutIdx),
                ...oldLayout.slice(layoutIdx + 1),
              ])
            : get().occupiedCells;

        get().updateDragInfo({
          isDraggable: true,
          pos: { x, y },
          shipId: shipId || null,
          occupiedCells: actualOccupiedCells,
          shipVariant,
          indexCell,
          shipSize: fleetConfig[shipVariant].size,
          cellSize,
        });
      },

      resetDragInfo: () => {
        set({ dragInfo: { ...initialDragInfo } }, false, "resetDragInfo");
      },

      updateDragInfo: (info) => {
        set({ dragInfo: { ...get().dragInfo, ...info } }, false, "updateDragInfo");
      },

      switchDirection: () => {
        set(
          { direction: get().direction === "h" ? "v" : "h" },
          false,
          "switchDirection",
        );
      },

      setPreviewCells: (shipPosition) => {
        const occupiedCellsPlacementPreview: OccupiedCellsPlacementPreview = {};
        if (shipPosition) {
          for (const pos of shipPosition.positions) {
            occupiedCellsPlacementPreview[getStringCoordinate(pos)] = "ship";
          }
          for (const pos of shipPosition.margins) {
            occupiedCellsPlacementPreview[getStringCoordinate(pos)] = "space";
          }
        }
        set({ occupiedCellsPlacementPreview }, false, "setPreviewCells");
      },
    })),
    { name: "PlacementStore" },
  ),
);
