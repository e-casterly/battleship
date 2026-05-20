import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getFreeCoordsSet } from "@utils/helpers.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import type { Coord } from "@utils/gameTypes.ts";

interface AiState {
  remainingCoords: Set<string>;
  focusCoords: Coord[];
}

interface AiActions {
  resetAiState: () => void;
  setAiState: (state: {
    remainingCoords: Set<string>;
    focusCoords: Coord[];
  }) => void;
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

      setAiState: (state) => set(state, false, "setAiState"),
    }),
    { name: "AiStore" },
  ),
);
