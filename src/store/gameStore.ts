import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BOARD_SIZE, FLEET_CONFIG, PLAYERS_IDS } from "@utils/constants.ts";
import {
  getInitialPlayers,
  setDataForPlayers,
  setFleetShots,
  setOccupiedCellsForPlayers,
  setRemainingShips,
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
  OccupiedCells,
  PlayerData,
  PlayerId,
  Phase,
  ShipsLayout,
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
  shipsLayout: ShipsLayout;
  occupiedCells: Record<PlayerId, OccupiedCells>;
  remainingShips: Record<PlayerId, Record<ShipType, number>>;
}

interface GameActions {
  startGame: () => void;
  startNewGame: () => void;
  resetSameGame: () => void;
  switchTurn: () => void;
  changeRemainingShipAmount: (playerId: PlayerId, shipVariant: ShipType) => void;
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
      shipsLayout: setDataForPlayers(playersIds, [] as never),
      occupiedCells: setDataForPlayers(playersIds, {} as OccupiedCells),
      remainingShips: setDataForPlayers(playersIds, {} as Record<ShipType, number>),

      switchTurn: () => {
        const currentTurn = get().turn;
        const [player1, player2] = get().playersIds;
        const nextTurn = currentTurn === player1 ? player2 : player1;
        set({ turn: nextTurn, move: get().move + 1 }, false, "switchTurn");
        get().setHistory("turn", {});
        if (nextTurn !== currentPlayerId) {
          setTimeout(() => get().computerMove(), 600);
        }
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

      startGame: () => {
        const { layout } = usePlacementStore.getState();
        const aiLayout = generateShipPositions(boardSize, fleetConfig);
        const shipsLayout: ShipsLayout = {
          [currentPlayerId]: layout,
          [playersIds[1]]: aiLayout,
        };
        set(
          {
            phase: "in-game",
            shipsLayout,
            occupiedCells: setOccupiedCellsForPlayers(playersIds, shipsLayout),
            remainingShips: setDataForPlayers(playersIds, setRemainingShips(fleetConfig)),
            fleetShots: setFleetShots(get().playersIds, shipsLayout),
          },
          false,
          "startGame",
        );
        get().setHistory("start", {});
        get().switchTurn();
      },

      startNewGame: () => {
        usePlacementStore.getState().resetPlacementState([]);
        useAiStore.getState().resetAiState();
        set(
          {
            phase: "placement",
            turn: null,
            hits: setDataForPlayers(get().playersIds, {}),
            fleetShots: setDataForPlayers(get().playersIds, {}),
            shipsLayout: setDataForPlayers(playersIds, [] as never),
            occupiedCells: setDataForPlayers(playersIds, {} as OccupiedCells),
            remainingShips: setDataForPlayers(playersIds, {} as Record<ShipType, number>),
            history: [],
            move: 0,
          },
          false,
          "startNewGame",
        );
      },

      resetSameGame: () => {
        usePlacementStore.getState().resetRemainingShips();
        useAiStore.getState().resetAiState();
        set(
          {
            phase: "placement",
            turn: null,
            hits: setDataForPlayers(get().playersIds, {}),
            fleetShots: setDataForPlayers(get().playersIds, {}),
            shipsLayout: setDataForPlayers(playersIds, [] as never),
            occupiedCells: setDataForPlayers(playersIds, {} as OccupiedCells),
            remainingShips: setDataForPlayers(playersIds, {} as Record<ShipType, number>),
            history: [],
            move: 0,
          },
          false,
          "resetSameGame",
        );
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
            const shipCells = state.shipsLayout[defenderId][shipId].positions.map(
              (item) => getStringCoordinate(item),
            );
            const marginCells = state.shipsLayout[defenderId][shipId].margins.map(
              (item) => getStringCoordinate(item),
            );
            for (const pos of shipCells) hits[defenderId][pos] = "sunk";
            for (const pos of marginCells) hits[defenderId][pos] = "miss";

            set({ hits, fleetShots }, false, "fire/sunk");
            get().changeRemainingShipAmount(defenderId, shipType);
            return {
              result: "sunk",
              excludedCoords: [...shipCells, ...marginCells],
              shipType,
            };
          }

          set({ hits, fleetShots }, false, "fire/hit");
          return { result: "hit", excludedCoords: [cellKey] };
        }

        set(
          {
            hits: {
              ...state.hits,
              [defenderId]: { ...state.hits[defenderId], [cellKey]: "miss" },
            },
          },
          false,
          "fire/miss",
        );
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
        set({ history: [...get().history, newNote] }, false, "setHistory");
      },

      checkWinner: (defenderId) => {
        const total = Object.values(get().fleetShots[defenderId]).reduce(
          (acc, val) => acc + val,
          0,
        );
        if (total === 0) {
          get().setHistory("win", {});
          set({ phase: "game-over", turn: null }, false, "checkWinner");
          return true;
        }
        return false;
      },
    }),
    { name: "GameStore" },
  ),
);
