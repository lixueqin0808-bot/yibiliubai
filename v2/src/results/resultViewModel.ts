import { calculateTimeScore, lifePenalty, type LevelResult, type ResultRank } from "./resultScoring";

export interface ResultViewModel {
  rank: ResultRank;
  label: LevelResult["label"];
  score: string;
  time: string;
  lives: string;
  cuts: string;
  best: string;
  hint: string;
  isNewBest: boolean;
}

const RANKS: ResultRank[] = ["la-wan-le", "npc", "ren-shang-ren", "top", "hangbao"];
const SCORE_FLOORS: Record<ResultRank, number> = {
  "la-wan-le": 20,
  npc: 40,
  "ren-shang-ren": 60,
  top: 75,
  hangbao: 90,
};

function formatSeconds(milliseconds: number): string {
  return `${(milliseconds / 1_000).toFixed(1)} 秒`;
}

function maxRankForLives(lives: LevelResult["lives"]): ResultRank {
  return lives === 3 ? "hangbao" : lives === 2 ? "top" : "ren-shang-ren";
}

function rankLabel(rank: ResultRank): string {
  return {
    hangbao: "夯爆了",
    top: "顶尖",
    "ren-shang-ren": "人上人",
    npc: "NPC",
    "la-wan-le": "拉完了",
  }[rank];
}

function nextRankHint(result: LevelResult): string {
  if (result.rank === maxRankForLives(result.lives)) return "本关封神";
  const nextRank = RANKS[RANKS.indexOf(result.rank) + 1];
  const targetScore = SCORE_FLOORS[nextRank];
  const penalty = lifePenalty(result.lives);
  let latestEligible = 0;
  for (let elapsed = 0; elapsed <= result.elapsedMs; elapsed += 100) {
    if (Math.round(calculateTimeScore(elapsed, result.timing) - penalty) >= targetScore) latestEligible = elapsed;
  }
  return `再快 ${formatSeconds(Math.max(100, result.elapsedMs - latestEligible))}，可至 ${rankLabel(nextRank)}`;
}

export function createResultViewModel(result: LevelResult, previousBestMs: number | undefined): ResultViewModel {
  const isNewBest = previousBestMs === undefined || result.elapsedMs < previousBestMs;
  const bestMs = isNewBest ? result.elapsedMs : previousBestMs;
  return {
    rank: result.rank,
    label: result.label,
    score: String(result.score),
    time: formatSeconds(result.elapsedMs),
    lives: `剩余 ${result.lives} 墨点`,
    cuts: `挥墨 ${result.cuts} 次`,
    best: isNewBest ? `${formatSeconds(bestMs)} 新纪录` : formatSeconds(bestMs),
    hint: nextRankHint(result),
    isNewBest,
  };
}
