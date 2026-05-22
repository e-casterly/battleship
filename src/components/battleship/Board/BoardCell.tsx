import { memo } from "react";
import { useGameStore } from "@store/gameStore.ts";
import cn from "clsx";
import Icon from "@components/common/Icon/Icon.tsx";
import type { CellStatus, PlayerId } from "@utils/gameTypes.ts";

interface BoardCellProps {
  cellKey: string;
  title: string;
  ownerId: PlayerId;
  isPlayerBoard: boolean;
  isInteractive: boolean;
  occupiedCell: string | undefined;
  hitStatus: CellStatus | undefined;
  className?: string;
}

export const BoardCell = memo(function BoardCell({
  cellKey,
  title,
  ownerId,
  isPlayerBoard,
  isInteractive,
  occupiedCell,
  hitStatus,
  className,
}: BoardCellProps) {
  const isShip = occupiedCell !== undefined && occupiedCell !== "space";
  const isDisable = hitStatus !== undefined || !isInteractive;

  function onClickCell() {
    if (isDisable) return;
    useGameStore.getState().playerMove(ownerId, cellKey);
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
        { "hover:bg-primary/20 hover:border-primary z-10 cursor-pointer": !isDisable },
        { "bg-primary/80": isPlayerBoard && isShip },
        className,
      )}
      onClick={onClickCell}
      disabled={isDisable}
      aria-label={title}
      data-coord={cellKey}
    >
      {isPlayerBoard && occupiedCell === "space" && (
        <div className="h-1 w-1 xl:h-2 xl:w-2 bg-note rounded-full" />
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
});
