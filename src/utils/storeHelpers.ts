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
  currentPlayerId?: PlayerId,
  dataForCurrentPlayer?: T,
) => {
  return Object.fromEntries(
    playersIds.map((id) => {
      if (currentPlayerId && id === currentPlayerId) {
        return [id, dataForCurrentPlayer as T];
      }
      const value = typeof data === "function" ? (data as () => T)() : data;
      return [id, value];
    }),
  ) as Record<PlayerId, T>;
};

export const getOccupiedCells = (
  initial: OccupiedCells,
  addition: ShipItemPosition[],
  startShipId: number = 0,
): OccupiedCells => {
  const occupied: OccupiedCells = { ...initial };
  for (let i = 0; i < addition.length; i++) {
    for (const pos of addition[i].positions) {
      occupied[getStringCoordinate(pos)] = startShipId + i;
    }
    for (const pos of addition[i].margins) {
      occupied[getStringCoordinate(pos)] = "space";
    }
  }
  return occupied;
};

export const setOccupiedCellsForPlayers = (
  playersIds: PlayerId[],
  layouts: ShipsLayout,
) =>
  Object.fromEntries(
    playersIds.map((id) => [id, getOccupiedCells({}, layouts[id])]),
  );

export const setRemainingShips = (
  fleetConfig: FleetConfig,
  empty?: boolean,
) => {
  const ships = {} as Record<ShipType, number>;
  for (const key in fleetConfig) {
    const ship = key as keyof FleetConfig;
    ships[ship] = empty ? 0 : fleetConfig[ship as keyof FleetConfig]["count"];
  }
  return ships;
};

export const setFleetShots = (
  playersIds: PlayerId[],
  layout: ShipsLayout,
): FleetShots => {
  const shots = (playerId: string) =>
    Object.fromEntries(
      layout[playerId].map((item, index) => [index, item.positions.length]),
    );
  return Object.fromEntries(playersIds.map((id) => [id, shots(id)]));
};
