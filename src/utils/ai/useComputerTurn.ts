import { useCallback, useEffect } from "react";
import {
  CURRENT_PLAYER_ID,
  AI_SHOT_DELAY_MS,
  FLEET_CONFIG,
} from "@utils/constants.ts";
import { useAiStore } from "@store/ai/useAiStore.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import { useGameStore } from "@store/game/useGameStore.ts";
import { pickAiTarget } from "@utils/ai/pickAiTarget.ts";
import { getMinRemainingShipSize } from "@utils/ai/getMinRemainingShipSize.ts";

export function useComputerTurn() {
  const phase = useGameStore((s) => s.phase);
  const turn = useGameStore((s) => s.turn);

  useEffect(() => {
    if (phase === "placement") {
      useAiStore.getState().resetAiState();
    }
  }, [phase]);

  const executeComputerMove = useCallback(() => {
    const { remainingCells, focusCoords } = useAiStore.getState();

    const remainingShips = useGameStore.getState().remainingShips[CURRENT_PLAYER_ID];
    const minShipSize = getMinRemainingShipSize(remainingShips, FLEET_CONFIG);

    const aiTarget = pickAiTarget(remainingCells, focusCoords, minShipSize);

    if (!aiTarget) {
      useGameStore.getState().switchTurn();
      return false;
    }

    const cellId = coordsToCellId(aiTarget);
    const { result, excludedCells, shipType } = useGameStore
      .getState()
      .fire(CURRENT_PLAYER_ID, cellId);

    useAiStore.getState().applyShot(excludedCells, result, aiTarget);
    useGameStore.getState().setHistory(result, { cellId, shipType });

    if (result === "miss") {
      useGameStore.getState().switchTurn();
      return false;
    }

    const winner = useGameStore.getState().checkWinner(CURRENT_PLAYER_ID);
    return !winner;
  }, []);

  useEffect(() => {
    if (phase !== "in-game" || turn === CURRENT_PLAYER_ID) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const schedule = (delay: number) => {
      const id = setTimeout(() => {
        const shouldContinue = executeComputerMove();
        if (shouldContinue) schedule(AI_SHOT_DELAY_MS);
      }, delay);
      timeouts.push(id);
    };

    schedule(AI_SHOT_DELAY_MS);
    return () => timeouts.forEach(clearTimeout);
  }, [phase, turn, executeComputerMove]);
}
