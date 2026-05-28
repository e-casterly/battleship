import { describe, it, expect } from "vitest";
import { computeShipPosition } from "@utils/placement/computeShipPosition.ts";
import type { DragInfo } from "@app-types/placement.types.ts";

const makeDragInfo = (overrides: Partial<DragInfo> = {}): DragInfo => ({
  isDraggable: true,
  shipId: "ship-1",
  shipVariant: "sloop",
  indexCell: 0,
  occupiedCells: {},
  shipSize: 2,
  cellSize: 40,
  ...overrides,
});

describe("computeShipPosition", () => {
  describe("returns null for incomplete dragInfo", () => {
    it("returns null when shipVariant is null", () => {
      expect(computeShipPosition("3,3", makeDragInfo({ shipVariant: null }), "h")).toBeNull();
    });

    it("returns null when shipId is null", () => {
      expect(computeShipPosition("3,3", makeDragInfo({ shipId: null }), "h")).toBeNull();
    });
  });

  describe("returns null when placement is out of bounds", () => {
    it("returns null when a horizontal ship extends past the right edge", () => {
      // sloop size 2 at col 9: cells [0,9],[0,10] — col 10 is out
      expect(computeShipPosition("0,9", makeDragInfo(), "h")).toBeNull();
    });

    it("returns null when a vertical ship extends past the bottom edge", () => {
      // sloop size 2 at row 9: cells [9,0],[10,0] — row 10 is out
      expect(computeShipPosition("9,0", makeDragInfo(), "v")).toBeNull();
    });
  });

  describe("returns null when a cell is already occupied", () => {
    it("returns null when a position overlaps another ship", () => {
      const dragInfo = makeDragInfo({ occupiedCells: { "3,4": "ship-2" } });
      expect(computeShipPosition("3,3", dragInfo, "h")).toBeNull();
    });

    it("returns null when a position falls on a margin cell of another ship", () => {
      const dragInfo = makeDragInfo({ occupiedCells: { "3,4": "space" } });
      expect(computeShipPosition("3,3", dragInfo, "h")).toBeNull();
    });
  });

  describe("valid horizontal placement", () => {
    const result = computeShipPosition("3,3", makeDragInfo(), "h")!;

    it("returns a non-null result", () => {
      expect(result).not.toBeNull();
    });

    it("has the correct id and type", () => {
      expect(result.id).toBe("ship-1");
      expect(result.type).toBe("sloop");
    });

    it("positions extend rightward from the drop cell", () => {
      expect(result.positions).toEqual([[3, 3], [3, 4]]);
    });

    it("includes non-empty margins", () => {
      expect(result.margins.length).toBeGreaterThan(0);
    });

    it("margins do not overlap ship positions", () => {
      const posSet = new Set(result.positions.map(([r, c]) => `${r},${c}`));
      for (const [r, c] of result.margins) {
        expect(posSet.has(`${r},${c}`)).toBe(false);
      }
    });
  });

  describe("valid vertical placement", () => {
    it("positions extend downward from the drop cell", () => {
      const result = computeShipPosition("3,3", makeDragInfo(), "v");
      expect(result!.positions).toEqual([[3, 3], [4, 3]]);
    });
  });

  describe("indexCell > 0 — ship straddles the drop cell", () => {
    it("offsets positions correctly when dragging by a non-first cell", () => {
      // sloop size 2, indexCell=1 at [3,4] → ship should occupy [[3,3],[3,4]]
      const result = computeShipPosition("3,4", makeDragInfo({ indexCell: 1 }), "h");
      expect(result!.positions).toEqual([[3, 3], [3, 4]]);
    });
  });

  describe("larger ship", () => {
    it("builds 4 positions for a horizontal frigate", () => {
      const result = computeShipPosition(
        "5,3",
        makeDragInfo({ shipVariant: "frigate", shipSize: 4 }),
        "h",
      );
      expect(result!.positions).toEqual([[5, 3], [5, 4], [5, 5], [5, 6]]);
    });
  });
});
