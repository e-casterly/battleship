import Button from "@components/common/Button/Button.tsx";
import { useGameStore } from "@store/gameStore.ts";
import { usePlacementStore } from "@store/placementStore.ts";
import { TOTAL_SHIPS } from "@utils/constants.ts";

export function StartGame() {
  const startGame = useGameStore((s) => s.startGame);
  const layout = usePlacementStore((s) => s.layout);
  const isReady = layout.length === TOTAL_SHIPS;

  return (
    <div className="flex justify-center">
      <Button onClick={() => startGame(layout)} disabled={!isReady} size="large">
        Start game
      </Button>
    </div>
  );
}
