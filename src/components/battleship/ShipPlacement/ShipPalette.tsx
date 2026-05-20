import * as React from "react";
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
  const fleet = FLEET_CONFIG;
  const direction = usePlacementStore((s) => s.direction);
  const remainingShips = usePlacementStore((s) => s.remainingShips);

  return (
    <div
      className={cn("flex gap-2 flex-wrap", {
        "flex-row items-start": direction === "v",
        "flex-col": direction === "h",
      })}
    >
      {(Object.keys(fleet) as ShipType[]).map((variant) => {
        const { size, count } = fleet[variant];
        const remaining = remainingShips[variant];
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
              <div
                className={cn("cell-size", { "text-note": remaining === 0 })}
              >
                <Icon name={variant} size="auto" />
              </div>
            </div>
            <div className="flex-1 flex gap-2">
              {Array.from({ length: count }).map((_, indexCount) => (
                <ShipItem
                  key={indexCount}
                  direction={direction}
                  size={size}
                  isActive={remaining === indexCount + 1}
                  onPointerDown={(e, indexCell) =>
                    onPointerDown(e, variant, indexCell)
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ShipItemProps {
  direction: "h" | "v";
  size: number;
  isActive: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, index: number) => void;
}

function ShipItem({ size, isActive, onPointerDown, direction }: ShipItemProps) {
  return (
    <div
      className={cn("flex border border-stroke", {
        "flex-col": direction === "v",
        "hover:shadow-base": isActive,
      })}
    >
      {Array.from({ length: size }).map((_, indexSize) => (
        <div
          key={indexSize}
          className={cn("cell-size border border-stroke touch-none", {
            "cursor-pointer bg-primary": isActive,
          })}
          onPointerDown={(e) => (isActive ? onPointerDown(e, indexSize) : undefined)}
        />
      ))}
    </div>
  );
}
