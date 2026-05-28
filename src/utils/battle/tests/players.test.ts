import { describe, it, expect } from "vitest";
import { getInitialPlayers, setDataForPlayers } from "@utils/battle/players.ts";

describe("getInitialPlayers", () => {
  it("preserves the id on each item", () => {
    const result = getInitialPlayers(["player", "computer"]);
    expect(result[0].id).toBe("player");
    expect(result[1].id).toBe("computer");
  });
});

describe("setDataForPlayers", () => {
  it("maps each player id to the given value", () => {
    const result = setDataForPlayers(["player", "computer"], 0);
    expect(result["player"]).toBe(0);
    expect(result["computer"]).toBe(0);
  });

  it("calls the factory function separately for each player", () => {
    const result = setDataForPlayers(["player", "computer"], () => []);
    expect(result["player"]).toEqual([]);
    expect(result["computer"]).toEqual([]);
    expect(result["player"]).not.toBe(result["computer"]);
  });
});
