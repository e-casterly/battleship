import { useGameStore } from "@utils/store.ts";
import type { PlayerId } from "@utils/gameTypes.ts";
import cn from "classnames";
import Icon from "@components/common/Icon/Icon.tsx";

interface BoardCellProps {
  cellKey: string;
  title: string;
  ownerId: PlayerId;
  className?: string;
}
export function BoardCell({
  cellKey,
  title,
  ownerId,
  className,
}: BoardCellProps) {
  const turn = useGameStore((s) => s.turn);

  const occupiedCell = useGameStore(
    (s) => s.occupiedCells?.[ownerId]?.[cellKey],
  );

  const isShip = typeof occupiedCell === "number";

  const currentPlayerId = useGameStore((s) => s.currentPlayerId);
  const isPlayerBoard = currentPlayerId === ownerId;

  const hitStatus =
    useGameStore((s) => s.hits?.[ownerId]?.[cellKey]) || undefined;

  const isDisable =
    hitStatus !== undefined ||
    isPlayerBoard ||
    turn !== currentPlayerId ||
    !ownerId ||
    !cellKey;

  const playerMove = useGameStore((s) => s.playerMove);

  function onClickCell() {
    if (isDisable) return;
    playerMove(ownerId, cellKey);
  }

  const iconClasses = "absolute inset-0 w-8/12 h-8/12 m-auto";

  return (
    <button
      className={cn(
        "relative cell-size overflow-visible",
        "inline-flex justify-center items-center",
        "border border-stroke",
        "disabled:pointer-events-none disabled:cursor-default",
        { "touch-none focus-visible:outline-none": isDisable },
        {
          "hover:bg-primary/20 hover:border-primary z-10 cursor-pointer":
            !isDisable,
        },
        { "bg-primary/80": isPlayerBoard && isShip },
        className,
      )}
      onClick={onClickCell}
      disabled={isDisable}
      aria-label={title}
      data-coord={cellKey}
    >
      {isPlayerBoard && occupiedCell === "space" && (
        <div className={cn("h-1 w-1 xl:h-2 xl:w-2 bg-note rounded-full")}></div>
      )}
      {hitStatus === "hit" && (
        <div className={cn(iconClasses, "animate-appearing")}>
          <Icon name="close" size="auto" />
        </div>
      )}
      {hitStatus === "sunk" && (
        <div className={cn(iconClasses, "text-danger animate-shake")}>
          <Icon name="close" size="auto" />
        </div>
      )}
      {hitStatus === "miss" && (
        <div className={cn(iconClasses, "animate-appearing")}>
          <Icon name="circle" size="auto" />
        </div>
      )}
    </button>
  );
}
