import { describe, expect, it } from "vitest";
import { buildMapSidewall } from "../geometry/mapSidewall";
import { pointInPolygon } from "../geometry/polygon";

describe("buildMapSidewall", () => {
  it("keeps the original polygon as every face inner edge and expands outward", () => {
    const polygon = [
      { x: 20, y: 20 },
      { x: 180, y: 20 },
      { x: 180, y: 160 },
      { x: 20, y: 160 },
    ];
    const sidewall = buildMapSidewall(polygon, 12);

    expect(sidewall.faces).toHaveLength(polygon.length);
    sidewall.faces.forEach((face, index) => {
      expect(face.innerStart).toBe(polygon[index]);
      expect(face.innerEnd).toBe(polygon[(index + 1) % polygon.length]);
      expect(pointInPolygon(face.outerStart, polygon)).toBe(false);
    });
  });

  it("limits sharp and concave joins to finite outer vertices", () => {
    const polygon = [
      { x: 30, y: 20 },
      { x: 190, y: 20 },
      { x: 190, y: 80 },
      { x: 100, y: 80 },
      { x: 100, y: 170 },
      { x: 30, y: 170 },
    ];
    const sidewall = buildMapSidewall(polygon, 12);

    sidewall.outerPolygon.forEach((point, index) => {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
      expect(Math.hypot(point.x - polygon[index].x, point.y - polygon[index].y)).toBeLessThanOrEqual(27.1);
    });
  });
});
