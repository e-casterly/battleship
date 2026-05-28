import { describe, it, expect } from "vitest";
import { buildShipCells } from "@utils/layout-helpers/buildShipCells.ts";
import type { BoardSize } from "@app-types/common.types.ts";

const BOARD: BoardSize = [10, 10];
const H = [0, 1];
const V = [1, 0];

describe("buildShipCells", () => {
  describe("indexCell = 0 (default) — ship extends forward from startPoint", () => {
    it("builds a horizontal 3-cell ship", () => {
      expect(buildShipCells(BOARD, [3, 3], H, 3)).toEqual([[3, 3], [3, 4], [3, 5]]);
    });

    it("builds a vertical 3-cell ship", () => {
      expect(buildShipCells(BOARD, [3, 3], V, 3)).toEqual([[3, 3], [4, 3], [5, 3]]);
    });

    it("builds a single-cell ship", () => {
      expect(buildShipCells(BOARD, [5, 5], H, 1)).toEqual([[5, 5]]);
    });

    it("builds a 5-cell ship along the top row", () => {
      expect(buildShipCells(BOARD, [0, 0], H, 5)).toEqual([
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
      ]);
    });
  });

  describe("indexCell > 0 — ship straddles the startPoint", () => {
    it("places 1 pre-cell and 1 post-cell when indexCell=1, size=3", () => {
      expect(buildShipCells(BOARD, [3, 4], H, 3, 1)).toEqual([[3, 3], [3, 4], [3, 5]]);
    });

    it("places 2 pre-cells and 0 post-cells when indexCell=2, size=3", () => {
      expect(buildShipCells(BOARD, [3, 5], H, 3, 2)).toEqual([[3, 3], [3, 4], [3, 5]]);
    });

    it("places 1 pre-cell for a vertical ship (indexCell=1, size=3)", () => {
      expect(buildShipCells(BOARD, [4, 3], V, 3, 1)).toEqual([[3, 3], [4, 3], [5, 3]]);
    });

    it("places correct cells for indexCell=1, size=2", () => {
      expect(buildShipCells(BOARD, [3, 4], H, 2, 1)).toEqual([[3, 3], [3, 4]]);
    });

    it("pre-cells are ordered correctly (closest first) for indexCell=2, size=3", () => {
      const result = buildShipCells(BOARD, [3, 5], H, 3, 2);
      expect(result[0]).toEqual([3, 3]);
      expect(result[1]).toEqual([3, 4]);
      expect(result[2]).toEqual([3, 5]);
    });
  });

  describe("returns [] when ship goes out of bounds", () => {
    it("returns [] when ship extends past the right edge", () => {
      // cells would be [3,8],[3,9],[3,10] — col 10 is out
      expect(buildShipCells(BOARD, [3, 8], H, 3)).toEqual([]);
    });

    it("returns a valid result when the ship fits exactly at the right edge", () => {
      expect(buildShipCells(BOARD, [3, 7], H, 3)).toEqual([[3, 7], [3, 8], [3, 9]]);
    });

    it("returns [] when a pre-cell goes to a negative column (indexCell=1 at col 0)", () => {
      // pre-cell would be [3,-1]
      expect(buildShipCells(BOARD, [3, 0], H, 2, 1)).toEqual([]);
    });

    it("returns [] when startPoint itself is outside the board", () => {
      expect(buildShipCells(BOARD, [10, 5], H, 1)).toEqual([]);
    });

    it("returns [] when vertical ship extends past the bottom edge", () => {
      expect(buildShipCells(BOARD, [8, 3], V, 3)).toEqual([]);
    });

    it("returns [] when a vertical pre-cell goes above row 0 (indexCell=1 at row 0)", () => {
      expect(buildShipCells(BOARD, [0, 5], V, 2, 1)).toEqual([]);
    });
  });

  describe("non-default directions", () => {
    it("extends left with dir=[0,-1]", () => {
      expect(buildShipCells(BOARD, [3, 7], [0, -1], 3)).toEqual([[3, 7], [3, 6], [3, 5]]);
    });

    it("extends upward with dir=[-1,0]", () => {
      expect(buildShipCells(BOARD, [5, 3], [-1, 0], 3)).toEqual([[5, 3], [4, 3], [3, 3]]);
    });

    it("returns [] when dir=[0,-1] ship goes negative", () => {
      expect(buildShipCells(BOARD, [3, 1], [0, -1], 3)).toEqual([]);
    });
  });

  describe("custom board size", () => {
    it("accepts a 5×5 board and places a valid 2-cell ship", () => {
      expect(buildShipCells([5, 5], [4, 3], H, 2)).toEqual([[4, 3], [4, 4]]);
    });

    it("returns [] when a 3-cell ship would exceed a 5-column board", () => {
      // cells would be [4,3],[4,4],[4,5] — col 5 is out of 5-col board
      expect(buildShipCells([5, 5], [4, 3], H, 3)).toEqual([]);
    });
  });
});
