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
  id: string;
  positions: Coord[];
  margins: Coord[];
  type: ShipType;
}

export type CellStatus = "miss" | "hit" | "sunk";
export type HitStatus = {
  [key: string]: CellStatus;
};
export type PlayerFleetShots = Record<string, number>;

export type PlayerId = string;
export interface PlayerData {
  name: string;
  id: PlayerId;
}

export type ShipsLayout = Record<PlayerId, ShipItemPosition[]>;
export type ShipCells = Record<string, string>; // cellKey → shipId, used in game phase for fire lookup
export type PlacementCells = Record<string, string>; // cellKey → shipId | "space", used in placement for collision detection
export type PreviewCells = Record<string, "ship" | "space">;
export type Hits = Record<PlayerId, HitStatus>;
export type FleetShots = Record<PlayerId, PlayerFleetShots>;

export type Phase = "placement" | "in-game" | "game-over";

export type DragInfo = {
  isDraggable: boolean;
  shipId: string | null;
  occupiedCells: PlacementCells;
  indexCell: number;
  shipVariant: ShipType | null;
  shipSize: number;
  cellSize: number;
};
