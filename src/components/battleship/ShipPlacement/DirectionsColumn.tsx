import * as React from "react";
import type { ShipType } from "@utils/gameTypes.ts";
import { useGameStore } from "@utils/store.ts";
import { useEffect, useMemo } from "react";
import { Toggle, ToggleButton } from "@components/common/Toggle/Toggle.tsx";
import cn from "classnames";
import { PlacementCellView } from "@components/battleship/Board/PlacementCellView.tsx";
import Icon from "@components/common/Icon/Icon.tsx";

interface DirectionsColumnProps {
  onPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    variant?: ShipType,
    index?: number,
  ) => void;
}

export function DirectionsColumn({ onPointerDown }: DirectionsColumnProps) {
  const fleet = useGameStore((s) => s.fleetConfig);
  const { direction } = useGameStore((s) => s.dragInfo);

  const currentPlayerId = useGameStore((s) => s.currentPlayerId);
  const remainingShips = useGameStore((s) => s.remainingShips[currentPlayerId]);

  const switchDirection = useGameStore((s) => s.switchDirection);

  const leftToPlace = useMemo(
    () => Object.values(remainingShips).reduce((acc, value) => acc + value, 0),
    [remainingShips],
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

  return (
    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 max-lg:order-first">
      <p className="font-decorative text-sm md:text-base xl:text-lg">
        Left ships to place: {leftToPlace}
      </p>
      <ul className="text-sm md:text-base xl:text-lg list-dash text-note">
        <li>Drag and drop your ships</li>
        <li className="inline-flex gap-2 items-center">
          <span>Press Space to rotate</span>
          <Toggle selectedValue={direction} onChange={switchDirection}>
            <ToggleButton value="h">
              <Icon name="horizontal" />
            </ToggleButton>
            <ToggleButton value="v">
              <Icon name="vertical" />
            </ToggleButton>
          </Toggle>
        </li>
      </ul>
      <div
        className={cn("flex gap-2 flex-wrap", {
          "flex-row items-start": direction === "v",
          "flex-col": direction === "h",
        })}
      >
        {Object.keys(fleet).map((variant) => (
          <div
            key={variant}
            className={cn("flex flex-col gap-2", {
              "flex-row": direction === "h",
            })}
          >
            <div
              className={cn(
                "text-foreground text-xs font-semibold flex flex-col items-center justify-center gap-0.5",
                {
                  "flex-row": direction === "h",
                },
              )}
            >
              <div>{remainingShips[variant as ShipType]} x</div>
              <div
                className={cn("cell-size", {
                  "text-note": remainingShips[variant as ShipType] === 0,
                })}
              >
                <Icon name={variant as ShipType} size="auto" />
              </div>
            </div>
            <div className="flex-1 flex gap-2">
              {Array.from({
                length: fleet[variant as keyof typeof fleet].count,
              }).map((_, indexCount) => (
                <ShipItem
                  key={indexCount}
                  direction={direction}
                  size={fleet[variant as keyof typeof fleet].size}
                  isActive={
                    remainingShips[variant as keyof typeof fleet] ===
                    indexCount + 1
                  }
                  onPointerDown={(e, indexCell) =>
                    onPointerDown(e, variant as ShipType, indexCell)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
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
        <PlacementCellView
          key={indexSize}
          isActiveShip={isActive}
          onPointerDown={(e) =>
            isActive ? onPointerDown(e, indexSize) : undefined
          }
        />
      ))}
    </div>
  );
}
