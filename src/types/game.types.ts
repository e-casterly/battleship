import type {
  CellId,
  ShipId,
  ShipItemPosition, ShipType,
} from "@app-types/common.types.ts";

export type PlayerId = string;

export interface PlayerData {
  name: string;
  id: PlayerId;
}

export type ShotResult = "miss" | "hit" | "sunk";

export type ShotMap = {
  [cellId: string]: ShotResult;
};

export type ShipCells = Record<CellId, ShipId>; // used in game phase for fire lookup

export type Shots = Record<PlayerId, ShotMap>;

export type ShipHealth = Record<string, number>;

export type FleetHealth = Record<PlayerId, ShipHealth>;

export type Phase = "placement" | "in-game" | "game-over";

export type HistoryEvent = "start" | "turn" | "miss" | "hit" | "sunk" | "win";

export interface HistoryCtx {
  attackerName?: string;
  cellTitle?: string;
  shipType?: string;
  move?: number;
}

export type ShipsLayout = Record<PlayerId, ShipItemPosition[]>;

export type OccupiedCells = Record<PlayerId, ShipCells>;

export type RemainingShips = Record<PlayerId, Record<ShipType, number>>;

export type HistoryNotes = string[];
