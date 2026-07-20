import { describe, expect, it } from "vitest";
import { isSimplePolygon, polygonArea, signedPolygonArea } from "../geometry/polygon";

describe("polygonArea", () => {
  it("returns the same area for clockwise and counter-clockwise points", () => {
    const clockwise = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(polygonArea(clockwise)).toBe(100);
    expect(polygonArea([...clockwise].reverse())).toBe(100);
  });

  it("keeps winding information separate from absolute area", () => {
    const clockwise = [{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }];
    expect(signedPolygonArea(clockwise)).toBeLessThan(0);
    expect(signedPolygonArea([...clockwise].reverse())).toBeGreaterThan(0);
  });

  it("detects self-intersecting map outlines", () => {
    expect(isSimplePolygon([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }])).toBe(true);
    expect(isSimplePolygon([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }])).toBe(false);
  });
});
