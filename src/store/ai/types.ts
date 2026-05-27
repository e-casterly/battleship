import type { Coord } from "@app-types/common.types.ts";
import type { ShotResult } from "@app-types/game.types.ts";

interface AiState {
  remainingCells: Set<string>;
  focusCoords: Coord[];
}

interface AiActions {
  resetAiState: () => void;
  applyShot: (
    excludedCells: string[],
    result: ShotResult,
    hitPoint: Coord,
  ) => void;
}

export type AiStore = AiState & AiActions;