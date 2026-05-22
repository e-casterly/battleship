import * as React from "react";
import { useMemo } from "react";
import type { ShipType } from "@utils/gameTypes.ts";
import { FLEET_CONFIG } from "@utils/constants.ts";
import { usePlacementStore } from "@store/placementStore.ts";
import cn from "clsx";
import Icon from "@components/common/Icon/Icon.tsx";

interface ShipPaletteProps {
  onPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    variant?: ShipType,
    index?: number,
  ) => void;
}

export function ShipPalette({ onPointerDown }: ShipPaletteProps) {
  const direction = usePlacementStore((s) => s.direction);
  const layout = usePlacementStore((s) => s.layout);
  const removeShip = usePlacementStore((s) => s.removeShip);

  const { placedIds, placedCountByType } = useMemo(() => ({
    placedIds: new Set(layout.map((s) => s.id)),
    placedCountByType: layout.reduce<Record<string, number>>((acc, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    }, {}),
  }), [layout]);

  return (
    <div
      className={cn("flex gap-2 flex-wrap", {
        "flex-row items-start": direction === "v",
        "flex-col": direction === "h",
      })}
    >
      {(Object.keys(FLEET_CONFIG) as ShipType[]).map((variant) => {
        const { size, count } = FLEET_CONFIG[variant];
        const remaining = count - (placedCountByType[variant] ?? 0);
        return (
          <div
            key={variant}
            className={cn("flex flex-col gap-2", {
              "flex-row": direction === "h",
            })}
          >
            <div
              className={cn(
                "text-foreground text-xs font-semibold flex flex-col items-center justify-center gap-0.5",
                { "flex-row": direction === "h" },
              )}
            >
              <div>{remaining} x</div>
              <div className={cn("cell-size", { "text-note": remaining === 0 })}>
                <Icon name={variant} size="auto" />
              </div>
            </div>
            <div className="flex-1 flex gap-2">
              {Array.from({ length: count }).map((_, i) => {
                const shipId = `${variant}-${i}`;
                return (
                  <ShipItem
                    key={shipId}
                    shipId={shipId}
                    direction={direction}
                    size={size}
                    isPlaced={placedIds.has(shipId)}
                    onPointerDown={(e, indexCell) =>
                      onPointerDown(e, variant, indexCell)
                    }
                    onRemove={() => removeShip(shipId)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ShipItemProps {
  shipId: string;
  direction: "h" | "v";
  size: number;
  isPlaced: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, index: number) => void;
  onRemove: () => void;
}

function ShipItem({ shipId, size, isPlaced, onPointerDown, onRemove, direction }: ShipItemProps) {
  return (
    <div
      className={cn("flex border border-stroke", {
        "flex-col": direction === "v",
        "hover:shadow-base": !isPlaced,
        "opacity-40 cursor-pointer": isPlaced,
      })}
      onClick={isPlaced ? onRemove : undefined}
    >
      {Array.from({ length: size }).map((_, indexSize) => (
        <div
          key={indexSize}
          data-ship={!isPlaced ? shipId : undefined}
          className={cn("cell-size border border-stroke touch-none", {
            "cursor-pointer bg-primary": !isPlaced,
          })}
          onPointerDown={(e) => (!isPlaced ? onPointerDown(e, indexSize) : undefined)}
        />
      ))}
    </div>
  );
}
