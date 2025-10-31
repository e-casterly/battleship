import { useGameStore } from "@utils/store.ts";
import * as React from "react";
import { PlacementCellView } from "@components/battleship/Board/PlacementCellView.tsx";

interface PlacementCellProps {
  isActive?: boolean;
  cellKey: string;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnter?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function PlacementCell({
  cellKey,
  onPointerDown,
  onPointerEnter,
}: PlacementCellProps) {
  const currentPlayerId = useGameStore((s) => s.currentPlayerId);
  const occupiedCell = useGameStore(
    (s) => s.occupiedCells?.[currentPlayerId]?.[cellKey],
  );
  const preview = useGameStore(
    (s) => s.occupiedCellsPlacementPreview?.[cellKey],
  );

  const isShip = typeof occupiedCell === "number";
  return (
    <PlacementCellView
      cellKey={cellKey}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      isActiveShip={isShip}
      isSpace={occupiedCell === "space"}
      shipId={isShip ? occupiedCell : undefined}
      preview={preview}
    />
  );
}
