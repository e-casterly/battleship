import { useMemo } from "react";

import { BOARD_SIZE, CURRENT_PLAYER_ID } from "@utils/constants.ts";
import { BoardShell } from "@components/battleship/Board/BoardShell.tsx";
import { BoardCell } from "@components/battleship/Game/BoardCell.tsx";
import type { ShotResult, PlayerId } from "@app-types/game.types.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";
import { useGameStore } from "@store/game/useGameStore.ts";
import { gridCells } from "@utils/helpers/boardGrid.ts";

interface GameBoardProps {
  ownerId: PlayerId;
}

const [rows, cols] = BOARD_SIZE;
const cells = gridCells(rows, cols);

export function GameBoard({ ownerId }: GameBoardProps) {
  const turn = useGameStore((s) => s.turn);
  const phase = useGameStore((s) => s.phase);
  const shots = useGameStore((s) => s.shots[ownerId]);
  const occupiedCells = useGameStore((s) => s.occupiedCells[ownerId]);
  const shipsLayout = useGameStore((s) => s.shipsLayout[ownerId]);

  const isPlayerBoard = CURRENT_PLAYER_ID === ownerId;
  const isInteractive = !isPlayerBoard && turn === CURRENT_PLAYER_ID;
  const isFocused = turn !== null && turn !== ownerId;

  const marginCells = useMemo(() => {
    const set = new Set<string>();
    for (const ship of shipsLayout ?? []) {
      for (const pos of ship.margins) set.add(coordsToCellId(pos));
    }
    return set;
  }, [shipsLayout]);

  const isGameOver = phase === "game-over";

  return (
    <BoardShell
      rows={rows}
      cols={cols}
      isFocused={isFocused}
      label={`Board ${ownerId}`}
    >
      {cells.map(({ cellId, title }) => (
        <BoardCell
          key={cellId}
          cellId={cellId}
          title={title}
          ownerId={ownerId}
          isPlayerBoard={isPlayerBoard}
          isInteractive={isInteractive}
          occupiedCell={occupiedCells?.[cellId]}
          shotStatus={shots?.[cellId] as ShotResult | undefined}
          isSpace={isPlayerBoard && marginCells.has(cellId)}
          isGameOver={isGameOver}
        />
      ))}
    </BoardShell>
  );
}
