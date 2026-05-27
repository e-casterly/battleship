import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  getRemainingCells,
} from "@utils/layout-helpers/getRemainingCells.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import type { AiStore } from "@store/ai/types.ts";

export const useAiStore = create<AiStore>()(
  devtools(
    (set) => ({
      remainingCells: getRemainingCells(BOARD_SIZE),
      focusCoords: [],

      resetAiState: () =>
        set(
          { remainingCells: getRemainingCells(BOARD_SIZE), focusCoords: [] },
          false,
          "resetAiState",
        ),

      applyShot: (excludedCells, result, hitPoint) =>
        set(
          (state) => {
            const newRemainingCells = new Set(state.remainingCells);
            for (const cell of excludedCells) newRemainingCells.delete(cell);

            let newFocusCoords = [...state.focusCoords];
            if (result === "hit") newFocusCoords = [...newFocusCoords, hitPoint];
            else if (result === "sunk") newFocusCoords = [];

            return {
              remainingCells: newRemainingCells,
              focusCoords: newFocusCoords,
            };
          },
          false,
          "applyShot",
        ),
    }),
    { name: "AiStore" },
  ),
);