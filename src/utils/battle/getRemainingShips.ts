import type { FleetConfig, ShipType } from "@app-types/common.types.ts";

export const getRemainingShips = (fleetConfig: FleetConfig) => {
  const ships = {} as Record<ShipType, number>;
  for (const key in fleetConfig) {
    const ship = key as keyof FleetConfig;
    ships[ship] = fleetConfig[ship].count;
  }
  return ships;
};