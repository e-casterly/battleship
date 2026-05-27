import { describe, it, expect } from "vitest";
import { tryPlaceShipInDirection } from "@utils/layout/tryPlaceShipInDirection.ts";
import type { BoardSize, Coord } from "@app-types/common.types.ts";

const BOARD: BoardSize = [10, 10];
const RIGHT = [0, 1];
const DOWN = [1, 0];
const LEFT = [0, -1];

const makeFreeCoordsFromPositions = (positions: Coord[]): Set<string> =>
  new Set(positions.map(([r, c]) => `${r},${c}`));

describe("tryPlaceShipInDirection", () => {
  describe("returns positions and margins", () => {
    it("places a horizontal ship when all cells are free", () => {
      const positions: Coord[] = [[3, 3], [3, 4], [3, 5]];
      const freeCoords = makeFreeCoordsFromPositions(positions);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [3, 3], RIGHT, 3);
      expect(result).not.toBeNull();
      expect(result!.positions).toEqual([[3, 3], [3, 4], [3, 5]]);
    });

    it("places a vertical ship when all cells are free", () => {
      const positions: Coord[] = [[2, 4], [3, 4], [4, 4]];
      const freeCoords = makeFreeCoordsFromPositions(positions);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [2, 4], DOWN, 3);
      expect(result).not.toBeNull();
      expect(result!.positions).toEqual([[2, 4], [3, 4], [4, 4]]);
    });

    it("returns non-empty margins", () => {
      const freeCoords = makeFreeCoordsFromPositions([[5, 5]]);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [5, 5], RIGHT, 1);
      expect(result!.margins.length).toBeGreaterThan(0);
    });

    it("does not include ship positions in margins", () => {
      const freeCoords = makeFreeCoordsFromPositions([[5, 5]]);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [5, 5], RIGHT, 1);
      expect(result!.margins).not.toContainEqual([5, 5]);
    });

    it("places a single-cell ship", () => {
      const freeCoords = new Set(["4,4"]);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [4, 4], RIGHT, 1);
      expect(result).not.toBeNull();
      expect(result!.positions).toEqual([[4, 4]]);
    });
  });

  describe("returns null", () => {
    it("returns null when the ship extends beyond the board boundary", () => {
      const freeCoords = new Set(["0,8", "0,9"]);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [0, 8], RIGHT, 3);
      expect(result).toBeNull();
    });

    it("returns null when the start point is at the board edge in the given direction", () => {
      const freeCoords = new Set(["3,0"]);
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [3, 0], LEFT, 2);
      expect(result).toBeNull();
    });

    it("returns null when a position is occupied", () => {
      const freeCoords = new Set(["3,3"]); // only first cell is free
      const result = tryPlaceShipInDirection(BOARD, freeCoords, [3, 3], RIGHT, 3);
      expect(result).toBeNull();
    });

    it("returns null when freeCoords is empty", () => {
      const result = tryPlaceShipInDirection(
        BOARD,
        new Set<string>(),
        [5, 5],
        RIGHT,
        2,
      );
      expect(result).toBeNull();
    });
  });
});
