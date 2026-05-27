import type {
  ShotResult,
  FleetHealth,
  Shots,
  PlayerId,
  ShipCells,
  ShipsLayout,
  RemainingShips,
} from "@app-types/game.types.ts";
import type { CellId, ShipType } from "@app-types/common.types.ts";
import { coordsToCellId } from "@utils/helpers/coordinateFormat.ts";


type FireState = {
  occupiedCells: Record<PlayerId, ShipCells>;
  fleetHealth: FleetHealth;
  shots: Shots;
  shipsLayout: ShipsLayout;
  remainingShips: Record<PlayerId, Record<ShipType, number>>;
};

export type FireOutcome = {
  patch: {
    shots: Shots;
    fleetHealth?: FleetHealth;
    remainingShips?: RemainingShips;
  };
  result: ShotResult;
  excludedCells: string[];
  shipType?: ShipType;
};

export function computeFire(
  defenderId: PlayerId,
  cellId: CellId,
  state: FireState,
): FireOutcome {
  const buildShotsPatch = (updates: Record<string, ShotResult>): Shots => ({
    ...state.shots,
    [defenderId]: { ...state.shots[defenderId], ...updates },
  });

  const shipId = state.occupiedCells[defenderId]?.[cellId];

  if (shipId === undefined) {
    return {
      patch: { shots: buildShotsPatch({ [cellId]: "miss" }) },
      result: "miss",
      excludedCells: [cellId],
    };
  }

  const currentHealth = state.fleetHealth[defenderId][shipId];
  if (currentHealth === undefined)
    throw new Error(`Ship "${shipId}" not found in fleetHealth for defender "${defenderId}"`);
  const newHitsAmount = currentHealth - 1;
  const isSunk = newHitsAmount === 0;

  const fleetHealth: FleetHealth = {
    ...state.fleetHealth,
    [defenderId]: { ...state.fleetHealth[defenderId], [shipId]: newHitsAmount },
  };

  if (!isSunk) {
    return {
      patch: { shots: buildShotsPatch({ [cellId]: "hit" }), fleetHealth },
      result: "hit",
      excludedCells: [cellId],
    };
  }

  const ship = state.shipsLayout[defenderId].find((s) => s.id === shipId);
  if (!ship)
    throw new Error(
      `Ship "${shipId}" not found in layout for defender "${defenderId}"`,
    );

  const shipType = ship.type;
  const shipCells = ship.positions.map(coordsToCellId);
  const marginCells = ship.margins.map(coordsToCellId);

  return {
    patch: {
      shots: buildShotsPatch({
        ...Object.fromEntries(shipCells.map((p) => [p, "sunk" as ShotResult])),
        ...Object.fromEntries(
          marginCells.map((p) => [p, "miss" as ShotResult]),
        ),
      }),
      fleetHealth,
      remainingShips: {
        ...state.remainingShips,
        [defenderId]: {
          ...state.remainingShips[defenderId],
          [shipType]: state.remainingShips[defenderId][shipType] - 1,
        },
      },
    },
    result: "sunk",
    excludedCells: [...shipCells, ...marginCells],
    shipType,
  };
}
