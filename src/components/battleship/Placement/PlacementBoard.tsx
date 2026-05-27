import * as React from "react";
import { useMemo } from "react";
import { usePlacementStore } from "@store/placement/usePlacementStore.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import { BoardShell } from "@components/battleship/Board/BoardShell.tsx";
import { PlacementCell } from "@components/battleship/Placement/PlacementCell.tsx";
import { gridCellsId } from "@utils/helpers/boardGrid.ts";
import { getOccupiedCells } from "@utils/placement/getOccupiedCells.ts";

interface PlacementBoardProps {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const [rows, cols] = BOARD_SIZE;

const cells = gridCellsId(rows, cols);

export function PlacementBoard({ onPointerDown }: PlacementBoardProps) {
  const isDragging = usePlacementStore((s) => s.dragInfo.isDraggable);
  const layout = usePlacementStore((s) => s.layout);
  const previewCells = usePlacementStore((s) => s.previewCells);

  const occupiedCells = useMemo(() => getOccupiedCells(layout), [layout]);

  return (
    <BoardShell
      rows={rows}
      cols={cols}
      isFocused={isDragging}
      label="Placement board"
    >
      {cells.map((cellId) => (
        <PlacementCell
          key={cellId}
          cellId={cellId}
          occupiedCell={occupiedCells[cellId]}
          preview={previewCells[cellId]}
          onPointerDown={onPointerDown}
        />
      ))}
    </BoardShell>
  );
}
