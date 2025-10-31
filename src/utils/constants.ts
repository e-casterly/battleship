import type { FleetConfig } from "@utils/gameTypes.ts";

export const BOARD_SIZE: [number, number] = [10, 10]; // [rows, cols]

export const FLEET_CONFIG: FleetConfig = {
  galleon: { size: 5, count: 1 },
  frigate: { size: 4, count: 1 },
  brigantine: { size: 3, count: 1 },
  schooner: { size: 3, count: 1 },
  sloop: { size: 2, count: 1 },
};

export const PLAYERS_IDS = ["player", "computer"];

export const HORIZONTAL_DIRS = [
  [0, 1],
  [0, -1],
];
export const VERTICAL_DIRS = [
  [1, 0],
  [-1, 0],
];

export const DIRS: number[][] = [...HORIZONTAL_DIRS, ...VERTICAL_DIRS] as const;
