import * as React from "react";
import type { ShipType } from "@utils/gameTypes.ts";
import { usePlacementStore } from "@store/placementStore.ts";
import { useMemo } from "react";
import { Toggle, ToggleButton } from "@components/common/Toggle/Toggle.tsx";
import cn from "clsx";
import Icon from "@components/common/Icon/Icon.tsx";
import { PlacementActions } from "@components/battleship/ShipPlacement/PlacementActions.tsx";
import { ShipPalette } from "@components/battleship/ShipPlacement/ShipPalette.tsx";

interface PlacementPanelProps {
  onPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    variant?: ShipType,
    index?: number,
  ) => void;
}

export function PlacementPanel({ onPointerDown }: PlacementPanelProps) {
  const direction = usePlacementStore((s) => s.direction);
  const remainingShips = usePlacementStore((s) => s.remainingShips);
  const switchDirection = usePlacementStore((s) => s.switchDirection);

  const leftToPlace = useMemo(
    () => Object.values(remainingShips).reduce((acc, value) => acc + value, 0),
    [remainingShips],
  );

  return (
    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 justify-self-center lg:justify-self-end">
      <PlacementActions />
      <p className="font-decorative text-sm md:text-base xl:text-lg">
        Left ships to place: {leftToPlace}
      </p>
      <ul className={cn("text-sm md:text-base xl:text-lg list-dash text-note")}>
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
      <ShipPalette onPointerDown={onPointerDown} />
    </div>
  );
}
