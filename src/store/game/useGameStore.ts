import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getInitialPlayers, setDataForPlayers } from "@utils/battle/players.ts";
import {
  BOARD_SIZE,
  CURRENT_PLAYER_ID,
  FLEET_CONFIG,
  PLAYERS_IDS,
} from "@utils/constants.ts";
import { getOccupiedCellsForPlayers } from "@utils/battle/getOccupiedCellsForPlayers.ts";
import { computeFire } from "@utils/battle/computeFire.ts";
import { getCellTitle } from "@utils/helpers/getCellTitle.ts";
import { buildHistoryNote } from "@utils/battle/buildHistoryNote.ts";
import type { GameStore, HistoryCtx } from "@store/game/types.ts";
import type {
  FleetHealth,
  Shots,
  Phase,
  PlayerId,
  ShipCells,
  ShipsLayout,
} from "@app-types/game.types.ts";
import type { ShipItemPosition, ShipType } from "@app-types/common.types.ts";
import { getRemainingShips } from "@utils/battle/getRemainingShips.ts";
import { getFleetHealth } from "@utils/battle/getFleetHealth.ts";
import { generateFleetLayout } from "@utils/layout/generateFleetLayout.ts";

const getEmptyGameplayState = () => ({
  phase: "placement" as Phase,
  turn: null as PlayerId | null,
  history: [] as string[],
  move: 0,
  shots: setDataForPlayers(PLAYERS_IDS, () => ({}) as Shots[string]),
  fleetHealth: setDataForPlayers(
    PLAYERS_IDS,
    () => ({}) as FleetHealth[string],
  ),
  shipsLayout: setDataForPlayers(PLAYERS_IDS, () => [] as ShipItemPosition[]),
  occupiedCells: setDataForPlayers(PLAYERS_IDS, () => ({}) as ShipCells),
  remainingShips: setDataForPlayers(
    PLAYERS_IDS,
    () => ({}) as Record<ShipType, number>,
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
        get().setHistory("turn");
      },

      startGame: (layout) => {
        const aiLayout = generateFleetLayout(BOARD_SIZE, FLEET_CONFIG);
        const shipsLayout: ShipsLayout = {
          [CURRENT_PLAYER_ID]: layout,
          [PLAYERS_IDS[1]]: aiLayout,
        };
        set(
          {
            phase: "in-game",
            shipsLayout,
            occupiedCells: getOccupiedCellsForPlayers(PLAYERS_IDS, shipsLayout),
            remainingShips: setDataForPlayers(
              PLAYERS_IDS,
              getRemainingShips(FLEET_CONFIG),
            ),
            fleetHealth: getFleetHealth(PLAYERS_IDS, shipsLayout),
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

      fire: (defenderId, cellId) => {
        const {
          shots,
          occupiedCells,
          fleetHealth,
          shipsLayout,
          remainingShips,
        } = get();
        const { patch, result, excludedCells, shipType } = computeFire(
          defenderId,
          cellId,
          { shots, occupiedCells, fleetHealth, shipsLayout, remainingShips },
        );
        set(patch, false, `fire/${result}`);
        return { result, excludedCells, shipType };
      },

      playerMove: (defenderId, cellId) => {
        if (get().shots[defenderId][cellId] || get().turn !== CURRENT_PLAYER_ID)
          return;
        const { result, shipType } = get().fire(defenderId, cellId);
        get().setHistory(result, { cellId, shipType });
        if (result === "miss") {
          get().switchTurn();
        } else {
          get().checkWinner(defenderId);
        }
      },

      setHistory: (event, { cellId = "", shipType = "" } = {}) => {
        const attackerName = get().playersData.find(
          (p) => p.id === get().turn,
        )?.name;
        const ctx: HistoryCtx = {
          attackerName,
          cellTitle: cellId ? getCellTitle(cellId) : "",
          shipType,
          move: get().move,
        };
        set(
          { history: [...get().history, buildHistoryNote(event, ctx)] },
          false,
          "setHistory",
        );
      },

      checkWinner: (defenderId) => {
        const total = Object.values(get().fleetHealth[defenderId]).reduce(
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
