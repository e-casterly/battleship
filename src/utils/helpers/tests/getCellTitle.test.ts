import { describe, it, expect } from "vitest";
import { getCellTitle } from "@utils/helpers/getCellTitle.ts";

describe("getCellTitle", () => {
  describe("called with a [row, col] tuple", () => {
    it("[0,0] → 'A1'", () => {
      expect(getCellTitle([0, 0])).toBe("A1");
    });

    it("[0,9] → 'A10' — last column", () => {
      expect(getCellTitle([0, 9])).toBe("A10");
    });

    it("[9,0] → 'J1' — last row", () => {
      expect(getCellTitle([9, 0])).toBe("J1");
    });

    it("[9,9] → 'J10' — bottom-right corner", () => {
      expect(getCellTitle([9, 9])).toBe("J10");
    });

    it("[1,2] → 'B3'", () => {
      expect(getCellTitle([1, 2])).toBe("B3");
    });
  });

  describe("called with a 'row,col' string", () => {
    it("'0,0' → 'A1'", () => {
      expect(getCellTitle("0,0")).toBe("A1");
    });

    it("'3,5' → 'D6'", () => {
      expect(getCellTitle("3,5")).toBe("D6");
    });

    it("produces the same result as the Coord form", () => {
      expect(getCellTitle("7,4")).toBe(getCellTitle([7, 4]));
    });
  });
});
