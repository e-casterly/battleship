import { describe, it, expect } from "vitest";
import { getOccupiedPoints } from "@utils/generateShipPositions";
import { getFreeCoordsSet, getStringCoordinate } from "@utils/helpers";

describe("getOccupiedPoints", () => {
  it("returns null when points go out of board (getCoords -> [])", () => {
    const boardSize: [number, number] = [3, 3];
    const free = getFreeCoordsSet(boardSize);

    const res = getOccupiedPoints(boardSize, free, [2, 2], [0, 1], 2);

    expect(res).toBeNull();
  });

  it("returns null when at least one point is not available in freeCoords", () => {
    const boardSize: [number, number] = [3, 3];
    const free = getFreeCoordsSet(boardSize);

    free.delete(getStringCoordinate([0, 1]));

    const res = getOccupiedPoints(boardSize, free, [0, 0], [0, 1], 3);
    expect(res).toBeNull();
  });

  it("returns positions+margins and removes them from updatedFreeCoordsSet without mutating input", () => {
    const boardSize: [number, number] = [3, 3];
    const free = getFreeCoordsSet(boardSize);
    const freeBefore = new Set(free);

    const res = getOccupiedPoints(boardSize, free, [0, 0], [1, 0], 3);

    expect(res).not.toBeNull();

    expect(res!.positions).toEqual([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);

    expect(res!.margins).toEqual([
      [0, 1],
      [1, 1],
      [2, 1],
    ]);

    expect(free).toEqual(freeBefore);

    for (const p of res!.positions) {
      expect(res!.updatedFreeCoordsSet.has(getStringCoordinate(p))).toBe(false);
    }
    for (const m of res!.margins) {
      expect(res!.updatedFreeCoordsSet.has(getStringCoordinate(m))).toBe(false);
    }

    expect(res!.updatedFreeCoordsSet.has("0,2")).toBe(true);
    expect(res!.updatedFreeCoordsSet.has("2,2")).toBe(true);
  });
});
