import { useEffect } from "react";
import { useGameStore } from "@store/gameStore.ts";
import { CURRENT_PLAYER_ID } from "@utils/constants.ts";

export function useComputerTurn() {
  const phase = useGameStore((s) => s.phase);
  const turn = useGameStore((s) => s.turn);
  const computerMove = useGameStore((s) => s.computerMove);

  useEffect(() => {
    if (phase !== "in-game" || turn === CURRENT_PLAYER_ID) return;

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const schedule = (delay: number) => {
      const id = setTimeout(() => {
        const shouldContinue = computerMove();
        if (shouldContinue) schedule(500);
      }, delay);
      timeouts.push(id);
    };

    schedule(600);
    return () => timeouts.forEach(clearTimeout);
  }, [phase, turn, computerMove]);
}
