import type {
  CellStatus,
  FleetShots,
  FleetConfig,
  Hits,
  PlayerId,
  ShipCells,
  PlacementCells,
  ShipItemPosition,
  ShipsLayout,
  ShipType,
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

type FireState = {
  occupiedCells: Record<PlayerId, ShipCells>;
  fleetShots: FleetShots;
  hits: Hits;
  shipsLayout: ShipsLayout;
  remainingShips: Record<PlayerId, Record<ShipType, number>>;
};

export type FireOutcome = {
  patch: {
    hits: Hits;
    fleetShots?: FleetShots;
    remainingShips?: Record<PlayerId, Record<ShipType, number>>;
  };
  result: CellStatus;
  excludedCoords: string[];
  shipType?: ShipType;
};

export function computeFire(
  state: FireState,
  defenderId: PlayerId,
  cellKey: string,
): FireOutcome {
  const buildHitsPatch = (updates: Record<string, CellStatus>): Hits => ({
    ...state.hits,
    [defenderId]: { ...state.hits[defenderId], ...updates },
  });

  const shipId = state.occupiedCells[defenderId]?.[cellKey];

  if (shipId === undefined) {
    return {
      patch: { hits: buildHitsPatch({ [cellKey]: "miss" }) },
      result: "miss",
      excludedCoords: [cellKey],
    };
  }

  const newHitsAmount = state.fleetShots[defenderId][shipId] - 1;
  const isSunk = newHitsAmount === 0;

  const fleetShots: FleetShots = {
    ...state.fleetShots,
    [defenderId]: { ...state.fleetShots[defenderId], [shipId]: newHitsAmount },
  };

  if (!isSunk) {
    return {
      patch: { hits: buildHitsPatch({ [cellKey]: "hit" }), fleetShots },
      result: "hit",
      excludedCoords: [cellKey],
    };
  }

  const ship = state.shipsLayout[defenderId].find((s) => s.id === shipId);
  if (!ship) throw new Error(`Ship "${shipId}" not found in layout for defender "${defenderId}"`);

  const shipType = ship.type;
  const shipCells = ship.positions.map(getStringCoordinate);
  const marginCells = ship.margins.map(getStringCoordinate);

  return {
    patch: {
      hits: buildHitsPatch({
        ...Object.fromEntries(shipCells.map((p) => [p, "sunk" as CellStatus])),
        ...Object.fromEntries(marginCells.map((p) => [p, "miss" as CellStatus])),
      }),
      fleetShots,
      remainingShips: {
        ...state.remainingShips,
        [defenderId]: {
          ...state.remainingShips[defenderId],
          [shipType]: state.remainingShips[defenderId][shipType] - 1,
        },
      },
    },
    result: "sunk",
    excludedCoords: [...shipCells, ...marginCells],
    shipType,
  };
}

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
