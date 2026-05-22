import cn from 'clsx';
import { usePlacementStore } from "@store/placementStore.ts";
import { useEffect, useMemo, useRef } from "react";

export function DragGhost() {
  const isDraggable = usePlacementStore((s) => s.dragInfo.isDraggable);
  const shipSize = usePlacementStore((s) => s.dragInfo.shipSize);
  const direction = usePlacementStore((s) => s.direction);

  const isHorizontal = direction === "h";
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDraggable) return;

    const unsub = usePlacementStore.subscribe(
      (s) => s.dragPos,
      (pos) => {
        if (!ghostRef.current) return;
        const { dragInfo, direction } = usePlacementStore.getState();
        const horizontal = direction === "h";
        const { indexCell, cellSize } = dragInfo;

        const x = horizontal
          ? pos.x - indexCell * cellSize - cellSize / 2
          : pos.x - cellSize / 2;
        const y = horizontal
          ? pos.y - cellSize / 2
          : pos.y - indexCell * cellSize - cellSize / 2;

        ghostRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
      { fireImmediately: true },
    );

    return () => unsub();
  }, [isDraggable, isHorizontal]);

  const segments = useMemo(
    () =>
      Array.from({ length: shipSize }).map((_, i) => (
        <div key={i} className="cell-size border border-stroke bg-primary" />
      )),
    [shipSize],
  );

  if (!isDraggable) return null;

  return (
    <div
      ref={ghostRef}
      aria-hidden
      className={cn(
        "fixed top-0 left-0 z-50 pointer-events-none will-change-transform inline-flex self-start justify-self-start",
        !isDraggable && "opacity-0"
      )}
      style={{ transform: "translate3d(-100vw,-100vh,0)" }}
    >
      <div
        className={cn(
          "inline-flex justify-start items-start border border-stroke opacity-90",
          isHorizontal ? "flex-row" : "flex-col",
        )}
      >
        {segments}
      </div>
    </div>
  );
}
