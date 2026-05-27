import { useComputerTurn } from "@utils/ai/useComputerTurn.ts";
import { ShipPlacement } from "@components/battleship/Placement/ShipPlacement.tsx";
import { BattleView } from "@components/battleship/Game/BattleView.tsx";
import { GameOverBanner } from "@components/battleship/Game/GameOverBanner.tsx";
import { useGameStore } from "@store/game/useGameStore.ts";

export default function Game() {
  useComputerTurn();
  const phase = useGameStore((s) => s.phase);

  if (phase === "placement") return <ShipPlacement />;
  return (
    <>
      {phase === "game-over" && <GameOverBanner />}
      <BattleView />
    </>
  );
}
