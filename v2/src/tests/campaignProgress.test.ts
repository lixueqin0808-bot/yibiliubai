import { describe, expect, it } from "vitest";
import { defaultCampaignProgress, recordLevelCompletion } from "../core/campaignProgress";

describe("campaign progress", () => {
  it("starts with only the first level unlocked", () => {
    expect(defaultCampaignProgress()).toEqual({ unlockedThrough: 1, completed: [] });
  });

  it("records completion once and unlocks the next level", () => {
    const progress = recordLevelCompletion(defaultCampaignProgress(), 1, 5);
    expect(progress).toEqual({ unlockedThrough: 2, completed: [1] });
    expect(recordLevelCompletion(progress, 1, 5)).toEqual(progress);
  });
});
