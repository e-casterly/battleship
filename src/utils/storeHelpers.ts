import type {
  ShipType,
  FleetShots,
  ShipsLayout,
  PlayerId,
  FleetConfig,
  ShipCells,
  PlacementCells,
  ShipItemPosition,
} from "./gameTypes.ts";
import { getStringCoordinate } from "@utils/helpers.ts";

export const getInitialPlayers = (playersIds: PlayerId[]) =>
  playersIds.map((id) => ({
    id,
    name: id === "player" ? "Player" : "Computer",
  }));

export const setDataForPlayers = <T>(
  playersIds: PlayerId[],
  data: T | (() => T),
) => {
  return Object.fromEntries(
    playersIds.map((id) => {
      const value = typeof data === "function" ? (data as () => T)() : data;
      return [id, value];
    }),
  ) as Record<PlayerId, T>;
};

export const getOccupiedCells = (layout: ShipItemPosition[]): PlacementCells => {
  const occupied: PlacementCells = {};
  for (const ship of layout) {
    for (const pos of ship.positions) {
      occupied[getStringCoordinate(pos)] = ship.id;
    }
    for (const pos of ship.margins) {
      occupied[getStringCoordinate(pos)] = "space";
    }
  }
  return occupied;
};

export const getShipCells = (layout: ShipItemPosition[]): ShipCells => {
  const occupied: ShipCells = {};
  for (const ship of layout) {
    for (const pos of ship.positions) {
      occupied[getStringCoordinate(pos)] = ship.id;
    }
  }
  return occupied;
};

export const setOccupiedCellsForPlayers = (
  playersIds: PlayerId[],
  layouts: ShipsLayout,
): Record<PlayerId, ShipCells> =>
  Object.fromEntries(
    playersIds.map((id) => [id, getShipCells(layouts[id])]),
  );

export const getFullRemainingShips = (fleetConfig: FleetConfig) => {
  const ships = {} as Record<ShipType, number>;
  for (const key in fleetConfig) {
    const ship = key as keyof FleetConfig;
    ships[ship] = fleetConfig[ship].count;
  }
  return ships;
};

export const setFleetShots = (
  playersIds: PlayerId[],
  layout: ShipsLayout,
): FleetShots => {
  const shots = (playerId: string) =>
    Object.fromEntries(
      layout[playerId].map((item) => [item.id, item.positions.length]),
    );
  return Object.fromEntries(playersIds.map((id) => [id, shots(id)]));
};
