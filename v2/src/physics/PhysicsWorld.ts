import Matter from "matter-js";
import type { Point, Polygon } from "../core/types";

const { Bodies, Body, Composite, Engine } = Matter;

export class PhysicsWorld {
  private readonly engine = Engine.create({ gravity: { x: 0, y: 0 } });
  private readonly blade: Matter.Body;
  private boundaries: Matter.Body[] = [];
  private readonly targetSpeed: number;

  constructor(polygon: Polygon, position: Point, radius: number, velocity: Point, targetSpeed: number) {
    this.targetSpeed = targetSpeed;
    this.blade = Bodies.circle(position.x, position.y, radius, {
      restitution: 1,
      friction: 0,
      frictionAir: 0,
      inertia: Number.POSITIVE_INFINITY,
      label: "ink-blade",
    });
    Body.setVelocity(this.blade, velocity);
    Composite.add(this.engine.world, this.blade);
    this.setBoundary(polygon);
  }

  get position(): Point {
    return { x: this.blade.position.x, y: this.blade.position.y };
  }

  get velocity(): Point {
    return { x: this.blade.velocity.x, y: this.blade.velocity.y };
  }

  reset(position: Point, velocity: Point, polygon: Polygon): void {
    Body.setPosition(this.blade, position);
    Body.setVelocity(this.blade, velocity);
    this.setBoundary(polygon);
  }

  setBoundary(polygon: Polygon): void {
    Composite.remove(this.engine.world, this.boundaries);
    this.boundaries = polygon.map((start, index) => {
      const end = polygon[(index + 1) % polygon.length];
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      return Bodies.rectangle((start.x + end.x) / 2, (start.y + end.y) / 2, length + 10, 10, {
        isStatic: true,
        angle: Math.atan2(end.y - start.y, end.x - start.x),
        restitution: 1,
        friction: 0,
        label: "ink-boundary",
      });
    });
    Composite.add(this.engine.world, this.boundaries);
  }

  update(milliseconds: number): void {
    Engine.update(this.engine, Math.min(milliseconds, 25));
    const speed = Math.hypot(this.blade.velocity.x, this.blade.velocity.y);
    if (speed > 0.01 && Math.abs(speed - this.targetSpeed) > 0.05) {
      Body.setVelocity(this.blade, {
        x: (this.blade.velocity.x / speed) * this.targetSpeed,
        y: (this.blade.velocity.y / speed) * this.targetSpeed,
      });
    }
  }
}
