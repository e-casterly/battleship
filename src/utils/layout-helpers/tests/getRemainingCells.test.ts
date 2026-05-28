import { describe, it, expect } from "vitest";
import { getRemainingCells } from "@utils/layout-helpers/getRemainingCells.ts";

describe("getRemainingCells", () => {
  describe("default 10×10 board", () => {
    it("returns 100 cells", () => {
      expect(getRemainingCells().size).toBe(100);
    });

    it("contains the top-left corner", () => {
      expect(getRemainingCells().has("0,0")).toBe(true);
    });

    it("contains the bottom-right corner", () => {
      expect(getRemainingCells().has("9,9")).toBe(true);
    });

    it("does not contain cells outside the board", () => {
      const cells = getRemainingCells();
      expect(cells.has("10,0")).toBe(false);
      expect(cells.has("0,10")).toBe(false);
    });
  });

  describe("custom board size", () => {
    it("returns rows × cols cells", () => {
      expect(getRemainingCells([5, 3]).size).toBe(15);
    });

    it("contains only cells within bounds", () => {
      const cells = getRemainingCells([2, 2]);
      expect(cells).toEqual(new Set(["0,0", "0,1", "1,0", "1,1"]));
    });
  });
});
