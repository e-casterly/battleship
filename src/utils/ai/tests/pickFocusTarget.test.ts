import { describe, it, expect } from "vitest";
import { pickFocusTarget } from "@utils/ai/pickFocusTarget.ts";
import type { Coord } from "@app-types/common.types.ts";

const cells = (...coords: Coord[]) =>
  new Set(coords.map(([r, c]) => `${r},${c}`));

describe("pickFocusTarget", () => {
  describe("single hit — axis not yet determined, picks any adjacent free cell", () => {
    it("returns the only valid right neighbor", () => {
      expect(pickFocusTarget(cells([5, 6]), [[5, 5]])).toEqual([5, 6]);
    });

    it("returns the only valid left neighbor", () => {
      expect(pickFocusTarget(cells([5, 4]), [[5, 5]])).toEqual([5, 4]);
    });

    it("returns the only valid neighbor below", () => {
      expect(pickFocusTarget(cells([6, 5]), [[5, 5]])).toEqual([6, 5]);
    });

    it("returns the only valid neighbor above", () => {
      expect(pickFocusTarget(cells([4, 5]), [[5, 5]])).toEqual([4, 5]);
    });

    it("returns null when all neighboring cells are already shot", () => {
      expect(pickFocusTarget(cells([7, 7]), [[5, 5]])).toBeNull();
    });

    it("returns null when remainingCells is empty", () => {
      expect(pickFocusTarget(new Set(), [[5, 5]])).toBeNull();
    });

    it("returns one of the valid neighbors when multiple are available", () => {
      const result = pickFocusTarget(cells([5, 4], [5, 6]), [[5, 5]]);
      expect([[5, 4], [5, 6]]).toContainEqual(result);
    });
  });

  describe("hits on the same row — extends the attack left or right from the ends", () => {
    // focusCoords [3,3],[3,4],[3,5]: leftmost=[3,3], rightmost=[3,5]

    it("returns the cell to the right of the rightmost hit", () => {
      expect(pickFocusTarget(cells([3, 6]), [[3, 3], [3, 4], [3, 5]])).toEqual([3, 6]);
    });

    it("returns the cell to the left of the leftmost hit", () => {
      expect(pickFocusTarget(cells([3, 2]), [[3, 3], [3, 4], [3, 5]])).toEqual([3, 2]);
    });

    it("returns null when neither horizontal end has a free neighbor", () => {
      // only a vertical neighbor is free — should be ignored
      expect(pickFocusTarget(cells([4, 3]), [[3, 3], [3, 4], [3, 5]])).toBeNull();
    });

    it("ignores vertical neighbors even when they are free", () => {
      // [4,3] is below the leftmost hit; horizontal-only dirs are tried → null
      expect(pickFocusTarget(cells([4, 3]), [[3, 3], [3, 4]])).toBeNull();
    });

    it("sorts unsorted focusCoords correctly before picking endpoints", () => {
      expect(pickFocusTarget(cells([3, 6]), [[3, 5], [3, 3], [3, 4]])).toEqual([3, 6]);
    });

    it("works with just two adjacent horizontal hits", () => {
      expect(pickFocusTarget(cells([3, 5]), [[3, 3], [3, 4]])).toEqual([3, 5]);
    });
  });

  describe("multiple vertical hits — only vertical directions, only endpoints", () => {
    // focusCoords [3,5],[4,5],[5,5]: topmost=[3,5], bottommost=[5,5]

    it("returns the cell below the bottommost hit", () => {
      expect(pickFocusTarget(cells([6, 5]), [[3, 5], [4, 5], [5, 5]])).toEqual([6, 5]);
    });

    it("returns the cell above the topmost hit", () => {
      expect(pickFocusTarget(cells([2, 5]), [[3, 5], [4, 5], [5, 5]])).toEqual([2, 5]);
    });

    it("returns null when neither vertical end has a free neighbor", () => {
      // only a horizontal neighbor is free — should be ignored
      expect(pickFocusTarget(cells([3, 6]), [[3, 5], [4, 5], [5, 5]])).toBeNull();
    });

    it("ignores horizontal neighbors even when they are free", () => {
      // [3,6] is to the right of the topmost hit; vertical-only dirs are tried → null
      expect(pickFocusTarget(cells([3, 6]), [[3, 5], [4, 5]])).toBeNull();
    });

    it("sorts unsorted focusCoords correctly before picking endpoints", () => {
      expect(pickFocusTarget(cells([2, 5]), [[5, 5], [3, 5], [4, 5]])).toEqual([2, 5]);
    });
  });

  describe("board edges — out-of-bounds candidates are skipped", () => {
    it("skips the upward OOB direction and returns the only valid neighbor", () => {
      // [0,5]: dir[-1,0] gives [-1,5] which is OOB → only [1,5] is reachable
      expect(pickFocusTarget(cells([1, 5]), [[0, 5]])).toEqual([1, 5]);
    });

    it("returns null at a corner when no in-bound neighbor is in remainingCells", () => {
      // [0,0]: valid dirs give [0,1] and [1,0]; neither is in remainingCells
      expect(pickFocusTarget(cells([5, 5]), [[0, 0]])).toBeNull();
    });

    it("horizontal hits at the right edge — OOB extension skipped, left extension returned", () => {
      // rightmost=[3,9]: [3,10] is OOB; leftmost=[3,8]: [3,7] is the only option
      expect(pickFocusTarget(cells([3, 7]), [[3, 8], [3, 9]])).toEqual([3, 7]);
    });

    it("vertical hits at the bottom edge — OOB extension skipped, upward extension returned", () => {
      // bottommost=[9,5]: [10,5] is OOB; topmost=[8,5]: [7,5] is the only option
      expect(pickFocusTarget(cells([7, 5]), [[8, 5], [9, 5]])).toEqual([7, 5]);
    });
  });
});
