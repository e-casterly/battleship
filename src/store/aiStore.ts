import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getFreeCoordsSet } from "@utils/helpers.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import type { CellStatus, Coord } from "@utils/gameTypes.ts";

interface AiState {
  remainingCoords: Set<string>;
  focusCoords: Coord[];
}

interface AiActions {
  resetAiState: () => void;
  applyShot: (excludedCoords: string[], result: CellStatus, hitPoint: Coord) => void;
}

type AiStore = AiState & AiActions;

export const useAiStore = create<AiStore>()(
  devtools(
    (set) => ({
      remainingCoords: getFreeCoordsSet(BOARD_SIZE),
      focusCoords: [],

      resetAiState: () =>
        set(
          { remainingCoords: getFreeCoordsSet(BOARD_SIZE), focusCoords: [] },
          false,
          "resetAiState",
        ),

      applyShot: (excludedCoords, result, hitPoint) =>
        set(
          (state) => {
            const newRemainingCoords = new Set(state.remainingCoords);
            for (const coord of excludedCoords) newRemainingCoords.delete(coord);

            let newFocusCoords = [...state.focusCoords];
            if (result === "hit") newFocusCoords = [...newFocusCoords, hitPoint];
            else if (result === "sunk") newFocusCoords = [];

            return { remainingCoords: newRemainingCoords, focusCoords: newFocusCoords };
          },
          false,
          "applyShot",
        ),
    }),
    { name: "AiStore" },
  ),
);
