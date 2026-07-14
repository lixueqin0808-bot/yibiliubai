import type { Polygon } from "../core/types";

export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 844;

export const GOLDEN_POLYGON: Polygon = [
  { x: 101, y: 252 },
  { x: 290, y: 242 },
  { x: 303, y: 316 },
  { x: 295, y: 581 },
  { x: 262, y: 609 },
  { x: 114, y: 599 },
  { x: 90, y: 538 },
  { x: 93, y: 310 },
];

export const GOLDEN_LEVEL = {
  target: 0.5,
  blade: { x: 198, y: 454, radius: 12, speed: 2.25, velocity: { x: 1.66, y: 1.52 } },
  guide: { start: { x: 93, y: 328 }, end: { x: 303, y: 328 } },
  starThresholds: { three: { seconds: 28, cuts: 3 }, two: { seconds: 48, cuts: 5 } },
} as const;
