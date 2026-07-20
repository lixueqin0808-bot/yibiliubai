export interface ResultSequenceRender {
  showDialog(): void;
  revealRank(): void;
  playVoice(): void;
  landStamp(): void;
  playStamp(): void;
  revealStats(): void;
  unlockActions(): void;
}

interface Phase {
  delay: number;
  run: () => void;
  completed: boolean;
}

export class ResultSequence {
  private handles = new Set<ReturnType<typeof setTimeout>>();
  private phases: Phase[] = [];
  private finished = true;

  get isFinished(): boolean {
    return this.finished;
  }

  play(render: ResultSequenceRender): void {
    this.cancel();
    this.finished = false;
    this.phases = [
      { delay: 500, run: render.showDialog, completed: false },
      { delay: 850, run: render.revealRank, completed: false },
      { delay: 850, run: render.playVoice, completed: false },
      { delay: 1_120, run: render.landStamp, completed: false },
      { delay: 1_120, run: render.playStamp, completed: false },
      { delay: 1_320, run: render.revealStats, completed: false },
      { delay: 1_420, run: render.unlockActions, completed: false },
    ];
    this.phases.forEach((phase) => this.schedule(phase));
  }

  skip(): "consumed" | "ignored" {
    if (this.finished) return "ignored";
    this.phases.forEach((phase) => this.runPhase(phase));
    this.clearHandles();
    this.finished = true;
    return "consumed";
  }

  cancel(): void {
    this.clearHandles();
    this.phases = [];
    this.finished = true;
  }

  private schedule(phase: Phase): void {
    const handle = setTimeout(() => {
      this.handles.delete(handle);
      this.runPhase(phase);
      if (phase.delay === 1_420) this.finished = true;
    }, phase.delay);
    this.handles.add(handle);
  }

  private runPhase(phase: Phase): void {
    if (phase.completed) return;
    phase.completed = true;
    phase.run();
  }

  private clearHandles(): void {
    this.handles.forEach((handle) => clearTimeout(handle));
    this.handles.clear();
  }
}
