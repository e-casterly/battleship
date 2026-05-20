export type ShipType =
  | "galleon"
  | "frigate"
  | "brigantine"
  | "schooner"
  | "sloop";
export type FleetConfig = Record<ShipType, { size: number; count: number }>;
export type Coord = [number, number];
export type BoardSize = [number, number];

export interface ShipItemPosition {
  positions: Coord[];
  margins: Coord[];
  type: ShipType;
}

export type CellStatus = "miss" | "hit" | "sunk";
export type HitStatus = {
  [key: string]: CellStatus;
};
export type PlayerFleetShots = Record<number, number>;

export type PlayerId = string;
export interface PlayerData {
  name: string;
  id: PlayerId;
}

export type ShipsLayout = Record<PlayerId, ShipItemPosition[]>;
export type OccupiedCells = Record<string, number | string>;
export type OccupiedCellsPlacementPreview = Record<string, "ship" | "space">;
export type Hits = Record<PlayerId, HitStatus>;
export type FleetShots = Record<PlayerId, PlayerFleetShots>;

export type Phase = "placement" | "in-game" | "game-over";

export type DragInfo = {
  isDraggable: boolean;
  pos: { x: number; y: number };
  shipId: number | null;
  occupiedCells: OccupiedCells;
  startPoint: Coord | null;
  indexCell: number;
  shipVariant: ShipType | null;
  shipSize: number;
  cellSize: number;
};
