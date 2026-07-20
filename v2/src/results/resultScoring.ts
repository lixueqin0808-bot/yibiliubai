export type ResultRank = "hangbao" | "top" | "ren-shang-ren" | "npc" | "la-wan-le";

export interface LevelTiming {
  fastMs: number;
  standardMs: number;
  relaxedMs: number;
}

export interface CalculateResultInput {
  levelId: number;
  elapsedMs: number;
  lives: 1 | 2 | 3;
  cuts: number;
  timing: LevelTiming;
}

export interface LevelResult extends CalculateResultInput {
  score: number;
  rank: ResultRank;
  label: "夯爆了" | "顶尖" | "人上人" | "NPC" | "拉完了";
}

const LABELS = {
  hangbao: "夯爆了",
  top: "顶尖",
  "ren-shang-ren": "人上人",
  npc: "NPC",
  "la-wan-le": "拉完了",
} as const;

function interpolate(value: number, start: number, end: number, from: number, to: number): number {
  const progress = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return from + (to - from) * progress;
}

export function calculateTimeScore(elapsedMs: number, timing: LevelTiming): number {
  const elapsed = Math.max(0, elapsedMs);
  if (elapsed <= timing.fastMs) return 100;
  if (elapsed <= timing.standardMs) return interpolate(elapsed, timing.fastMs, timing.standardMs, 99, 75);
  if (elapsed <= timing.relaxedMs) return interpolate(elapsed, timing.standardMs, timing.relaxedMs, 74, 40);
  return Math.max(20, 39 - Math.floor((elapsed - timing.relaxedMs) / 4_000));
}

export function lifePenalty(lives: CalculateResultInput["lives"]): 0 | 12 | 28 {
  return lives === 3 ? 0 : lives === 2 ? 12 : 28;
}

export function calculateLevelResult(input: CalculateResultInput): LevelResult {
  const penalty = lifePenalty(input.lives);
  const score = Math.max(20, Math.min(100, Math.round(calculateTimeScore(input.elapsedMs, input.timing) - penalty)));
  let rank: ResultRank = score >= 90
    ? "hangbao"
    : score >= 75
      ? "top"
      : score >= 60
        ? "ren-shang-ren"
        : score >= 40
          ? "npc"
          : "la-wan-le";

  if (input.lives === 2 && rank === "hangbao") rank = "top";
  if (input.lives === 1 && (rank === "hangbao" || rank === "top")) rank = "ren-shang-ren";

  return { ...input, score, rank, label: LABELS[rank] };
}
