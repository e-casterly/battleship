import Icon from "@components/common/Icon/Icon.tsx";
import { useGameStore } from "@utils/store.ts";
import cn from "classnames";
import type { FleetConfig, PlayerId } from "@utils/gameTypes.ts";

interface ShipProps {
  variant: keyof FleetConfig;
  playerId: PlayerId;
  size?: number;
  maxShips?: number;
}

export default function Ship({
  variant,
  playerId,
  size = 0,
  maxShips = 5,
}: ShipProps) {
  const count: number = useGameStore(
    (s) => s.remainingShips[playerId]?.[variant] || 0,
  );
  return (
    <div className="flex flex-col items-center relative pl-2.5 lg:pl-3.5 flex-1">
      <div className="flex flex-col items-center relative w-full border-stroke border flex-1 justify-center py-0.5">
        <div
          className={cn(
            "flex justify-center items-center w-6 md:w-9 xl:w-12 text-foreground",
            {
              "text-note": count === 0,
            },
          )}
        >
          <Icon name={variant} size="auto" />
        </div>
        <div
          className={cn(
            "flex items-center justify-center absolute -top-1 -right-1 text-xs px-1 bg-foreground text-foreground-secondary rounded-full h-4 w-4 2xl:h-5 2xl:w-5 leading-none",
            {
              "bg-note": count === 0,
            },
          )}
        >
          {count}
        </div>
        <p
          className={cn(
            "text-tiny xl:text-xs 2xl:text-sm text-center capitalize w-full pb-px px-1 max-lg:hidden",
            {
              "text-note": count === 0,
            },
          )}
        >
          {variant}
        </p>
      </div>
      <div
        className="grid absolute top-0 left-px bottom-0"
        style={{
          gridTemplateRows: `repeat(${maxShips}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: size }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-2.5 lg:w-3.5 relative border-stroke border [&:not(:last-child)]:border-b-0",
              { "bg-primary/80": count > 0 },
              { "bg-note/80": count === 0 },
            )}
          ></div>
        ))}
      </div>
    </div>
  );
}
