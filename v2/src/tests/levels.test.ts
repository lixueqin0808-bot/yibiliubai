import { describe, expect, it } from "vitest";
import { LEVELS } from "../levels/goldenLevel";

describe("five-level campaign", () => {
  it("contains five ordered levels and reserves the final level for two blades", () => {
    expect(LEVELS.map((level) => level.id)).toEqual([1, 2, 3, 4, 5]);
    expect(LEVELS[1].blades).toHaveLength(2);
    expect(LEVELS[3].metalEdges).toHaveLength(1);
    expect(LEVELS[4].blades).toHaveLength(3);
    expect(LEVELS[4].metalEdges).toHaveLength(2);
  });
});
