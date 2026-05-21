import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  BOARD_SIZE,
  FLEET_CONFIG,
  PLAYERS_IDS,
  CURRENT_PLAYER_ID,
} from "@utils/constants.ts";
import {
  getInitialPlayers,
  setDataForPlayers,
  setFleetShots,
  setOccupiedCellsForPlayers,
  getFullRemainingShips,
} from "@utils/storeHelpers.ts";
import { getStringCoordinate, titleOfCell } from "@utils/helpers.ts";
import { generateShipPositions } from "@utils/generateShipPositions.ts";
import { getNextPoint } from "@utils/aiLogic.ts";
import type {
  CellStatus,
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
  playersData: PlayerData[];
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
  computerMove: () => boolean;
  setHistory: (
    event: "start" | "turn" | "miss" | "hit" | "sunk" | "win",
    options: { cellKey?: string; shipType?: string },
  ) => void;
  checkWinner: (defenderId: string) => boolean;
}

type GameStore = GameState & GameActions;

const getEmptyGameplayState = () => ({
  phase: "placement" as Phase,
  turn: null as PlayerId | null,
  history: [] as string[],
  move: 0,
  hits: setDataForPlayers(PLAYERS_IDS, {}),
  fleetShots: setDataForPlayers(PLAYERS_IDS, {}),
  shipsLayout: setDataForPlayers(PLAYERS_IDS, [] as never),
  occupiedCells: setDataForPlayers(PLAYERS_IDS, {} as OccupiedCells),
  remainingShips: setDataForPlayers(
    PLAYERS_IDS,
    {} as Record<ShipType, number>,
  ),
});

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      playersData: getInitialPlayers(PLAYERS_IDS),
      ...getEmptyGameplayState(),

      switchTurn: () => {
        const currentTurn = get().turn;
        const [player1, player2] = PLAYERS_IDS;
        const nextTurn = currentTurn === player1 ? player2 : player1;
        set({ turn: nextTurn, move: get().move + 1 }, false, "switchTurn");
        get().setHistory("turn", {});
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
        const aiLayout = generateShipPositions(BOARD_SIZE, FLEET_CONFIG);
        const shipsLayout: ShipsLayout = {
          [CURRENT_PLAYER_ID]: layout,
          [PLAYERS_IDS[1]]: aiLayout,
        };
        set(
          {
            phase: "in-game",
            shipsLayout,
            occupiedCells: setOccupiedCellsForPlayers(PLAYERS_IDS, shipsLayout),
            remainingShips: setDataForPlayers(
              PLAYERS_IDS,
              getFullRemainingShips(FLEET_CONFIG),
            ),
            fleetShots: setFleetShots(PLAYERS_IDS, shipsLayout),
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
        set(getEmptyGameplayState(), false, "startNewGame");
      },

      resetSameGame: () => {
        useAiStore.getState().resetAiState();
        set(getEmptyGameplayState(), false, "resetSameGame");
      },

      fire: (defenderId, cellKey) => {
        const state = get();
        const shipId = state.occupiedCells[defenderId]?.[cellKey];

        if (shipId !== undefined && shipId !== "space") {
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
            const ship = state.shipsLayout[defenderId].find(
              (s) => s.id === shipId,
            )!;
            const shipType = ship.type;
            const shipCells = ship.positions.map((item) =>
              getStringCoordinate(item),
            );
            const marginCells = ship.margins.map((item) =>
              getStringCoordinate(item),
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
          get().turn !== CURRENT_PLAYER_ID
        )
          return;
        const { result, shipType } = get().fire(defenderId, cellKey);
        get().setHistory(result, { cellKey, shipType });
        if (result === "miss") {
          get().switchTurn();
        } else {
          get().checkWinner(defenderId);
        }
      },

      computerMove: () => {
        const { remainingCoords, focusCoords } = useAiStore.getState();
        const nextPoint = getNextPoint(remainingCoords, focusCoords);
        if (!nextPoint) {
          get().switchTurn();
          return false;
        }

        const cellKey = getStringCoordinate(nextPoint);
        const { result, excludedCoords, shipType } = get().fire(
          CURRENT_PLAYER_ID,
          cellKey,
        );

        const newRemainingCoords = new Set(remainingCoords);
        for (const coord of excludedCoords) newRemainingCoords.delete(coord);

        let newFocusCoords = [...focusCoords];
        if (result === "hit") {
          newFocusCoords = [...newFocusCoords, nextPoint];
        } else if (result === "sunk") {
          newFocusCoords = [];
        }

        useAiStore.getState().setAiState({
          remainingCoords: newRemainingCoords,
          focusCoords: newFocusCoords,
        });

        get().setHistory(result, { cellKey, shipType });

        if (result === "miss") {
          get().switchTurn();
          return false;
        }

        const winner = get().checkWinner(CURRENT_PLAYER_ID);
        return !winner;
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
