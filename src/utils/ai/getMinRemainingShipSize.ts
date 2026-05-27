import type { FleetConfig, ShipType } from "@app-types/common.types.ts";

export function getMinRemainingShipSize(
  remainingShips: Record<ShipType, number>,
  fleetConfig: FleetConfig,
): number {
  const alive = Object.entries(remainingShips).filter(([, count]) => count > 0);
  if (alive.length === 0) return 1;
  return alive.reduce(
    (min, [type]) => Math.min(min, fleetConfig[type as ShipType].size),
    Infinity,
  );
}
