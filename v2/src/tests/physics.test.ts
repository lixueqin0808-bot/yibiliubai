import { describe, expect, it } from "vitest";
import { PhysicsWorld } from "../physics/PhysicsWorld";

const box = [
  { x: 0, y: 0 },
  { x: 200, y: 0 },
  { x: 200, y: 200 },
  { x: 0, y: 200 },
];

describe("PhysicsWorld", () => {
  it("reflects away from a wall instead of following it", () => {
    const world = new PhysicsWorld(box, { x: 180, y: 100 }, 10, { x: 2, y: 0.1 }, 2);
    for (let index = 0; index < 20; index += 1) world.update(16.7);
    expect(world.velocity.x).toBeLessThan(0);
    expect(world.position.x).toBeLessThan(190);
  });

  it("moves a blade away from a freshly cut boundary before the next frame", () => {
    const world = new PhysicsWorld(box, { x: 100, y: 20 }, 10, { x: 1, y: 1 }, 2);
    const retainedAfterCut = [
      { x: 0, y: 25 },
      { x: 200, y: 25 },
      { x: 200, y: 200 },
      { x: 0, y: 200 },
    ];

    world.setBoundary(retainedAfterCut);

    expect(world.position.y).toBeGreaterThanOrEqual(35);
    world.update(16.7);
    expect(world.position.y).toBeGreaterThanOrEqual(35);
  });
});
