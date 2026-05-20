import Board from "@components/battleship/Board/Board.tsx";
import { useGameStore } from "@store/gameStore.ts";
import { DragGhost } from "@components/battleship/ShipPlacement/DragGhost.tsx";
import { PlacementPanel } from "@components/battleship/ShipPlacement/PlacementPanel.tsx";
import { useDragHandlers } from "@components/battleship/ShipPlacement/useDragHandlers.ts";
import { StartGame } from "@components/battleship/ShipPlacement/StartGame.tsx";

export function ShipPlacement() {
  const currentPlayerId = useGameStore((s) => s.currentPlayerId);

  const { onPointerDown } = useDragHandlers();

  return (
    <>
      <StartGame />
      <p className="text-center my-3 md:my-6 text-sm md:text-lg lg:text-xl font-decorative">
        Hey, Captain! Place your ships and start the game!
      </p>
      <div className="grid grid-cols-12 gap-4 lg:gap-12">
        <PlacementPanel onPointerDown={onPointerDown} />
        <div className="col-span-12 lg:col-span-6 justify-self-center lg:justify-self-start">
          <Board ownerId={currentPlayerId} onPointerDown={onPointerDown} />
        </div>
      </div>
      <DragGhost />
    </>
  );
}
