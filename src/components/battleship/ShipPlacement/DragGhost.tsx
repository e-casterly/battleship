import cn from "classnames";
import { useGameStore } from "@utils/store.ts";
import { useEffect, useMemo, useRef } from "react";

export function DragGhost() {
  const { isDraggable, direction, shipSize, indexCell, cellSize } =
    useGameStore((s) => s.dragInfo);

  const isHorizontal = direction === "h";
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDraggable) return;

    const unsub = useGameStore.subscribe(
      (s) => s.dragInfo.pos,
      (pos) => {
        if (!pos || !ghostRef.current) return;
        const x = isHorizontal
          ? pos.x - indexCell * cellSize - cellSize / 2
          : pos.x - cellSize / 2;
        const y = isHorizontal
          ? pos.y - cellSize / 2
          : pos.y - indexCell * cellSize - cellSize / 2;

        ghostRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
      { fireImmediately: true },
    );

    return () => {
      unsub();
    };
  }, [isDraggable, isHorizontal, indexCell, cellSize]);

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
        "fixed inset-0 z-50 pointer-events-none will-change-transform inline-flex self-start justify-self-start",
      )}
      style={{ transform: "translate3d(-9999px,-9999px,0)" }}
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
