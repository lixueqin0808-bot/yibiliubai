import type { Point } from "../core/types";
import { distanceToSegment, segmentIntersection } from "./polygon";

export function segmentHitsCircle(start: Point, end: Point, center: Point, radius: number): boolean {
  return distanceToSegment(center, start, end) <= radius;
}

export function sweptCircleHitsSegment(
  circleStart: Point,
  circleEnd: Point,
  radius: number,
  segmentStart: Point,
  segmentEnd: Point,
): boolean {
  if (segmentHitsCircle(segmentStart, segmentEnd, circleStart, radius)) return true;
  if (segmentHitsCircle(segmentStart, segmentEnd, circleEnd, radius)) return true;
  if (segmentIntersection(circleStart, circleEnd, segmentStart, segmentEnd)) return true;
  return distanceToSegment(segmentStart, circleStart, circleEnd) <= radius
    || distanceToSegment(segmentEnd, circleStart, circleEnd) <= radius
    || distanceToSegment(circleStart, segmentStart, segmentEnd) <= radius
    || distanceToSegment(circleEnd, segmentStart, segmentEnd) <= radius;
}
