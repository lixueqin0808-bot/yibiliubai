import { describe, expect, it } from "vitest";
import { polygonArea } from "../geometry/polygon";

describe("polygonArea", () => {
  it("returns the same area for clockwise and counter-clockwise points", () => {
    const clockwise = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(polygonArea(clockwise)).toBe(100);
    expect(polygonArea([...clockwise].reverse())).toBe(100);
  });
});
