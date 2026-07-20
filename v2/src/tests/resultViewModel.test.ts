import { describe, expect, it } from "vitest";
import { calculateLevelResult } from "../results/resultScoring";
import { createResultViewModel } from "../results/resultViewModel";

const timing = { fastMs: 10_000, standardMs: 20_000, relaxedMs: 40_000 };

describe("result view model", () => {
  it("formats the complete visible result state", () => {
    const result = calculateLevelResult({ levelId: 1, elapsedMs: 18_600, lives: 2, cuts: 11, timing });
    expect(createResultViewModel(result, 20_000)).toMatchObject({
      time: "18.6 秒",
      lives: "剩余 2 墨点",
      cuts: "挥墨 11 次",
      best: "18.6 秒 新纪录",
      label: "人上人",
    });
  });

  it("does not offer a higher rank beyond the life cap", () => {
    const result = calculateLevelResult({ levelId: 1, elapsedMs: 9_000, lives: 1, cuts: 4, timing });
    expect(createResultViewModel(result, undefined).hint).toBe("本关封神");
  });
});
