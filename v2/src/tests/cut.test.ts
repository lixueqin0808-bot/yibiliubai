import { describe, expect, it } from "vitest";
import { splitPolygon } from "../geometry/cut";
import { polygonArea } from "../geometry/polygon";
import { GOLDEN_POLYGON } from "../levels/goldenLevel";

const square = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];

describe("splitPolygon", () => {
  it("splits a polygon and conserves area", () => {
    const result = splitPolygon(square, { x: 0, y: 50 }, { x: 100, y: 50 });
    expect(result).not.toBeNull();
    expect(result?.intersections).toHaveLength(2);
    expect(polygonArea(result!.positive) + polygonArea(result!.negative)).toBeCloseTo(10000, 5);
  });

  it("rejects a segment that does not cross the polygon", () => {
    expect(splitPolygon(square, { x: 10, y: 10 }, { x: 20, y: 20 })).toBeNull();
  });

  it("handles a diagonal cut", () => {
    const result = splitPolygon(square, { x: 0, y: 0 }, { x: 100, y: 100 });
    expect(result).not.toBeNull();
    expect(polygonArea(result!.positive)).toBeCloseTo(5000, 5);
    expect(polygonArea(result!.negative)).toBeCloseTo(5000, 5);
  });

  it("accepts the golden level guide cut", () => {
    const result = splitPolygon(GOLDEN_POLYGON, { x: 42, y: 300 }, { x: 352, y: 300 });
    expect(result).not.toBeNull();
    expect(result?.intersections).toHaveLength(2);
  });
});
