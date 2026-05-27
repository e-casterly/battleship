import type { PlayerId } from "@app-types/game.types.ts";

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
