import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultSequence, type ResultSequenceRender } from "../results/ResultSequence";

function recorder(): { calls: string[]; render: ResultSequenceRender } {
  const calls: string[] = [];
  const render = Object.fromEntries([
    ["showDialog", "dialog"], ["revealRank", "rank"], ["playVoice", "voice"],
    ["landStamp", "stamp"], ["playStamp", "stamp-sound"], ["revealStats", "stats"], ["unlockActions", "actions"],
  ].map(([method, name]) => [method, () => calls.push(name)])) as unknown as ResultSequenceRender;
  return { calls, render };
}

describe("result sequence", () => {
  afterEach(() => vi.useRealTimers());

  it("reveals deterministic phases without exposing actions early", () => {
    vi.useFakeTimers();
    const { calls, render } = recorder();
    const sequence = new ResultSequence();
    sequence.play(render);
    vi.advanceTimersByTime(499);
    expect(calls).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(calls).toEqual(["dialog"]);
    vi.advanceTimersByTime(350);
    expect(calls).toEqual(["dialog", "rank", "voice"]);
    vi.advanceTimersByTime(569);
    expect(calls).toContain("stamp");
    expect(calls).not.toContain("actions");
    vi.advanceTimersByTime(1);
    expect(calls).toContain("actions");
    expect(sequence.isFinished).toBe(true);
  });

  it("consumes the first skip without leaking a button click", () => {
    vi.useFakeTimers();
    const { calls, render } = recorder();
    const sequence = new ResultSequence();
    sequence.play(render);
    expect(sequence.skip()).toBe("consumed");
    expect(sequence.isFinished).toBe(true);
    expect(calls).toEqual(["dialog", "rank", "voice", "stamp", "stamp-sound", "stats", "actions"]);
    expect(sequence.skip()).toBe("ignored");
  });

  it("cancels every pending callback before a restart", () => {
    vi.useFakeTimers();
    const first = recorder();
    const second = recorder();
    const sequence = new ResultSequence();
    sequence.play(first.render);
    sequence.play(second.render);
    vi.advanceTimersByTime(1_500);
    expect(first.calls).toEqual([]);
    expect(second.calls).toContain("actions");
  });
});
