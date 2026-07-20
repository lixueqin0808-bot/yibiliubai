import type { Point, Polygon } from "../core/types";
import { dedupePolygon, isSimplePolygon, signedPolygonArea } from "../geometry/polygon";

export const MAP_SHAPE_IDS = [
  "rounded-slab", "tapered-tablet", "triangle", "shield", "hex-jade",
  "kite", "star-disc", "teardrop", "leaf", "mountain", "wide-h",
  "heart", "vertical-slip", "lantern", "bagua",
] as const;

export type MapShapeId = typeof MAP_SHAPE_IDS[number];

const CENTER = { x: 195, y: 434 };
const BOUNDS = { left: 60, right: 330, top: 225, bottom: 640 };

function point(angle: number, radiusX: number, radiusY: number, center = CENTER): Point {
  return { x: center.x + Math.cos(angle) * radiusX, y: center.y + Math.sin(angle) * radiusY };
}

function sampleArc(start: number, end: number, steps: number, radiusX: number, radiusY: number, center = CENTER): Point[] {
  return Array.from({ length: steps + 1 }, (_, index) => point(start + (end - start) * index / steps, radiusX, radiusY, center));
}

function sampleQuadratic(start: Point, control: Point, end: Point, steps: number): Point[] {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const inverse = 1 - t;
    return {
      x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
      y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
    };
  });
}

function clockwise(points: Polygon): Polygon {
  const cleaned = dedupePolygon(points);
  return signedPolygonArea(cleaned) > 0 ? [...cleaned].reverse() : cleaned;
}

function assertShape(id: MapShapeId, polygon: Polygon): Polygon {
  const result = clockwise(polygon);
  if (result.length < 3 || result.length > 24) throw new Error(`${id} has an invalid vertex count`);
  if (!isSimplePolygon(result)) throw new Error(`${id} self-intersects`);
  result.forEach((current, index) => {
    const next = result[(index + 1) % result.length];
    if (Math.hypot(next.x - current.x, next.y - current.y) < 10) throw new Error(`${id} has a short edge`);
    if (current.x < BOUNDS.left || current.x > BOUNDS.right || current.y < BOUNDS.top || current.y > BOUNDS.bottom) {
      throw new Error(`${id} exceeds the map safety bounds`);
    }
  });
  return result;
}

function shapePoints(id: MapShapeId): Polygon {
  switch (id) {
    case "rounded-slab": return [
      { x: 95, y: 270 }, { x: 282, y: 250 }, { x: 312, y: 320 }, { x: 294, y: 568 },
      { x: 250, y: 620 }, { x: 113, y: 595 }, { x: 78, y: 505 }, { x: 92, y: 350 },
    ];
    case "tapered-tablet": return [
      { x: 82, y: 265 }, { x: 308, y: 265 }, { x: 279, y: 616 }, { x: 111, y: 616 },
    ];
    case "triangle": return [
      { x: 195, y: 230 }, { x: 325, y: 620 }, { x: 65, y: 620 },
    ];
    case "hex-jade": return [
      { x: 125, y: 246 }, { x: 268, y: 246 }, { x: 322, y: 380 },
      { x: 273, y: 614 }, { x: 117, y: 614 }, { x: 68, y: 380 },
    ];
    case "shield": return [
      { x: 112, y: 248 }, { x: 278, y: 248 }, { x: 310, y: 340 },
      { x: 276, y: 540 }, { x: 195, y: 620 }, { x: 114, y: 540 }, { x: 80, y: 340 },
    ];
    case "kite": return [
      { x: 195, y: 230 }, { x: 320, y: 430 }, { x: 195, y: 632 }, { x: 70, y: 430 },
    ];
    case "star-disc": return sampleArc(0, Math.PI * 2, 16, 125, 184);
    case "leaf": return [
      { x: 195, y: 238 },
      ...sampleQuadratic({ x: 195, y: 238 }, { x: -45, y: 410 }, { x: 195, y: 630 }, 8).slice(1),
      ...sampleQuadratic({ x: 195, y: 630 }, { x: 435, y: 410 }, { x: 195, y: 238 }, 8).slice(1),
    ];
    case "teardrop": return [
      { x: 195, y: 226 }, ...sampleArc(-Math.PI * 0.36, Math.PI * 1.36, 14, 125, 182, { x: 195, y: 443 }),
    ];
    case "mountain": return [
      { x: 68, y: 610 }, { x: 68, y: 438 }, { x: 132, y: 330 }, { x: 195, y: 228 },
      { x: 250, y: 346 }, { x: 320, y: 426 }, { x: 320, y: 610 },
    ];
    case "wide-h": return [
      { x: 70, y: 240 }, { x: 150, y: 240 }, { x: 150, y: 380 },
      { x: 240, y: 380 }, { x: 240, y: 240 }, { x: 320, y: 240 },
      { x: 320, y: 630 }, { x: 240, y: 630 }, { x: 240, y: 490 },
      { x: 150, y: 490 }, { x: 150, y: 630 }, { x: 70, y: 630 },
    ];
    case "heart": return [
      { x: 195, y: 630 }, { x: 105, y: 545 }, { x: 68, y: 430 },
      { x: 76, y: 330 }, { x: 126, y: 260 }, { x: 178, y: 278 },
      { x: 195, y: 315 }, { x: 212, y: 278 }, { x: 264, y: 260 },
      { x: 314, y: 330 }, { x: 322, y: 430 }, { x: 285, y: 545 },
    ];
    case "vertical-slip": return [
      { x: 125, y: 230 }, { x: 266, y: 230 }, { x: 290, y: 275 }, { x: 277, y: 600 },
      { x: 245, y: 630 }, { x: 116, y: 610 }, { x: 100, y: 270 },
    ];
    case "lantern": return [
      { x: 150, y: 238 }, { x: 240, y: 238 }, { x: 252, y: 270 },
      { x: 300, y: 320 }, { x: 320, y: 430 }, { x: 300, y: 540 },
      { x: 252, y: 590 }, { x: 240, y: 622 }, { x: 150, y: 622 },
      { x: 138, y: 590 }, { x: 90, y: 540 }, { x: 70, y: 430 },
      { x: 90, y: 320 }, { x: 138, y: 270 },
    ];
    case "bagua": return [
      { x: 132, y: 232 }, { x: 258, y: 232 }, { x: 322, y: 318 }, { x: 322, y: 548 },
      { x: 258, y: 630 }, { x: 132, y: 630 }, { x: 68, y: 548 }, { x: 68, y: 318 },
    ];
  }
}

export function createMapShape(id: MapShapeId): Polygon {
  return assertShape(id, shapePoints(id));
}
