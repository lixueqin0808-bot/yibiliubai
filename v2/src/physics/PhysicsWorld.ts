import type { Point, Polygon } from "../core/types";
import { distanceToSegment, pointInPolygon } from "../geometry/polygon";

const FRAME_MS = 1000 / 60;

function normalize(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function closestEdge(point: Point, polygon: Polygon): { start: Point; end: Point } {
  let closest = { start: polygon[0], end: polygon[1] };
  let distance = Number.POSITIVE_INFINITY;
  polygon.forEach((start, index) => {
    const end = polygon[(index + 1) % polygon.length];
    const nextDistance = distanceToSegment(point, start, end);
    if (nextDistance < distance) {
      distance = nextDistance;
      closest = { start, end };
    }
  });
  return closest;
}

function polygonCentroid(polygon: Polygon): Point {
  const sum = polygon.reduce((total, point) => ({
    x: total.x + point.x,
    y: total.y + point.y,
  }), { x: 0, y: 0 });
  return { x: sum.x / polygon.length, y: sum.y / polygon.length };
}

/**
 * Deterministic arcade motion: blades reflect from the map boundary instead of
 * inheriting rigid-body friction that makes them appear to roll along an edge.
 */
export class PhysicsWorld {
  private positionValue: Point;
  private velocityValue: Point;
  private polygon: Polygon;
  private bounceCount = 0;

  constructor(
    polygon: Polygon,
    position: Point,
    private readonly radius: number,
    velocity: Point,
    private readonly targetSpeed: number,
  ) {
    this.polygon = polygon;
    this.positionValue = { ...position };
    this.velocityValue = this.withTargetSpeed(velocity);
  }

  get position(): Point {
    return { ...this.positionValue };
  }

  get velocity(): Point {
    return { ...this.velocityValue };
  }

  reset(position: Point, velocity: Point, polygon: Polygon): void {
    this.positionValue = { ...position };
    this.velocityValue = this.withTargetSpeed(velocity);
    this.polygon = polygon;
    this.bounceCount = 0;
  }

  setBoundary(polygon: Polygon): void {
    this.polygon = polygon;
    this.reconcileBoundary();
  }

  update(milliseconds: number): void {
    let remaining = Math.min(milliseconds, 25) / FRAME_MS;
    let attempts = 0;
    while (remaining > 0.001 && attempts < 3) {
      attempts += 1;
      const candidate = {
        x: this.positionValue.x + this.velocityValue.x * remaining,
        y: this.positionValue.y + this.velocityValue.y * remaining,
      };
      if (this.isInside(candidate)) {
        this.positionValue = candidate;
        return;
      }

      let low = 0;
      let high = remaining;
      for (let index = 0; index < 9; index += 1) {
        const mid = (low + high) / 2;
        const probe = {
          x: this.positionValue.x + this.velocityValue.x * mid,
          y: this.positionValue.y + this.velocityValue.y * mid,
        };
        if (this.isInside(probe)) low = mid;
        else high = mid;
      }
      this.positionValue = {
        x: this.positionValue.x + this.velocityValue.x * Math.max(0, low - 0.01),
        y: this.positionValue.y + this.velocityValue.y * Math.max(0, low - 0.01),
      };
      this.reflectFromClosestEdge();
      remaining -= low;
    }
  }

  private isInside(point: Point): boolean {
    if (!pointInPolygon(point, this.polygon)) return false;
    return this.polygon.every((start, index) => {
      const end = this.polygon[(index + 1) % this.polygon.length];
      return distanceToSegment(point, start, end) >= this.radius;
    });
  }

  private reflectFromClosestEdge(): void {
    const { start, end } = closestEdge(this.positionValue, this.polygon);
    const tangent = normalize({ x: end.x - start.x, y: end.y - start.y });
    const normal = { x: -tangent.y, y: tangent.x };
    const dot = this.velocityValue.x * normal.x + this.velocityValue.y * normal.y;
    let reflected = {
      x: this.velocityValue.x - 2 * dot * normal.x,
      y: this.velocityValue.y - 2 * dot * normal.y,
    };
    // A tiny deterministic nudge prevents a blade from repeating the same corner trap.
    this.bounceCount += 1;
    const nudge = Math.sin(this.bounceCount * 12.9898) * 0.035;
    const cos = Math.cos(nudge);
    const sin = Math.sin(nudge);
    reflected = {
      x: reflected.x * cos - reflected.y * sin,
      y: reflected.x * sin + reflected.y * cos,
    };
    this.velocityValue = this.withTargetSpeed(reflected);
  }

  /**
   * A cut keeps the blade center on the retained side, but its radius can still
   * overlap the freshly created edge. Reposition it before the next frame so it
   * cannot endlessly reflect in a new corner.
   */
  private reconcileBoundary(): void {
    if (this.isInside(this.positionValue)) return;

    const origin = { ...this.positionValue };
    const center = polygonCentroid(this.polygon);
    const candidates: Point[] = [center];
    const toCenter = normalize({ x: center.x - origin.x, y: center.y - origin.y });

    for (const multiplier of [1, 1.75, 2.5, 3.5, 5]) {
      candidates.push({
        x: origin.x + toCenter.x * this.radius * multiplier,
        y: origin.y + toCenter.y * this.radius * multiplier,
      });
    }

    for (const multiplier of [1.25, 2, 3, 4.5]) {
      for (let index = 0; index < 24; index += 1) {
        const angle = (Math.PI * 2 * index) / 24;
        candidates.push({
          x: origin.x + Math.cos(angle) * this.radius * multiplier,
          y: origin.y + Math.sin(angle) * this.radius * multiplier,
        });
      }
    }

    const safePosition = candidates.find((candidate) => this.isInside(candidate));
    if (safePosition) {
      this.positionValue = safePosition;
      this.velocityValue = this.withTargetSpeed({
        x: this.velocityValue.x + (safePosition.x - origin.x) * 0.12,
        y: this.velocityValue.y + (safePosition.y - origin.y) * 0.12,
      });
      return;
    }

    this.positionValue = center;
    this.velocityValue = this.withTargetSpeed({ x: -this.velocityValue.y, y: this.velocityValue.x });
  }

  private withTargetSpeed(vector: Point): Point {
    const unit = normalize(vector);
    return { x: unit.x * this.targetSpeed, y: unit.y * this.targetSpeed };
  }
}
