import { useGameStore } from "@store/gameStore.ts";
import { PlayerPart } from "@components/battleship/Game/PlayerPart.tsx";
import { History } from "@components/battleship/History/History.tsx";
import { PlayerName } from "@components/battleship/Game/PlayerName.tsx";

export function BattleView() {
  const players = useGameStore((s) => s.playersData);

  return (
    <>
      <div className="grid grid-cols-12 gap-x-2 items-center mb-2 sm:mb-4">
        <PlayerName id={players[0].id} name={players[0].name} />
        <History className="col-span-6" />
        <PlayerName id={players[1].id} name={players[1].name} reverse />
      </div>
      <div className="w-full grid grid-cols-12 gap-3 sm:gap-4 md:gap-8 xl:gap-12">
        {players.map((player) => (
          <PlayerPart key={player.id} id={player.id} />
        ))}
      </div>
    </>
  );
}
