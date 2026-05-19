import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getFreeCoordsSet } from "@utils/helpers.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import type { Coord } from "@utils/gameTypes.ts";

interface AiState {
  aiRemainingCoords: Set<string>;
  aiFocusCoords: Coord[];
}

interface AiActions {
  resetAiState: () => void;
  setAiState: (state: {
    aiRemainingCoords: Set<string>;
    aiFocusCoords: Coord[];
  }) => void;
}

type AiStore = AiState & AiActions;

export const useAiStore = create<AiStore>()(
  devtools(
    (set) => ({
      aiRemainingCoords: getFreeCoordsSet(BOARD_SIZE),
      aiFocusCoords: [],

      resetAiState: () =>
        set({
          aiRemainingCoords: getFreeCoordsSet(BOARD_SIZE),
          aiFocusCoords: [],
        }),

      setAiState: (state) => set(state),
    }),
    { name: "AiStore" },
  ),
);
