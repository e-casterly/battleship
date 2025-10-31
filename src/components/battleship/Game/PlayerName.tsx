import { useGameStore } from "@utils/store.ts";
import cn from "classnames";
import Icon from "@components/common/Icon/Icon.tsx";

export function PlayerName({
  id,
  name,
  reverse,
}: {
  id: string;
  name: string;
  reverse?: boolean;
}) {
  const turn = useGameStore((s) => s.turn);
  return (
    <div
      className={cn("flex items-center gap-2 flex-1 justify-end", {
        "flex-row-reverse": reverse,
      })}
    >
      <div className="text-xs sm:text-sm lg:text-xl xl:text-2xl font-medium font-decorative flex justify-between items-center">
        <p>{name}</p>
      </div>
      <div
        className={cn(
          "w-4 sm:w-6 lg:w-8 2xl:w-10 eas-in-out duration-400 transition-transform",
          {
            "rotate-180": reverse,
            "text-primary/80 scale-130": turn === id,
          },
        )}
      >
        <Icon name="arrow" size="auto" />
      </div>
    </div>
  );
}
