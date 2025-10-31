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

export function tryToGetPoints(
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

  return {
    positions: points,
    margins: margins,
    updatedFreeCoordsSet,
  };
}

export function generateShipPositions(
  boardSize: [number, number] = [10, 10],
  fleet: FleetConfig,
): ShipItemPosition[] {
  let freeCoords = getFreeCoordsSet(boardSize);

  const getShipPoints = (shipSize: number, freeCoordsSet: Set<string>) => {
    const startPoint = getFreePointFromSet(freeCoordsSet);
    if (!startPoint) return null;

    const shuffledDirs = shuffleDirs();
    for (const dir of shuffledDirs) {
      const occupiedPoints = tryToGetPoints(
        boardSize,
        freeCoordsSet,
        startPoint,
        dir,
        shipSize,
      );
      if (!occupiedPoints) continue;

      const { positions, margins, updatedFreeCoordsSet } = occupiedPoints;

      return {
        positions,
        margins,
        updatedFreeCoordsSet,
      };
    }
    const newShipSet = new Set(freeCoordsSet);
    newShipSet.delete(getStringCoordinate(startPoint));
    return getShipPoints(shipSize, newShipSet);
  };

  const getShipsData = (attempts: number) => {
    const shipPositions: ShipItemPosition[] = [];
    for (const ship in fleet) {
      const currentShip = ship as keyof FleetConfig;
      const size = fleet[currentShip]["size"];
      for (let i = 0; i < fleet[currentShip]["count"]; i++) {
        const shipData = getShipPoints(size, freeCoords);
        if (!shipData) {
          if (attempts > 20) {
            return null;
          }
          freeCoords = getFreeCoordsSet(boardSize);
          return getShipsData(attempts + 1);
        }
        freeCoords = new Set(shipData.updatedFreeCoordsSet);
        const { positions, margins } = shipData;
        shipPositions.push({
          positions,
          margins,
          type: currentShip,
        });
      }
    }
    return shipPositions;
  };

  const result: Partial<ShipItemPosition[]> | null = getShipsData(0);
  if (!result) {
    return layoutPresets[
      Math.floor(Math.random() * layoutPresets.length)
    ] as ShipItemPosition[];
  }
  return result as ShipItemPosition[];
}
