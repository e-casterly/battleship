import type {
  ShotResult,
  FleetHealth,
  Shots,
  Phase,
  PlayerData,
  PlayerId,
  ShipsLayout,
  HistoryEvent,
  HistoryCtx,
  OccupiedCells,
  RemainingShips,
  HistoryNotes,
} from "@app-types/game.types.ts";
import type { ShipItemPosition, ShipType } from "@app-types/common.types.ts";

export type { HistoryEvent, HistoryCtx };

interface GameState {
  playersData: PlayerData[];
  phase: Phase;
  turn: PlayerId | null;
  history: HistoryNotes;
  move: number;
  shots: Shots;
  fleetHealth: FleetHealth;
  shipsLayout: ShipsLayout;
  occupiedCells: OccupiedCells;
  remainingShips: RemainingShips;
}

interface GameActions {
  startGame: (layout: ShipItemPosition[]) => void;
  startNewGame: () => void;
  resetSameGame: () => void;
  switchTurn: () => void;
  fire: (
    playerId: PlayerId,
    cellId: string,
  ) => { result: ShotResult; excludedCells: string[]; shipType?: ShipType };
  playerMove: (playerId: PlayerId, cellId: string) => void;
  setHistory: (
    event: HistoryEvent,
    options?: { cellId?: string; shipType?: string },
  ) => void;
  checkWinner: (defenderId: string) => boolean;
}

export type GameStore = GameState & GameActions;
