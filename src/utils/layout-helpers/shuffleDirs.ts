import { DIRS } from "@utils/constants.ts";

export const shuffleDirs = (dirs: number[][] = DIRS): number[][] => {
  const arr = [...dirs];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};