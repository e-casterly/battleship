import Button from "@components/common/Button/Button.tsx";
import { usePlacementStore } from "@store/placement/usePlacementStore.ts";
import { TOTAL_SHIPS } from "@utils/constants.ts";
import { useGameStore } from "@store/game/useGameStore.ts";

export function StartGame() {
  const startGame = useGameStore((s) => s.startGame);
  const layout = usePlacementStore((s) => s.layout);
  const isReady = layout.length === TOTAL_SHIPS;

  return (
    <div className="flex justify-center">
      <Button
        onClick={() => startGame(layout)}
        disabled={!isReady}
        size="large"
      >
        Start game
      </Button>
    </div>
  );
}
