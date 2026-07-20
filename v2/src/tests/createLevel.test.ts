import { describe, expect, it } from "vitest";
import { createLevel } from "../levels/createLevel";

const source = {
  id: 99,
  shapeId: "kite" as const,
  target: 0.4,
  blades: [],
};

describe("createLevel", () => {
  it("maps locked edge indices to complete shape boundary segments", () => {
    const level = createLevel({ ...source, lockedEdgeIndices: [0, 2] });
    expect(level.shapeId).toBe("kite");
    expect(level.metalEdges).toEqual([
      { start: level.polygon[0], end: level.polygon[1] },
      { start: level.polygon[2], end: level.polygon[3] },
    ]);
  });

  it("rejects invalid and repeated edge indices", () => {
    expect(() => createLevel({ ...source, lockedEdgeIndices: [-1] })).toThrow("invalid locked edge index");
    expect(() => createLevel({ ...source, lockedEdgeIndices: [0, 0] })).toThrow("repeats locked edge index");
    expect(() => createLevel({ ...source, lockedEdgeIndices: [4] })).toThrow("invalid locked edge index");
  });
});
