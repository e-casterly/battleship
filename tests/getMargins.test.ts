import { describe, it, expect } from "vitest";
import { getMargins } from "@utils/layout-helpers/getMargins.ts";
import type { BoardSize, Coord } from "@app-types/common.types.ts";

const BOARD: BoardSize = [10, 10];

describe("getMargins", () => {
  it("returns an empty array for an empty points list — regression for Infinity bug", () => {
    expect(getMargins(BOARD, [])).toEqual([]);
  });

  it("returns 8 surrounding cells for a single point in the center of the board", () => {
    const margins = getMargins(BOARD, [[5, 5]]);
    expect(margins).toHaveLength(8);
    expect(margins).toContainEqual([4, 4]);
    expect(margins).toContainEqual([4, 5]);
    expect(margins).toContainEqual([4, 6]);
    expect(margins).toContainEqual([5, 4]);
    expect(margins).toContainEqual([5, 6]);
    expect(margins).toContainEqual([6, 4]);
    expect(margins).toContainEqual([6, 5]);
    expect(margins).toContainEqual([6, 6]);
  });

  it("clips margins to board boundaries for a corner point", () => {
    const margins = getMargins(BOARD, [[0, 0]]);
    expect(margins).toHaveLength(3);
    expect(margins).toContainEqual([0, 1]);
    expect(margins).toContainEqual([1, 0]);
    expect(margins).toContainEqual([1, 1]);
  });

  it("clips margins to board boundaries for an edge point", () => {
    const margins = getMargins(BOARD, [[0, 5]]);
    expect(margins).toHaveLength(5);
    expect(margins).toContainEqual([0, 4]);
    expect(margins).toContainEqual([0, 6]);
    expect(margins).toContainEqual([1, 4]);
    expect(margins).toContainEqual([1, 5]);
    expect(margins).toContainEqual([1, 6]);
  });

  it("does not include the ship's own cells in the margins", () => {
    const positions: Coord[] = [[5, 5]];
    const margins = getMargins(BOARD, positions);
    expect(margins).not.toContainEqual([5, 5]);
  });

  it("returns correct margins for a horizontal two-cell ship", () => {
    const positions: Coord[] = [[3, 3], [3, 4]];
    const margins = getMargins(BOARD, positions);
    expect(margins).not.toContainEqual([3, 3]);
    expect(margins).not.toContainEqual([3, 4]);
    expect(margins).toContainEqual([2, 2]);
    expect(margins).toContainEqual([4, 5]);
    expect(margins).toHaveLength(10);
  });

  it("clips margins for a ship placed at the last row", () => {
    const positions: Coord[] = [[9, 5]];
    const margins = getMargins(BOARD, positions);
    expect(margins.every(([r]) => r <= 9)).toBe(true);
  });
});
