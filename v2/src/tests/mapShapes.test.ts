import { describe, expect, it } from "vitest";
import { isSimplePolygon, polygonArea, signedPolygonArea } from "../geometry/polygon";
import { createMapShape, MAP_SHAPE_IDS } from "../levels/mapShapes";

describe("map shape library", () => {
  it("uses the final fifteen-shape catalog", () => {
    expect(MAP_SHAPE_IDS).toEqual([
      "rounded-slab", "tapered-tablet", "triangle", "shield", "hex-jade",
      "kite", "star-disc", "teardrop", "leaf", "mountain", "wide-h",
      "heart", "vertical-slip", "lantern", "bagua",
    ]);
  });

  it("creates fifteen unique, clockwise, simple maps inside the safe play area", () => {
    const shapes = MAP_SHAPE_IDS.map((id) => createMapShape(id));
    expect(new Set(shapes.map((shape) => JSON.stringify(shape))).size).toBe(15);

    shapes.forEach((polygon) => {
      expect(polygon.length).toBeGreaterThanOrEqual(3);
      expect(polygon.length).toBeLessThanOrEqual(24);
      expect(signedPolygonArea(polygon)).toBeLessThan(0);
      expect(isSimplePolygon(polygon)).toBe(true);
      expect(polygonArea(polygon)).toBeGreaterThanOrEqual(45_000);
      expect(polygonArea(polygon)).toBeLessThanOrEqual(95_000);
      polygon.forEach((point, index) => {
        const next = polygon[(index + 1) % polygon.length];
        expect(Math.hypot(next.x - point.x, next.y - point.y)).toBeGreaterThanOrEqual(10);
        expect(point.x).toBeGreaterThanOrEqual(60);
        expect(point.x).toBeLessThanOrEqual(330);
        expect(point.y).toBeGreaterThanOrEqual(225);
        expect(point.y).toBeLessThanOrEqual(640);
      });
    });
  });

  it("keeps the leaf and teardrop visually distinct from a round map", () => {
    const teardrop = createMapShape("teardrop");
    const leaf = createMapShape("leaf");

    expect(Math.min(...teardrop.map((point) => point.y))).toBeLessThan(240);
    expect(Math.max(...teardrop.map((point) => point.y))).toBeGreaterThan(590);
    expect(Math.min(...leaf.map((point) => point.y))).toBe(238);
    expect(Math.max(...leaf.map((point) => point.y))).toBe(630);
    expect(leaf.filter((point) => point.x === 195).length).toBeGreaterThanOrEqual(2);
  });
});
