# 魔性评分结算系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为十五关增加时间主导、生命限级的五档评分，以及“最终一刀—评价语音—朱印—统计—下一关”的完整结算闭环。

**Architecture:** 评分、计时、结算编排分别放入独立模块；`Game` 只产生关卡结果并冻结游戏，`main.ts` 保存纪录并把结果交给 `ResultSequence`。评分逻辑保持纯函数，DOM、音频和存档均不能反向依赖评分模块。

**Tech Stack:** TypeScript 7、Canvas 2D、Web Audio/HTMLAudioElement、Vitest、Playwright、Vite。

## Global Constraints

- 切割次数不限，且不影响评分。
- 时间从第一次起笔开始；暂停、设置、失焦和结算不计时。
- 剩余两命最高“顶尖”，剩余一命最高“人上人”，三命耗尽进入失败流程。
- 五档文案固定为“夯爆了、顶尖、人上人、NPC、拉完了”。
- 五档语音使用同一个声音人格；正式语音必须自行录制、合法生成或取得授权。
- 最终一刀必须完整播放后才允许结算层出现。
- 快速点击只允许跳过动画，不能误触下一关。
- `v2` 当前不是 Git 仓库；每个任务以测试通过作为检查点，不执行或声称 Git 提交。
- 最终必须运行 `npm.cmd run build`、`npm.cmd run test`、`npm.cmd run test:e2e`。

---

### Task 1: 评分模型与十五关时间参数

**Files:**
- Create: `src/results/resultScoring.ts`
- Create: `src/tests/resultScoring.test.ts`
- Modify: `src/levels/goldenLevel.ts`
- Modify: `src/levels/createLevel.ts`
- Modify: `src/tests/levels.test.ts`

**Interfaces:**
- Produces: `ResultRank`、`LevelTiming`、`LevelResult`、`calculateLevelResult(input)`。
- Later tasks consume: `LevelDefinition.timing` and `calculateLevelResult`.

- [ ] **Step 1: Write the failing scoring tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateLevelResult, type LevelTiming } from "../results/resultScoring";

const timing: LevelTiming = { fastMs: 10_000, standardMs: 20_000, relaxedMs: 40_000 };

describe("result scoring", () => {
  it("awards hangbao only for a fast no-hit clear", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 9_000, lives: 3, cuts: 12, timing }).rank).toBe("hangbao");
  });

  it("does not change score when only cut count changes", () => {
    const first = calculateLevelResult({ levelId: 1, elapsedMs: 18_000, lives: 3, cuts: 3, timing });
    const second = calculateLevelResult({ levelId: 1, elapsedMs: 18_000, lives: 3, cuts: 30, timing });
    expect(first.score).toBe(second.score);
  });

  it("caps two lives at top and one life at ren-shang-ren", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 8_000, lives: 2, cuts: 4, timing }).rank).toBe("top");
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 8_000, lives: 1, cuts: 4, timing }).rank).toBe("ren-shang-ren");
  });

  it("uses the five fixed labels", () => {
    expect(calculateLevelResult({ levelId: 1, elapsedMs: 80_000, lives: 3, cuts: 4, timing }).label).toBe("拉完了");
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm.cmd run test -- src/tests/resultScoring.test.ts`

Expected: FAIL because `resultScoring.ts` does not exist.

- [ ] **Step 3: Implement the pure scoring module**

```ts
export type ResultRank = "hangbao" | "top" | "ren-shang-ren" | "npc" | "la-wan-le";

export interface LevelTiming {
  fastMs: number;
  standardMs: number;
  relaxedMs: number;
}

export interface LevelResult {
  levelId: number;
  elapsedMs: number;
  lives: number;
  cuts: number;
  score: number;
  rank: ResultRank;
  label: "夯爆了" | "顶尖" | "人上人" | "NPC" | "拉完了";
}

export interface CalculateResultInput {
  levelId: number;
  elapsedMs: number;
  lives: 1 | 2 | 3;
  cuts: number;
  timing: LevelTiming;
}

function lerpScore(value: number, start: number, end: number, from: number, to: number): number {
  const progress = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return from + (to - from) * progress;
}

function timeScore(elapsedMs: number, timing: LevelTiming): number {
  if (elapsedMs <= timing.fastMs) return 100;
  if (elapsedMs <= timing.standardMs) return lerpScore(elapsedMs, timing.fastMs, timing.standardMs, 99, 75);
  if (elapsedMs <= timing.relaxedMs) return lerpScore(elapsedMs, timing.standardMs, timing.relaxedMs, 74, 40);
  return Math.max(20, 39 - Math.floor((elapsedMs - timing.relaxedMs) / 4_000));
}

const LABELS = {
  hangbao: "夯爆了", top: "顶尖", "ren-shang-ren": "人上人", npc: "NPC", "la-wan-le": "拉完了",
} as const;

export function calculateLevelResult(input: CalculateResultInput): LevelResult {
  const penalty = input.lives === 3 ? 0 : input.lives === 2 ? 10 : 20;
  const score = Math.max(20, Math.min(100, Math.round(timeScore(input.elapsedMs, input.timing) - penalty)));
  let rank: ResultRank = score >= 90 ? "hangbao" : score >= 75 ? "top" : score >= 60 ? "ren-shang-ren" : score >= 40 ? "npc" : "la-wan-le";
  if (input.lives === 2 && rank === "hangbao") rank = "top";
  if (input.lives === 1 && (rank === "hangbao" || rank === "top")) rank = "ren-shang-ren";
  return { ...input, score, rank, label: LABELS[rank] };
}
```

- [ ] **Step 4: Add level timing to the level contract**

Add `timing: LevelTiming` to `LevelDefinition` and `LevelSource`; copy it in `createLevel`. Configure the first-pass values in `LEVELS`:

```ts
const TIMINGS: LevelTiming[] = [
  { fastMs: 12_000, standardMs: 24_000, relaxedMs: 45_000 },
  { fastMs: 16_000, standardMs: 30_000, relaxedMs: 55_000 },
  { fastMs: 18_000, standardMs: 34_000, relaxedMs: 62_000 },
  { fastMs: 20_000, standardMs: 38_000, relaxedMs: 68_000 },
  { fastMs: 22_000, standardMs: 42_000, relaxedMs: 75_000 },
  { fastMs: 24_000, standardMs: 46_000, relaxedMs: 82_000 },
  { fastMs: 26_000, standardMs: 50_000, relaxedMs: 88_000 },
  { fastMs: 28_000, standardMs: 54_000, relaxedMs: 94_000 },
  { fastMs: 30_000, standardMs: 58_000, relaxedMs: 100_000 },
  { fastMs: 32_000, standardMs: 62_000, relaxedMs: 108_000 },
  { fastMs: 34_000, standardMs: 66_000, relaxedMs: 116_000 },
  { fastMs: 36_000, standardMs: 70_000, relaxedMs: 124_000 },
  { fastMs: 38_000, standardMs: 74_000, relaxedMs: 132_000 },
  { fastMs: 40_000, standardMs: 78_000, relaxedMs: 140_000 },
  { fastMs: 42_000, standardMs: 82_000, relaxedMs: 148_000 },
];
```

Each level uses `timing: TIMINGS[id - 1]`. These values are calibration seeds, not promises of final difficulty.

- [ ] **Step 5: Verify scoring and level contracts**

Run: `npm.cmd run test -- src/tests/resultScoring.test.ts src/tests/levels.test.ts`

Expected: PASS.

---

### Task 2: Pause-safe first-input timer

**Files:**
- Create: `src/results/LevelTimer.ts`
- Create: `src/tests/levelTimer.test.ts`
- Modify: `src/core/Game.ts`

**Interfaces:**
- Produces: `LevelTimer.start(now)`, `pause(now)`, `resume(now)`, `reset()`, `elapsed(now)`.
- `Game.complete()` consumes `elapsed(performance.now())`.

- [ ] **Step 1: Write deterministic timer tests with injected timestamps**

```ts
it("starts on first input and excludes paused time", () => {
  const timer = new LevelTimer();
  timer.start(1_000);
  timer.start(2_000);
  timer.pause(6_000);
  timer.resume(16_000);
  expect(timer.elapsed(21_000)).toBe(10_000);
});

it("returns zero before the first input", () => {
  expect(new LevelTimer().elapsed(50_000)).toBe(0);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd run test -- src/tests/levelTimer.test.ts`

Expected: FAIL because `LevelTimer` does not exist.

- [ ] **Step 3: Implement `LevelTimer`**

Use four private fields: `startedAt`, `pausedAt`, `pausedTotal`, `running`. `start()` is idempotent; `pause()` only records once; `resume()` adds the paused duration; `elapsed()` returns active milliseconds only.

- [ ] **Step 4: Integrate lifecycle events in `Game`**

- Add `private readonly timer = new LevelTimer()`.
- Call `timer.reset()` in `loadLevel()`.
- Call `timer.start(performance.now())` on accepted `pointerdown` before `playStart()`.
- Call `timer.pause(performance.now())` in `pause()` and on `document.visibilitychange` when hidden.
- Call `timer.resume(performance.now())` in `resume()` and when visible if status is `playing`.
- Do not start the timer from menus, tutorial, level selection, or automatic animation.

- [ ] **Step 5: Verify timer and existing game tests**

Run: `npm.cmd run test -- src/tests/levelTimer.test.ts src/tests/roundState.test.ts`

Expected: PASS.

---

### Task 3: Best-time persistence with backward compatibility

**Files:**
- Modify: `src/core/campaignProgress.ts`
- Modify: `src/tests/campaignProgress.test.ts`

**Interfaces:**
- Produces: `CampaignProgress.bestTimes: Record<string, number>`.
- Produces: `recordLevelCompletion(progress, levelId, levelCount, elapsedMs)`.

- [ ] **Step 1: Extend the failing persistence tests**

```ts
expect(defaultCampaignProgress()).toEqual({ unlockedThrough: 1, completed: [], bestTimes: {} });

const first = recordLevelCompletion(defaultCampaignProgress(), 1, 15, 24_500);
expect(first.bestTimes).toEqual({ "1": 24_500 });
const slower = recordLevelCompletion(first, 1, 15, 31_000);
expect(slower.bestTimes).toEqual({ "1": 24_500 });
const faster = recordLevelCompletion(slower, 1, 15, 22_000);
expect(faster.bestTimes).toEqual({ "1": 22_000 });
```

Add a load test that places `{ "unlockedThrough": 3, "completed": [1,2] }` in localStorage and expects `bestTimes: {}`.

- [ ] **Step 2: Run the test and verify failure**

Run: `npm.cmd run test -- src/tests/campaignProgress.test.ts`

Expected: FAIL because `bestTimes` and `elapsedMs` are absent.

- [ ] **Step 3: Implement minimum-time persistence**

Extend the interface, default, loader and recorder. Reject non-finite, zero or negative best-time entries during load. Preserve existing unlock and completion behavior.

- [ ] **Step 4: Verify old and new save shapes**

Run: `npm.cmd run test -- src/tests/campaignProgress.test.ts`

Expected: PASS.

---

### Task 4: Result callback, view model and accessible result layout

**Files:**
- Create: `src/results/resultViewModel.ts`
- Create: `src/tests/resultViewModel.test.ts`
- Modify: `src/core/Game.ts`
- Modify: `src/main.ts`
- Modify: `index.html`
- Modify: `src/styles.css`

**Interfaces:**
- Changes callback to: `onLevelComplete?: (result: LevelResult) => void`.
- Produces: `createResultViewModel(result, previousBestMs)`.

- [ ] **Step 1: Write view-model tests**

Assert formatted time (`18.6秒`), best time, `挥墨 11 次`, `剩余 2 墨点`, and next-rank hint. Highest rank returns `本关封神`; lower ranks return an exact number of seconds to the next score threshold based on the same timing function.

- [ ] **Step 2: Run the test and verify failure**

Run: `npm.cmd run test -- src/tests/resultViewModel.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Change `Game.complete()` to emit a `LevelResult`**

```ts
private complete(): void {
  this.status = "completed";
  const result = calculateLevelResult({
    levelId: this.level.id,
    elapsedMs: this.timer.elapsed(performance.now()),
    lives: this.lives as 1 | 2 | 3,
    cuts: this.effectiveCuts,
    timing: this.level.timing,
  });
  this.callbacks.onLevelComplete?.(result);
}
```

Remove direct result-dialog opening and delayed complete audio from `Game.complete`; Task 5 owns that sequence.

- [ ] **Step 4: Replace the current result markup**

The dialog contains these stable IDs:

```html
<dialog id="resultDialog" class="dialog result-dialog" aria-labelledby="resultRank">
  <div id="resultBurst" class="result-burst" aria-hidden="true"></div>
  <p id="resultRank" class="result-rank"></p>
  <span class="stamp" aria-label="留白已成"></span>
  <p id="resultLevel" class="result-level"></p>
  <dl class="result-stats">
    <div><dt>用时</dt><dd id="resultTime"></dd></div>
    <div><dt>墨点</dt><dd id="resultLives"></dd></div>
    <div><dt>挥墨</dt><dd id="resultCuts"></dd></div>
    <div><dt>最佳</dt><dd id="resultBest"></dd></div>
  </dl>
  <p id="resultHint" class="result-hint"></p>
  <div class="dialog-actions icon-actions">...</div>
</dialog>
```

- [ ] **Step 5: Add restrained rank-specific CSS**

Use `data-rank` on the dialog. Keep a stable dialog size; rank styles change accent, animation amplitude and burst opacity, not layout. Add reduced-motion rules that remove shake/large translate while retaining opacity and text.

- [ ] **Step 6: Update `main.ts` persistence and rendering**

Read the previous best before recording completion, save the new result, create the view model, populate all IDs, set `resultDialog.dataset.rank`, and refresh the level grid.

- [ ] **Step 7: Verify view-model and build**

Run: `npm.cmd run test -- src/tests/resultViewModel.test.ts src/tests/campaignProgress.test.ts`

Run: `npm.cmd run build`

Expected: PASS.

---

### Task 5: Deterministic result timeline and skip protection

**Files:**
- Create: `src/results/ResultSequence.ts`
- Create: `src/tests/resultSequence.test.ts`
- Modify: `src/main.ts`
- Modify: `src/audio/AudioManager.ts`
- Modify: `src/styles.css`

**Interfaces:**
- Produces: `ResultSequence.play(result, render)` and `skip()`.
- Consumes callbacks: `showDialog`, `revealRank`, `playVoice`, `landStamp`, `revealStats`, `unlockActions`.

- [ ] **Step 1: Write fake-timer sequence tests**

Use `vi.useFakeTimers()` and assert:

- Dialog is not shown before 500ms.
- Rank and voice start at 850ms.
- Stamp lands between 1000ms and 1400ms.
- Stats and buttons unlock at 1400ms.
- First `skip()` completes the sequence but returns `"consumed"` so the click cannot activate a button.
- `cancel()` clears every pending timer on restart or level change.

- [ ] **Step 2: Run and verify failure**

Run: `npm.cmd run test -- src/tests/resultSequence.test.ts`

Expected: FAIL because `ResultSequence` does not exist.

- [ ] **Step 3: Implement the sequence with injected scheduler callbacks**

Store timeout handles in a `Set<number>`. `play()` begins with `cancel()`, schedules each named phase, and records `finished`. `skip()` runs all unreached render callbacks in order, clears timers, sets `finished`, and returns `"consumed"`.

- [ ] **Step 4: Integrate click protection**

Attach one click listener to the result dialog capture phase. While the sequence is unfinished, call `preventDefault()`, `stopPropagation()` and `sequence.skip()`. Only later clicks may reach “再来一次” or “下一关”.

- [ ] **Step 5: Separate stamp sound from rank voice**

Replace `playComplete()` with:

```ts
playResultVoice(rank: ResultRank): void;
playStamp(): void;
```

`playStamp()` uses the existing `level-complete.wav` with timing aligned to the visual contact frame. `playResultVoice()` initially returns silently when a formal voice asset is unavailable; visual ranking must still complete.

- [ ] **Step 6: Verify sequence tests and browser build**

Run: `npm.cmd run test -- src/tests/resultSequence.test.ts`

Run: `npm.cmd run build`

Expected: PASS.

---

### Task 6: Same-persona voice asset intake and integration

**Files:**
- Add: `src/assets/audio/results/hangbao-01.wav`
- Add: `src/assets/audio/results/top-01.wav`
- Add: `src/assets/audio/results/ren-shang-ren-01.wav`
- Add: `src/assets/audio/results/npc-01.wav`
- Add: `src/assets/audio/results/la-wan-le-01.wav`
- Modify: `src/audio/AudioManager.ts`
- Create: `docs/audio/result-voice-asset-checklist.md`

**Interfaces:**
- `AudioManager.playResultVoice(rank)` maps exactly one file to each rank in the first release.
- Future variants may extend each rank to an array without changing callers.

- [ ] **Step 1: Create the asset checklist before sourcing**

Document exact requirements:

- WAV, 44.1kHz or 48kHz, mono preferred, 16-bit or 24-bit PCM.
- Same speaker, same microphone distance and same room sound.
- Peak below -1dBFS; no background music, reverb tail or clipping.
- `夯爆了` may last 0.9–1.4s; other ranks 0.4–0.9s.
- Files must contain only the spoken phrase and natural breath/noise floor.

- [ ] **Step 2: Pause for the five approved voice files**

Do not generate substitute voices or copy another game's audio. Continue only after all five exact filenames exist and the user confirms they use the same voice persona.

- [ ] **Step 3: Import and map the assets**

Extend `SampleName` with five result samples and map `ResultRank` to sample names. Set per-rank volume so perceived loudness is consistent; `hangbao` may use a second low-frequency synthesized accent but must not clip.

- [ ] **Step 4: Verify audio loading in Playwright**

Add a resource-entry assertion that all five result files load after audio unlock and a forced result sequence. The test does not judge artistic quality; manual testing handles that.

---

### Task 7: Result-flow E2E and fifteen-level calibration pass

**Files:**
- Modify: `e2e/golden-level.spec.ts`
- Modify: `README.md`
- Modify: this plan file to mark completed checkboxes during execution

**Interfaces:**
- No new runtime API.

- [ ] **Step 1: Add deterministic E2E result hooks**

In test mode only, expose a small `window.__YIBILIUBAI_TEST__` method that completes the current level with explicit `{ elapsedMs, lives, cuts }`. It must be omitted from production behavior and only assigned when `import.meta.env.MODE === "test"` or a documented query flag is present.

- [ ] **Step 2: Test all five result ranks**

For each rank, force a result, assert `data-rank`, visible label, formatted stats, button lock before sequence completion, and screenshot at `390x844`. Add one reduced-motion test and one sound-off test.

- [ ] **Step 3: Test best-time persistence and retry**

Complete the same level with a slow time, then a faster time, reload, and assert the faster best remains. Click “再来一次” and verify the timer and result state reset.

- [ ] **Step 4: Run full verification**

Run: `npm.cmd run build`

Run: `npm.cmd run test`

Run: `npm.cmd run test:e2e`

Expected: all commands PASS with no console errors or viewport overflow.

- [ ] **Step 5: Manual calibration protocol**

Play each level three times. Record completion time, remaining lives and rank. Adjust only `TIMINGS`; do not change score thresholds from one level to another. Accept the first release when “人上人” is the most frequent first-clear result, “夯爆了” is achievable but rare, and “拉完了” does not dominate any level.

- [ ] **Step 6: Update player documentation**

Document the five ranks, explain that cuts are unlimited, and state that time and remaining life determine evaluation. Do not expose the complete formula in the in-game tutorial.

## Execution Order

Execute Tasks 1–5 and 7 first using silent rank-voice fallback. Task 6 is an explicit asset gate: once the user supplies five same-persona voice files, integrate them and rerun Task 7. The visual result system must remain fully functional before and after voice assets are added.

