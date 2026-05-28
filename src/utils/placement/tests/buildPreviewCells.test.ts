import { describe, it, expect } from "vitest";
import { buildPreviewCells } from "@utils/placement/buildPreviewCells.ts";
import type { ShipItemPosition } from "@app-types/common.types.ts";

const makeShip = (
  positions: [number, number][],
  margins: [number, number][],
): ShipItemPosition => ({
  id: "ship-1",
  type: "sloop",
  positions,
  margins,
});

describe("buildPreviewCells", () => {
  it("returns an empty object when called with null", () => {
    expect(buildPreviewCells(null)).toEqual({});
  });

  it("marks each position cell as 'ship'", () => {
    const result = buildPreviewCells(makeShip([[3, 3], [3, 4]], []));
    expect(result["3,3"]).toBe("ship");
    expect(result["3,4"]).toBe("ship");
  });

  it("marks each margin cell as 'space'", () => {
    const result = buildPreviewCells(makeShip([], [[2, 2], [2, 3]]));
    expect(result["2,2"]).toBe("space");
    expect(result["2,3"]).toBe("space");
  });

  it("includes both ship and margin cells together", () => {
    const result = buildPreviewCells(makeShip([[3, 3]], [[2, 2], [2, 3], [4, 4]]));
    expect(Object.keys(result)).toHaveLength(4);
    expect(result["3,3"]).toBe("ship");
    expect(result["2,2"]).toBe("space");
  });

  it("returns an empty object when both positions and margins are empty", () => {
    expect(buildPreviewCells(makeShip([], []))).toEqual({});
  });
});
