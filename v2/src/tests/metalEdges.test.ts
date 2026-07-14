import { describe, expect, it } from "vitest";
import { visibleBoundarySegments } from "../geometry/polygon";

describe("locked map edges", () => {
  const locked = [{ start: { x: 0, y: 0 }, end: { x: 100, y: 0 } }];

  it("only renders locked edges that remain on the retained polygon", () => {
    const retained = [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 0, y: 100 }];
    expect(visibleBoundarySegments(retained, locked)).toEqual([
      { start: { x: 0, y: 0 }, end: { x: 50, y: 0 } },
    ]);
  });

  it("removes the locked edge when its map piece no longer exists", () => {
    const retained = [{ x: 50, y: 20 }, { x: 100, y: 20 }, { x: 100, y: 100 }, { x: 50, y: 100 }];
    expect(visibleBoundarySegments(retained, locked)).toEqual([]);
  });
});
