import type { Coord } from "@app-types/common.types.ts";
import { cellIdToCoords } from "@utils/helpers/coordinateFormat.ts";

export const getCellTitle = (num: Coord | string) => {
  const cell = typeof num === "string" ? cellIdToCoords(num) : num;
  return `${String.fromCharCode(65 + cell[0])}${cell[1] + 1}`;
};
