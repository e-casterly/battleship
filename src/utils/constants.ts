import type { FleetConfig } from "@app-types/common.types.ts";

export const BOARD_SIZE: [number, number] = [10, 10]; // [rows, cols]

export const FLEET_CONFIG: FleetConfig = {
  galleon: { size: 5, count: 1 },
  frigate: { size: 4, count: 1 },
  brigantine: { size: 3, count: 1 },
  schooner: { size: 2, count: 2 },
  sloop: { size: 1, count: 2 },
};

export const TOTAL_SHIPS = Object.values(FLEET_CONFIG).reduce((acc, { count }) => acc + count, 0);

export const PLAYERS_IDS = ["player", "computer"];
export const CURRENT_PLAYER_ID = PLAYERS_IDS[0];

export const HORIZONTAL_DIRS = [
  [0, 1],
  [0, -1],
];
export const VERTICAL_DIRS = [
  [1, 0],
  [-1, 0],
];

export const DIRS: number[][] = [...HORIZONTAL_DIRS, ...VERTICAL_DIRS];

export const AI_SHOT_DELAY_MS = 600;
