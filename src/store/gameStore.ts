import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BOARD_SIZE, FLEET_CONFIG, PLAYERS_IDS } from "@utils/constants.ts";
import {
  getInitialPlayers,
  setDataForPlayers,
  setFleetShots,
} from "@utils/storeHelpers.ts";
import { getStringCoordinate, titleOfCell } from "@utils/helpers.ts";
import { generateShipPositions } from "@utils/generateShipPositions.ts";
import { getNextPoint } from "@utils/aiLogic.ts";
import type {
  BoardSize,
  CellStatus,
  FleetConfig,
  FleetShots,
  Hits,
  PlayerData,
  PlayerId,
  Phase,
  ShipType,
} from "@utils/gameTypes.ts";
import { usePlacementStore } from "@store/placementStore.ts";
import { useAiStore } from "@store/aiStore.ts";

interface GameState {
  boardSize: BoardSize;
  fleetConfig: FleetConfig;
  playersIds: PlayerId[];
  playersData: PlayerData[];
  currentPlayerId: string;
  phase: Phase;
  turn: PlayerId | null;
  history: string[];
  move: number;
  hits: Hits;
  fleetShots: FleetShots;
}

interface GameActions {
  startGame: () => void;
  startNewGame: () => void;
  resetSameGame: () => void;
  switchTurn: () => void;
  fire: (
    playerId: PlayerId,
    cellKey: string,
  ) => { result: CellStatus; excludedCoords: string[]; shipType?: ShipType };
  playerMove: (playerId: PlayerId, cellKey: string) => void;
  computerMove: () => void;
  setHistory: (
    event: "start" | "turn" | "miss" | "hit" | "sunk" | "win",
    options: { cellKey?: string; shipType?: string },
  ) => void;
  checkWinner: (defenderId: string) => boolean;
}

type GameStore = GameState & GameActions;

const boardSize = BOARD_SIZE;
const fleetConfig = FLEET_CONFIG;
const playersIds = PLAYERS_IDS;
const currentPlayerId = playersIds[0];

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      boardSize,
      fleetConfig,
      playersIds,
      playersData: getInitialPlayers(playersIds),
      currentPlayerId,
      phase: "placement",
      turn: null,
      history: [],
      move: 0,
      hits: setDataForPlayers(playersIds, {}),
      fleetShots: setDataForPlayers(playersIds, {}),

      switchTurn: () => {
        const currentTurn = get().turn;
        const [player1, player2] = get().playersIds;
        const nextTurn = currentTurn === player1 ? player2 : player1;
        set({ turn: nextTurn, move: get().move + 1 });
        get().setHistory("turn", {});
        if (nextTurn !== currentPlayerId) {
          setTimeout(() => get().computerMove(), 600);
        }
      },

      startGame: () => {
        const { shipsLayout } = usePlacementStore.getState();
        usePlacementStore.getState().initRemainingShipsForGame();
        set({
          phase: "in-game",
          fleetShots: setFleetShots(get().playersIds, shipsLayout),
        });
        get().setHistory("start", {});
        get().switchTurn();
      },

      startNewGame: () => {
        const layouts = setDataForPlayers(
          get().playersIds,
          generateShipPositions(get().boardSize, get().fleetConfig),
          currentPlayerId,
          [],
        );
        usePlacementStore.getState().resetPlacementState(layouts);
        useAiStore.getState().resetAiState();
        set({
          phase: "placement",
          turn: null,
          hits: setDataForPlayers(get().playersIds, {}),
          fleetShots: setDataForPlayers(get().playersIds, {}),
          history: [],
          move: 0,
        });
      },

      resetSameGame: () => {
        usePlacementStore.getState().resetRemainingShips();
        useAiStore.getState().resetAiState();
        set({
          phase: "placement",
          turn: null,
          hits: setDataForPlayers(get().playersIds, {}),
          fleetShots: setDataForPlayers(get().playersIds, {}),
          history: [],
          move: 0,
        });
      },

      fire: (defenderId, cellKey) => {
        const { occupiedCells, shipsLayout } = usePlacementStore.getState();
        const state = get();
        const shipId = occupiedCells[defenderId]?.[cellKey];

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
            const shipType = shipsLayout[defenderId][shipId].type;
            const shipCells = shipsLayout[defenderId][shipId].positions.map(
              (item) => getStringCoordinate(item),
            );
            const marginCells = shipsLayout[defenderId][shipId].margins.map(
              (item) => getStringCoordinate(item),
            );
            for (const pos of shipCells) hits[defenderId][pos] = "sunk";
            for (const pos of marginCells) hits[defenderId][pos] = "miss";

            set({ hits, fleetShots });
            usePlacementStore
              .getState()
              .changeRemainingShipAmount(defenderId, shipType);
            return {
              result: "sunk",
              excludedCoords: [...shipCells, ...marginCells],
              shipType,
            };
          }

          set({ hits, fleetShots });
          return { result: "hit", excludedCoords: [cellKey] };
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
          get().turn !== currentPlayerId
        )
          return;
        const { result, shipType } = get().fire(defenderId, cellKey);
        get().setHistory(result, { cellKey, shipType });
        if (result === "miss") get().switchTurn();
        get().checkWinner(defenderId);
      },

      computerMove: () => {
        const { aiRemainingCoords, aiFocusCoords } = useAiStore.getState();
        const defenderId = currentPlayerId;
        const nextPoint = getNextPoint(aiRemainingCoords, aiFocusCoords);
        if (!nextPoint) return get().switchTurn();

        const cellKey = getStringCoordinate(nextPoint);
        const { result, excludedCoords, shipType } = get().fire(
          defenderId,
          cellKey,
        );

        for (const coord of excludedCoords) aiRemainingCoords.delete(coord);

        let newAiFocusCoords = [...aiFocusCoords];
        if (result === "hit") {
          newAiFocusCoords = [...newAiFocusCoords, nextPoint];
        } else if (result === "sunk") {
          newAiFocusCoords = [];
        }

        useAiStore.getState().setAiState({
          aiRemainingCoords: new Set(aiRemainingCoords),
          aiFocusCoords: newAiFocusCoords,
        });

        get().setHistory(result, { cellKey, shipType });
        if (result === "miss") {
          get().switchTurn();
        } else {
          const winner = get().checkWinner(defenderId);
          if (!winner) setTimeout(() => get().computerMove(), 500);
        }
      },

      setHistory: (event, { cellKey = "", shipType = "" }) => {
        const attackerName = get().playersData.find(
          (p) => p.id === get().turn,
        )?.name;
        const cellTitle = cellKey ? titleOfCell(cellKey) : "";
        let newNote = "";
        if (event === "start") newNote = "Game started";
        else if (event === "turn")
          newNote = `Turn ${get().move} - ${attackerName}'s move`;
        else if (event === "miss")
          newNote = `- ${attackerName} missed on ${cellTitle}`;
        else if (event === "hit")
          newNote = `- ${attackerName} hit on ${cellTitle}`;
        else if (event === "sunk")
          newNote = `- ${attackerName} sunk ${shipType} ship on ${cellTitle}`;
        else if (event === "win") newNote = `${attackerName} won the game!`;
        set({ history: [...get().history, newNote] });
      },

      checkWinner: (defenderId) => {
        const total = Object.values(get().fleetShots[defenderId]).reduce(
          (acc, val) => acc + val,
          0,
        );
        if (total === 0) {
          get().setHistory("win", {});
          set({ phase: "game-over", turn: null });
          return true;
        }
        return false;
      },
    }),
    { name: "GameStore" },
  ),
);
