import { describe, expect, it } from "vitest";
import { calculateLevelResult, lifePenalty, type LevelTiming } from "../results/resultScoring";

const timing: LevelTiming = { fastMs: 10_000, standardMs: 20_000, relaxedMs: 40_000 };

describe("result scoring", () => {
  it("awards hangbao only for a fast no-hit clear", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 9_000, lives: 3, cuts: 12, timing }).rank).toBe("hangbao");
  });

  it("does not change score when only cut count changes", () => {
    const first = calculateLevelResult({ levelId: 1, elapsedMs: 18_000, lives: 3, cuts: 3, timing });
    const second = calculateLevelResult({ levelId: 1, elapsedMs: 18_000, lives: 3, cuts: 30, timing });
    expect(first.score).toBe(second.score);
  });

  it("caps two lives at top and one life at ren-shang-ren", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 8_000, lives: 2, cuts: 4, timing }).rank).toBe("top");
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 8_000, lives: 1, cuts: 4, timing }).rank).toBe("ren-shang-ren");
  });

  it("applies the objective life penalties", () => {
    expect(lifePenalty(3)).toBe(0);
    expect(lifePenalty(2)).toBe(12);
    expect(lifePenalty(1)).toBe(28);
  });

  it("allows npc and la-wan-le to appear after mistakes", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 20_000, lives: 1, cuts: 8, timing }).rank).toBe("npc");
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 40_000, lives: 1, cuts: 8, timing }).rank).toBe("la-wan-le");
  });

  it("uses the five fixed labels", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 80_000, lives: 3, cuts: 4, timing }).label).toBe("拉完了");
  });
});
