import Button from "@components/common/Button/Button.tsx";
import { useGameStore } from "@store/gameStore.ts";
import { usePlacementStore } from "@store/placementStore.ts";


export function StartGame() {
  const startGame = useGameStore((s) => s.startGame);
  const remainingShips = usePlacementStore((s) => s.remainingShips);
  const isReady = Object.values(remainingShips).every((count) => count === 0);
  return (
    <div className="flex justify-center">
      <Button onClick={startGame} isDisable={!isReady} size="large">
        Start game
      </Button>
    </div>
  );
}