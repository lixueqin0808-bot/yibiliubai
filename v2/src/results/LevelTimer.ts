export class LevelTimer {
  private startedAt: number | null = null;
  private pausedAt: number | null = null;
  private pausedTotal = 0;
  private running = false;

  start(now: number): void {
    if (this.startedAt !== null) return;
    this.startedAt = now;
    this.running = true;
  }

  pause(now: number): void {
    if (!this.running || this.startedAt === null || this.pausedAt !== null) return;
    this.pausedAt = now;
    this.running = false;
  }

  resume(now: number): void {
    if (this.startedAt === null || this.pausedAt === null) return;
    this.pausedTotal += Math.max(0, now - this.pausedAt);
    this.pausedAt = null;
    this.running = true;
  }

  reset(): void {
    this.startedAt = null;
    this.pausedAt = null;
    this.pausedTotal = 0;
    this.running = false;
  }

  elapsed(now: number): number {
    if (this.startedAt === null) return 0;
    const pausedNow = this.pausedAt === null ? 0 : Math.max(0, now - this.pausedAt);
    return Math.max(0, now - this.startedAt - this.pausedTotal - pausedNow);
  }
}
