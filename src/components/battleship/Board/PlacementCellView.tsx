import cn from "classnames";
import * as React from "react";

interface PlacementCellViewProps {
  isActiveShip?: boolean;
  isSpace?: boolean;
  cellKey?: string;
  shipId?: number;
  preview?: "ship" | "space" | undefined;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function PlacementCellView({
  isActiveShip = false,
  cellKey,
  onPointerDown,
  shipId,
  preview,
  isSpace,
}: PlacementCellViewProps) {
  return (
    <div
      className={cn(
        "cell-size border border-stroke touch-none focus-visible:outline-none flex justify-center items-center",
        {
          "cursor-pointer bg-primary": isActiveShip,
        },
        { "bg-primary/40": preview === "ship" && !isActiveShip },
      )}
      data-coord={cellKey}
      data-ship={shipId}
      onPointerDown={onPointerDown}
    >
      {(isSpace || preview === "space") && (
        <div
          className={cn("h-2 w-2 rounded-full", {
            "bg-note": isSpace,
            "bg-note/40": preview === "space",
          })}
        ></div>
      )}
    </div>
  );
}
