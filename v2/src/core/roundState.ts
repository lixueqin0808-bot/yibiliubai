export const ROUND_LIVES = 3;

export function remainingRatio(area: number, initialArea: number): number {
  if (initialArea <= 0) return 0;
  return Math.max(0, Math.min(1, area / initialArea));
}

export function applyBladeHit(lives: number): { lives: number; shouldRestart: boolean } {
  const nextLives = Math.max(0, lives - 1);
  return { lives: nextLives, shouldRestart: nextLives === 0 };
}
