import * as React from "react";
import { useMemo } from "react";
import { usePlacementStore } from "@store/placementStore.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import { getStringCoordinate } from "@utils/helpers.ts";
import { BoardShell } from "@components/battleship/Board/BoardShell.tsx";
import { PlacementCell } from "@components/battleship/Board/PlacementCell.tsx";

interface PlacementBoardProps {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function PlacementBoard({ onPointerDown }: PlacementBoardProps) {
  const [rows, cols] = BOARD_SIZE;
  const isDragging = usePlacementStore((s) => s.dragInfo.isDraggable);

  const cells = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({ key: getStringCoordinate([r, c]) });
      }
    }
    return arr;
  }, [rows, cols]);

  return (
    <BoardShell rows={rows} cols={cols} isFocused={isDragging} label="Placement board">
      {cells.map(({ key }) => (
        <PlacementCell key={key} cellKey={key} onPointerDown={onPointerDown} />
      ))}
    </BoardShell>
  );
}
