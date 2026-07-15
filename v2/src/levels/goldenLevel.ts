import type { Point, Polygon } from "../core/types";
import type { BoundarySegment } from "../geometry/polygon";

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
  target: number;
  polygon: Polygon;
  blades: BladeConfig[];
  guide?: { start: Point; end: Point };
  metalEdges?: BoundarySegment[];
}

const levelOne: Polygon = [
  { x: 101, y: 252 }, { x: 290, y: 242 }, { x: 303, y: 316 }, { x: 295, y: 581 },
  { x: 262, y: 609 }, { x: 114, y: 599 }, { x: 90, y: 538 }, { x: 93, y: 310 },
];

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    target: 0.5,
    polygon: levelOne,
    blades: [{ x: 198, y: 454, variant: "four", radius: 12, speed: 2.25, velocity: { x: 1.66, y: 1.52 } }],
    guide: { start: { x: 93, y: 328 }, end: { x: 303, y: 328 } },
  },
  {
    id: 2,
    target: 0.52,
    polygon: [
      { x: 89, y: 263 }, { x: 296, y: 238 }, { x: 314, y: 331 }, { x: 284, y: 596 },
      { x: 237, y: 622 }, { x: 102, y: 598 }, { x: 78, y: 497 }, { x: 92, y: 343 },
    ],
    blades: [
      { x: 158, y: 401, variant: "four", radius: 11, speed: 1.95, velocity: { x: 1.49, y: 1.26 } },
      { x: 244, y: 520, variant: "four", radius: 11, speed: 1.95, velocity: { x: -1.44, y: 1.32 } },
    ],
  },
  {
    id: 3,
    target: 0.48,
    polygon: [
      { x: 114, y: 246 }, { x: 270, y: 255 }, { x: 311, y: 328 }, { x: 282, y: 395 },
      { x: 305, y: 512 }, { x: 258, y: 617 }, { x: 169, y: 593 }, { x: 94, y: 622 },
      { x: 76, y: 512 }, { x: 112, y: 443 }, { x: 81, y: 343 },
    ],
    blades: [
      { x: 162, y: 405, variant: "four", radius: 11, speed: 2.2, velocity: { x: 1.64, y: 1.46 } },
      { x: 249, y: 522, variant: "four", radius: 11, speed: 2.38, velocity: { x: -1.76, y: 1.6 } },
    ],
  },
  {
    id: 4,
    target: 0.46,
    polygon: [
      { x: 93, y: 259 }, { x: 286, y: 245 }, { x: 315, y: 319 }, { x: 291, y: 568 },
      { x: 235, y: 621 }, { x: 107, y: 586 }, { x: 79, y: 487 }, { x: 97, y: 365 },
    ],
    blades: [
      { x: 163, y: 412, variant: "four", radius: 11, speed: 2.25, velocity: { x: 1.63, y: 1.55 } },
      { x: 248, y: 521, variant: "four", radius: 11, speed: 2.45, velocity: { x: -1.81, y: 1.65 } },
    ],
    metalEdges: [
      { start: { x: 315, y: 319 }, end: { x: 291, y: 568 } },
    ],
  },
  {
    id: 5,
    target: 0.44,
    polygon: [
      { x: 103, y: 250 }, { x: 276, y: 239 }, { x: 314, y: 319 }, { x: 289, y: 410 },
      { x: 309, y: 531 }, { x: 260, y: 622 }, { x: 151, y: 604 }, { x: 84, y: 559 },
      { x: 94, y: 467 }, { x: 72, y: 350 },
    ],
    blades: [
      { x: 168, y: 411, variant: "five", radius: 16, speed: 2.45, velocity: { x: 1.98, y: 1.42 } },
      { x: 249, y: 512, variant: "four", radius: 11, speed: 2.55, velocity: { x: -1.86, y: 1.74 } },
      { x: 218, y: 340, variant: "four", radius: 10, speed: 2.72, velocity: { x: 2.05, y: 1.79 } },
    ],
    metalEdges: [
      { start: { x: 84, y: 559 }, end: { x: 94, y: 467 } },
      { start: { x: 314, y: 319 }, end: { x: 289, y: 410 } },
    ],
  },
];

export const GOLDEN_LEVEL = LEVELS[0];
export const GOLDEN_POLYGON = LEVELS[0].polygon;
