import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import type {
  GameState,
  GameActions,
  Hits,
  ShipsLayout,
  FleetShots,
  Coord,
  OccupiedCellsPlacementPreview,
} from "@utils/gameTypes.ts";
import {
  setFleetShots,
  getInitialPlayers,
  setRemainingShips,
  setOccupiedCellsForPlayers,
  getOccupiedCells,
  setDataForPlayers,
} from "@utils/storeHelpers.ts";
import {
  getCoords,
  getFreeCoordsSet,
  getIntegerCoordinate,
  getMargins,
  getStringCoordinate,
  titleOfCell,
} from "@utils/helpers.ts";
import { getNextPoint } from "@utils/aiLogic.ts";
import { BOARD_SIZE, FLEET_CONFIG, PLAYERS_IDS } from "@utils/constants.ts";
import { generateShipPositions } from "@utils/generateShipPositions.ts";

type Store = GameState & GameActions;

export const useGameStore = create<Store>()(
  devtools(
    subscribeWithSelector((set, get) => {
      const playersIds = PLAYERS_IDS;
      const boardSize = BOARD_SIZE;
      const fleetConfig = FLEET_CONFIG;
      const currentPlayerId = playersIds[0];
      const playersData = getInitialPlayers(playersIds);
      const shipsLayout = setDataForPlayers(
        playersIds,
        generateShipPositions(boardSize, fleetConfig),
        currentPlayerId,
        [],
      );
      const occupiedCells = setOccupiedCellsForPlayers(playersIds, shipsLayout);
      return {
        boardSize,
        fleetConfig,

        playersIds,
        playersData,
        currentPlayerId,

        shipsLayout,
        occupiedCells, // cells with ship ids

        occupiedCellsPlacementPreview: {},
        dragInfo: {
          isDraggable: false,
          pos: { x: 0, y: 0 },
          direction: "h",
          shipId: null,
          occupiedCells: {},
          startPoint: null,
          indexCell: 0,
          shipVariant: null,
          shipSize: 0,
          cellSize: 0,
        },

        remainingShips: setDataForPlayers(
          playersIds,
          setRemainingShips(fleetConfig),
        ),

        phase: "placement",
        turn: null,
        history: [],
        move: 0,
        hits: setDataForPlayers(playersIds, {}), // hits and its results
        fleetShots: setDataForPlayers(playersIds, {}), // number of hits for each ship

        aiRemainingCoords: getFreeCoordsSet(boardSize),
        aiFocusCoords: [],

        switchTurn: () => {
          const currentTurn = get().turn;
          const [player1, player2] = get().playersIds;
          const nextTurn = currentTurn === player1 ? player2 : player1;
          set({
            turn: nextTurn,
            move: get().move + 1,
          });
          get().setHistory("turn", {});
          if (nextTurn !== get().currentPlayerId) {
            setTimeout(() => {
              get().computerMove();
            }, 600);
          }
        },

        startGame: () => {
          set({
            phase: "in-game",
            fleetShots: setFleetShots(get().playersIds, get().shipsLayout),
            remainingShips: setDataForPlayers(
              get().playersIds,
              setRemainingShips(get().fleetConfig),
            ),
          });
          get().setHistory("start", {});
          get().switchTurn();
        },

        startNewGame: () => {
          const layouts: ShipsLayout = setDataForPlayers(
            get().playersIds,
            generateShipPositions(get().boardSize, get().fleetConfig),
            get().currentPlayerId,
            [],
          );
          set({
            phase: "placement",
            turn: null,
            shipsLayout: layouts,
            occupiedCells: setOccupiedCellsForPlayers(
              get().playersIds,
              layouts,
            ),
            hits: setDataForPlayers(get().playersIds, {}),
            fleetShots: setDataForPlayers(get().playersIds, {}),
            remainingShips: setDataForPlayers(
              get().playersIds,
              setRemainingShips(get().fleetConfig),
            ),
            history: [],
            move: 0,
          });
        },

        resetSameGame: () =>
          set(() => ({
            phase: "placement",
            turn: null,
            hits: setDataForPlayers(get().playersIds, {}),
            fleetShots: setDataForPlayers(get().playersIds, {}),
            remainingShips: setDataForPlayers(
              get().playersIds,
              setRemainingShips(get().fleetConfig),
              get().currentPlayerId,
              setRemainingShips(get().fleetConfig, true),
            ),
            history: [],
            move: 0,
          })),

        randomizeShipsLayout: () => {
          const playerLayout = generateShipPositions(
            get().boardSize,
            get().fleetConfig,
          );
          const currentPlayerId = get().currentPlayerId;
          set({
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
              [currentPlayerId]: setRemainingShips(get().fleetConfig, true),
            },
          });
        },

        customizeShipsLayout: () => {
          set({
            shipsLayout: { ...get().shipsLayout, [get().currentPlayerId]: [] },
            occupiedCells: {
              ...get().occupiedCells,
              [get().currentPlayerId]: {},
            },
            remainingShips: {
              ...get().remainingShips,
              [get().currentPlayerId]: setRemainingShips(get().fleetConfig),
            },
          });
        },

        changeRemainingShipAmount: (playerId, shipVariant) => {
          set({
            remainingShips: {
              ...get().remainingShips,
              [playerId]: {
                ...get().remainingShips[playerId],
                [shipVariant]: get().remainingShips[playerId][shipVariant] - 1,
              },
            },
          });
        },

        shipPlacement: (coord, isPreview = false) => {
          if (!isPreview) {
            get().setPreviewCells(null);
          }

          const { direction, shipVariant, indexCell, shipId, occupiedCells } =
            get().dragInfo;
          if (!coord || !direction || !shipVariant) {
            return get().setDragInfo(true);
          }

          const currentPlayerId = get().currentPlayerId;
          const integerCoord: Coord = getIntegerCoordinate(coord);
          const dir = direction === "h" ? [0, 1] : [1, 0];
          const shipSize = get().fleetConfig[shipVariant]["size"];

          const points = getCoords(
            get().boardSize,
            integerCoord,
            dir,
            shipSize,
            indexCell !== null ? indexCell : 0,
          );

          if (points.length === 0 && !isPreview) return get().setDragInfo(true);
          if (points.length === 0 && isPreview) return;

          const oldPlayerLayout = get().shipsLayout[currentPlayerId];

          const isPlacedShip = shipId !== null && oldPlayerLayout[shipId];

          for (const point of points) {
            const stringPoint = getStringCoordinate(point);
            if (occupiedCells[stringPoint] !== undefined) {
              if (!isPreview) return get().setDragInfo(true);
              return;
            }
          }

          const margins = getMargins(get().boardSize, points);

          const newShipPosition = {
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

          set({
            shipsLayout: {
              ...get().shipsLayout,
              [currentPlayerId]: newPlayerLayout,
            },
            occupiedCells: {
              ...get().occupiedCells,
              [currentPlayerId]: getOccupiedCells({}, newPlayerLayout),
            },
          });

          get().setDragInfo(true);

          if (!isPlacedShip) {
            get().changeRemainingShipAmount(currentPlayerId, shipVariant);
          }
        },

        onStartDragging: ({
          variant,
          index,
          shipId,
          coord,
          x,
          y,
          cellSize,
        }) => {
          const currentPlayerId = get().currentPlayerId;
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

          get().setDragInfo(false, {
            isDraggable: true,
            pos: { x, y },
            shipId: shipId ? Number(shipId) : null,
            occupiedCells: actualOccupiedCells,
            shipVariant,
            indexCell,
            shipSize: get().fleetConfig[shipVariant].size,
            cellSize: cellSize,
          });
        },

        setDragInfo: (isReset = false, info = {}) => {
          const initial = isReset
            ? {
                isDraggable: false,
                pos: { x: 0, y: 0 },
                shipId: null,
                occupiedCells: {},
                startPoint: null,
                indexCell: 0,
                shipVariant: null,
                shipSize: 0,
                cellSize: 0,
                direction: get().dragInfo.direction
                  ? get().dragInfo.direction
                  : "h",
              }
            : {};
          set({
            dragInfo: { ...get().dragInfo, ...initial, ...info },
          });
        },

        switchDirection: () => {
          set({
            dragInfo: {
              ...get().dragInfo,
              direction: get().dragInfo.direction === "h" ? "v" : "h",
            },
          });
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
          return set({
            occupiedCellsPlacementPreview,
          });
        },

        fire: (defenderId, cellKey) => {
          const state = get();
          const shipId = state.occupiedCells[defenderId]?.[cellKey];

          if (shipId !== undefined && typeof shipId === "number") {
            const newHitsAmount = state.fleetShots[defenderId][shipId] - 1;
            const isSunk = newHitsAmount === 0;

            const fleetShots: FleetShots = {
              ...state.fleetShots,
              [defenderId]: {
                ...state.fleetShots[defenderId],
                [shipId]: newHitsAmount,
              },
            };
            const hits: Hits = {
              ...state.hits,
              [defenderId]: { ...state.hits[defenderId], [cellKey]: "hit" },
            };

            if (isSunk) {
              const shipType = state.shipsLayout[defenderId][shipId].type;
              const shipCells =
                state.shipsLayout[defenderId][shipId].positions.map((item) =>
                  getStringCoordinate(item),
                ) ?? [];
              const marginCells =
                state.shipsLayout[defenderId][shipId].margins.map((item) =>
                  getStringCoordinate(item),
                ) ?? [];
              for (const pos of shipCells) {
                hits[defenderId][pos] = "sunk";
              }
              for (const pos of marginCells) {
                hits[defenderId][pos] = "miss";
              }

              set({
                hits,
                fleetShots,
              });
              get().changeRemainingShipAmount(defenderId, shipType);
              return {
                result: "sunk",
                excludedCoords: [...shipCells, ...marginCells],
                shipType,
              };
            }
            set({
              hits,
              fleetShots,
            });
            return { result: "hit", excludedCoords: [cellKey], cellKey };
          }
          set({
            hits: {
              ...state.hits,
              [defenderId]: { ...state.hits[defenderId], [cellKey]: "miss" },
            },
          });
          return { result: "miss", excludedCoords: [cellKey] };
        },

        playerMove: (defenderId, cellKey) => {
          if (
            get().hits[defenderId][cellKey] ||
            get().turn !== get().currentPlayerId
          )
            return;
          const { result, shipType } = get().fire(defenderId, cellKey);
          get().setHistory(result, { cellKey, shipType });
          if (result === "miss") {
            get().switchTurn();
          }
          get().checkWinner(defenderId);
        },

        computerMove: () => {
          const aiRemainingCoords = get().aiRemainingCoords;
          const aiFocusCoords = get().aiFocusCoords;
          const defenderId = get().currentPlayerId;
          const nextPoint = getNextPoint(aiRemainingCoords, aiFocusCoords);
          if (!nextPoint) return get().switchTurn();
          const { result, excludedCoords, shipType } = get().fire(
            defenderId,
            getStringCoordinate(nextPoint),
          );
          for (const coords of excludedCoords) {
            aiRemainingCoords.delete(coords);
          }
          let newAiFocusCoords = [...aiFocusCoords];
          if (result === "hit") {
            newAiFocusCoords = [...newAiFocusCoords, nextPoint];
          } else if (result === "sunk") {
            newAiFocusCoords = [];
          }
          set({
            aiRemainingCoords: new Set(aiRemainingCoords),
            aiFocusCoords: newAiFocusCoords,
          });
          get().setHistory(result, {
            cellKey: getStringCoordinate(nextPoint),
            shipType,
          });
          if (result === "miss") {
            get().switchTurn();
          } else {
            const winner = get().checkWinner(defenderId);
            if (!winner) {
              setTimeout(() => {
                get().computerMove();
              }, 500);
            }
          }
        },

        setHistory: (event, { cellKey = "", shipType = "" }) => {
          const attackerName = get().playersData.find(
            (p) => p.id === get().turn,
          )?.name;
          const cellTitle = cellKey ? titleOfCell(cellKey) : "";
          let newNote = "";
          if (event === "start") {
            newNote = "Game started";
          } else if (event === "turn") {
            newNote = `Turn ${get().move} - ${attackerName}'s move`;
          } else if (event === "miss") {
            newNote = `- ${attackerName} missed on ${cellTitle}`;
          } else if (event === "hit") {
            newNote = `- ${attackerName} hit on ${cellTitle}`;
          } else if (event === "sunk") {
            newNote = `- ${attackerName} sunk ${shipType} ship on ${cellTitle}`;
          } else if (event === "win") {
            newNote = `${attackerName} won the game!`;
          }
          set({
            history: [...get().history, newNote],
          });
        },

        checkWinner: (defenderId) => {
          const total = Object.values(get().fleetShots[defenderId]).reduce(
            (acc, val) => acc + val,
            0,
          );
          if (total === 0) {
            get().setHistory("win", {});
            set({
              phase: "game-over",
              turn: null,
            });
            return true;
          }
          return false;
        },
      };
    }),
  ),
);
