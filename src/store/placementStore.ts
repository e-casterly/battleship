import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { BOARD_SIZE, FLEET_CONFIG, PLAYERS_IDS } from "@utils/constants.ts";
import {
  getCoords,
  getIntegerCoordinate,
  getMargins,
  getStringCoordinate,
} from "@utils/helpers.ts";
import {
  getOccupiedCells,
  setDataForPlayers,
  setOccupiedCellsForPlayers,
  setRemainingShips,
} from "@utils/storeHelpers.ts";
import { generateShipPositions } from "@utils/generateShipPositions.ts";
import type {
  Coord,
  DragInfo,
  OccupiedCells,
  OccupiedCellsPlacementPreview,
  PlayerId,
  ShipItemPosition,
  ShipsLayout,
  ShipType,
} from "@utils/gameTypes.ts";

interface PlacementState {
  direction: "h" | "v";
  shipsLayout: ShipsLayout;
  occupiedCells: Record<PlayerId, OccupiedCells>;
  remainingShips: Record<PlayerId, Record<ShipType, number>>;
  occupiedCellsPlacementPreview: OccupiedCellsPlacementPreview;
  dragInfo: DragInfo;
}

interface PlacementActions {
  resetPlacementState: (layouts: ShipsLayout) => void;
  resetRemainingShips: () => void;
  initRemainingShipsForGame: () => void;
  randomizeShipsLayout: () => void;
  customizeShipsLayout: () => void;
  changeRemainingShipAmount: (playerId: PlayerId, shipVariant: ShipType) => void;
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
const playersIds = PLAYERS_IDS;
const currentPlayerId = playersIds[0];

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
    subscribeWithSelector((set, get) => {
      const shipsLayout = setDataForPlayers(
        playersIds,
        generateShipPositions(boardSize, fleetConfig),
        currentPlayerId,
        [],
      );
      const occupiedCells = setOccupiedCellsForPlayers(playersIds, shipsLayout);

      return {
        direction: "h",
        shipsLayout,
        occupiedCells,
        occupiedCellsPlacementPreview: {},
        dragInfo: { ...initialDragInfo },
        remainingShips: setDataForPlayers(
          playersIds,
          setRemainingShips(fleetConfig),
        ),

        resetPlacementState: (layouts) => {
          set(
            {
              direction: "h",
              shipsLayout: layouts,
              occupiedCells: setOccupiedCellsForPlayers(playersIds, layouts),
              remainingShips: setDataForPlayers(
                playersIds,
                setRemainingShips(fleetConfig),
              ),
              occupiedCellsPlacementPreview: {},
              dragInfo: { ...initialDragInfo },
            },
            false,
            "resetPlacementState",
          );
        },

        // used by resetSameGame: current player gets 0 (placed), others get full
        resetRemainingShips: () => {
          set(
            {
              remainingShips: setDataForPlayers(
                playersIds,
                setRemainingShips(fleetConfig),
                currentPlayerId,
                setRemainingShips(fleetConfig, true),
              ),
            },
            false,
            "resetRemainingShips",
          );
        },

        // used by startGame: all players get full counts for the battle
        initRemainingShipsForGame: () => {
          set(
            {
              remainingShips: setDataForPlayers(
                playersIds,
                setRemainingShips(fleetConfig),
              ),
            },
            false,
            "initRemainingShipsForGame",
          );
        },

        randomizeShipsLayout: () => {
          const playerLayout = generateShipPositions(boardSize, fleetConfig);
          set(
            {
              shipsLayout: {
                ...get().shipsLayout,
                [currentPlayerId]: playerLayout,
              },
              occupiedCells: {
                ...get().occupiedCells,
                [currentPlayerId]: getOccupiedCells({}, playerLayout),
              },
              remainingShips: {
                ...get().remainingShips,
                [currentPlayerId]: setRemainingShips(fleetConfig, true),
              },
            },
            false,
            "randomizeShipsLayout",
          );
        },

        customizeShipsLayout: () => {
          set(
            {
              shipsLayout: { ...get().shipsLayout, [currentPlayerId]: [] },
              occupiedCells: {
                ...get().occupiedCells,
                [currentPlayerId]: {},
              },
              remainingShips: {
                ...get().remainingShips,
                [currentPlayerId]: setRemainingShips(fleetConfig),
              },
            },
            false,
            "customizeShipsLayout",
          );
        },

        changeRemainingShipAmount: (playerId, shipVariant) => {
          set(
            {
              remainingShips: {
                ...get().remainingShips,
                [playerId]: {
                  ...get().remainingShips[playerId],
                  [shipVariant]: get().remainingShips[playerId][shipVariant] - 1,
                },
              },
            },
            false,
            "changeRemainingShipAmount",
          );
        },

        shipPlacement: (coord, isPreview = false) => {
          if (!isPreview) get().setPreviewCells(null);

          const { direction } = get();
          const { shipVariant, indexCell, shipId, occupiedCells } =
            get().dragInfo;
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

          const oldPlayerLayout = get().shipsLayout[currentPlayerId];
          const isPlacedShip = shipId !== null && oldPlayerLayout[shipId];

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

          const newPlayerLayout = isPlacedShip
            ? [
                ...oldPlayerLayout.slice(0, shipId),
                newShipPosition,
                ...oldPlayerLayout.slice(shipId + 1),
              ]
            : [...oldPlayerLayout, newShipPosition];

          set(
            {
              shipsLayout: {
                ...get().shipsLayout,
                [currentPlayerId]: newPlayerLayout,
              },
              occupiedCells: {
                ...get().occupiedCells,
                [currentPlayerId]: getOccupiedCells({}, newPlayerLayout),
              },
            },
            false,
            "shipPlacement",
          );

          get().resetDragInfo();

          if (!isPlacedShip) {
            get().changeRemainingShipAmount(currentPlayerId, shipVariant);
          }
        },

        onStartDragging: ({ variant, index, shipId, coord, x, y, cellSize }) => {
          let shipVariant = variant;
          let indexCell = index;
          const integerShipId =
            shipId && !Number.isNaN(Number(shipId)) ? Number(shipId) : null;

          if (integerShipId !== null) {
            const layoutInfo =
              get().shipsLayout[currentPlayerId][integerShipId];
            if (!layoutInfo || !coord) return;
            shipVariant = layoutInfo.type;
            const integerCoord = getIntegerCoordinate(coord);
            indexCell = layoutInfo.positions.findIndex(
              (item) =>
                item[0] === integerCoord[0] && item[1] === integerCoord[1],
            );
          }
          if (!shipVariant || indexCell === undefined) return;

          const oldPlayerLayout = get().shipsLayout[currentPlayerId];
          const actualOccupiedCells =
            integerShipId !== null
              ? getOccupiedCells({}, [
                  ...oldPlayerLayout.slice(0, integerShipId),
                  ...oldPlayerLayout.slice(integerShipId + 1),
                ])
              : get().occupiedCells[currentPlayerId];

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
          set({ direction: get().direction === "h" ? "v" : "h" }, false, "switchDirection");
        },

        setPreviewCells: (shipPosition) => {
          const occupiedCellsPlacementPreview: OccupiedCellsPlacementPreview =
            {};
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
      };
    }),
    { name: "PlacementStore" },
  ),
);
