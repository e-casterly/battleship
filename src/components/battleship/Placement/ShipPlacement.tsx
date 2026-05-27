import { PlacementBoard } from "@components/battleship/Placement/PlacementBoard.tsx";
import { DragGhost } from "@components/battleship/Placement/DragGhost.tsx";
import { PlacementPanel } from "@components/battleship/Placement/PlacementPanel.tsx";
import { useDragHandlers } from "@components/battleship/Placement/useDragHandlers.ts";
import { StartGame } from "@components/battleship/Placement/StartGame.tsx";

export function ShipPlacement() {
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
          <PlacementBoard onPointerDown={onPointerDown} />
        </div>
      </div>
      <DragGhost />
    </>
  );
}
