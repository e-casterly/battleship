import * as React from "react";
import { memo } from "react";
import cn from "clsx";

interface PlacementCellProps {
  cellKey: string;
  occupiedCell: string | undefined;
  preview: "ship" | "space" | undefined;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const PlacementCell = memo(function PlacementCell({
  cellKey,
  occupiedCell,
  preview,
  onPointerDown,
}: PlacementCellProps) {
  const isShip = occupiedCell !== undefined && occupiedCell !== "space";

  return (
    <div
      className={cn(
        "cell-size border border-stroke touch-none focus-visible:outline-none flex justify-center items-center",
        { "cursor-pointer bg-primary": isShip },
        { "bg-primary/40": preview === "ship" && !isShip },
      )}
      data-coord={cellKey}
      data-ship={isShip ? occupiedCell : undefined}
      onPointerDown={onPointerDown}
    >
      {(occupiedCell === "space" || preview === "space") && (
        <div
          className={cn("h-2 w-2 rounded-full", {
            "bg-note": occupiedCell === "space",
            "bg-note/40": preview === "space",
          })}
        />
      )}
    </div>
  );
});
