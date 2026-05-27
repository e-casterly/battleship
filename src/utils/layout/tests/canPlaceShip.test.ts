import { describe, it, expect } from "vitest";
import { canPlaceShip } from "@utils/layout/tryPlaceShipInDirection.ts";
import type { Coord } from "@app-types/common.types.ts";

describe("canPlaceShip", () => {
  it("returns true when all positions are in freeCoords", () => {
    const freeCoords = new Set(["0,0", "0,1", "0,2"]);
    const positions: Coord[] = [[0, 0], [0, 1], [0, 2]];
    expect(canPlaceShip(freeCoords, positions)).toBe(true);
  });

  it("returns false when any position is not in freeCoords", () => {
    const freeCoords = new Set(["0,0", "0,1"]);
    const positions: Coord[] = [[0, 0], [0, 1], [0, 2]];
    expect(canPlaceShip(freeCoords, positions)).toBe(false);
  });

  it("returns false when all positions are occupied", () => {
    const freeCoords = new Set(["5,5"]);
    const positions: Coord[] = [[0, 0], [0, 1]];
    expect(canPlaceShip(freeCoords, positions)).toBe(false);
  });

  it("returns true for a single-cell ship on a free cell", () => {
    const freeCoords = new Set(["3,4"]);
    const positions: Coord[] = [[3, 4]];
    expect(canPlaceShip(freeCoords, positions)).toBe(true);
  });

  it("returns false for a single-cell ship on an occupied cell", () => {
    const freeCoords = new Set(["1,1"]);
    const positions: Coord[] = [[3, 4]];
    expect(canPlaceShip(freeCoords, positions)).toBe(false);
  });

  it("returns false when freeCoords is empty", () => {
    const freeCoords = new Set<string>();
    const positions: Coord[] = [[0, 0]];
    expect(canPlaceShip(freeCoords, positions)).toBe(false);
  });
});
