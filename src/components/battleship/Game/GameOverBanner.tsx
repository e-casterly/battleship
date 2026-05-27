import { usePlacementStore } from "@store/placement/usePlacementStore.ts";
import Button from "@components/common/Button/Button.tsx";
import { Bubbles } from "@components/battleship/Bubbles/Bubbles.tsx";
import { useGameStore } from "@store/game/useGameStore.ts";

export function GameOverBanner() {
  function onStartNewGame() {
    usePlacementStore.getState().resetPlacementState([]);
    useGameStore.getState().startNewGame();
  }

  return (
    <>
      <div className="flex justify-center mb-4 animate-fade-in">
        <Button onClick={onStartNewGame}>Start new game</Button>
      </div>
      <Bubbles />
    </>
  );
}
