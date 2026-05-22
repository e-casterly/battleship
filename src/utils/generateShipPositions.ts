import type { Coord, FleetConfig, ShipItemPosition } from "@utils/gameTypes.ts";
import { layoutPresets } from "@utils/layoutPresets.ts";
import {
  getCoords,
  getFreeCoordsSet,
  getFreePointFromSet,
  getMargins,
  getStringCoordinate,
  shuffleDirs,
} from "@utils/helpers.ts";

export function getOccupiedPoints(
  boardSize: [number, number],
  freeCoords: Set<string>,
  startPoint: Coord,
  dir: number[],
  shipSize: number,
): {
  positions: Coord[];
  margins: Coord[];
  updatedFreeCoordsSet: Set<string>;
} | null {
  const updatedFreeCoordsSet = new Set(freeCoords);
  const points: Coord[] = getCoords(boardSize, startPoint, dir, shipSize);

  const isAvailable = points.every((point) =>
    updatedFreeCoordsSet.has(getStringCoordinate(point)),
  );

  if (points.length === 0 || !isAvailable) return null;

  const margins = getMargins(boardSize, points);

  for (const position of points) {
    updatedFreeCoordsSet.delete(getStringCoordinate(position));
  }
  for (const margin of margins) {
    updatedFreeCoordsSet.delete(getStringCoordinate(margin));
  }

  return { positions: points, margins, updatedFreeCoordsSet };
}

function findShipPoints(
  boardSize: [number, number],
  shipSize: number,
  initialFreeCoords: Set<string>,
) {
  let freeCoordsSet = new Set(initialFreeCoords);

  while (freeCoordsSet.size > 0) {
    const startPoint = getFreePointFromSet(freeCoordsSet);
    if (!startPoint) return null;

    for (const dir of shuffleDirs()) {
      const result = getOccupiedPoints(boardSize, freeCoordsSet, startPoint, dir, shipSize);
      if (result) return result;
    }

    freeCoordsSet = new Set(freeCoordsSet);
    freeCoordsSet.delete(getStringCoordinate(startPoint));
  }

  return null;
}

export function generateShipPositions(
  boardSize: [number, number] = [10, 10],
  fleet: FleetConfig,
): ShipItemPosition[] {
  const MAX_ATTEMPTS = 20;

  for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
    let freeCoords = getFreeCoordsSet(boardSize);
    const shipPositions: ShipItemPosition[] = [];
    let failed = false;

    for (const ship in fleet) {
      const type = ship as keyof FleetConfig;
      const { size, count } = fleet[type];

      for (let i = 0; i < count; i++) {
        const shipData = findShipPoints(boardSize, size, freeCoords);
        if (!shipData) { failed = true; break; }

        freeCoords = shipData.updatedFreeCoordsSet;
        shipPositions.push({ id: `${type}-${i}`, positions: shipData.positions, margins: shipData.margins, type });
      }

      if (failed) break;
    }

    if (!failed) return shipPositions;
  }

  const preset = layoutPresets[Math.floor(Math.random() * layoutPresets.length)];
  const typeCounts: Record<string, number> = {};
  return (preset as Omit<ShipItemPosition, "id">[]).map((s) => {
    typeCounts[s.type] = typeCounts[s.type] ?? 0;
    return { ...s, id: `${s.type}-${typeCounts[s.type]++}` };
  });
}
