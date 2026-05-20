import { useGameStore } from "@store/gameStore.ts";
import { ShipPlacement } from "@components/battleship/ShipPlacement/ShipPlacement.tsx";
import { BattleView } from "@components/battleship/Game/BattleView.tsx";
import { GameOverBanner } from "@components/battleship/Game/GameOverBanner.tsx";

export default function Game() {
  const phase = useGameStore((s) => s.phase);

  if (phase === "placement") return <ShipPlacement />;
  return (
    <>
      {phase === "game-over" && <GameOverBanner />}
      <BattleView />
    </>
  );
}
