export interface CampaignProgress {
  unlockedThrough: number;
  completed: number[];
  bestTimes: Record<string, number>;
}

const STORAGE_KEY = "yibiliubai-v2-campaign";

export function defaultCampaignProgress(): CampaignProgress {
  return { unlockedThrough: 1, completed: [], bestTimes: {} };
}

export function recordLevelCompletion(
  progress: CampaignProgress,
  levelId: number,
  levelCount: number,
  elapsedMs: number,
): CampaignProgress {
  const completed = [...new Set([...progress.completed, levelId])].sort((a, b) => a - b);
  const bestTimes = { ...progress.bestTimes };
  if (Number.isFinite(elapsedMs) && elapsedMs > 0) {
    const key = String(levelId);
    bestTimes[key] = bestTimes[key] === undefined ? elapsedMs : Math.min(bestTimes[key], elapsedMs);
  }
  return {
    completed,
    unlockedThrough: Math.min(levelCount, Math.max(progress.unlockedThrough, levelId + 1)),
    bestTimes,
  };
}

export function loadCampaignProgress(): CampaignProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as Partial<CampaignProgress>;
    if (typeof parsed.unlockedThrough !== "number" || !Array.isArray(parsed.completed)) return defaultCampaignProgress();
    const bestTimes = Object.fromEntries(Object.entries(parsed.bestTimes ?? {}).filter(([, value]) => (
      typeof value === "number" && Number.isFinite(value) && value > 0
    )));
    return {
      unlockedThrough: Math.max(1, parsed.unlockedThrough),
      completed: parsed.completed.filter(Number.isInteger),
      bestTimes,
    };
  } catch {
    return defaultCampaignProgress();
  }
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
