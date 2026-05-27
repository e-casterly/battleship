import { memo } from "react";
import cn from "clsx";
import Icon from "@components/common/Icon/Icon.tsx";
import type { ShotResult, PlayerId } from "@app-types/game.types.ts";
import { useGameStore } from "@store/game/useGameStore.ts";
import type { CellId } from "@app-types/common.types.ts";

interface BoardCellProps {
  cellId: CellId;
  title: string;
  ownerId: PlayerId;
  isPlayerBoard: boolean;
  isInteractive: boolean;
  occupiedCell: string | undefined;
  shotStatus: ShotResult | undefined;
  isSpace: boolean;
  isGameOver: boolean;
  className?: string;
}

export const BoardCell = memo(function BoardCell({
  cellId,
  title,
  ownerId,
  isPlayerBoard,
  isInteractive,
  occupiedCell,
  shotStatus,
  isSpace,
  isGameOver,
  className,
}: BoardCellProps) {
  const isShip = occupiedCell !== undefined;
  const isDisable = shotStatus !== undefined || !isInteractive;

  function onClickCell() {
    if (isDisable) return;
    useGameStore.getState().playerMove(ownerId, cellId);
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
        {
          "bg-primary/80": (isPlayerBoard || isGameOver) && isShip,
        },
        className,
      )}
      onClick={onClickCell}
      disabled={isDisable}
      aria-label={title}
      data-cell-id={cellId}
    >
      {(isPlayerBoard || isGameOver) && isSpace && (
        <div className="h-1 w-1 xl:h-2 xl:w-2 bg-note rounded-full" />
      )}
      {shotStatus === "hit" && (
        <div className={cn(iconClasses, "animate-appearing")}>
          <Icon name="close" size="auto" />
        </div>
      )}
      {shotStatus === "sunk" && (
        <div className={cn(iconClasses, "text-danger animate-shake")}>
          <Icon name="close" size="auto" />
        </div>
      )}
      {shotStatus === "miss" && (
        <div className={cn(iconClasses, "animate-appearing")}>
          <Icon name="circle" size="auto" />
        </div>
      )}
    </button>
  );
});
