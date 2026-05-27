import { describe, it, expect } from "vitest";
import { withoutShipArea } from "@utils/layout/withoutShipArea.ts";

describe("withoutShipArea", () => {
  it("returns a new Set without mutating the original", () => {
    const freeCoords = new Set(["0,0", "0,1", "1,0", "1,1"]);
    const result = withoutShipArea(freeCoords, [[0, 0]], []);
    expect(result).not.toBe(freeCoords);
    expect(freeCoords.has("0,0")).toBe(true);
  });

  it("removes position cells from the set", () => {
    const freeCoords = new Set(["2,3", "2,4", "5,5"]);
    const result = withoutShipArea(freeCoords, [[2, 3], [2, 4]], []);
    expect(result.has("2,3")).toBe(false);
    expect(result.has("2,4")).toBe(false);
  });

  it("removes margin cells from the set", () => {
    const freeCoords = new Set(["1,2", "1,3", "3,4", "5,5"]);
    const result = withoutShipArea(freeCoords, [], [[1, 2], [1, 3], [3, 4]]);
    expect(result.has("1,2")).toBe(false);
    expect(result.has("1,3")).toBe(false);
    expect(result.has("3,4")).toBe(false);
  });

  it("preserves cells not in positions or margins", () => {
    const freeCoords = new Set(["2,3", "5,5", "7,8"]);
    const result = withoutShipArea(freeCoords, [[2, 3]], []);
    expect(result.has("5,5")).toBe(true);
    expect(result.has("7,8")).toBe(true);
  });

  it("returns a copy with all cells intact when positions and margins are empty", () => {
    const freeCoords = new Set(["0,0", "1,1"]);
    const result = withoutShipArea(freeCoords, [], []);
    expect(result).not.toBe(freeCoords);
    expect(result).toEqual(freeCoords);
  });

  it("handles gracefully when a cell to remove is not in the set", () => {
    const freeCoords = new Set(["5,5"]);
    const result = withoutShipArea(freeCoords, [[0, 0]], [[9, 9]]);
    expect(result.has("5,5")).toBe(true);
    expect(result.size).toBe(1);
  });
});
