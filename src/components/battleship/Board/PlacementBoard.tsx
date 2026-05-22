import * as React from "react";
import { useMemo } from "react";
import { usePlacementStore } from "@store/placementStore.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import { getStringCoordinate } from "@utils/helpers.ts";
import { getOccupiedCells } from "@utils/storeHelpers.ts";
import { BoardShell } from "@components/battleship/Board/BoardShell.tsx";
import { PlacementCell } from "@components/battleship/Board/PlacementCell.tsx";

interface PlacementBoardProps {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const [rows, cols] = BOARD_SIZE;

const cells = Array.from({ length: rows }, (_, r) =>
  Array.from({ length: cols }, (_, c) => getStringCoordinate([r, c])),
).flat();

export function PlacementBoard({ onPointerDown }: PlacementBoardProps) {
  const isDragging = usePlacementStore((s) => s.dragInfo.isDraggable);
  const layout = usePlacementStore((s) => s.layout);
  const previewCells = usePlacementStore((s) => s.previewCells);

  const occupiedCells = useMemo(() => getOccupiedCells(layout), [layout]);

  return (
    <BoardShell rows={rows} cols={cols} isFocused={isDragging} label="Placement board">
      {cells.map((key) => (
        <PlacementCell
          key={key}
          cellKey={key}
          occupiedCell={occupiedCells[key]}
          preview={previewCells[key]}
          onPointerDown={onPointerDown}
        />
      ))}
    </BoardShell>
  );
}
