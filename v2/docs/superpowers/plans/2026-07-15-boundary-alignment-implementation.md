# Boundary Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Align blade visual size, collision radius, and locked-edge rendering around one shared map boundary.

**Architecture:** `goldenLevel.ts` exports one blade collision-radius helper used by `Game` and `PhysicsWorld`. `Game` renders non-locked map outlines separately from a 45-degree clipped edge strip for visible locked boundaries.

**Tech Stack:** TypeScript, Canvas 2D, Vite, Vitest, Playwright.

## Global Constraints

- Preserve existing 15 level polygons, target ratios, and blade counts.
- Do not restore a corner-joint asset.
- Keep touch and mouse gestures unchanged.

---

### Task 1: Unify visible blade size and collision radius

**Files:**
- Modify: `src/levels/goldenLevel.ts`
- Modify: `src/core/Game.ts`
- Test: `src/tests/physics.test.ts`

- [x] Export `bladeCollisionRadius(blade)` with a four-blade radius of 19 and five-blade radius of 25.
- [x] Use that helper for pointer hit checks, swept hits, and `PhysicsWorld` construction.
- [x] Add a unit assertion that a four-blade radius is smaller than five-blade radius and both exceed the old smallest radius.

### Task 2: Replace locked map outlines with mitered strips

**Files:**
- Modify: `src/core/Game.ts`
- Test: `src/tests/metalEdges.test.ts`

- [x] Add a helper that recognizes an original polygon edge currently covered by `visibleBoundarySegments`.
- [x] Skip the default polygon stroke on locked edges.
- [x] Draw each visible locked edge as a 10-pixel repeated texture clipped to a local quadrilateral with 45-degree end bevels.
- [x] Keep every strip centered on the map edge so it covers the prior outline.

### Task 3: Browser regression coverage

**Files:**
- Modify: `e2e/golden-level.spec.ts`

- [x] Extend the locked-edge test to assert the level-four canvas contains the new edge-strip asset and no corner asset.
- [x] Capture the level-four screenshot after the edge is rendered.

### Task 4: Validate and prepare phone testing

**Files:**
- Verify: project scripts

- [x] Run build, unit tests, and browser tests.
- [x] Start Vite with `--host 0.0.0.0` on port 4175 so a phone on the same Wi-Fi can use the computer LAN address.
- [x] Report the exact phone URL and focused test checklist.
