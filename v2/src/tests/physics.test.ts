import { describe, expect, it } from "vitest";
import { bladeCollisionRadius } from "../levels/goldenLevel";
import { PhysicsWorld } from "../physics/PhysicsWorld";

const box = [
  { x: 0, y: 0 },
  { x: 200, y: 0 },
  { x: 200, y: 200 },
  { x: 0, y: 200 },
];

describe("PhysicsWorld", () => {
  it("uses sprite-sized collision radii for the two blade variants", () => {
    expect(bladeCollisionRadius({ variant: "four" })).toBe(19);
    expect(bladeCollisionRadius({ variant: "five" })).toBe(25);
  });

  it("reflects away from a wall instead of following it", () => {
    const world = new PhysicsWorld(box, { x: 180, y: 100 }, 10, { x: 2, y: 0.1 }, 2);
    for (let index = 0; index < 20; index += 1) world.update(16.7);
    expect(world.velocity.x).toBeLessThan(0);
    expect(world.position.x).toBeLessThan(190);
  });

  it("reflects from the inset short side of a metal edge obstacle", () => {
    const insetMetalEdge = [[
      { x: 160, y: 50 },
      { x: 160, y: 150 },
      { x: 150, y: 140 },
      { x: 150, y: 60 },
    ]];
    const world = new PhysicsWorld(box, { x: 100, y: 100 }, 10, { x: 2, y: 0 }, 2, insetMetalEdge);

    for (let index = 0; index < 30; index += 1) world.update(16.7);

    expect(world.velocity.x).toBeLessThan(0);
    expect(world.position.x).toBeLessThan(141);
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
