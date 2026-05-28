import { describe, it, expect } from "vitest";
import { getFleetHealth } from "@utils/battle/getFleetHealth.ts";
import type { ShipsLayout } from "@app-types/game.types.ts";

const makeShip = (id: string, size: number) => ({
  id,
  type: "sloop" as const,
  positions: Array.from({ length: size }, (_, i) => [0, i] as [number, number]),
  margins: [],
});

describe("getFleetHealth", () => {
  it("sets health equal to the number of positions for each ship", () => {
    const layout: ShipsLayout = {
      player: [makeShip("sloop-1", 2), makeShip("frigate-1", 4)],
    };
    const result = getFleetHealth(["player"], layout);
    expect(result["player"]["sloop-1"]).toBe(2);
    expect(result["player"]["frigate-1"]).toBe(4);
  });

  it("returns an entry for each player", () => {
    const layout: ShipsLayout = {
      player: [makeShip("ship-1", 3)],
      computer: [makeShip("ship-2", 2)],
    };
    const result = getFleetHealth(["player", "computer"], layout);
    expect(result["player"]["ship-1"]).toBe(3);
    expect(result["computer"]["ship-2"]).toBe(2);
  });

  it("returns an empty health map for a player with no ships", () => {
    const layout: ShipsLayout = { player: [] };
    const result = getFleetHealth(["player"], layout);
    expect(result["player"]).toEqual({});
  });
});
