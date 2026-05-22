import { useMemo } from "react";
import { useGameStore } from "@store/gameStore.ts";
import { BOARD_SIZE, CURRENT_PLAYER_ID } from "@utils/constants.ts";
import { getStringCoordinate, titleOfCell } from "@utils/helpers.ts";
import { BoardShell } from "@components/battleship/Board/BoardShell.tsx";
import { BoardCell } from "@components/battleship/Board/BoardCell.tsx";
import type { CellStatus, PlayerId } from "@utils/gameTypes.ts";

interface GameBoardProps {
  ownerId: PlayerId;
}

const [rows, cols] = BOARD_SIZE;
const cells = Array.from({ length: rows }, (_, r) =>
  Array.from({ length: cols }, (_, c) => ({
    key: getStringCoordinate([r, c]),
    title: titleOfCell([r, c]),
  })),
).flat();

export function GameBoard({ ownerId }: GameBoardProps) {
  const turn = useGameStore((s) => s.turn);
  const hits = useGameStore((s) => s.hits[ownerId]);
  const occupiedCells = useGameStore((s) => s.occupiedCells[ownerId]);
  const shipsLayout = useGameStore((s) => s.shipsLayout[ownerId]);

  const isPlayerBoard = CURRENT_PLAYER_ID === ownerId;
  const isInteractive = !isPlayerBoard && turn === CURRENT_PLAYER_ID;
  const isFocused = turn !== null && turn !== ownerId;

  const marginCells = useMemo(() => {
    const set = new Set<string>();
    for (const ship of shipsLayout ?? []) {
      for (const pos of ship.margins) set.add(getStringCoordinate(pos));
    }
    return set;
  }, [shipsLayout]);

  return (
    <BoardShell rows={rows} cols={cols} isFocused={isFocused} label={`Board ${ownerId}`}>
      {cells.map(({ key, title }) => (
        <BoardCell
          key={key}
          cellKey={key}
          title={title}
          ownerId={ownerId}
          isPlayerBoard={isPlayerBoard}
          isInteractive={isInteractive}
          occupiedCell={occupiedCells?.[key]}
          hitStatus={hits?.[key] as CellStatus | undefined}
          isSpace={isPlayerBoard && marginCells.has(key)}
        />
      ))}
    </BoardShell>
  );
}
