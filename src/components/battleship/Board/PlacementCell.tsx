import { usePlacementStore } from "@store/placementStore.ts";
import * as React from "react";
import { PlacementCellView } from "@components/battleship/Board/PlacementCellView.tsx";

interface PlacementCellProps {
  isActive?: boolean;
  cellKey: string;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function PlacementCell({
  cellKey,
  onPointerDown,
}: PlacementCellProps) {
  const occupiedCell = usePlacementStore((s) => s.occupiedCells?.[cellKey]);
  const preview = usePlacementStore(
    (s) => s.occupiedCellsPlacementPreview?.[cellKey],
  );

  const isShip = typeof occupiedCell === "number";
  return (
    <PlacementCellView
      cellKey={cellKey}
      onPointerDown={onPointerDown}
      isActiveShip={isShip}
      isSpace={occupiedCell === "space"}
      shipId={isShip ? occupiedCell : undefined}
      preview={preview}
    />
  );
}
