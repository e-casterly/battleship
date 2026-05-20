import { useEffect, useMemo } from "react";
import * as React from "react";
import { usePlacementStore } from "@store/placementStore.ts";
import { throttleRaf } from "@utils/throttleRaf.ts";
import type { ShipType } from "@utils/gameTypes.ts";

export function useDragHandlers() {
  const shipPlacement = usePlacementStore((s) => s.shipPlacement);
  const onStartDragging = usePlacementStore((s) => s.onStartDragging);
  const updateDragInfo = usePlacementStore((s) => s.updateDragInfo);
  const switchDirection = usePlacementStore((s) => s.switchDirection);
  const isDraggable = usePlacementStore((s) => s.dragInfo.isDraggable);

  const setPosThrottled = useMemo(
    () =>
      throttleRaf((x: number, y: number) => {
        updateDragInfo({ pos: { x, y } });
      }),
    [updateDragInfo],
  );

  const placePreviewThrottled = useMemo(
    () => throttleRaf((coord: string | null) => shipPlacement(coord, true)),
    [shipPlacement],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        switchDirection();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [switchDirection]);

  useEffect(() => {
    if (!isDraggable) return;

    const onMove = (e: PointerEvent) => {
      const evs = e.getCoalescedEvents?.() as PointerEvent[] | undefined;
      const last = evs?.length ? evs[evs.length - 1] : e;
      setPosThrottled(last.clientX, last.clientY);

      const el = document.elementFromPoint(last.clientX, last.clientY);
      const coord = el?.getAttribute?.("data-coord");
      if (coord) placePreviewThrottled(coord);
    };

    const onEnd = (e: PointerEvent) => {
      const cell = document.elementFromPoint(e.clientX, e.clientY);
      const coord = cell?.getAttribute?.("data-coord");
      shipPlacement(coord ?? null);
    };

    const onCancel = () => shipPlacement(null);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onEnd, { once: true });
    document.addEventListener("pointercancel", onCancel, { once: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd);
      document.removeEventListener("pointercancel", onCancel);
    };
  }, [isDraggable, placePreviewThrottled, setPosThrottled, shipPlacement]);

  function onPointerDown(
    e: React.PointerEvent<HTMLDivElement>,
    variant?: ShipType,
    index?: number,
  ) {
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
  }

  return { onPointerDown };
}
