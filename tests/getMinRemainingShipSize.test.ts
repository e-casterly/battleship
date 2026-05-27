import { describe, it, expect } from "vitest";
import { getMinRemainingShipSize } from "@utils/ai/getMinRemainingShipSize.ts";
import type { FleetConfig } from "@app-types/common.types.ts";

const fleetConfig: FleetConfig = {
  galleon: { size: 5, count: 1 },
  frigate: { size: 4, count: 1 },
  brigantine: { size: 3, count: 1 },
  schooner: { size: 3, count: 1 },
  sloop: { size: 2, count: 2 },
};

describe("getMinRemainingShipSize", () => {
  it("returns the smallest ship size when all ships are alive", () => {
    const remainingShips = { galleon: 1, frigate: 1, brigantine: 1, schooner: 1, sloop: 2 };
    expect(getMinRemainingShipSize(remainingShips, fleetConfig)).toBe(2);
  });

  it("returns the minimum size among ships still alive", () => {
    const remainingShips = { galleon: 1, frigate: 1, brigantine: 0, schooner: 0, sloop: 0 };
    expect(getMinRemainingShipSize(remainingShips, fleetConfig)).toBe(4);
  });

  it("returns the size of the only remaining ship type", () => {
    const remainingShips = { galleon: 1, frigate: 0, brigantine: 0, schooner: 0, sloop: 0 };
    expect(getMinRemainingShipSize(remainingShips, fleetConfig)).toBe(5);
  });

  it("returns 1 when all ships are sunk — regression for Infinity bug", () => {
    const remainingShips = { galleon: 0, frigate: 0, brigantine: 0, schooner: 0, sloop: 0 };
    expect(getMinRemainingShipSize(remainingShips, fleetConfig)).toBe(1);
  });

  it("ignores ship types with count 0 when computing the minimum", () => {
    const remainingShips = { galleon: 0, frigate: 0, brigantine: 1, schooner: 1, sloop: 0 };
    expect(getMinRemainingShipSize(remainingShips, fleetConfig)).toBe(3);
  });
});
