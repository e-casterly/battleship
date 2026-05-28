import { describe, it, expect } from "vitest";
import { getOccupiedCells } from "@utils/placement/getOccupiedCells.ts";
import type { ShipItemPosition } from "@app-types/common.types.ts";

const makeShip = (
  id: string,
  positions: [number, number][],
  margins: [number, number][],
): ShipItemPosition => ({ id, type: "sloop", positions, margins });

describe("getOccupiedCells", () => {
  it("returns an empty object for an empty layout", () => {
    expect(getOccupiedCells([])).toEqual({});
  });

  it("maps each position cell to the ship id", () => {
    const result = getOccupiedCells([makeShip("ship-1", [[3, 3], [3, 4]], [])]);
    expect(result["3,3"]).toBe("ship-1");
    expect(result["3,4"]).toBe("ship-1");
  });

  it("maps each margin cell to 'space'", () => {
    const result = getOccupiedCells([makeShip("ship-1", [], [[2, 2], [4, 4]])]);
    expect(result["2,2"]).toBe("space");
    expect(result["4,4"]).toBe("space");
  });

  it("merges cells from multiple ships", () => {
    const result = getOccupiedCells([
      makeShip("ship-1", [[1, 1]], []),
      makeShip("ship-2", [[5, 5]], []),
    ]);
    expect(result["1,1"]).toBe("ship-1");
    expect(result["5,5"]).toBe("ship-2");
  });

});
