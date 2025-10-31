import { BoardCell } from "./BoardCell.tsx";
import cn from "classnames";
import { AxisY } from "@components/battleship/Board/AxisY.tsx";
import { AxisX } from "@components/battleship/Board/AxisX.tsx";
import { useMemo } from "react";
import { getStringCoordinate, titleOfCell } from "@utils/helpers.ts";
import { useGameStore } from "@utils/store.ts";
import type { PlayerId } from "@utils/gameTypes.ts";
import * as React from "react";
import { PlacementCell } from "@components/battleship/Board/PlacementCell.tsx";

interface BoardProps {
  ownerId: PlayerId;
  className?: string;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerEnter?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

interface CellData {
  key: string;
  title: string;
  r: number;
  c: number;
}

export default function Board({
  ownerId,
  className,
  onPointerDown,
  onPointerEnter,
}: BoardProps) {
  const phase = useGameStore((s) => s.phase);
  const turn = useGameStore((s) => s.turn);
  const isDragging = useGameStore((s) => s.dragInfo.isDraggable);
  const [rows, cols] = useGameStore((s) => s.boardSize);

  const boardCells: CellData[] = useMemo(() => {
    const arr: CellData[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({
          key: getStringCoordinate([r, c]),
          title: titleOfCell([r, c]),
          r,
          c,
        });
      }
    }
    return arr;
  }, [rows, cols]);

  return (
    <div
      className={cn(
        "inline-grid grid-cols-[auto_1fr] items-center justify-center",
        className,
      )}
    >
      <AxisY cols={cols} />
      <AxisX rows={rows} />
      <div
        className={cn(
          "grid w-full border border-stroke justify-center items-center",
          {
            "shadow-base":
              isDragging ||
              (phase === "in-game" && turn !== null && turn !== ownerId),
          },
        )}
        style={{
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
        role="grid"
        aria-label={`Board ${ownerId}`}
      >
        {boardCells.map(({ key, title }) => {
          if (phase === "placement") {
            return (
              <PlacementCell
                key={key}
                cellKey={key}
                onPointerDown={onPointerDown}
                onPointerEnter={onPointerEnter}
              />
            );
          }
          return (
            <BoardCell
              key={key}
              cellKey={key}
              title={title}
              ownerId={ownerId}
            />
          );
        })}
      </div>
    </div>
  );
}
