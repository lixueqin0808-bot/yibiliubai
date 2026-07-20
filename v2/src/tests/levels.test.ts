import { describe, expect, it } from "vitest";
import { LEVELS } from "../levels/goldenLevel";

describe("fifteen-level campaign", () => {
  it("contains three ordered five-level chapters with a restrained difficulty climb", () => {
    expect(LEVELS.map((level) => level.id)).toEqual(Array.from({ length: 15 }, (_, index) => index + 1));
    expect(LEVELS.map((level) => level.shapeId)).toEqual([
      "rounded-slab", "tapered-tablet", "triangle", "shield", "hex-jade",
      "kite", "star-disc", "teardrop", "leaf", "mountain", "wide-h",
      "heart", "vertical-slip", "lantern", "bagua",
    ]);
    expect(new Set(LEVELS.map((level) => JSON.stringify(level.polygon))).size).toBe(15);
    LEVELS.forEach((level) => {
      expect(level.timing.fastMs).toBeLessThan(level.timing.standardMs);
      expect(level.timing.standardMs).toBeLessThan(level.timing.relaxedMs);
    });
    expect(LEVELS[0].timing).toEqual({ fastMs: 8_000, standardMs: 16_000, relaxedMs: 28_000 });
    expect(LEVELS[14].timing).toEqual({ fastMs: 42_000, standardMs: 66_000, relaxedMs: 106_000 });
    LEVELS.slice(1).forEach((level, index) => {
      const previous = LEVELS[index];
      expect(level.timing.fastMs).toBeGreaterThan(previous.timing.fastMs);
      expect(level.timing.standardMs).toBeGreaterThan(previous.timing.standardMs);
      expect(level.timing.relaxedMs).toBeGreaterThan(previous.timing.relaxedMs);
    });
    expect(LEVELS[1].blades).toHaveLength(3);
    expect(LEVELS[3].metalEdges).toHaveLength(1);
    expect(LEVELS[4].blades).toHaveLength(4);
    expect(LEVELS[4].metalEdges).toHaveLength(2);
    expect(LEVELS[5].blades).toHaveLength(4);
    expect(LEVELS[9].metalEdges).toHaveLength(2);
    expect(LEVELS[14].blades).toHaveLength(5);
    expect(LEVELS[14].metalEdges).toHaveLength(3);
    LEVELS.slice(1).forEach((level, index) => {
      expect(level.target).toBeLessThan(LEVELS[index].target);
    });
  });
});
