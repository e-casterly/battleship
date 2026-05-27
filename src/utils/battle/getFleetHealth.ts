import type {
  FleetHealth,
  PlayerId,
  ShipsLayout,
} from "@app-types/game.types.ts";

export const getFleetHealth = (
  playersIds: PlayerId[],
  layout: ShipsLayout,
): FleetHealth => {
  const shots = (playerId: PlayerId) =>
    Object.fromEntries(
      layout[playerId].map((item) => [item.id, item.positions.length]),
    );
  return Object.fromEntries(playersIds.map((id) => [id, shots(id)]));
};