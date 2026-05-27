import { describe, it, expect } from "vitest";
import { computeFire } from "@utils/battle/computeFire.ts";
import type { FireState } from "@utils/battle/computeFire.ts";

const DEFENDER = "player1";
const CELL = "2,3";
const SHIP_ID = "ship-1";

const baseState: FireState = {
  shots: { [DEFENDER]: {} },
  occupiedCells: { [DEFENDER]: {} },
  fleetHealth: { [DEFENDER]: {} },
  shipsLayout: { [DEFENDER]: [] },
  remainingShips: {
    [DEFENDER]: {
      sloop: 2,
      schooner: 1,
      brigantine: 1,
      frigate: 1,
      galleon: 1,
    },
  },
};

describe("computeFire", () => {
  describe("miss — cell is empty", () => {
    const state: FireState = {
      ...baseState,
      occupiedCells: { [DEFENDER]: {} },
    };
    const outcome = computeFire(DEFENDER, CELL, state);

    it('returns result "miss"', () => {
      expect(outcome.result).toBe("miss");
    });

    it("excludedCells contains only the target cell", () => {
      expect(outcome.excludedCells).toEqual([CELL]);
    });

    it("marks the cell as miss in shots patch", () => {
      expect(outcome.patch.shots[DEFENDER][CELL]).toBe("miss");
    });

    it("does not include fleetHealth or remainingShips in patch", () => {
      expect(outcome.patch.fleetHealth).toBeUndefined();
      expect(outcome.patch.remainingShips).toBeUndefined();
    });

    it("does not return shipType", () => {
      expect(outcome.shipType).toBeUndefined();
    });
  });

  describe("hit — ship health > 1", () => {
    const state: FireState = {
      ...baseState,
      occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
      fleetHealth: { [DEFENDER]: { [SHIP_ID]: 3 } },
    };
    const outcome = computeFire(DEFENDER, CELL, state);

    it('returns result "hit"', () => {
      expect(outcome.result).toBe("hit");
    });

    it("marks the cell as hit in shots patch", () => {
      expect(outcome.patch.shots[DEFENDER][CELL]).toBe("hit");
    });

    it("decrements ship health by 1", () => {
      expect(outcome.patch.fleetHealth![DEFENDER][SHIP_ID]).toBe(2);
    });

    it("does not include remainingShips in patch", () => {
      expect(outcome.patch.remainingShips).toBeUndefined();
    });

    it("preserves previous shots", () => {
      const stateWithHistory: FireState = {
        ...state,
        shots: { [DEFENDER]: { "0,0": "miss" } },
      };
      const result = computeFire(DEFENDER, CELL, stateWithHistory);
      expect(result.patch.shots[DEFENDER]["0,0"]).toBe("miss");
    });
  });

  describe("sunk — ship health === 1", () => {
    const ship = {
      id: SHIP_ID,
      type: "sloop" as const,
      positions: [[2, 3]] as [number, number][],
      margins: [
        [1, 2], [1, 3], [1, 4],
        [2, 2],         [2, 4],
        [3, 2], [3, 3], [3, 4],
      ] as [number, number][],
    };
    const state: FireState = {
      ...baseState,
      occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
      fleetHealth: { [DEFENDER]: { [SHIP_ID]: 1 } },
      shipsLayout: { [DEFENDER]: [ship] },
    };
    const outcome = computeFire(DEFENDER, CELL, state);

    it('returns result "sunk"', () => {
      expect(outcome.result).toBe("sunk");
    });

    it("returns the ship type", () => {
      expect(outcome.shipType).toBe("sloop");
    });

    it("marks all ship cells as sunk in shots patch", () => {
      expect(outcome.patch.shots[DEFENDER]["2,3"]).toBe("sunk");
    });

    it("marks all margin cells as miss in shots patch", () => {
      expect(outcome.patch.shots[DEFENDER]["1,2"]).toBe("miss");
      expect(outcome.patch.shots[DEFENDER]["3,4"]).toBe("miss");
    });

    it("sets ship health to 0 in fleetHealth patch", () => {
      expect(outcome.patch.fleetHealth![DEFENDER][SHIP_ID]).toBe(0);
    });

    it("decrements the ship type count in remainingShips patch", () => {
      expect(outcome.patch.remainingShips![DEFENDER].sloop).toBe(1);
    });

    it("excludedCells contains all ship and margin cells", () => {
      expect(outcome.excludedCells).toContain("2,3");
      expect(outcome.excludedCells).toContain("1,2");
      expect(outcome.excludedCells).toHaveLength(
        ship.positions.length + ship.margins.length,
      );
    });
  });

  describe("guard throws", () => {
    it("throws if ship is in occupiedCells but missing from fleetHealth", () => {
      const state: FireState = {
        ...baseState,
        occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
        fleetHealth: { [DEFENDER]: {} },
      };
      expect(() => computeFire(DEFENDER, CELL, state)).toThrow(SHIP_ID);
    });

    it("throws if ship health reaches 0 but ship is missing from shipsLayout", () => {
      const state: FireState = {
        ...baseState,
        occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
        fleetHealth: { [DEFENDER]: { [SHIP_ID]: 1 } },
        shipsLayout: { [DEFENDER]: [] },
      };
      expect(() => computeFire(DEFENDER, CELL, state)).toThrow(SHIP_ID);
    });
  });

  describe("state isolation", () => {
    it("does not affect other defenders' shots on miss", () => {
      const state: FireState = {
        ...baseState,
        shots: { [DEFENDER]: {}, player2: { "0,0": "hit" } },
        occupiedCells: { [DEFENDER]: {}, player2: {} },
      };
      const outcome = computeFire(DEFENDER, CELL, state);
      expect(outcome.patch.shots["player2"]).toEqual({ "0,0": "hit" });
    });

    it("does not affect other ships' health in fleetHealth patch on hit", () => {
      const state: FireState = {
        ...baseState,
        occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
        fleetHealth: { [DEFENDER]: { [SHIP_ID]: 2, "ship-2": 3 } },
      };
      const outcome = computeFire(DEFENDER, CELL, state);
      expect(outcome.patch.fleetHealth![DEFENDER]["ship-2"]).toBe(3);
    });

    it("does not affect other ship types' count in remainingShips patch on sunk", () => {
      const ship = {
        id: SHIP_ID,
        type: "sloop" as const,
        positions: [[2, 3]] as [number, number][],
        margins: [] as [number, number][],
      };
      const state: FireState = {
        ...baseState,
        occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
        fleetHealth: { [DEFENDER]: { [SHIP_ID]: 1 } },
        shipsLayout: { [DEFENDER]: [ship] },
      };
      const outcome = computeFire(DEFENDER, CELL, state);
      expect(outcome.patch.remainingShips![DEFENDER].schooner).toBe(1);
      expect(outcome.patch.remainingShips![DEFENDER].frigate).toBe(1);
    });
  });

  describe("sunk — multi-cell ship", () => {
    it("marks all positions of a multi-cell ship as sunk", () => {
      const ship = {
        id: SHIP_ID,
        type: "schooner" as const,
        positions: [[2, 3], [2, 4]] as [number, number][],
        margins: [
          [1, 2], [1, 3], [1, 4], [1, 5],
          [2, 2],                  [2, 5],
          [3, 2], [3, 3], [3, 4], [3, 5],
        ] as [number, number][],
      };
      const state: FireState = {
        ...baseState,
        occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
        fleetHealth: { [DEFENDER]: { [SHIP_ID]: 1 } },
        shipsLayout: { [DEFENDER]: [ship] },
        remainingShips: { [DEFENDER]: { ...baseState.remainingShips[DEFENDER], schooner: 1 } },
      };
      const outcome = computeFire(DEFENDER, CELL, state);
      expect(outcome.patch.shots[DEFENDER]["2,3"]).toBe("sunk");
      expect(outcome.patch.shots[DEFENDER]["2,4"]).toBe("sunk");
    });
  });

  describe("sunk — last ship of its type", () => {
    it("decrements remainingShips to 0 when the last ship of its type is sunk", () => {
      const ship = {
        id: SHIP_ID,
        type: "sloop" as const,
        positions: [[2, 3]] as [number, number][],
        margins: [] as [number, number][],
      };
      const state: FireState = {
        ...baseState,
        occupiedCells: { [DEFENDER]: { [CELL]: SHIP_ID } },
        fleetHealth: { [DEFENDER]: { [SHIP_ID]: 1 } },
        shipsLayout: { [DEFENDER]: [ship] },
        remainingShips: { [DEFENDER]: { ...baseState.remainingShips[DEFENDER], sloop: 1 } },
      };
      const outcome = computeFire(DEFENDER, CELL, state);
      expect(outcome.patch.remainingShips![DEFENDER].sloop).toBe(0);
    });
  });
});
