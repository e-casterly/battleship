import { useCallback, useEffect } from "react";
import { useGameStore } from "@store/gameStore.ts";
import { useAiStore } from "@store/aiStore.ts";
import { getNextPoint } from "@utils/aiLogic.ts";
import { getStringCoordinate } from "@utils/helpers.ts";
import { CURRENT_PLAYER_ID } from "@utils/constants.ts";

export function useComputerTurn() {
  const phase = useGameStore((s) => s.phase);
  const turn = useGameStore((s) => s.turn);

  useEffect(() => {
    if (phase === "placement") {
      useAiStore.getState().resetAiState();
    }
  }, [phase]);

  const executeComputerMove = useCallback(() => {
    const { remainingCoords, focusCoords } = useAiStore.getState();
    const nextPoint = getNextPoint(remainingCoords, focusCoords);

    if (!nextPoint) {
      useGameStore.getState().switchTurn();
      return false;
    }

    const cellKey = getStringCoordinate(nextPoint);
    const { result, excludedCoords, shipType } = useGameStore
      .getState()
      .fire(CURRENT_PLAYER_ID, cellKey);

    const newRemainingCoords = new Set(remainingCoords);
    for (const coord of excludedCoords) newRemainingCoords.delete(coord);

    let newFocusCoords = [...focusCoords];
    if (result === "hit") newFocusCoords = [...newFocusCoords, nextPoint];
    else if (result === "sunk") newFocusCoords = [];

    useAiStore.getState().setAiState({
      remainingCoords: newRemainingCoords,
      focusCoords: newFocusCoords,
    });

    useGameStore.getState().setHistory(result, { cellKey, shipType });

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
        if (shouldContinue) schedule(500);
      }, delay);
      timeouts.push(id);
    };

    schedule(600);
    return () => timeouts.forEach(clearTimeout);
  }, [phase, turn, executeComputerMove]);
}
