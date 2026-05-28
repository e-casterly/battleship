import { describe, it, expect } from "vitest";
import { coordsToCellId, cellIdToCoords } from "@utils/helpers/coordinateFormat.ts";

describe("coordsToCellId", () => {
  it("formats [0,0] as '0,0'", () => {
    expect(coordsToCellId([0, 0])).toBe("0,0");
  });

  it("formats [3,5] as '3,5'", () => {
    expect(coordsToCellId([3, 5])).toBe("3,5");
  });

  it("formats [9,9] as '9,9'", () => {
    expect(coordsToCellId([9, 9])).toBe("9,9");
  });
});

describe("cellIdToCoords", () => {
  it("parses '0,0' as [0,0]", () => {
    expect(cellIdToCoords("0,0")).toEqual([0, 0]);
  });

  it("parses '3,5' as [3,5]", () => {
    expect(cellIdToCoords("3,5")).toEqual([3, 5]);
  });

  it("parses '9,9' as [9,9]", () => {
    expect(cellIdToCoords("9,9")).toEqual([9, 9]);
  });

  it("returns numbers, not strings", () => {
    const [r, c] = cellIdToCoords("4,7");
    expect(typeof r).toBe("number");
    expect(typeof c).toBe("number");
  });
});

describe("round-trip", () => {
  it("coord → cellId → coord returns the original value", () => {
    const coord: [number, number] = [5, 8];
    expect(cellIdToCoords(coordsToCellId(coord))).toEqual(coord);
  });

  it("cellId → coord → cellId returns the original string", () => {
    expect(coordsToCellId(cellIdToCoords("2,7"))).toBe("2,7");
  });
});
