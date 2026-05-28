import { describe, it, expect } from "vitest";
import {
  getShipCells,
  getOccupiedCellsForPlayers,
} from "@utils/battle/getOccupiedCellsForPlayers.ts";
import type { ShipItemPosition } from "@app-types/common.types.ts";
import type { ShipsLayout } from "@app-types/game.types.ts";

const makeShip = (
  id: string,
  positions: [number, number][],
  margins: [number, number][] = [],
): ShipItemPosition => ({ id, type: "sloop", positions, margins });

describe("getShipCells", () => {
  it("returns an empty object for an empty layout", () => {
    expect(getShipCells([])).toEqual({});
  });

  it("maps each position cell to the ship id", () => {
    const result = getShipCells([makeShip("ship-1", [[3, 3], [3, 4]])]);
    expect(result["3,3"]).toBe("ship-1");
    expect(result["3,4"]).toBe("ship-1");
  });

  it("does not include margin cells", () => {
    const result = getShipCells([makeShip("ship-1", [[3, 3]], [[2, 2], [4, 4]])]);
    expect(result["2,2"]).toBeUndefined();
    expect(result["4,4"]).toBeUndefined();
  });

  it("includes cells from multiple ships", () => {
    const result = getShipCells([
      makeShip("ship-1", [[1, 1]]),
      makeShip("ship-2", [[5, 5]]),
    ]);
    expect(result["1,1"]).toBe("ship-1");
    expect(result["5,5"]).toBe("ship-2");
  });
});

describe("getOccupiedCellsForPlayers", () => {
  it("returns an entry for each player", () => {
    const layouts: ShipsLayout = {
      player: [makeShip("ship-1", [[1, 1]])],
      computer: [makeShip("ship-2", [[5, 5]])],
    };
    const result = getOccupiedCellsForPlayers(["player", "computer"], layouts);
    expect(result["player"]["1,1"]).toBe("ship-1");
    expect(result["computer"]["5,5"]).toBe("ship-2");
  });

  it("keeps each player's cells isolated from the other", () => {
    const layouts: ShipsLayout = {
      player: [makeShip("ship-1", [[1, 1]])],
      computer: [makeShip("ship-2", [[5, 5]])],
    };
    const result = getOccupiedCellsForPlayers(["player", "computer"], layouts);
    expect(result["player"]["5,5"]).toBeUndefined();
    expect(result["computer"]["1,1"]).toBeUndefined();
  });

  it("returns an empty map for a player with no ships", () => {
    const layouts: ShipsLayout = { player: [] };
    expect(getOccupiedCellsForPlayers(["player"], layouts)["player"]).toEqual({});
  });
});
