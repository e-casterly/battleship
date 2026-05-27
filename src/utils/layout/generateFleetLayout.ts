import type { FleetConfig, ShipItemPosition } from "@app-types/common.types.ts";
import { getRemainingCells } from "@utils/layout-helpers/getRemainingCells.ts";
import { layoutPresets } from "@utils/layoutPresets.ts";
import { findShipPlacement } from "@utils/layout/findShipPlacement.ts";
import { withoutShipArea } from "@utils/layout/withoutShipArea.ts";

function tryPlaceFleet(
  boardSize: [number, number],
  fleet: FleetConfig,
): ShipItemPosition[] | null {
  let remainingCells = getRemainingCells(boardSize);
  const shipPositions: ShipItemPosition[] = [];

  for (const [ship, { size, count }] of Object.entries(fleet)) {
    const type = ship as keyof FleetConfig;

    for (let i = 0; i < count; i++) {
      const placement = findShipPlacement(boardSize, size, remainingCells);
      if (!placement) return null;

      remainingCells = withoutShipArea(remainingCells, placement.positions, placement.margins);
      shipPositions.push({
        id: `${type}-${i}`,
        positions: placement.positions,
        margins: placement.margins,
        type,
      });
    }
  }

  return shipPositions;
}

function getPresetLayout(): ShipItemPosition[] {
  const preset = layoutPresets[Math.floor(Math.random() * layoutPresets.length)];
  const typeCounts: Record<string, number> = {};
  return (preset as Omit<ShipItemPosition, "id">[]).map((s) => {
    typeCounts[s.type] = typeCounts[s.type] ?? 0;
    return { ...s, id: `${s.type}-${typeCounts[s.type]++}` };
  });
}

export function generateFleetLayout(
  boardSize: [number, number] = [10, 10],
  fleet: FleetConfig,
): ShipItemPosition[] {
  const MAX_ATTEMPTS = 20;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const result = tryPlaceFleet(boardSize, fleet);
    if (result) return result;
  }

  return getPresetLayout();
}