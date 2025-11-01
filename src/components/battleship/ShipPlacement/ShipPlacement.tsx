import Button from "@components/common/Button/Button.tsx";
import Board from "@components/battleship/Board/Board.tsx";
import { useGameStore } from "@utils/store.ts";
import * as React from "react";
import type { ShipType } from "@utils/gameTypes.ts";
import { useEffect, useMemo } from "react";
import { DragGhost } from "@components/battleship/ShipPlacement/DragGhost.tsx";
import { throttleRaf } from "@utils/throttleRaf.ts";
import { DirectionsColumn } from "@components/battleship/ShipPlacement/DirectionsColumn.tsx";
import Icon from "@components/common/Icon/Icon.tsx";

export function ShipPlacement() {
  const currentPlayerId = useGameStore((s) => s.currentPlayerId);

  const remainingShips = useGameStore((s) => s.remainingShips[currentPlayerId]);

  const { isDraggable } = useGameStore((s) => s.dragInfo);

  const isReady = Object.values(remainingShips).every((count) => count === 0);

  const randomizeShipsLayout = useGameStore((s) => s.randomizeShipsLayout);
  const customizeShipsLayout = useGameStore((s) => s.customizeShipsLayout);
  const shipPlacement = useGameStore((s) => s.shipPlacement);
  const onStartDragging = useGameStore((s) => s.onStartDragging);

  const setDragInfo = useGameStore((s) => s.setDragInfo);
  const startGame = useGameStore((s) => s.startGame);

  const setPosThrottled = useMemo(
    () =>
      throttleRaf((x: number, y: number) => {
        setDragInfo(false, { pos: { x, y } });
      }),
    [setDragInfo],
  );

  const placePreviewThrottled = useMemo(
    () => throttleRaf((coord: string | null) => shipPlacement(coord, true)),
    [shipPlacement]
  );

  useEffect(() => {
    if (!isDraggable) return;

    const onMove = (e: PointerEvent) => {
      const evs = e.getCoalescedEvents?.() as PointerEvent[] | undefined;
      const last = evs?.length ? evs[evs.length - 1] : e;
      setPosThrottled(last.clientX, last.clientY);

      const el = document.elementFromPoint(last.clientX, last.clientY);
      const coord = el?.getAttribute?.("data-coord");
      if (coord) {
        placePreviewThrottled(coord)
      }
    };

    const onCancel = () => {
      shipPlacement(null);
    };

    const onEnd = (e: PointerEvent) => {
      const cell = document.elementFromPoint(e.clientX, e.clientY);
      const coord = cell?.getAttribute?.("data-coord");
      shipPlacement(coord ?? null);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onEnd, { once: true });
    document.addEventListener("pointercancel", onCancel, { once: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd);
      document.removeEventListener("pointercancel", onCancel);
    };
  }, [isDraggable, placePreviewThrottled, setPosThrottled, shipPlacement]);

  const onPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    variant?: ShipType,
    index?: number,
  ) => {

    e.preventDefault();
    const shipId = e.currentTarget?.getAttribute("data-ship") || "";
    const coord = e.currentTarget?.getAttribute("data-coord") || "";

    onStartDragging({
      variant,
      index,
      shipId,
      coord,
      x: e.clientX,
      y: e.clientY,
      cellSize: e.currentTarget.clientWidth,
    });
  };

  return (
    <>
      <div className="flex justify-center">
        <Button onClick={startGame} isDisable={!isReady} size="large">
          Start game
        </Button>
      </div>
      <p className="text-center my-3 md:my-6 text-sm md:text-lg lg:text-xl font-decorative">
        Hey, Captain! Place your ships and start the game!
      </p>
      <div className="grid grid-cols-12 gap-4 lg:gap-12">
        <div className="max-lg:order-first col-span-12 lg:col-span-6 flex flex-col justify-start items-center lg:items-end">
          <div className="flex justify-center gap-2 md:gap-4 mb-4">
            <Button onClick={randomizeShipsLayout} icon={<Icon name="cube" />}>
              Randomize ships
            </Button>
            <Button onClick={customizeShipsLayout} icon={<Icon name="hand" />}>
              Custom placement
            </Button>
          </div>
          <Board
            ownerId={currentPlayerId}
            onPointerDown={onPointerDown}
          />
        </div>
        <DirectionsColumn onPointerDown={onPointerDown} />
      </div>
      <DragGhost />
    </>
  );
}
