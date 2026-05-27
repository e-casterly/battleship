import { cellIdToCoords } from "@utils/helpers/coordinateFormat.ts";

export const pickRandomPoint = (set: Set<string>) => {
  const freeIndex = Math.floor(Math.random() * set.size);
  let i = 0;
  for (const item of set) {
    if (i === freeIndex) return cellIdToCoords(item);
    i++;
  }
  return null;
};
