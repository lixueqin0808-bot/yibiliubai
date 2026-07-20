import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultCampaignProgress, loadCampaignProgress, recordLevelCompletion } from "../core/campaignProgress";

describe("campaign progress", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("starts with only the first level unlocked", () => {
    expect(defaultCampaignProgress()).toEqual({ unlockedThrough: 1, completed: [], bestTimes: {} });
  });

  it("records completion once and unlocks the next level", () => {
    const progress = recordLevelCompletion(defaultCampaignProgress(), 1, 15, 24_500);
    expect(progress).toEqual({ unlockedThrough: 2, completed: [1], bestTimes: { "1": 24_500 } });
    expect(recordLevelCompletion(progress, 1, 15, 31_000)).toEqual(progress);
    expect(recordLevelCompletion(progress, 1, 15, 22_000).bestTimes).toEqual({ "1": 22_000 });
  });

  it("loads earlier save files without best-time data", () => {
    const entries = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => entries.get(key) ?? null,
      setItem: (key: string, value: string) => entries.set(key, value),
    });
    localStorage.setItem("yibiliubai-v2-campaign", JSON.stringify({ unlockedThrough: 3, completed: [1, 2] }));
    expect(loadCampaignProgress()).toEqual({ unlockedThrough: 3, completed: [1, 2], bestTimes: {} });
  });
});
