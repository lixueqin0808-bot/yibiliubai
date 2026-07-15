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
    target: 0.48,
    polygon: levelOne,
    blades: [{ x: 198, y: 454, variant: "four", radius: 12, speed: 2.42, velocity: { x: 1.82, y: 1.64 } }],
    guide: { start: { x: 93, y: 328 }, end: { x: 303, y: 328 } },
  },
  {
    id: 2,
    target: 0.45,
    polygon: [
      { x: 89, y: 263 }, { x: 296, y: 238 }, { x: 314, y: 331 }, { x: 284, y: 596 },
      { x: 237, y: 622 }, { x: 102, y: 598 }, { x: 78, y: 497 }, { x: 92, y: 343 },
    ],
    blades: [
      { x: 158, y: 401, variant: "four", radius: 11, speed: 2.3, velocity: { x: 1.7, y: 1.48 } },
      { x: 244, y: 520, variant: "four", radius: 11, speed: 2.36, velocity: { x: -1.68, y: 1.52 } },
      { x: 222, y: 337, variant: "four", radius: 10, speed: 2.46, velocity: { x: 1.9, y: 1.58 } },
    ],
  },
  {
    id: 3,
    target: 0.42,
    polygon: [
      { x: 114, y: 246 }, { x: 270, y: 255 }, { x: 311, y: 328 }, { x: 282, y: 395 },
      { x: 305, y: 512 }, { x: 258, y: 617 }, { x: 169, y: 593 }, { x: 94, y: 622 },
      { x: 76, y: 512 }, { x: 112, y: 443 }, { x: 81, y: 343 },
    ],
    blades: [
      { x: 162, y: 405, variant: "four", radius: 11, speed: 2.2, velocity: { x: 1.64, y: 1.46 } },
      { x: 249, y: 522, variant: "four", radius: 11, speed: 2.38, velocity: { x: -1.76, y: 1.6 } },
      { x: 222, y: 347, variant: "four", radius: 10, speed: 2.52, velocity: { x: 1.94, y: 1.68 } },
    ],
  },
  {
    id: 4,
    target: 0.39,
    polygon: [
      { x: 93, y: 259 }, { x: 286, y: 245 }, { x: 315, y: 319 }, { x: 291, y: 568 },
      { x: 235, y: 621 }, { x: 107, y: 586 }, { x: 79, y: 487 }, { x: 97, y: 365 },
    ],
    blades: [
      { x: 163, y: 412, variant: "four", radius: 11, speed: 2.25, velocity: { x: 1.63, y: 1.55 } },
      { x: 248, y: 521, variant: "four", radius: 11, speed: 2.45, velocity: { x: -1.81, y: 1.65 } },
      { x: 219, y: 342, variant: "five", radius: 15, speed: 2.34, velocity: { x: 1.72, y: 1.4 } },
    ],
    metalEdges: [
      { start: { x: 315, y: 319 }, end: { x: 291, y: 568 } },
    ],
  },
  {
    id: 5,
    target: 0.36,
    polygon: [
      { x: 103, y: 250 }, { x: 276, y: 239 }, { x: 314, y: 319 }, { x: 289, y: 410 },
      { x: 309, y: 531 }, { x: 260, y: 622 }, { x: 151, y: 604 }, { x: 84, y: 559 },
      { x: 94, y: 467 }, { x: 72, y: 350 },
    ],
    blades: [
      { x: 168, y: 411, variant: "five", radius: 16, speed: 2.45, velocity: { x: 1.98, y: 1.42 } },
      { x: 249, y: 512, variant: "four", radius: 11, speed: 2.55, velocity: { x: -1.86, y: 1.74 } },
      { x: 218, y: 340, variant: "four", radius: 10, speed: 2.72, velocity: { x: 2.05, y: 1.79 } },
      { x: 142, y: 511, variant: "four", radius: 10, speed: 2.78, velocity: { x: 2.14, y: -1.76 } },
    ],
    metalEdges: [
      { start: { x: 84, y: 559 }, end: { x: 94, y: 467 } },
      { start: { x: 314, y: 319 }, end: { x: 289, y: 410 } },
    ],
  },
  {
    id: 6,
    target: 0.34,
    polygon: [
      { x: 96, y: 258 }, { x: 283, y: 246 }, { x: 313, y: 326 }, { x: 294, y: 559 },
      { x: 246, y: 620 }, { x: 112, y: 593 }, { x: 78, y: 505 }, { x: 92, y: 350 },
    ],
    blades: [
      { x: 152, y: 388, variant: "four", radius: 11, speed: 2.28, velocity: { x: 1.66, y: 1.5 } },
      { x: 246, y: 526, variant: "five", radius: 16, speed: 2.18, velocity: { x: -1.62, y: 1.34 } },
      { x: 222, y: 348, variant: "four", radius: 10, speed: 2.46, velocity: { x: 1.88, y: 1.55 } },
      { x: 145, y: 500, variant: "four", radius: 10, speed: 2.56, velocity: { x: 2.02, y: -1.7 } },
    ],
    metalEdges: [
      { start: { x: 313, y: 326 }, end: { x: 294, y: 559 } },
      { start: { x: 112, y: 593 }, end: { x: 78, y: 505 } },
    ],
  },
  {
    id: 7,
    target: 0.32,
    polygon: [
      { x: 89, y: 268 }, { x: 295, y: 244 }, { x: 316, y: 345 }, { x: 282, y: 598 },
      { x: 218, y: 622 }, { x: 98, y: 589 }, { x: 73, y: 493 }, { x: 92, y: 352 },
    ],
    blades: [
      { x: 142, y: 390, variant: "four", radius: 11, speed: 2.2, velocity: { x: 1.72, y: 1.42 } },
      { x: 252, y: 412, variant: "four", radius: 11, speed: 2.4, velocity: { x: -1.83, y: 1.58 } },
      { x: 211, y: 537, variant: "four", radius: 10, speed: 2.52, velocity: { x: 1.94, y: -1.68 } },
      { x: 162, y: 511, variant: "four", radius: 10, speed: 2.64, velocity: { x: 2.08, y: -1.78 } },
    ],
    metalEdges: [
      { start: { x: 89, y: 268 }, end: { x: 295, y: 244 } },
      { start: { x: 316, y: 345 }, end: { x: 282, y: 598 } },
    ],
  },
  {
    id: 8,
    target: 0.30,
    polygon: [
      { x: 111, y: 246 }, { x: 273, y: 253 }, { x: 312, y: 333 }, { x: 286, y: 416 },
      { x: 306, y: 516 }, { x: 257, y: 620 }, { x: 163, y: 595 }, { x: 89, y: 620 },
      { x: 72, y: 512 }, { x: 106, y: 438 }, { x: 78, y: 342 },
    ],
    blades: [
      { x: 155, y: 415, variant: "four", radius: 11, speed: 2.32, velocity: { x: 1.72, y: 1.5 } },
      { x: 248, y: 505, variant: "four", radius: 11, speed: 2.5, velocity: { x: -1.86, y: 1.69 } },
      { x: 227, y: 350, variant: "five", radius: 16, speed: 2.24, velocity: { x: 1.58, y: 1.31 } },
      { x: 158, y: 535, variant: "four", radius: 10, speed: 2.66, velocity: { x: 2.1, y: -1.8 } },
    ],
    metalEdges: [
      { start: { x: 312, y: 333 }, end: { x: 286, y: 416 } },
      { start: { x: 89, y: 620 }, end: { x: 72, y: 512 } },
    ],
  },
  {
    id: 9,
    target: 0.29,
    polygon: [
      { x: 100, y: 250 }, { x: 287, y: 245 }, { x: 318, y: 328 }, { x: 292, y: 593 },
      { x: 241, y: 621 }, { x: 104, y: 595 }, { x: 75, y: 509 }, { x: 88, y: 345 },
    ],
    blades: [
      { x: 145, y: 376, variant: "four", radius: 10, speed: 2.58, velocity: { x: 1.98, y: 1.62 } },
      { x: 254, y: 425, variant: "four", radius: 11, speed: 2.65, velocity: { x: -2.02, y: 1.74 } },
      { x: 198, y: 543, variant: "four", radius: 10, speed: 2.75, velocity: { x: 2.14, y: -1.71 } },
      { x: 147, y: 515, variant: "four", radius: 10, speed: 2.82, velocity: { x: 2.2, y: -1.86 } },
    ],
    metalEdges: [
      { start: { x: 318, y: 328 }, end: { x: 292, y: 593 } },
      { start: { x: 104, y: 595 }, end: { x: 75, y: 509 } },
    ],
  },
  {
    id: 10,
    target: 0.28,
    polygon: [
      { x: 94, y: 257 }, { x: 285, y: 244 }, { x: 314, y: 317 }, { x: 295, y: 561 },
      { x: 252, y: 619 }, { x: 113, y: 596 }, { x: 79, y: 497 }, { x: 96, y: 362 },
    ],
    blades: [
      { x: 151, y: 395, variant: "four", radius: 11, speed: 2.44, velocity: { x: 1.84, y: 1.55 } },
      { x: 246, y: 500, variant: "four", radius: 11, speed: 2.55, velocity: { x: -1.9, y: 1.67 } },
      { x: 221, y: 342, variant: "five", radius: 16, speed: 2.36, velocity: { x: 1.73, y: 1.39 } },
      { x: 151, y: 526, variant: "four", radius: 10, speed: 2.72, velocity: { x: 2.12, y: -1.82 } },
    ],
    metalEdges: [
      { start: { x: 314, y: 317 }, end: { x: 295, y: 561 } },
      { start: { x: 113, y: 596 }, end: { x: 79, y: 497 } },
    ],
  },
  {
    id: 11,
    target: 0.27,
    polygon: [
      { x: 108, y: 246 }, { x: 274, y: 255 }, { x: 313, y: 330 }, { x: 290, y: 406 },
      { x: 309, y: 520 }, { x: 258, y: 620 }, { x: 161, y: 597 }, { x: 89, y: 621 },
      { x: 73, y: 510 }, { x: 108, y: 440 }, { x: 80, y: 340 },
    ],
    blades: [
      { x: 143, y: 394, variant: "four", radius: 10, speed: 2.65, velocity: { x: 2.05, y: 1.68 } },
      { x: 244, y: 455, variant: "four", radius: 11, speed: 2.72, velocity: { x: -2.08, y: 1.76 } },
      { x: 205, y: 544, variant: "four", radius: 10, speed: 2.78, velocity: { x: 2.16, y: -1.83 } },
      { x: 164, y: 516, variant: "five", radius: 16, speed: 2.58, velocity: { x: 1.96, y: -1.58 } },
    ],
    metalEdges: [
      { start: { x: 108, y: 246 }, end: { x: 274, y: 255 } },
      { start: { x: 309, y: 520 }, end: { x: 258, y: 620 } },
    ],
  },
  {
    id: 12,
    target: 0.26,
    polygon: [
      { x: 94, y: 260 }, { x: 290, y: 246 }, { x: 318, y: 324 }, { x: 290, y: 580 },
      { x: 242, y: 622 }, { x: 102, y: 593 }, { x: 78, y: 488 }, { x: 98, y: 362 },
    ],
    blades: [
      { x: 149, y: 402, variant: "four", radius: 11, speed: 2.55, velocity: { x: 1.92, y: 1.62 } },
      { x: 249, y: 515, variant: "five", radius: 16, speed: 2.48, velocity: { x: -1.84, y: 1.48 } },
      { x: 225, y: 344, variant: "four", radius: 10, speed: 2.74, velocity: { x: 2.12, y: 1.71 } },
      { x: 155, y: 515, variant: "four", radius: 10, speed: 2.84, velocity: { x: 2.2, y: -1.85 } },
    ],
    metalEdges: [
      { start: { x: 94, y: 260 }, end: { x: 290, y: 246 } },
      { start: { x: 290, y: 246 }, end: { x: 318, y: 324 } },
    ],
  },
  {
    id: 13,
    target: 0.25,
    polygon: [
      { x: 102, y: 249 }, { x: 278, y: 238 }, { x: 315, y: 320 }, { x: 289, y: 410 },
      { x: 310, y: 531 }, { x: 258, y: 621 }, { x: 151, y: 604 }, { x: 84, y: 558 },
      { x: 95, y: 466 }, { x: 72, y: 350 },
    ],
    blades: [
      { x: 138, y: 388, variant: "four", radius: 10, speed: 2.76, velocity: { x: 2.13, y: 1.73 } },
      { x: 250, y: 400, variant: "four", radius: 11, speed: 2.66, velocity: { x: -2.04, y: 1.66 } },
      { x: 238, y: 526, variant: "four", radius: 10, speed: 2.85, velocity: { x: -2.18, y: -1.82 } },
      { x: 156, y: 520, variant: "five", radius: 16, speed: 2.46, velocity: { x: 1.78, y: -1.46 } },
      { x: 219, y: 344, variant: "four", radius: 10, speed: 2.94, velocity: { x: 2.28, y: 1.88 } },
    ],
    metalEdges: [
      { start: { x: 84, y: 558 }, end: { x: 95, y: 466 } },
      { start: { x: 315, y: 320 }, end: { x: 289, y: 410 } },
    ],
  },
  {
    id: 14,
    target: 0.24,
    polygon: [
      { x: 91, y: 263 }, { x: 292, y: 245 }, { x: 317, y: 337 }, { x: 283, y: 596 },
      { x: 231, y: 623 }, { x: 99, y: 589 }, { x: 73, y: 496 }, { x: 91, y: 345 },
    ],
    blades: [
      { x: 143, y: 381, variant: "four", radius: 10, speed: 2.82, velocity: { x: 2.18, y: 1.78 } },
      { x: 250, y: 405, variant: "four", radius: 11, speed: 2.76, velocity: { x: -2.12, y: 1.74 } },
      { x: 202, y: 530, variant: "five", radius: 16, speed: 2.55, velocity: { x: 1.9, y: -1.52 } },
      { x: 266, y: 548, variant: "four", radius: 10, speed: 2.9, velocity: { x: -2.24, y: -1.81 } },
      { x: 215, y: 345, variant: "four", radius: 10, speed: 3.0, velocity: { x: 2.34, y: 1.94 } },
    ],
    metalEdges: [
      { start: { x: 317, y: 337 }, end: { x: 283, y: 596 } },
      { start: { x: 99, y: 589 }, end: { x: 73, y: 496 } },
    ],
  },
  {
    id: 15,
    target: 0.22,
    polygon: [
      { x: 108, y: 244 }, { x: 274, y: 253 }, { x: 313, y: 330 }, { x: 286, y: 416 },
      { x: 307, y: 518 }, { x: 257, y: 622 }, { x: 160, y: 596 }, { x: 88, y: 620 },
      { x: 71, y: 511 }, { x: 106, y: 438 }, { x: 78, y: 340 },
    ],
    blades: [
      { x: 139, y: 390, variant: "four", radius: 10, speed: 2.86, velocity: { x: 2.2, y: 1.79 } },
      { x: 248, y: 397, variant: "four", radius: 11, speed: 2.82, velocity: { x: -2.16, y: 1.76 } },
      { x: 227, y: 532, variant: "five", radius: 17, speed: 2.6, velocity: { x: -1.94, y: -1.59 } },
      { x: 154, y: 535, variant: "four", radius: 10, speed: 2.96, velocity: { x: 2.3, y: -1.88 } },
      { x: 220, y: 344, variant: "four", radius: 10, speed: 3.08, velocity: { x: 2.4, y: 1.98 } },
    ],
    metalEdges: [
      { start: { x: 108, y: 244 }, end: { x: 274, y: 253 } },
      { start: { x: 313, y: 330 }, end: { x: 286, y: 416 } },
      { start: { x: 88, y: 620 }, end: { x: 71, y: 511 } },
    ],
  },
];

export const GOLDEN_LEVEL = LEVELS[0];
export const GOLDEN_POLYGON = LEVELS[0].polygon;
