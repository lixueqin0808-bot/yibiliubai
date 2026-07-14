import { describe, expect, it } from "vitest";
import { applyBladeHit, remainingRatio } from "../core/roundState";

describe("round state", () => {
  it("treats the intact polygon as full remaining area", () => {
    expect(remainingRatio(100, 100)).toBe(1);
    expect(remainingRatio(50, 100)).toBe(0.5);
    expect(remainingRatio(-10, 100)).toBe(0);
  });

  it("restarts only after the third blade hit", () => {
    expect(applyBladeHit(3)).toEqual({ lives: 2, shouldRestart: false });
    expect(applyBladeHit(1)).toEqual({ lives: 0, shouldRestart: true });
  });
});
