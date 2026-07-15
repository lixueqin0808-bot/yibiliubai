# Art 2.0 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the V2 gameplay assets with the approved Art 2.0 set, render locked edges without a separate corner sprite, and prevent blades from freezing after a cut changes the polygon.

**Architecture:** Game rendering imports the four approved assets from `src/assets` and keeps map/edge texture drawing in `Game`. `PhysicsWorld` owns post-boundary relocation so every blade has a valid radius-safe position after a polygon cut.

**Tech Stack:** TypeScript, Canvas 2D, Vite, Vitest, Playwright.

## Global Constraints

- Keep all 15 levels and their existing difficulty values.
- Do not add a standalone corner-joint image.
- Locked edge segments must disappear with removed map pieces.
- Preserve mouse and touch play.

---

### Task 1: Install approved Art 2.0 files

**Files:**
- Modify: `src/assets/ink-blade-four.webp`
- Modify: `src/assets/ink-blade-five.webp`
- Modify: `src/assets/ink-slate-map-texture.webp`
- Modify: `src/assets/ink-iron-edge-strip.webp`

- [x] Copy the approved four-blade, five-blade, map texture, and edge strip into the existing asset names.
- [x] Verify each replacement exists and has non-zero size.

### Task 2: Render continuous locked edges

**Files:**
- Modify: `src/core/Game.ts`
- Test: `src/tests/metalEdges.test.ts`

- [x] Remove corner-joint image loading and all independent corner sprite drawing.
- [x] Draw each visible locked segment from the repeated edge texture with round line caps, so endpoint overlap comes from the same material.
- [x] Keep `visibleBoundarySegments` as the source of truth so removed map pieces remove their locked edge portions.
- [x] Run the metal-edge unit tests.

### Task 3: Reconcile blades after cuts

**Files:**
- Modify: `src/physics/PhysicsWorld.ts`
- Modify: `src/core/Game.ts`
- Test: `src/tests/physics.test.ts`

- [x] Add a boundary reconciliation method that finds a radius-safe interior position after `setBoundary`.
- [x] On failure to find one, push the blade inward from the closest edge with deterministic direction sampling.
- [x] Add a regression test where a polygon boundary moves past a blade near a corner.
- [x] Call reconciliation through the existing `setBoundary` path after every successful cut.
- [x] Run physics and full unit tests.

### Task 4: Build and browser verification

**Files:**
- Verify: `src/core/Game.ts`
- Verify: `e2e/golden-level.spec.ts`

- [x] Run `npm.cmd run build`.
- [x] Run `npm.cmd run test`.
- [x] Run `npm.cmd run test:e2e`.
- [x] Capture desktop and mobile screenshots and check that the map is visible, both blade variants render, and locked edges have no separate corner buttons.
