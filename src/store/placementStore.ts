import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { BOARD_SIZE, FLEET_CONFIG } from "@utils/constants.ts";
import {
  getCoords,
  getIntegerCoordinate,
  getMargins,
  getStringCoordinate,
} from "@utils/helpers.ts";
import {
  getOccupiedCells,
  getFullRemainingShips,
  getEmptyRemainingShips,
} from "@utils/storeHelpers.ts";
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
  remainingShips: Record<ShipType, number>;
  occupiedCellsPlacementPreview: OccupiedCellsPlacementPreview;
  dragInfo: DragInfo;
}

interface PlacementActions {
  resetPlacementState: (layout: ShipItemPosition[]) => void;
  resetRemainingShips: () => void;
  randomizeShipsLayout: () => void;
  customizeShipsLayout: () => void;
  changeRemainingShipAmount: (shipVariant: ShipType) => void;
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
      remainingShips: getFullRemainingShips(fleetConfig),
      occupiedCellsPlacementPreview: {},
      dragInfo: { ...initialDragInfo },

      resetPlacementState: (layout) => {
        set(
          {
            direction: "h",
            layout,
            occupiedCells: getOccupiedCells(layout),
            remainingShips: getFullRemainingShips(fleetConfig),
            occupiedCellsPlacementPreview: {},
            dragInfo: { ...initialDragInfo },
          },
          false,
          "resetPlacementState",
        );
      },

      resetRemainingShips: () => {
        set(
          { remainingShips: getEmptyRemainingShips(fleetConfig) },
          false,
          "resetRemainingShips",
        );
      },

      randomizeShipsLayout: () => {
        const layout = generateShipPositions(boardSize, fleetConfig);
        set(
          {
            layout,
            occupiedCells: getOccupiedCells(layout),
            remainingShips: getEmptyRemainingShips(fleetConfig),
          },
          false,
          "randomizeShipsLayout",
        );
      },

      customizeShipsLayout: () => {
        set(
          {
            layout: [],
            occupiedCells: {},
            remainingShips: getFullRemainingShips(fleetConfig),
          },
          false,
          "customizeShipsLayout",
        );
      },

      changeRemainingShipAmount: (shipVariant) => {
        set(
          {
            remainingShips: {
              ...get().remainingShips,
              [shipVariant]: get().remainingShips[shipVariant] - 1,
            },
          },
          false,
          "changeRemainingShipAmount",
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
        const isPlacedShip = shipId !== null && oldLayout[shipId];

        for (const point of points) {
          const stringPoint = getStringCoordinate(point);
          if (occupiedCells[stringPoint] !== undefined) {
            if (!isPreview) return get().resetDragInfo();
            return;
          }
        }

        const margins = getMargins(boardSize, points);
        const newShipPosition: ShipItemPosition = {
          margins,
          positions: points,
          type: shipVariant,
        };

        if (isPreview) {
          return get().setPreviewCells(newShipPosition);
        }

        const newLayout = isPlacedShip
          ? [
              ...oldLayout.slice(0, shipId),
              newShipPosition,
              ...oldLayout.slice(shipId + 1),
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

        if (!isPlacedShip) {
          get().changeRemainingShipAmount(shipVariant);
        }
      },

      onStartDragging: ({ variant, index, shipId, coord, x, y, cellSize }) => {
        let shipVariant = variant;
        let indexCell = index;
        const integerShipId =
          shipId && !Number.isNaN(Number(shipId)) ? Number(shipId) : null;

        if (integerShipId !== null) {
          const layoutInfo = get().layout[integerShipId];
          if (!layoutInfo || !coord) return;
          shipVariant = layoutInfo.type;
          const integerCoord = getIntegerCoordinate(coord);
          indexCell = layoutInfo.positions.findIndex(
            (item) =>
              item[0] === integerCoord[0] && item[1] === integerCoord[1],
          );
        }
        if (!shipVariant || indexCell === undefined) return;

        const oldLayout = get().layout;
        const actualOccupiedCells =
          integerShipId !== null
            ? getOccupiedCells([
                ...oldLayout.slice(0, integerShipId),
                ...oldLayout.slice(integerShipId + 1),
              ])
            : get().occupiedCells;

        get().updateDragInfo({
          isDraggable: true,
          pos: { x, y },
          shipId: shipId ? Number(shipId) : null,
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
