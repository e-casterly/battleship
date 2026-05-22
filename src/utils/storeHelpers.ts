import type {
  ShipType,
  FleetShots,
  ShipsLayout,
  PlayerId,
  FleetConfig,
  OccupiedCells,
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

// Includes ship positions and margin spaces — used in placement for collision detection and UI
export const getOccupiedCells = (layout: ShipItemPosition[]): OccupiedCells => {
  const occupied: OccupiedCells = {};
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

// Ship positions only — used in game phase for fire lookup
export const getShipCells = (layout: ShipItemPosition[]): OccupiedCells => {
  const occupied: OccupiedCells = {};
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
) =>
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
