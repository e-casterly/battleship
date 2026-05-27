export type ShipType =
  | "galleon"
  | "frigate"
  | "brigantine"
  | "schooner"
  | "sloop";

export type FleetConfig = Record<ShipType, { size: number; count: number }>;
export type Coord = [number, number];
export type BoardSize = [number, number];

export type ShipId = string;
export type CellId = string;

export type Orientation = "h" | "v";

export interface ShipItemPosition {
  id: string;
  positions: Coord[];
  margins: Coord[];
  type: ShipType;
}
