import type { Point, Polygon } from "../core/types";
import { pointInPolygon } from "./polygon";

export interface SidewallFace {
  innerStart: Point;
  innerEnd: Point;
  outerStart: Point;
  outerEnd: Point;
  outwardNormal: Point;
}

export interface MapSidewall {
  outerPolygon: Polygon;
  faces: SidewallFace[];
}

function normalize(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function outwardNormal(start: Point, end: Point, polygon: Polygon): Point {
  const direction = normalize({ x: end.x - start.x, y: end.y - start.y });
  const left = { x: -direction.y, y: direction.x };
  const midpoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  return pointInPolygon({ x: midpoint.x + left.x * 2, y: midpoint.y + left.y * 2 }, polygon)
    ? { x: -left.x, y: -left.y }
    : left;
}

function lineIntersection(point: Point, direction: Point, otherPoint: Point, otherDirection: Point): Point | null {
  const denominator = direction.x * otherDirection.y - direction.y * otherDirection.x;
  if (Math.abs(denominator) < 0.00001) return null;
  const offset = { x: otherPoint.x - point.x, y: otherPoint.y - point.y };
  const distance = (offset.x * otherDirection.y - offset.y * otherDirection.x) / denominator;
  return { x: point.x + direction.x * distance, y: point.y + direction.y * distance };
}

function outerVertex(polygon: Polygon, index: number, depth: number): Point {
  const previousIndex = (index + polygon.length - 1) % polygon.length;
  const nextIndex = (index + 1) % polygon.length;
  const previous = polygon[previousIndex];
  const current = polygon[index];
  const next = polygon[nextIndex];
  const previousDirection = normalize({ x: current.x - previous.x, y: current.y - previous.y });
  const nextDirection = normalize({ x: next.x - current.x, y: next.y - current.y });
  const previousNormal = outwardNormal(previous, current, polygon);
  const nextNormal = outwardNormal(current, next, polygon);
  const intersection = lineIntersection(
    { x: current.x + previousNormal.x * depth, y: current.y + previousNormal.y * depth },
    previousDirection,
    { x: current.x + nextNormal.x * depth, y: current.y + nextNormal.y * depth },
    nextDirection,
  );

  const miterLimit = depth * 2.25;
  if (intersection) {
    const displacement = { x: intersection.x - current.x, y: intersection.y - current.y };
    const distance = Math.hypot(displacement.x, displacement.y);
    const facesBothSides = displacement.x * previousNormal.x + displacement.y * previousNormal.y > 0
      && displacement.x * nextNormal.x + displacement.y * nextNormal.y > 0;
    if (facesBothSides && distance <= miterLimit) return intersection;
  }

  const blended = normalize({ x: previousNormal.x + nextNormal.x, y: previousNormal.y + nextNormal.y });
  return { x: current.x + blended.x * depth, y: current.y + blended.y * depth };
}

/**
 * Builds the visible lower sidewall outside a map top face. The original polygon
 * stays untouched: it remains the short inner edge and the gameplay boundary.
 */
export function buildMapSidewall(polygon: Polygon, depth: number): MapSidewall {
  const outerPolygon = polygon.map((_, index) => outerVertex(polygon, index, depth));
  const faces = polygon.map((innerStart, index) => {
    const nextIndex = (index + 1) % polygon.length;
    const innerEnd = polygon[nextIndex];
    return {
      innerStart,
      innerEnd,
      outerStart: outerPolygon[index],
      outerEnd: outerPolygon[nextIndex],
      outwardNormal: outwardNormal(innerStart, innerEnd, polygon),
    };
  });
  return { outerPolygon, faces };
}
