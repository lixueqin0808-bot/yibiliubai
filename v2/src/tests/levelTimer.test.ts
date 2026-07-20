import { describe, expect, it } from "vitest";
import { LevelTimer } from "../results/LevelTimer";

describe("level timer", () => {
  it("starts once and excludes paused time", () => {
    const timer = new LevelTimer();
    timer.start(1_000);
    timer.start(2_000);
    timer.pause(6_000);
    timer.resume(16_000);
    expect(timer.elapsed(21_000)).toBe(10_000);
  });

  it("returns zero before the first accepted input", () => {
    expect(new LevelTimer().elapsed(50_000)).toBe(0);
  });

  it("does not count an active pause before resume", () => {
    const timer = new LevelTimer();
    timer.start(1_000);
    timer.pause(5_000);
    expect(timer.elapsed(17_000)).toBe(4_000);
  });
});
