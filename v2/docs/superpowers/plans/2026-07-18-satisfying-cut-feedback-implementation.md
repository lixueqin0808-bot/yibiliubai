# 爽切反馈链 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把每次有效切割升级为低延迟、方向明确、具有爆发和释放感的完整反馈链，同时保持移动端输入、物理和性能稳定。

**Architecture:** 新建 `CutFeedbackController` 管理表现状态和时间参数，`Game` 保留切割判定与 Canvas 绘制。控制器只接收切线、移除多边形、面积和时间，输出可绘制快照；音频继续由 `AudioManager` 分层播放。

**Tech Stack:** TypeScript 7、Canvas 2D、Web Audio/HTMLAudioElement、Vibration API、Vitest、Playwright、Vite。

## Global Constraints

- 成功切割后的可感知反馈延迟低于 100ms。
- 30–50ms 停顿只影响表现，不丢失指针事件，不改变物理时间步。
- 切除区域必须沿移除侧法线产生明确位移，不得只淡出。
- 切割声音由锋利前层、材质中层和低频后层组成。
- 单次切割不播放语音。
- `prefers-reduced-motion` 下减少震屏、位移和粒子，但保留切光、进度和声音。
- 连续快速切割不得造成输入丢失、声音无限叠加或永久冻结。
- `v2` 当前不是 Git 仓库；每个任务以测试通过作为检查点。
- 最终必须运行 `npm.cmd run build`、`npm.cmd run test`、`npm.cmd run test:e2e`。

---

### Task 1: CutFeedbackController state machine

**Files:**
- Create: `src/feedback/CutFeedbackController.ts`
- Create: `src/tests/cutFeedbackController.test.ts`

**Interfaces:**
- Produces: `start(input)`, `snapshot(now)`, `clear()`, `isActive(now)`.
- Snapshot fields: `phase`, `progress`, `lineAlpha`, `removedOffset`, `removedRotation`, `shake`, `particles`.

- [ ] **Step 1: Write failing deterministic tests**

Test these exact contracts:

- At `startedAt`, phase is `impact` and removed offset is zero.
- At `startedAt + 45`, phase changes to `release`.
- Offset grows in the supplied normal direction and scales within a bounded range based on removed-area ratio.
- At `startedAt + 520`, the controller is inactive.
- Reduced motion caps offset at 8 logical pixels and particle count at 4.
- Starting a new cut replaces the previous feedback cleanly.

- [ ] **Step 2: Run and verify failure**

Run: `npm.cmd run test -- src/tests/cutFeedbackController.test.ts`

Expected: FAIL because the controller does not exist.

- [ ] **Step 3: Implement typed input and snapshot**

```ts
export interface CutFeedbackInput {
  lineStart: Point;
  lineEnd: Point;
  removed: Polygon;
  normal: Point;
  removedAreaRatio: number;
  startedAt: number;
  reduceMotion: boolean;
}

export type CutFeedbackPhase = "impact" | "release" | "settle" | "inactive";
```

Use fixed phase boundaries `45ms`, `260ms`, `520ms`. Clamp removed translation to 8–26 logical pixels and rotation to at most 0.08 radians. Particle count is 4 in reduced motion and 8–16 otherwise based on removed-area ratio.

- [ ] **Step 4: Run the focused test**

Run: `npm.cmd run test -- src/tests/cutFeedbackController.test.ts`

Expected: PASS.

---

### Task 2: Replace ad-hoc cut timing in Game

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `src/tests/cut.test.ts`

**Interfaces:**
- Consumes: `CutFeedbackController.start()` and `.snapshot()`.
- Removes duplicated feedback timing from `Game.cutEffect`, while preserving cut geometry.

- [ ] **Step 1: Add a regression test for uninterrupted rapid cuts**

Write a test around the pure cut/state boundary asserting two valid cuts less than 200ms apart both update remaining area and effective-cut count. The test must not require a real timer or browser pointer event.

- [ ] **Step 2: Integrate the controller after successful split**

Keep the existing normal calculation. Pass `polygonArea(removed) / initialArea` and the full removed polygon to `start()`. Replace `freezeUntil = now + 55` with a presentation-only impact window. Keep `inputLockedUntil` no longer than 90ms so responsive rapid cutting remains possible.

- [ ] **Step 3: Preserve immediate HUD update**

Call `updateHud()` in the same synchronous task as polygon replacement. Result completion may be scheduled after the final cut feedback, but progress cannot wait for animation completion.

- [ ] **Step 4: Verify cut and geometry suites**

Run: `npm.cmd run test -- src/tests/cut.test.ts src/tests/polygon.test.ts src/tests/metalEdges.test.ts`

Expected: PASS.

---

### Task 3: Directional removed-piece rendering and impact flash

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `src/styles.css`
- Modify: `e2e/golden-level.spec.ts`

**Interfaces:**
- Consumes: `CutFeedbackSnapshot` each animation frame.

- [ ] **Step 1: Render the removed polygon from snapshot state**

Save the Canvas state, translate by `removedOffset`, rotate around the removed polygon centroid by `removedRotation`, draw the map material clipped to `removed`, then restore. Keep it above the background but below live blades and danger feedback.

- [ ] **Step 2: Render a two-stage cut line**

During impact, draw a 3px silver-white core and 8px low-alpha bloom. During release, reduce bloom quickly while retaining a thin 1px afterimage. The line must disappear by 420ms.

- [ ] **Step 3: Derive shake from the controller**

Apply the snapshot's bounded shake to the map/effects render transform, not to the DOM shell. Controls and progress bar must remain stationary and readable.

- [ ] **Step 4: Add Playwright pixel and layout assertions**

Capture frames immediately before cut, 60ms after cut and 300ms after cut. Assert the canvas changed, the progress clip updated, and `.game-shell` bounding box did not move or overflow.

---

### Task 4: Area-scaled directional ink dispersal

**Files:**
- Modify: `src/feedback/CutFeedbackController.ts`
- Modify: `src/core/Game.ts`
- Modify: `src/tests/cutFeedbackController.test.ts`

**Interfaces:**
- Snapshot particles contain deterministic origin, velocity, size, life when an injected random function is supplied in tests.

- [ ] **Step 1: Add seeded particle tests**

Assert a larger removed-area ratio creates more particles than a small cut, every particle velocity has a positive dot product with the removed-side normal after bounded scatter, and all particles expire by 600ms.

- [ ] **Step 2: Render particles with pressure curve**

Particle alpha rises quickly for 40ms and decays to zero. Size expands slightly during release. Use dark ink particles with a small minority of light paper-fiber flecks; no decorative colored particles.

- [ ] **Step 3: Add a frame-budget guard**

Cap particles at 16 per cut and keep only one active removed polygon. A new cut may replace the old removed-piece animation after preserving its already-applied gameplay state.

- [ ] **Step 4: Verify controller tests**

Run: `npm.cmd run test -- src/tests/cutFeedbackController.test.ts`

Expected: PASS.

---

### Task 5: Three-layer cut audio and overlap control

**Files:**
- Modify: `src/audio/AudioManager.ts`
- Create: `src/tests/audioPolicy.test.ts`

**Interfaces:**
- Produces: `playCutSuccess(intensity: number)`.
- Intensity is clamped to `0..1` from removed-area ratio.

- [ ] **Step 1: Extract and test a pure audio policy**

Create a function returning three layer options. Assert:

- Front layer starts at 0ms and remains the loudest perceived layer.
- Material layer starts at 15–35ms.
- Low-frequency/dispersal layer starts at 70–110ms.
- Large cuts increase low layer modestly but never above the front layer.
- Calls inside a 70ms overlap window attenuate the older tail instead of stacking unboundedly.

- [ ] **Step 2: Replace `playSuccess()`**

Reuse `cut-success.wav`, `cut-paper.wav` and `ink-dispersal.wav`. Rename the public method to `playCutSuccess(intensity)` and drive volume/duration from the tested policy. Keep `playMetalBlock`, `playBladeHit`, `playLifeLost` and UI audio independent.

- [ ] **Step 3: Verify audio policy and build**

Run: `npm.cmd run test -- src/tests/audioPolicy.test.ts`

Run: `npm.cmd run build`

Expected: PASS.

---

### Task 6: Haptics, reduced motion and lifecycle cleanup

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `src/feedback/CutFeedbackController.ts`
- Modify: `src/tests/cutFeedbackController.test.ts`

**Interfaces:**
- No new public API.

- [ ] **Step 1: Centralize haptic policy**

Successful cut uses `navigator.vibrate(10)` for small cuts and `navigator.vibrate(16)` for large cuts. Blade hit keeps a stronger 24ms pattern. Do nothing when vibration is unsupported.

- [ ] **Step 2: Clear feedback on state transitions**

Call `feedback.clear()` on restart, level load, game over and leaving to level selection. Pausing freezes visual elapsed time; resume continues without jumping to the end.

- [ ] **Step 3: Verify reduced-motion behavior**

In Playwright emulation, assert progress and cut line still update while map displacement and shake remain below reduced-motion caps.

---

### Task 7: Full browser handoff and manual feel calibration

**Files:**
- Modify: `e2e/golden-level.spec.ts`
- Modify: `README.md`
- Modify: this plan file to mark completed checkboxes during execution

**Interfaces:**
- No new runtime API.

- [ ] **Step 1: Run automated verification**

Run: `npm.cmd run build`

Run: `npm.cmd run test`

Run: `npm.cmd run test:e2e`

Expected: all PASS with no console errors, non-finite canvas state or viewport overflow.

- [ ] **Step 2: Test five specific player scenarios**

Ask the player to test: a tiny cut, a large cut, two rapid cuts, a cut near a blade, and the final winning cut. Request feedback on immediacy, clarity, sound balance, shake comfort and whether the removed side is obvious.

- [ ] **Step 3: Tune only feedback constants**

During feel calibration, modify phase durations, offsets, layer volumes, particle count and shake amplitudes only. Do not alter polygon splitting, collision radius, level target or scoring thresholds to compensate for feedback problems.

- [ ] **Step 4: Document final constants**

Add a README section listing impact duration, release duration, input lock, haptic durations and audio layer delays so later changes do not silently regress the approved feel.

## Execution Order

Implement the magic-result plan first through its silent-voice fallback, then execute this cut-feedback plan. Integrate formal same-persona rank voices when the five approved files are available. Run the complete build, unit and E2E suite after each plan rather than waiting until both are finished.

