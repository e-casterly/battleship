import { useCallback, useEffect } from "react";
import { useGameStore } from "@store/gameStore.ts";
import { useAiStore } from "@store/aiStore.ts";
import { getNextPoint } from "@utils/aiLogic.ts";
import { getStringCoordinate } from "@utils/helpers.ts";
import { CURRENT_PLAYER_ID, AI_SHOT_DELAY_MS, FLEET_CONFIG } from "@utils/constants.ts";
import type { ShipType } from "@utils/gameTypes.ts";

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

    const remainingShips = useGameStore.getState().remainingShips[CURRENT_PLAYER_ID];
    const minShipSize = Object.entries(remainingShips)
      .filter(([, count]) => count > 0)
      .reduce((min, [type]) => Math.min(min, FLEET_CONFIG[type as ShipType].size), Infinity);

    const nextPoint = getNextPoint(remainingCoords, focusCoords, minShipSize);

    if (!nextPoint) {
      useGameStore.getState().switchTurn();
      return false;
    }

    const cellKey = getStringCoordinate(nextPoint);
    const { result, excludedCoords, shipType } = useGameStore
      .getState()
      .fire(CURRENT_PLAYER_ID, cellKey);

    useAiStore.getState().applyShot(excludedCoords, result, nextPoint);
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
        if (shouldContinue) schedule(AI_SHOT_DELAY_MS);
      }, delay);
      timeouts.push(id);
    };

    schedule(AI_SHOT_DELAY_MS);
    return () => timeouts.forEach(clearTimeout);
  }, [phase, turn, executeComputerMove]);
}
