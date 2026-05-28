import { describe, it, expect } from "vitest";
import { gridCellsId, gridCells } from "@utils/helpers/boardGrid.ts";

describe("gridCellsId", () => {
  it("returns rows × cols items", () => {
    expect(gridCellsId(10, 10)).toHaveLength(100);
  });

  it("starts with '0,0' and ends with the last cell", () => {
    const result = gridCellsId(10, 10);
    expect(result[0]).toBe("0,0");
    expect(result[99]).toBe("9,9");
  });

  it("iterates row by row — second cell is '0,1', not '1,0'", () => {
    expect(gridCellsId(10, 10)[1]).toBe("0,1");
  });

  it("works for non-square grids", () => {
    const result = gridCellsId(2, 3);
    expect(result).toEqual(["0,0", "0,1", "0,2", "1,0", "1,1", "1,2"]);
  });
});

describe("gridCells", () => {
  it("returns rows × cols items", () => {
    expect(gridCells(10, 10)).toHaveLength(100);
  });

  it("each item has a cellId and a title", () => {
    const first = gridCells(10, 10)[0];
    expect(first.cellId).toBe("0,0");
    expect(first.title).toBe("A1");
  });

  it("each item has correct cellId and title", () => {
    const cells = gridCells(3, 3);
    expect(cells[0]).toEqual({ cellId: "0,0", title: "A1" });
    expect(cells[8]).toEqual({ cellId: "2,2", title: "C3" });
  });
});
