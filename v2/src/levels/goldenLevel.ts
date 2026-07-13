import type { Polygon } from "../core/types";

export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 844;

export const GOLDEN_POLYGON: Polygon = [
  { x: 80, y: 224 },
  { x: 310, y: 212 },
  { x: 325, y: 303 },
  { x: 315, y: 627 },
  { x: 275, y: 661 },
  { x: 95, y: 649 },
  { x: 66, y: 575 },
  { x: 70, y: 296 },
];

export const GOLDEN_LEVEL = {
  target: 0.5,
  blade: { x: 205, y: 470, radius: 14, speed: 2.2, velocity: { x: 1.62, y: 1.49 } },
  guide: { start: { x: 66, y: 312 }, end: { x: 325, y: 312 } },
  starThresholds: { three: { seconds: 28, cuts: 3 }, two: { seconds: 48, cuts: 5 } },
} as const;
