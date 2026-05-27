import { useCallback, useEffect, useMemo, useRef } from "react";
import * as React from "react";
import { usePlacementStore } from "@store/placement/usePlacementStore.ts";
import { throttleRaf } from "@utils/throttleRaf.ts";
import type { CellId, ShipType } from "@app-types/common.types.ts";

const INTERACTIVE_TAGS = new Set(["INPUT", "TEXTAREA", "BUTTON", "SELECT"]);

export function useDragHandlers() {
  const isDraggable = usePlacementStore((s) => s.dragInfo.isDraggable);
  const lastCoordRef = useRef<string | null>(null);

  const setPosThrottled = useMemo(
    () =>
      throttleRaf((x: number, y: number) => {
        usePlacementStore.getState().setDragPos(x, y);
      }),
    [],
  );

  const placePreviewThrottled = useMemo(
    () =>
      throttleRaf((cellId: CellId) => {
        usePlacementStore.getState().previewShipPlacement(cellId);
      }),
    [],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      if (INTERACTIVE_TAGS.has((e.target as HTMLElement).tagName)) return;
      e.preventDefault();
      usePlacementStore.getState().switchDirection();
      if (lastCoordRef.current) {
        usePlacementStore.getState().previewShipPlacement(lastCoordRef.current);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!isDraggable) return;

    const onMove = (e: PointerEvent) => {
      const evs = e.getCoalescedEvents?.() as PointerEvent[] | undefined;
      const last = evs?.length ? evs[evs.length - 1] : e;
      setPosThrottled(last.clientX, last.clientY);

      const el = document.elementFromPoint(last.clientX, last.clientY);
      const cellId = el?.getAttribute?.("data-cell-id");
      if (cellId) {
        lastCoordRef.current = cellId;
        placePreviewThrottled(cellId);
      }
    };

    const onEnd = (e: PointerEvent) => {
      const cell = document.elementFromPoint(e.clientX, e.clientY);
      const cellId = cell?.getAttribute?.("data-cell-id") ?? null;
      lastCoordRef.current = null;
      usePlacementStore.getState().confirmShipPlacement(cellId);
    };

    const onCancel = () => {
      lastCoordRef.current = null;
      usePlacementStore.getState().confirmShipPlacement(null);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onEnd);
    document.addEventListener("pointercancel", onCancel);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd);
      document.removeEventListener("pointercancel", onCancel);
    };
  }, [isDraggable, setPosThrottled, placePreviewThrottled]);

  const onPointerDown = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      variant?: ShipType,
      index?: number,
    ) => {
      e.preventDefault();
      const shipId = e.currentTarget.getAttribute("data-ship-id") ?? "";
      const cellId = e.currentTarget.getAttribute("data-cell-id") ?? "";
      const cellSize = e.currentTarget.clientWidth;
      const x = e.clientX;
      const y = e.clientY;

      if (variant !== undefined && index !== undefined) {
        usePlacementStore.getState().startDragFromPalette({ shipId, variant, index, x, y, cellSize });
      } else {
        usePlacementStore
          .getState()
          .startDragFromBoard({ shipId, cellId, x, y, cellSize });
      }
    },
    [],
  );

  return { onPointerDown };
}
