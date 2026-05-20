import Ship from "@components/battleship/Ship/Ship.tsx";
import { GameBoard } from "@components/battleship/Board/GameBoard.tsx";
import { FLEET_CONFIG, CURRENT_PLAYER_ID } from "@utils/constants.ts";
import type { PlayerData, ShipType } from "@utils/gameTypes.ts";
import cn from 'clsx';

interface PlayerPartProps {
  name: PlayerData["name"];
  id: PlayerData["id"];
}

export function PlayerPart({ id }: PlayerPartProps) {
  const isPlayer = CURRENT_PLAYER_ID === id;
  const fleet = FLEET_CONFIG;

  const maxShips = Object.values(fleet).reduce(
    (acc, curr) => acc + curr.count,
    0,
  );

  return (
    <div className={cn("col-span-12 md:col-span-6 flex flex-col items-center first:lg:items-end last:lg:items-start group", {
      "max-md:order-first": !isPlayer,
    })}>
      <div className="flex flex-col lg:flex-row gap-x-4 group-last:lg:flex-row-reverse">
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
          <GameBoard ownerId={id} />
        </div>
      </div>
    </div>
  );
}
