import { describe, expect, it } from "vitest";
import { segmentHitsCircle, sweptCircleHitsSegment } from "../geometry/collision";

describe("segmentHitsCircle", () => {
  it("detects direct and tangent hits", () => {
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 4 }, 5)).toBe(true);
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 5 }, 5)).toBe(true);
  });

  it("rejects a clear miss", () => {
    expect(segmentHitsCircle({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 6 }, 5)).toBe(false);
  });
});

describe("sweptCircleHitsSegment", () => {
  it("detects a fast circle crossing a cut line", () => {
    expect(sweptCircleHitsSegment(
      { x: 50, y: -20 },
      { x: 50, y: 20 },
      5,
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    )).toBe(true);
  });
});
