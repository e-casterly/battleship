import { describe, it, expect } from "vitest";
import { isPointInsideOfBoard } from "@utils/layout-helpers/isPointInsideOfBoard.ts";

describe("isPointInsideOfBoard", () => {
  describe("default 10×10 board", () => {
    it("returns true for [0,0] — top-left corner", () => {
      expect(isPointInsideOfBoard([0, 0])).toBe(true);
    });

    it("returns true for [9,9] — bottom-right corner", () => {
      expect(isPointInsideOfBoard([9, 9])).toBe(true);
    });

    it("returns true for a point in the middle", () => {
      expect(isPointInsideOfBoard([5, 5])).toBe(true);
    });

    it("returns false for [10,0] — row out of bounds", () => {
      expect(isPointInsideOfBoard([10, 0])).toBe(false);
    });

    it("returns false for [0,10] — column out of bounds", () => {
      expect(isPointInsideOfBoard([0, 10])).toBe(false);
    });

    it("returns false for [-1,0] — negative row", () => {
      expect(isPointInsideOfBoard([-1, 0])).toBe(false);
    });

    it("returns false for [0,-1] — negative column", () => {
      expect(isPointInsideOfBoard([0, -1])).toBe(false);
    });
  });

  describe("custom board size", () => {
    it("returns true for the last valid cell of a 5×5 board", () => {
      expect(isPointInsideOfBoard([4, 4], [5, 5])).toBe(true);
    });

    it("returns false when row equals board height", () => {
      expect(isPointInsideOfBoard([5, 0], [5, 5])).toBe(false);
    });

    it("returns false when column equals board width", () => {
      expect(isPointInsideOfBoard([0, 5], [5, 5])).toBe(false);
    });

    it("supports non-square boards", () => {
      expect(isPointInsideOfBoard([1, 9], [3, 10])).toBe(true);
      expect(isPointInsideOfBoard([3, 0], [3, 10])).toBe(false);
    });
  });
});
