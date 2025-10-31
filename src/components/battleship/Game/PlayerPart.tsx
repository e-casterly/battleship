import Ship from "@components/battleship/Ship/Ship.tsx";
import Board from "@components/battleship/Board/Board.tsx";
import { useGameStore } from "@utils/store.ts";
import type { PlayerData, ShipType } from "@utils/gameTypes.ts";

interface PlayerPartProps {
  name: PlayerData["name"];
  id: PlayerData["id"];
}

export function PlayerPart({ id }: PlayerPartProps) {
  const fleet = useGameStore((s) => s.fleetConfig);

  const maxShips = Object.values(fleet).reduce(
    (acc, curr) => acc + curr.count,
    0,
  );

  return (
    <div className="col-span-12 lg:col-span-6 flex flex-col items-center first:lg:items-end last:lg:items-start group">
      <div className="flex flex-col lg:flex-row gap-x-4 group-[&:last-child]:lg:flex-row-reverse">
        <div className="flex flex-row lg:flex-col justify-between mb-1 sm:mb-2 lg:mb-0 lg:pt-6.5 flex-auto gap-1 sm:gap-2">
          {Object.keys(fleet).map((ship) => (
            <Ship
              key={ship}
              playerId={id}
              variant={ship as ShipType}
              size={fleet[ship as ShipType].size}
              maxShips={maxShips}
            />
          ))}
        </div>
        <div className="flex-none inline-flex">
          <Board ownerId={id} />
        </div>
      </div>
    </div>
  );
}
