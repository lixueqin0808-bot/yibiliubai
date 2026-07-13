import type { Point, Polygon } from "../core/types";
import { dedupePolygon, lineSide, polygonArea, segmentIntersection } from "./polygon";

export interface SplitResult {
  positive: Polygon;
  negative: Polygon;
  intersections: Point[];
}

function clipHalfPlane(polygon: Polygon, start: Point, end: Point, keepPositive: boolean): Polygon {
  const output: Polygon = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const currentSide = lineSide(start, end, current);
    const nextSide = lineSide(start, end, next);
    const currentInside = keepPositive ? currentSide >= -1e-7 : currentSide <= 1e-7;
    const nextInside = keepPositive ? nextSide >= -1e-7 : nextSide <= 1e-7;

    if (currentInside) output.push(current);
    if (currentInside !== nextInside) {
      const direction = { x: end.x - start.x, y: end.y - start.y };
      const farStart = { x: start.x - direction.x * 1000, y: start.y - direction.y * 1000 };
      const farEnd = { x: end.x + direction.x * 1000, y: end.y + direction.y * 1000 };
      const intersection = segmentIntersection(current, next, farStart, farEnd);
      if (intersection) output.push(intersection);
    }
  }
  return dedupePolygon(output);
}

function uniqueIntersections(polygon: Polygon, start: Point, end: Point): Point[] {
  const result: Point[] = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const intersection = segmentIntersection(start, end, polygon[index], polygon[(index + 1) % polygon.length]);
    if (intersection && !result.some((item) => Math.hypot(item.x - intersection.x, item.y - intersection.y) < 0.1)) {
      result.push(intersection);
    }
  }
  return result;
}

export function splitPolygon(polygon: Polygon, start: Point, end: Point): SplitResult | null {
  if (Math.hypot(end.x - start.x, end.y - start.y) < 8) return null;
  const intersections = uniqueIntersections(polygon, start, end);
  if (intersections.length !== 2) return null;

  const positive = clipHalfPlane(polygon, start, end, true);
  const negative = clipHalfPlane(polygon, start, end, false);
  if (positive.length < 3 || negative.length < 3) return null;
  if (polygonArea(positive) < 20 || polygonArea(negative) < 20) return null;
  return { positive, negative, intersections };
}
