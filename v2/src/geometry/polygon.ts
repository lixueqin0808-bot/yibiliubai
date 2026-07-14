import type { Point, Polygon } from "../core/types";

const EPSILON = 1e-7;

export function polygonArea(polygon: Polygon): number {
  let sum = 0;
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    sum += current.x * next.y - next.x * current.y;
  }
  return Math.abs(sum) / 2;
}

export function lineSide(start: Point, end: Point, point: Point): number {
  return (end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x);
}

export function pointInPolygon(point: Point, polygon: Polygon): boolean {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current];
    const b = polygon[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

export function segmentIntersection(a: Point, b: Point, c: Point, d: Point): Point | null {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const denominator = r.x * s.y - r.y * s.x;
  if (Math.abs(denominator) < EPSILON) return null;

  const offset = { x: c.x - a.x, y: c.y - a.y };
  const t = (offset.x * s.y - offset.y * s.x) / denominator;
  const u = (offset.x * r.y - offset.y * r.x) / denominator;
  if (t < -EPSILON || t > 1 + EPSILON || u < -EPSILON || u > 1 + EPSILON) return null;
  return { x: a.x + t * r.x, y: a.y + t * r.y };
}

export function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const projection = Math.max(0, Math.min(1,
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy),
  ));
  return Math.hypot(point.x - (start.x + projection * dx), point.y - (start.y + projection * dy));
}

export function distanceToPolygonEdge(point: Point, polygon: Polygon): number {
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 0; index < polygon.length; index += 1) {
    minimum = Math.min(minimum, distanceToSegment(point, polygon[index], polygon[(index + 1) % polygon.length]));
  }
  return minimum;
}

export interface BoundarySegment {
  start: Point;
  end: Point;
}

/** Returns the currently retained portions of the original locked map edges. */
export function visibleBoundarySegments(polygon: Polygon, lockedEdges: BoundarySegment[]): BoundarySegment[] {
  const visible: BoundarySegment[] = [];
  polygon.forEach((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    const isLocked = lockedEdges.some((locked) => (
      distanceToSegment(start, locked.start, locked.end) <= 0.75
      && distanceToSegment(end, locked.start, locked.end) <= 0.75
    ));
    if (isLocked) visible.push({ start, end });
  });
  return visible;
}

export function dedupePolygon(polygon: Polygon): Polygon {
  const result: Polygon = [];
  for (const point of polygon) {
    const previous = result[result.length - 1];
    if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 0.01) result.push(point);
  }
  if (result.length > 2) {
    const first = result[0];
    const last = result[result.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) <= 0.01) result.pop();
  }
  return result;
}
