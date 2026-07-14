export interface CampaignProgress {
  unlockedThrough: number;
  completed: number[];
}

const STORAGE_KEY = "yibiliubai-v2-campaign";

export function defaultCampaignProgress(): CampaignProgress {
  return { unlockedThrough: 1, completed: [] };
}

export function recordLevelCompletion(progress: CampaignProgress, levelId: number, levelCount: number): CampaignProgress {
  const completed = [...new Set([...progress.completed, levelId])].sort((a, b) => a - b);
  return {
    completed,
    unlockedThrough: Math.min(levelCount, Math.max(progress.unlockedThrough, levelId + 1)),
  };
}

export function loadCampaignProgress(): CampaignProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as Partial<CampaignProgress>;
    if (typeof parsed.unlockedThrough !== "number" || !Array.isArray(parsed.completed)) return defaultCampaignProgress();
    return { unlockedThrough: Math.max(1, parsed.unlockedThrough), completed: parsed.completed.filter(Number.isInteger) };
  } catch {
    return defaultCampaignProgress();
  }
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
