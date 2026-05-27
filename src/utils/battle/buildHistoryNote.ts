import type { HistoryCtx, HistoryEvent } from "@app-types/game.types.ts";

const NOTE_BUILDERS: Record<HistoryEvent, (ctx: HistoryCtx) => string> = {
  start: () => "Game started",
  turn: ({ move, attackerName }) => `Turn ${move} - ${attackerName}'s move`,
  miss: ({ attackerName, cellTitle }) => `- ${attackerName} missed on ${cellTitle}`,
  hit: ({ attackerName, cellTitle }) => `- ${attackerName} hit on ${cellTitle}`,
  sunk: ({ attackerName, shipType, cellTitle }) =>
    `- ${attackerName} sunk ${shipType} ship on ${cellTitle}`,
  win: ({ attackerName }) => `${attackerName} won the game!`,
};

export function buildHistoryNote(event: HistoryEvent, ctx: HistoryCtx): string {
  return NOTE_BUILDERS[event](ctx);
}
