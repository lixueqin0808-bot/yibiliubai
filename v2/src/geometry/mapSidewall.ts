import type { Point, Polygon } from "../core/types";
import { pointInPolygon } from "./polygon";

export interface SidewallFace {
  innerStart: Point;
  innerEnd: Point;
  outerStart: Point;
  outerEnd: Point;
  outwardNormal: Point;
}

export interface SidewallCorner {
  inner: Point;
  outerFromPrevious: Point;
  outerToNext: Point;
  outwardNormal: Point;
}

export interface MapSidewall {
  outerPolygon: Polygon;
  faces: SidewallFace[];
  corners: SidewallCorner[];
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

function move(point: Point, direction: Point, distance: number): Point {
  return { x: point.x + direction.x * distance, y: point.y + direction.y * distance };
}

/**
 * Builds a finite trapezoid for every map edge. Its outer side is longer than
 * the top-face edge, while each vertex is closed by a short 45-degree cap.
 * This avoids unbounded miter spikes on sharp and concave map corners.
 */
export function buildMapSidewall(polygon: Polygon, depth: number): MapSidewall {
  const cornerExtension = Math.min(depth * 0.48, 6.5);
  const faces = polygon.map((innerStart, index) => {
    const innerEnd = polygon[(index + 1) % polygon.length];
    const tangent = normalize({ x: innerEnd.x - innerStart.x, y: innerEnd.y - innerStart.y });
    const normal = outwardNormal(innerStart, innerEnd, polygon);
    const outerStart = move(move(innerStart, normal, depth), tangent, -cornerExtension);
    const outerEnd = move(move(innerEnd, normal, depth), tangent, cornerExtension);
    return { innerStart, innerEnd, outerStart, outerEnd, outwardNormal: normal };
  });

  const corners = polygon.map((inner, index) => {
    const previous = faces[(index + faces.length - 1) % faces.length];
    const next = faces[index];
    return {
      inner,
      outerFromPrevious: previous.outerEnd,
      outerToNext: next.outerStart,
      outwardNormal: normalize({
        x: previous.outwardNormal.x + next.outwardNormal.x,
        y: previous.outwardNormal.y + next.outwardNormal.y,
      }),
    };
  });

  return {
    faces,
    corners,
    outerPolygon: faces.flatMap((face) => [face.outerStart, face.outerEnd]),
  };
}
