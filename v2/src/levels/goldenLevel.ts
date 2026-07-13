import type { Polygon } from "../core/types";

export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 844;

export const GOLDEN_POLYGON: Polygon = [
  { x: 58, y: 184 },
  { x: 332, y: 170 },
  { x: 350, y: 278 },
  { x: 338, y: 664 },
  { x: 290, y: 704 },
  { x: 76, y: 690 },
  { x: 42, y: 602 },
  { x: 46, y: 270 },
];

export const GOLDEN_LEVEL = {
  target: 0.5,
  blade: { x: 205, y: 470, radius: 18, speed: 2.2, velocity: { x: 1.62, y: 1.49 } },
  guide: { start: { x: 42, y: 300 }, end: { x: 352, y: 300 } },
  starThresholds: { three: { seconds: 28, cuts: 3 }, two: { seconds: 48, cuts: 5 } },
} as const;
