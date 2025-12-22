import { describe, it, expect, vi, afterEach } from "vitest";
import { generateShipPositions } from "@utils/generateShipPositions";
import { getStringCoordinate } from "@utils/helpers";
import type { FleetConfig } from "@utils/gameTypes.ts";

describe("generateShipPositions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates correct counts and no overlapping ship positions (Math.random fixed)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const fleet = {
      sloop: { size: 2, count: 1 },
      schooner: { size: 3, count: 1 },
    };

    const ships = generateShipPositions([10, 10], fleet as FleetConfig);

    expect(ships).toHaveLength(2);

    const lengths = ships.map((s) => s.positions.length).sort((a, b) => a - b);
    expect(lengths).toEqual([2, 3]);

    const occupied = new Set<string>();
    for (const ship of ships) {
      for (const p of ship.positions) {
        const key = getStringCoordinate(p);
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }
  });
});
