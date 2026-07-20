import type { Point, Polygon } from "../core/types";
import type { BoundarySegment } from "../geometry/polygon";
import { createLevel } from "./createLevel";
import type { MapShapeId } from "./mapShapes";
import type { LevelTiming } from "../results/resultScoring";

export const LOGICAL_WIDTH = 390;
export const LOGICAL_HEIGHT = 844;

export interface BladeConfig extends Point {
  variant: "four" | "five";
  radius: number;
  speed: number;
  velocity: Point;
}

export interface LevelDefinition {
  id: number;
  shapeId?: MapShapeId;
  target: number;
  timing: LevelTiming;
  polygon: Polygon;
  blades: BladeConfig[];
  guide?: { start: Point; end: Point };
  metalEdges?: BoundarySegment[];
}

const TIMINGS: LevelTiming[] = [
  { fastMs: 8_000, standardMs: 16_000, relaxedMs: 28_000 },
  { fastMs: 10_000, standardMs: 20_000, relaxedMs: 34_000 },
  { fastMs: 12_000, standardMs: 23_000, relaxedMs: 39_000 },
  { fastMs: 14_000, standardMs: 26_000, relaxedMs: 44_000 },
  { fastMs: 16_000, standardMs: 29_000, relaxedMs: 49_000 },
  { fastMs: 18_000, standardMs: 32_000, relaxedMs: 54_000 },
  { fastMs: 20_000, standardMs: 35_000, relaxedMs: 59_000 },
  { fastMs: 22_000, standardMs: 38_000, relaxedMs: 64_000 },
  { fastMs: 24_000, standardMs: 41_000, relaxedMs: 69_000 },
  { fastMs: 27_000, standardMs: 45_000, relaxedMs: 75_000 },
  { fastMs: 30_000, standardMs: 49_000, relaxedMs: 81_000 },
  { fastMs: 33_000, standardMs: 53_000, relaxedMs: 87_000 },
  { fastMs: 36_000, standardMs: 57_000, relaxedMs: 93_000 },
  { fastMs: 39_000, standardMs: 61_000, relaxedMs: 99_000 },
  { fastMs: 42_000, standardMs: 66_000, relaxedMs: 106_000 },
];

/** Matches the rendered sprite footprint instead of the older placeholder radius. */
export function bladeCollisionRadius(blade: Pick<BladeConfig, "variant">): number {
  return blade.variant === "five" ? 25 : 19;
}

export const LEVELS: LevelDefinition[] = [
  createLevel({
    id: 1,
    shapeId: "rounded-slab",
    target: 0.48,
    blades: [{ x: 198, y: 454, variant: "four", radius: 12, speed: 2.42, velocity: { x: 1.82, y: 1.64 } }],
    guide: { start: { x: 93, y: 328 }, end: { x: 303, y: 328 } },
  }),
  createLevel({
    id: 2,
    shapeId: "tapered-tablet",
    target: 0.45,
    blades: [
      { x: 158, y: 401, variant: "four", radius: 11, speed: 2.3, velocity: { x: 1.7, y: 1.48 } },
      { x: 244, y: 520, variant: "four", radius: 11, speed: 2.36, velocity: { x: -1.68, y: 1.52 } },
      { x: 222, y: 337, variant: "four", radius: 10, speed: 2.46, velocity: { x: 1.9, y: 1.58 } },
    ],
  }),
  createLevel({
    id: 3,
    shapeId: "triangle",
    target: 0.42,
    blades: [
      { x: 162, y: 465, variant: "four", radius: 11, speed: 2.2, velocity: { x: 1.64, y: 1.46 } },
      { x: 249, y: 535, variant: "four", radius: 11, speed: 2.38, velocity: { x: -1.76, y: 1.6 } },
      { x: 195, y: 365, variant: "four", radius: 10, speed: 2.52, velocity: { x: 1.94, y: 1.68 } },
    ],
  }),
  createLevel({
    id: 4,
    shapeId: "shield",
    target: 0.39,
    blades: [
      { x: 163, y: 412, variant: "four", radius: 11, speed: 2.25, velocity: { x: 1.63, y: 1.55 } },
      { x: 248, y: 521, variant: "four", radius: 11, speed: 2.45, velocity: { x: -1.81, y: 1.65 } },
      { x: 219, y: 342, variant: "five", radius: 15, speed: 2.34, velocity: { x: 1.72, y: 1.4 } },
    ],
    lockedEdgeIndices: [2],
  }),
  createLevel({
    id: 5,
    shapeId: "hex-jade",
    target: 0.36,
    blades: [
      { x: 168, y: 411, variant: "five", radius: 16, speed: 2.45, velocity: { x: 1.98, y: 1.42 } },
      { x: 249, y: 512, variant: "four", radius: 11, speed: 2.55, velocity: { x: -1.86, y: 1.74 } },
      { x: 218, y: 340, variant: "four", radius: 10, speed: 2.72, velocity: { x: 2.05, y: 1.79 } },
      { x: 142, y: 511, variant: "four", radius: 10, speed: 2.78, velocity: { x: 2.14, y: -1.76 } },
    ],
    lockedEdgeIndices: [1, 4],
  }),
  createLevel({
    id: 6,
    shapeId: "kite",
    target: 0.34,
    blades: [
      { x: 180, y: 390, variant: "four", radius: 11, speed: 2.28, velocity: { x: 1.66, y: 1.5 } },
      { x: 235, y: 510, variant: "five", radius: 16, speed: 2.18, velocity: { x: -1.62, y: 1.34 } },
      { x: 222, y: 348, variant: "four", radius: 10, speed: 2.46, velocity: { x: 1.88, y: 1.55 } },
      { x: 175, y: 500, variant: "four", radius: 10, speed: 2.56, velocity: { x: 2.02, y: -1.7 } },
    ],
    lockedEdgeIndices: [1, 3],
  }),
  createLevel({
    id: 7,
    shapeId: "star-disc",
    target: 0.32,
    blades: [
      { x: 142, y: 390, variant: "four", radius: 11, speed: 2.2, velocity: { x: 1.72, y: 1.42 } },
      { x: 252, y: 412, variant: "four", radius: 11, speed: 2.4, velocity: { x: -1.83, y: 1.58 } },
      { x: 211, y: 537, variant: "four", radius: 10, speed: 2.52, velocity: { x: 1.94, y: -1.68 } },
      { x: 162, y: 511, variant: "four", radius: 10, speed: 2.64, velocity: { x: 2.08, y: -1.78 } },
    ],
    lockedEdgeIndices: [2, 7],
  }),
  createLevel({
    id: 8,
    shapeId: "teardrop",
    target: 0.30,
    blades: [
      { x: 150, y: 410, variant: "four", radius: 11, speed: 2.32, velocity: { x: 1.72, y: 1.5 } },
      { x: 240, y: 410, variant: "four", radius: 11, speed: 2.5, velocity: { x: -1.86, y: 1.69 } },
      { x: 195, y: 370, variant: "five", radius: 16, speed: 2.24, velocity: { x: 1.58, y: 1.31 } },
      { x: 195, y: 440, variant: "four", radius: 10, speed: 2.66, velocity: { x: 2.1, y: -1.8 } },
    ],
    lockedEdgeIndices: [3, 10],
  }),
  createLevel({
    id: 9,
    shapeId: "leaf",
    target: 0.29,
    blades: [
      { x: 145, y: 376, variant: "four", radius: 10, speed: 2.58, velocity: { x: 1.98, y: 1.62 } },
      { x: 225, y: 425, variant: "four", radius: 11, speed: 2.65, velocity: { x: -2.02, y: 1.74 } },
      { x: 198, y: 543, variant: "four", radius: 10, speed: 2.75, velocity: { x: 2.14, y: -1.71 } },
      { x: 147, y: 515, variant: "four", radius: 10, speed: 2.82, velocity: { x: 2.2, y: -1.86 } },
    ],
    lockedEdgeIndices: [4, 15],
  }),
  createLevel({
    id: 10,
    shapeId: "mountain",
    target: 0.28,
    blades: [
      { x: 151, y: 395, variant: "four", radius: 11, speed: 2.44, velocity: { x: 1.84, y: 1.55 } },
      { x: 246, y: 500, variant: "four", radius: 11, speed: 2.55, velocity: { x: -1.9, y: 1.67 } },
      { x: 205, y: 380, variant: "five", radius: 16, speed: 2.36, velocity: { x: 1.73, y: 1.39 } },
      { x: 180, y: 520, variant: "four", radius: 10, speed: 2.72, velocity: { x: 2.12, y: -1.82 } },
    ],
    lockedEdgeIndices: [1, 5],
  }),
  createLevel({
    id: 11,
    shapeId: "wide-h",
    target: 0.27,
    blades: [
      { x: 110, y: 320, variant: "four", radius: 10, speed: 2.65, velocity: { x: 2.05, y: 1.68 } },
      { x: 280, y: 455, variant: "four", radius: 11, speed: 2.72, velocity: { x: -2.08, y: 1.76 } },
      { x: 195, y: 435, variant: "four", radius: 10, speed: 2.78, velocity: { x: 2.16, y: -1.83 } },
      { x: 110, y: 555, variant: "five", radius: 16, speed: 2.58, velocity: { x: 1.96, y: -1.58 } },
    ],
    lockedEdgeIndices: [2, 8],
  }),
  createLevel({
    id: 12,
    shapeId: "heart",
    target: 0.26,
    blades: [
      { x: 149, y: 402, variant: "four", radius: 11, speed: 2.55, velocity: { x: 1.92, y: 1.62 } },
      { x: 249, y: 515, variant: "five", radius: 16, speed: 2.48, velocity: { x: -1.84, y: 1.48 } },
      { x: 225, y: 344, variant: "four", radius: 10, speed: 2.74, velocity: { x: 2.12, y: 1.71 } },
      { x: 155, y: 515, variant: "four", radius: 10, speed: 2.84, velocity: { x: 2.2, y: -1.85 } },
    ],
    lockedEdgeIndices: [3, 9],
  }),
  createLevel({
    id: 13,
    shapeId: "vertical-slip",
    target: 0.25,
    blades: [
      { x: 138, y: 388, variant: "four", radius: 10, speed: 2.76, velocity: { x: 2.13, y: 1.73 } },
      { x: 250, y: 400, variant: "four", radius: 11, speed: 2.66, velocity: { x: -2.04, y: 1.66 } },
      { x: 238, y: 526, variant: "four", radius: 10, speed: 2.85, velocity: { x: -2.18, y: -1.82 } },
      { x: 156, y: 520, variant: "five", radius: 16, speed: 2.46, velocity: { x: 1.78, y: -1.46 } },
      { x: 219, y: 344, variant: "four", radius: 10, speed: 2.94, velocity: { x: 2.28, y: 1.88 } },
    ],
    lockedEdgeIndices: [1, 4],
  }),
  createLevel({
    id: 14,
    shapeId: "lantern",
    target: 0.24,
    blades: [
      { x: 143, y: 381, variant: "four", radius: 10, speed: 2.82, velocity: { x: 2.18, y: 1.78 } },
      { x: 250, y: 405, variant: "four", radius: 11, speed: 2.76, velocity: { x: -2.12, y: 1.74 } },
      { x: 202, y: 530, variant: "five", radius: 16, speed: 2.55, velocity: { x: 1.9, y: -1.52 } },
      { x: 255, y: 535, variant: "four", radius: 10, speed: 2.9, velocity: { x: -2.24, y: -1.81 } },
      { x: 215, y: 345, variant: "four", radius: 10, speed: 3.0, velocity: { x: 2.34, y: 1.94 } },
    ],
    lockedEdgeIndices: [3, 9],
  }),
  createLevel({
    id: 15,
    shapeId: "bagua",
    target: 0.22,
    blades: [
      { x: 139, y: 390, variant: "four", radius: 10, speed: 2.86, velocity: { x: 2.2, y: 1.79 } },
      { x: 248, y: 397, variant: "four", radius: 11, speed: 2.82, velocity: { x: -2.16, y: 1.76 } },
      { x: 227, y: 532, variant: "five", radius: 17, speed: 2.6, velocity: { x: -1.94, y: -1.59 } },
      { x: 154, y: 535, variant: "four", radius: 10, speed: 2.96, velocity: { x: 2.3, y: -1.88 } },
      { x: 220, y: 344, variant: "four", radius: 10, speed: 3.08, velocity: { x: 2.4, y: 1.98 } },
    ],
    lockedEdgeIndices: [0, 2, 5],
  }),
];

LEVELS.forEach((level) => {
  level.timing = TIMINGS[level.id - 1];
});

export const GOLDEN_LEVEL = LEVELS[0];
export const GOLDEN_POLYGON = LEVELS[0].polygon;
