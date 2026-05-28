import { describe, it, expect } from "vitest";
import { getRemainingShips } from "@utils/battle/getRemainingShips.ts";
import { FLEET_CONFIG } from "@utils/constants.ts";
import type { FleetConfig } from "@app-types/common.types.ts";

describe("getRemainingShips", () => {
  it("initialises each ship type with its count from the config", () => {
    const result = getRemainingShips(FLEET_CONFIG);
    expect(result.galleon).toBe(1);
    expect(result.frigate).toBe(1);
    expect(result.brigantine).toBe(1);
    expect(result.schooner).toBe(2);
    expect(result.sloop).toBe(2);
  });

  it("returns a count of 0 when a ship type has count 0", () => {
    const config: FleetConfig = {
      galleon: { size: 5, count: 0 },
      frigate: { size: 4, count: 1 },
      brigantine: { size: 3, count: 1 },
      schooner: { size: 3, count: 1 },
      sloop: { size: 2, count: 2 },
    };
    expect(getRemainingShips(config).galleon).toBe(0);
  });

  it("does not include the ship size — only the count", () => {
    const result = getRemainingShips(FLEET_CONFIG);
    expect(typeof result.galleon).toBe("number");
    expect(Object.keys(result)).toEqual(Object.keys(FLEET_CONFIG));
  });
});
