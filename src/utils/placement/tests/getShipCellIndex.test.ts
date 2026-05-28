import { describe, it, expect } from "vitest";
import { getShipCellIndex } from "@utils/placement/getShipCellIndex.ts";
import type { ShipItemPosition } from "@app-types/common.types.ts";

const makeShip = (positions: [number, number][]): ShipItemPosition => ({
  id: "ship-1",
  type: "sloop",
  positions,
  margins: [],
});

describe("getShipCellIndex", () => {
  describe("horizontal ship", () => {
    const ship = makeShip([[3, 3], [3, 4], [3, 5]]);

    it("returns 0 for the first cell", () => {
      expect(getShipCellIndex(ship, "3,3")).toBe(0);
    });

    it("returns 1 for the middle cell", () => {
      expect(getShipCellIndex(ship, "3,4")).toBe(1);
    });

    it("returns 2 for the last cell", () => {
      expect(getShipCellIndex(ship, "3,5")).toBe(2);
    });

    it("returns -1 for a cell not in the ship", () => {
      expect(getShipCellIndex(ship, "3,6")).toBe(-1);
    });
  });

  describe("vertical ship", () => {
    const ship = makeShip([[2, 5], [3, 5], [4, 5]]);

    it("returns 0 for the topmost cell", () => {
      expect(getShipCellIndex(ship, "2,5")).toBe(0);
    });

    it("returns 2 for the bottommost cell", () => {
      expect(getShipCellIndex(ship, "4,5")).toBe(2);
    });
  });

  describe("single-cell ship", () => {
    const ship = makeShip([[7, 2]]);

    it("returns 0 for its only cell", () => {
      expect(getShipCellIndex(ship, "7,2")).toBe(0);
    });

    it("returns -1 for any other cell", () => {
      expect(getShipCellIndex(ship, "7,3")).toBe(-1);
    });
  });

  it("returns -1 when positions is empty", () => {
    expect(getShipCellIndex(makeShip([]), "3,3")).toBe(-1);
  });
});
