import { usePlacementStore } from "@store/placementStore.ts";
import Button from "@components/common/Button/Button.tsx";
import Icon from "@components/common/Icon/Icon.tsx";

export function PlacementActions() {
  const randomizeShipsLayout = usePlacementStore((s) => s.randomizeShipsLayout);
  const customizeShipsLayout = usePlacementStore((s) => s.customizeShipsLayout);

  return (
    <div className="flex justify-start gap-2 md:gap-4">
      <Button onClick={randomizeShipsLayout} icon={<Icon name="cube" />}>
        Randomize ships
      </Button>
      <Button onClick={customizeShipsLayout} icon={<Icon name="hand" />}>
        Custom placement
      </Button>
    </div>
  );
}
