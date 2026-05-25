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
  computeFire,
} from "@utils/storeHelpers.ts";
import { titleOfCell } from "@utils/helpers.ts";
import { generateShipPositions } from "@utils/generateShipPositions.ts";
import type {
  CellStatus,
  ShipCells,
  PlayerData,
  PlayerId,
  Phase,
  ShipItemPosition,
  ShipsLayout,
  ShipType,
  Hits,
  FleetShots,
} from "@utils/gameTypes.ts";

type HistoryEvent = "start" | "turn" | "miss" | "hit" | "sunk" | "win";

interface HistoryCtx {
  attackerName?: string;
  cellTitle?: string;
  shipType?: string;
  move?: number;
}

const NOTE_BUILDERS: Record<HistoryEvent, (ctx: HistoryCtx) => string> = {
  start: () => "Game started",
  turn: ({ move, attackerName }) => `Turn ${move} - ${attackerName}'s move`,
  miss: ({ attackerName, cellTitle }) => `- ${attackerName} missed on ${cellTitle}`,
  hit: ({ attackerName, cellTitle }) => `- ${attackerName} hit on ${cellTitle}`,
  sunk: ({ attackerName, shipType, cellTitle }) =>
    `- ${attackerName} sunk ${shipType} ship on ${cellTitle}`,
  win: ({ attackerName }) => `${attackerName} won the game!`,
};

interface GameState {
  playersData: PlayerData[];
  phase: Phase;
  turn: PlayerId | null;
  history: string[];
  move: number;
  hits: Hits;
  fleetShots: FleetShots;
  shipsLayout: ShipsLayout;
  occupiedCells: Record<PlayerId, ShipCells>;
  remainingShips: Record<PlayerId, Record<ShipType, number>>;
}

interface GameActions {
  startGame: (layout: ShipItemPosition[]) => void;
  startNewGame: () => void;
  resetSameGame: () => void;
  switchTurn: () => void;
  fire: (
    playerId: PlayerId,
    cellKey: string,
  ) => { result: CellStatus; excludedCoords: string[]; shipType?: ShipType };
  playerMove: (playerId: PlayerId, cellKey: string) => void;
  setHistory: (
    event: HistoryEvent,
    options?: { cellKey?: string; shipType?: string },
  ) => void;
  checkWinner: (defenderId: string) => boolean;
}

type GameStore = GameState & GameActions;

const getEmptyGameplayState = () => ({
  phase: "placement" as Phase,
  turn: null as PlayerId | null,
  history: [] as string[],
  move: 0,
  hits: setDataForPlayers(PLAYERS_IDS, () => ({} as Hits[string])),
  fleetShots: setDataForPlayers(PLAYERS_IDS, () => ({} as FleetShots[string])),
  shipsLayout: setDataForPlayers(PLAYERS_IDS, () => [] as ShipItemPosition[]),
  occupiedCells: setDataForPlayers(PLAYERS_IDS, () => ({} as ShipCells)),
  remainingShips: setDataForPlayers(PLAYERS_IDS, () => ({} as Record<ShipType, number>)),
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
        get().setHistory("turn");
      },

      startGame: (layout) => {
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
        get().setHistory("start");
        get().switchTurn();
      },

      startNewGame: () => {
        set(getEmptyGameplayState(), false, "startNewGame");
      },

      resetSameGame: () => {
        set(getEmptyGameplayState(), false, "resetSameGame");
      },

      fire: (defenderId, cellKey) => {
        const { patch, result, excludedCoords, shipType } = computeFire(get(), defenderId, cellKey);
        set(patch, false, `fire/${result}`);
        return { result, excludedCoords, shipType };
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

      setHistory: (event, { cellKey = "", shipType = "" } = {}) => {
        const attackerName = get().playersData.find(p => p.id === get().turn)?.name;
        const ctx: HistoryCtx = {
          attackerName,
          cellTitle: cellKey ? titleOfCell(cellKey) : "",
          shipType,
          move: get().move,
        };
        set({ history: [...get().history, NOTE_BUILDERS[event](ctx)] }, false, "setHistory");
      },

      checkWinner: (defenderId) => {
        const total = Object.values(get().fleetShots[defenderId]).reduce(
          (acc, val) => acc + val,
          0,
        );
        if (total === 0) {
          get().setHistory("win");
          set({ phase: "game-over", turn: null }, false, "checkWinner");
          return true;
        }
        return false;
      },
    }),
    { name: "GameStore" },
  ),
);
