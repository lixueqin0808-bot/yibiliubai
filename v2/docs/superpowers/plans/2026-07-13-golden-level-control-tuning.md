# Golden Level Control Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the sample level footprint and make cutting immediate and robust outside the canvas.

**Architecture:** Keep the existing logical coordinate system and scale only level data plus blade rendering. Move active gesture listeners to `window`, while preserving canvas-only gesture starts and the existing geometry engine.

**Tech Stack:** TypeScript, Canvas 2D, Matter.js, Web Audio, Vitest, Playwright

## Global Constraints

- Keep the portrait 390 x 844 logical viewport.
- Do not add dependencies or external audio assets.
- Keep visual and collision blade sizes aligned.

---

### Task 1: Scale Gameplay Geometry

**Files:**
- Modify: `src/levels/goldenLevel.ts`
- Modify: `src/core/Game.ts`

- [ ] Replace the polygon coordinates with an approximately 84% centered version.
- [ ] Set blade collision radius to 14 and derive render scale from that radius.
- [ ] Run `npm.cmd run test` and confirm all geometry tests pass.

### Task 2: Make Gestures Immediate and Resilient

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `e2e/golden-level.spec.ts`

- [ ] Track one active pointer from canvas `pointerdown` through window move/up/cancel.
- [ ] Attempt safe polygon completion during movement and retain pointer-up fallback.
- [ ] Add Playwright assertions for progress before release and dragging beyond the game frame.

### Task 3: Tighten Success Audio and Verify

**Files:**
- Modify: `src/audio/AudioManager.ts`

- [ ] Replace the long tonal success cue with a short filtered slice and compact impact.
- [ ] Run `npm.cmd run test`, `npm.cmd run build`, and `npm.cmd run test:e2e`.
- [ ] Inspect mobile and desktop screenshots for margins, sizing, and overlap.
