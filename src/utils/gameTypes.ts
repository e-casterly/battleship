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

type HistoryCases = "start" | "turn" | "miss" | "hit" | "sunk" | "win";
interface HistoryOptions {
  shipType?: string;
  cellKey?: string;
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
  direction: "h" | "v";
  shipId: number | null;
  occupiedCells: OccupiedCells;
  startPoint: Coord | null;
  indexCell: number;
  shipVariant: ShipType | null;
  shipSize: number;
  cellSize: number;
};

export interface GameState {
  boardSize: BoardSize;
  fleetConfig: FleetConfig;

  playersIds: PlayerId[];
  playersData: PlayerData[];
  currentPlayerId: string;

  shipsLayout: ShipsLayout;
  occupiedCells: Record<PlayerId, OccupiedCells>;
  remainingShips: Record<PlayerId, Record<ShipType, number>>;

  occupiedCellsPlacementPreview: OccupiedCellsPlacementPreview;
  dragInfo: DragInfo;

  phase: Phase;
  turn: PlayerId | null;
  history: string[];
  move: number;
  hits: Hits;
  fleetShots: FleetShots;

  aiRemainingCoords: Set<string>;
  aiFocusCoords: Coord[];
}

export interface GameActions {
  startGame: () => void;
  startNewGame: () => void;
  resetSameGame: () => void;

  randomizeShipsLayout: () => void;
  customizeShipsLayout: () => void;

  switchTurn: () => void;
  fire: (
    playerId: PlayerId,
    cellKey: string,
  ) => { result: CellStatus; excludedCoords: string[]; shipType?: string };
  playerMove: (playerId: PlayerId, cellKey: string) => void;
  computerMove: () => void;
  setHistory: (event: HistoryCases, options: HistoryOptions) => void;
  checkWinner: (defenderId: string) => boolean;

  changeRemainingShipAmount: (
    playerId: PlayerId,
    shipVariant: ShipType,
  ) => void;

  shipPlacement: (startPoint: string | null, isPreview?: boolean) => void;
  setPreviewCells: (shipPosition: ShipItemPosition | null) => void;
  onStartDragging: ({
    variant,
    index,
    shipId,
    coord,
    x,
    y,
    cellSize,
  }: {
    variant: ShipType | undefined;
    index: number | undefined;
    shipId: string;
    coord: string;
    x: number;
    y: number;
    cellSize: number;
  }) => void;

  setDragInfo: (isReset: boolean, info?: Partial<DragInfo>) => void;
  switchDirection: () => void;
}
