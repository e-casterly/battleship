import { describe, it, expect } from "vitest";
import { buildHistoryNote } from "@utils/battle/buildHistoryNote.ts";

describe("buildHistoryNote", () => {
  it('returns "Game started" for start event', () => {
    expect(buildHistoryNote("start", {})).toBe("Game started");
  });

  it("returns turn note with move number and attacker name", () => {
    expect(buildHistoryNote("turn", { move: 3, attackerName: "Player" })).toBe(
      "Turn 3 - Player's move",
    );
  });

  it("returns miss note with attacker name and cell title", () => {
    expect(
      buildHistoryNote("miss", { attackerName: "Player", cellTitle: "A1" }),
    ).toBe("- Player missed on A1");
  });

  it("returns hit note with attacker name and cell title", () => {
    expect(
      buildHistoryNote("hit", { attackerName: "Computer", cellTitle: "C5" }),
    ).toBe("- Computer hit on C5");
  });

  it("returns sunk note with attacker name, ship type and cell title", () => {
    expect(
      buildHistoryNote("sunk", {
        attackerName: "Player",
        shipType: "sloop",
        cellTitle: "B3",
      }),
    ).toBe("- Player sunk sloop ship on B3");
  });

  it("returns win note with attacker name", () => {
    expect(buildHistoryNote("win", { attackerName: "Computer" })).toBe(
      "Computer won the game!",
    );
  });
});
