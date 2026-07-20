# Golden Core Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the V2 golden level into the confirmed iSlash-style loop: three recoverable chances, remaining-area bamboo progress, invalid-cut feedback, and a game-native completion flow.

**Architecture:** Keep the existing polygon splitting and Matter.js boundary simulation. Extend `Game` with a small round-state model (`lives`, `recovering`, `completed`) and make the HUD a projection of that state. The new progress asset is split into a base bamboo rail and two independent leaf overlays; CSS owns their breathing animation while TypeScript updates only semantic state and remaining-area width.

**Tech Stack:** TypeScript, Canvas 2D, Matter.js, Vite, Vitest, Playwright, local raster post-processing.

## Global Constraints

- The logical game size stays `390 x 844` and the progress rail occupies `88%` of that width.
- Progress represents **remaining** map area and shrinks toward a fixed cinnabar knot.
- Each level has exactly `3` chances, shown without numeric life text; cutting is unlimited.
- A blade hit removes one chance but preserves the map and blade motion; only the third hit restarts the level.
- An invalid cut changes nothing and does not remove a chance.
- Golden level contains one standard rotating ink blade only; no items, ghost blades, or metal edges.
- Keep the player-visible copy minimal; do not add explanatory text to normal gameplay.

---

### Task 1: Prepare the new progress asset as independently usable layers

**Files:**
- Create: `src/assets/progress-bamboo-rail.webp`
- Create: `src/assets/progress-leaves-left.webp`
- Create: `src/assets/progress-leaves-right.webp`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `小游戏素材/3214e5cd-b413-49a1-a249-f0b234dd1f1c.png`
- Produces: a transparent rail layer, transparent left-leaf layer, transparent right-leaf layer.

- [ ] **Step 1: Copy the supplied source image without overwriting existing assets**

Copy it into `src/assets/progress-bamboo-source.png`.

- [ ] **Step 2: Remove the flat magenta background and validate transparency**

Run the installed chroma-key helper with auto-key border sampling, soft matte, and despill. Confirm transparent corners and no pink fringe around bamboo or leaves.

- [ ] **Step 3: Crop each component into its own layer**

Create these three tight assets from the transparent source:

```text
progress-bamboo-rail.webp: only the horizontal bamboo, both ends kept flat
progress-leaves-left.webp: only the lower-left leaf cluster
progress-leaves-right.webp: only the lower-right leaf cluster
```

- [ ] **Step 4: Optimize the three layers for mobile delivery**

Convert to WebP. Preserve alpha, keep the rail at least 512 pixels wide, and keep each leaf cluster at least 128 pixels on its longest edge.

- [ ] **Step 5: Verify the final assets visually**

Confirm the rail can be horizontally clipped without cutting into leaves, the rail ends remain flat, and the leaf clusters are not mirrored duplicates.

### Task 2: Add testable round-state helpers

**Files:**
- Create: `src/core/roundState.ts`
- Create: `src/tests/roundState.test.ts`
- Modify: `src/core/types.ts`

**Interfaces:**
- Produces `ROUND_LIVES = 3`, `remainingRatio(area, initialArea)`, and `applyBladeHit(lives)`.
- `remainingRatio` returns a clamped value in `[0, 1]` where `1` means the original map is intact.
- `applyBladeHit(3)` returns `{ lives: 2, shouldRestart: false }`; `applyBladeHit(1)` returns `{ lives: 0, shouldRestart: true }`.

- [ ] **Step 1: Write failing state tests**

```ts
import { applyBladeHit, remainingRatio } from "../core/roundState";

it("treats the intact polygon as full remaining area", () => {
  expect(remainingRatio(100, 100)).toBe(1);
  expect(remainingRatio(50, 100)).toBe(0.5);
});

it("restarts only after the third blade hit", () => {
  expect(applyBladeHit(3)).toEqual({ lives: 2, shouldRestart: false });
  expect(applyBladeHit(1)).toEqual({ lives: 0, shouldRestart: true });
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm.cmd run test -- roundState.test.ts`

Expected: failure because `roundState` does not exist.

- [ ] **Step 3: Implement the helper module**

```ts
export const ROUND_LIVES = 3;

export function remainingRatio(area: number, initialArea: number): number {
  return Math.max(0, Math.min(1, area / initialArea));
}

export function applyBladeHit(lives: number): { lives: number; shouldRestart: boolean } {
  const nextLives = Math.max(0, lives - 1);
  return { lives: nextLives, shouldRestart: nextLives === 0 };
}
```

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm.cmd run test -- roundState.test.ts`

Expected: PASS.

### Task 3: Replace percentage HUD with a remaining-area bamboo HUD

**Files:**
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify: `src/core/Game.ts`

**Interfaces:**
- `GameElements` gains `lifeLeaves: HTMLElement[]` and `progressFill: HTMLElement`.
- `Game.updateHud()` sets `progressFill.style.transform = "scaleX(<remaining ratio>)"` and applies a hidden class to spent leaves.

- [ ] **Step 1: Replace the old percentage text markup**

Use a semantic progress section containing three decorative leaf elements, a fixed cinnabar knot element, and one maskable bamboo-fill element. Remove `#progressText` from `index.html` and `src/main.ts`.

- [ ] **Step 2: Implement the 88% rail layout**

Use `inset: 74px 6% auto` for the progress section. Draw the flat-ended bamboo rail as the changing fill, keep the cinnabar knot at `50%`, and position the three life leaves just outside the left rail end.

- [ ] **Step 3: Implement the breathing leaf animation**

Use independent left and right leaf image layers with alternating `opacity`, `transform`, and `animation-delay`. Respect `prefers-reduced-motion` by keeping both layers visible and still.

- [ ] **Step 4: Change `Game.updateProgress()` into `Game.updateHud()`**

Compute `remainingRatio(polygonArea(this.polygon), this.initialArea)`. The bamboo fill begins at full width and shrinks from right to left. The knot position remains unchanged.

- [ ] **Step 5: Verify the HUD at initial state, after a cut, and at completion**

Initial state: full rail and three life leaves. After a successful cut: rail shortens by the removed-area ratio. After a blade hit: one leaf hides. Completion: rail is at or below knot position.

### Task 4: Implement recoverable blade hits and invalid-cut feedback

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `src/core/types.ts`
- Modify: `src/tests/cut.test.ts`

**Interfaces:**
- `GameStatus` includes `"recovering"` instead of `"failed"`.
- `Game.handleBladeHit(point, lineStart, lineEnd)` decrements lives and resumes play after the red feedback delay unless no lives remain.
- `Game.showInvalidCut(start, end)` stores a short gray line effect and leaves polygon, physics, and lives unchanged.

- [ ] **Step 1: Add a failing test for an invalid two-blade-side result**

Add a unit test around the decision helper used by `Game`: when both candidate polygons contain a blade, result is `"invalid"` rather than `"success"` or `"hit"`.

- [ ] **Step 2: Make invalid cuts visually distinct and harmless**

When a valid line intersects the map but cannot discard a blade-free side, draw a gray line for about 180 milliseconds, play the soft invalid sound, and do not mutate the polygon or decrement a life.

- [ ] **Step 3: Change blade-hit behaviour from automatic restart to recovery**

On a collision, retain the polygon and physics world, show the existing red danger line and mark, decrement one life, and lock input for about 520 milliseconds. Resume normal play with remaining lives.

- [ ] **Step 4: Restart only after the final chance is spent**

When `applyBladeHit` returns `shouldRestart: true`, show the same red feedback, then call `restart()` after the feedback window. `restart()` restores three lives and full bamboo rail.

- [ ] **Step 5: Run unit tests**

Run: `npm.cmd run test`

Expected: all geometry, collision, and new round-state tests pass.

### Task 5: Make successful cuts feel like separated material, not a fade-out

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `src/levels/goldenLevel.ts`

**Interfaces:**
- `CutEffect` gains `rotation`, `driftDistance`, and `duration` fields.
- The removed polygon is rendered with a strong early separation and exits within 360 milliseconds.

- [ ] **Step 1: Reduce nonessential particle density**

Use 8 to 12 particles in normal mode and 4 particles in reduced-motion mode. Keep particles close to the cut seam.

- [ ] **Step 2: Strengthen separated-board motion**

During the first 100 milliseconds, move the discarded polygon quickly along the cut normal. Then continue a smaller drift with a 2 to 5 degree rotation before fading out. The retained polygon must update immediately on the first frame.

- [ ] **Step 3: Synchronize the seam, bamboo shrink, sound, and vibration**

Start all feedback on the same frame. Keep input locked for no more than 180 milliseconds after a successful cut.

- [ ] **Step 4: Verify via Playwright screenshot and manual swipe**

Confirm the map remains readable, the blade remains visible, and the cut feedback does not delay the next safe gesture.

### Task 6: Replace generic dialogs with the confirmed game loop controls

**Files:**
- Modify: `index.html`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify: `src/core/Game.ts`

**Interfaces:**
- `Game` exposes `openSettings()` and `closeSettings()` only if settings state is kept in game code; otherwise menu state stays in `main.ts`.
- Result dialog contains `levelSelect`, `again`, and `nextLevel` icon buttons, with `nextLevel` as the primary action.

- [ ] **Step 1: Reduce normal-play controls to pause and settings**

Remove the permanent top sound button and level badge. Keep a left-bottom pause button and right-bottom settings button.

- [ ] **Step 2: Implement settings expansion upward from the right-bottom button**

The expanded stack contains only return-to-home and music toggle actions. Closing settings restores the normal screen without pausing gameplay.

- [ ] **Step 3: Rebuild pause and completion layers around icon-first actions**

Pause layer: continue, replay, level selection. Completion layer: level selection, replay, next level. Keep the finished map visible under a dark scrim and make next level visually primary.

- [ ] **Step 4: Keep level progression local and minimal**

For the golden sample, next level restarts the same sample and does not claim that a second level exists. Persist no progress until the five-level data model is introduced.

- [ ] **Step 5: Run build and browser tests**

Run: `npm.cmd run build`

Run: `npm.cmd run test:e2e`

Expected: build succeeds and the test flow can start, cut, recover after one hit, and reopen the level.

### Task 7: Final visual and interaction acceptance

**Files:**
- Modify only if a defect is found in files from Tasks 1 to 6.

- [ ] **Step 1: Test at desktop and mobile-sized viewports**

Use `390 x 844` and a desktop browser constrained to the game shell. Confirm the rail remains 88% wide and no leaf or knot overlaps controls.

- [ ] **Step 2: Test the confirmed loop end-to-end**

1. Start with three life leaves and a full rail.
2. Make a safe cut and confirm rail shrinks by remaining area.
3. Make an invalid cut and confirm no life is lost.
4. Hit the blade once and confirm one leaf is lost but map stays cut.
5. Exhaust the remaining lives and confirm only then does the level restart.
6. Reach the knot and confirm the completion layer prioritizes next level.

- [ ] **Step 3: Commit the scoped implementation**

```bash
git add -- v2/index.html v2/src/core v2/src/assets/progress-* v2/src/main.ts v2/src/styles.css v2/src/tests
git commit -m "feat(v2): rebuild golden level core loop"
```

## Self-Review

- Spec coverage: lives, unlimited cuts, remaining-area rail, fixed target knot, breathing leaves, invalid cuts, physical separation, minimal controls, and completion flow all have dedicated tasks.
- No placeholder scan: no unresolved implementation choice remains in the plan; golden level intentionally omits future five-level mechanics.
- Type consistency: `remainingRatio`, `applyBladeHit`, `Game.updateHud`, `Game.handleBladeHit`, and `Game.showInvalidCut` have one stated responsibility each.
