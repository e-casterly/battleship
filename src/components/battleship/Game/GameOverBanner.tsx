import { useGameStore } from "@store/gameStore.ts";
import Button from "@components/common/Button/Button.tsx";
import { Bubbles } from "@components/battleship/Bubbles/Bubbles.tsx";

export function GameOverBanner() {
  const startNewGame = useGameStore((s) => s.startNewGame);

  return (
    <>
      <div className="flex justify-center mb-4 animate-fade-in">
        <Button onClick={startNewGame}>Start new game</Button>
      </div>
      <Bubbles />
    </>
  );
}
