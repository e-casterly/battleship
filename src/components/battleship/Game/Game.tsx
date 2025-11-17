import { useGameStore } from "@utils/store.ts";
import { PlayerPart } from "@components/battleship/Game/PlayerPart.tsx";
import { History } from "@components/battleship/History/History.tsx";
import { ShipPlacement } from "@components/battleship/ShipPlacement/ShipPlacement.tsx";
import Button from "@components/common/Button/Button.tsx";
import { PlayerName } from "@components/battleship/Game/PlayerName.tsx";

export default function Game() {
  const players = useGameStore((s) => s.playersData);
  const phase = useGameStore((s) => s.phase);

  const startNewGame = useGameStore((s) => s.startNewGame);

  return (
    <>
      {phase === "placement" && <ShipPlacement />}
      {phase === "game-over" && (
        <div className="flex justify-center mb-4 animate-fade-in">
          <Button onClick={startNewGame}>Start new game</Button>
        </div>
      )}
      {phase !== "placement" && (
        <>
          <div className="grid grid-cols-12 gap-x-2 items-center mb-2 sm:mb-4">
            <PlayerName id={players[0].id} name={players[0].name} />
            <History className="col-span-6" />
            <PlayerName id={players[1].id} name={players[1].name} reverse />
          </div>
          <div className="w-full grid grid-cols-12 gap-3 sm:gap-4 md:gap-8 xl:gap-12">
            {players.map((player) => (
              <PlayerPart key={player.id} id={player.id} name={player.name} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
