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

  it("uses finite 45-degree corner caps for sharp and concave joins", () => {
    const polygon = [
      { x: 30, y: 20 },
      { x: 190, y: 20 },
      { x: 190, y: 80 },
      { x: 100, y: 80 },
      { x: 100, y: 170 },
      { x: 30, y: 170 },
    ];
    const sidewall = buildMapSidewall(polygon, 12);

    expect(sidewall.corners).toHaveLength(polygon.length);
    sidewall.outerPolygon.forEach((point) => {
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.y)).toBe(true);
    });
    sidewall.faces.forEach((face) => {
      const innerLength = Math.hypot(face.innerEnd.x - face.innerStart.x, face.innerEnd.y - face.innerStart.y);
      const outerLength = Math.hypot(face.outerEnd.x - face.outerStart.x, face.outerEnd.y - face.outerStart.y);
      expect(outerLength).toBeGreaterThan(innerLength);
    });
    sidewall.corners.forEach((corner) => {
      expect(Math.hypot(corner.outerFromPrevious.x - corner.inner.x, corner.outerFromPrevious.y - corner.inner.y)).toBeLessThanOrEqual(20);
      expect(Math.hypot(corner.outerToNext.x - corner.inner.x, corner.outerToNext.y - corner.inner.y)).toBeLessThanOrEqual(20);
    });
  });
});
