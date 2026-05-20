import { useMemo } from "react";
import { useGameStore } from "@store/gameStore.ts";
import { BOARD_SIZE } from "@utils/constants.ts";
import { getStringCoordinate, titleOfCell } from "@utils/helpers.ts";
import { BoardShell } from "@components/battleship/Board/BoardShell.tsx";
import { BoardCell } from "@components/battleship/Board/BoardCell.tsx";
import type { PlayerId } from "@utils/gameTypes.ts";

interface GameBoardProps {
  ownerId: PlayerId;
}

export function GameBoard({ ownerId }: GameBoardProps) {
  const [rows, cols] = BOARD_SIZE;
  const turn = useGameStore((s) => s.turn);
  const isFocused = turn !== null && turn !== ownerId;

  const cells = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({
          key: getStringCoordinate([r, c]),
          title: titleOfCell([r, c]),
        });
      }
    }
    return arr;
  }, [rows, cols]);

  return (
    <BoardShell rows={rows} cols={cols} isFocused={isFocused} label={`Board ${ownerId}`}>
      {cells.map(({ key, title }) => (
        <BoardCell key={key} cellKey={key} title={title} ownerId={ownerId} />
      ))}
    </BoardShell>
  );
}
