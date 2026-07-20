import { describe, expect, it } from "vitest";
import { bladeCollisionRadius, LEVELS } from "../levels/goldenLevel";
import { distanceToPolygonEdge, distanceToSegment, isSimplePolygon, pointInPolygon } from "../geometry/polygon";

describe("campaign map geometry", () => {
  it("keeps every initial blade inside its map with collision clearance", () => {
    LEVELS.forEach((level) => {
      expect(isSimplePolygon(level.polygon), `level ${level.id} self-intersects`).toBe(true);
      level.blades.forEach((blade, index) => {
        expect(pointInPolygon(blade, level.polygon), `level ${level.id} blade ${index + 1} starts outside`).toBe(true);
        expect(distanceToPolygonEdge(blade, level.polygon), `level ${level.id} blade ${index + 1} starts too close to an edge`)
          .toBeGreaterThanOrEqual(bladeCollisionRadius(blade) + 2);
      });
      level.blades.forEach((blade, index) => {
        level.blades.slice(index + 1).forEach((other, offset) => {
          const required = bladeCollisionRadius(blade) + bladeCollisionRadius(other);
          expect(Math.hypot(blade.x - other.x, blade.y - other.y), `level ${level.id} blades ${index + 1} and ${index + offset + 2} overlap`)
            .toBeGreaterThan(required);
        });
      });
    });
  });

  it("anchors every locked edge to one complete map boundary edge", () => {
    LEVELS.forEach((level) => {
      level.metalEdges?.forEach((metal) => {
        const matchesBoundary = level.polygon.some((start, index) => {
          const end = level.polygon[(index + 1) % level.polygon.length];
          return distanceToSegment(metal.start, start, end) < 0.01
            && distanceToSegment(metal.end, start, end) < 0.01
            && Math.abs(Math.hypot(metal.end.x - metal.start.x, metal.end.y - metal.start.y) - Math.hypot(end.x - start.x, end.y - start.y)) < 0.01;
        });
        expect(matchesBoundary, `level ${level.id} has a detached locked edge`).toBe(true);
      });
    });
  });
});
