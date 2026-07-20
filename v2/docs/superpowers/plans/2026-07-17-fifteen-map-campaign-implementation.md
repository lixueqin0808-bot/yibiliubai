# Fifteen Map Campaign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all fifteen campaign levels to fifteen validated map definitions, replace level 8's failed fan with a teardrop, and add restrained identifying motifs without changing the existing game loop or difficulty data.

**Architecture:** `mapShapes.ts` remains the only geometry catalog and produces simple clockwise polygons. `createLevel.ts` converts shape IDs and locked edge indices into the existing level contract. `Game.ts` renders optional clipped motifs by shape ID while physics and cutting continue to use the same polygon boundary.

**Tech Stack:** TypeScript, Canvas 2D, Matter.js, Vitest, Playwright, Vite.

**Status:** Completed on 2026-07-17. Build, 30 unit tests, and 6 Playwright tests pass.

## Global Constraints

- Do not add or regenerate image assets.
- Do not implement true curved collision or curved cutting.
- Do not change level IDs, targets, blade counts, blade variants, speeds, or velocity vectors.
- Only blade spawn coordinates and locked edge indices may change for geometry safety.
- Do not use holes, disconnected pieces, narrow necks, or deep concave pockets.
- Run `npm.cmd run build`, `npm.cmd run test`, and `npm.cmd run test:e2e` before handoff.

---

### Task 1: Replace the Shape Catalog With the Final Fifteen Shapes

**Files:**
- Modify: `src/levels/mapShapes.ts`
- Modify: `src/tests/mapShapes.test.ts`

**Interfaces:**
- Produces: `MAP_SHAPE_IDS` containing exactly `rounded-slab`, `tapered-tablet`, `triangle`, `shield`, `hex-jade`, `kite`, `star-disc`, `teardrop`, `leaf`, `mountain`, `wide-h`, `heart`, `vertical-slip`, `lantern`, and `bagua`.
- Preserves: `createMapShape(id: MapShapeId): Polygon`.

- [ ] **Step 1: Update the catalog test to assert the final IDs**

```ts
expect(MAP_SHAPE_IDS).toEqual([
  "rounded-slab", "tapered-tablet", "triangle", "shield", "hex-jade",
  "kite", "star-disc", "teardrop", "leaf", "mountain", "wide-h",
  "heart", "vertical-slip", "lantern", "bagua",
]);
```

Keep the existing assertions for uniqueness, clockwise winding, simple geometry, area `45_000..95_000`, vertex count `3..24`, minimum edge length `10`, and safety bounds `x=60..330`, `y=225..640`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd run test -- src/tests/mapShapes.test.ts`

Expected: FAIL because the catalog still contains the fan and older unused shapes.

- [ ] **Step 3: Replace the four retired shapes and keep the eleven accepted shapes**

Use these new polygon definitions:

```ts
case "triangle": return [
  { x: 195, y: 230 }, { x: 325, y: 620 }, { x: 65, y: 620 },
];

case "wide-h": return [
  { x: 70, y: 240 }, { x: 150, y: 240 }, { x: 150, y: 380 },
  { x: 240, y: 380 }, { x: 240, y: 240 }, { x: 320, y: 240 },
  { x: 320, y: 630 }, { x: 240, y: 630 }, { x: 240, y: 490 },
  { x: 150, y: 490 }, { x: 150, y: 630 }, { x: 70, y: 630 },
];

case "heart": return [
  { x: 195, y: 630 }, { x: 105, y: 545 }, { x: 68, y: 430 },
  { x: 76, y: 330 }, { x: 126, y: 260 }, { x: 178, y: 278 },
  { x: 195, y: 315 }, { x: 212, y: 278 }, { x: 264, y: 260 },
  { x: 314, y: 330 }, { x: 322, y: 430 }, { x: 285, y: 545 },
];

case "lantern": return [
  { x: 150, y: 238 }, { x: 240, y: 238 }, { x: 252, y: 270 },
  { x: 300, y: 320 }, { x: 320, y: 430 }, { x: 300, y: 540 },
  { x: 252, y: 590 }, { x: 240, y: 622 }, { x: 150, y: 622 },
  { x: 138, y: 590 }, { x: 90, y: 540 }, { x: 70, y: 430 },
  { x: 90, y: 320 }, { x: 138, y: 270 },
];
```

Remove `open-fan`, `octagonal-seal`, `ruyi-cloud`, and `horizontal-seal` from the type catalog and switch. Keep the existing accepted geometry for the other eleven IDs.

- [ ] **Step 4: Run shape tests**

Run: `npm.cmd run test -- src/tests/mapShapes.test.ts`

Expected: PASS for all fifteen shapes. If a declared polygon violates the existing numeric safety contract, correct the whole shape definition before continuing; do not weaken the assertions.

### Task 2: Add the Final Motif Renderer and Remove Fan Rendering

**Files:**
- Modify: `src/core/Game.ts`
- Modify: `e2e/golden-level.spec.ts`

**Interfaces:**
- Consumes: `this.level.shapeId`.
- Produces no gameplay API; motifs are clipped Canvas strokes.

- [ ] **Step 1: Add a browser assertion that the retired fan is absent**

In the representative-shape browser test, expect level 8 to expose `data-shape="teardrop"`. Add a page evaluation that confirms no canvas dataset reports `open-fan` while visiting all fifteen levels.

- [ ] **Step 2: Run the browser test and verify failure**

Run: `npm.cmd run test:e2e -- --grep "distinct map silhouettes"`

Expected: FAIL because level 8 still uses `open-fan`.

- [ ] **Step 3: Replace `drawMapMotif` with shape-specific dispatch**

```ts
private drawMapMotif(ctx: CanvasRenderingContext2D): void {
  switch (this.level.shapeId) {
    case "star-disc": this.drawStarDiscMotif(ctx); break;
    case "leaf": this.drawLeafMotif(ctx); break;
    case "hex-jade": this.drawHexJadeMotif(ctx); break;
    case "vertical-slip": this.drawSlipMotif(ctx); break;
    case "lantern": this.drawLanternMotif(ctx); break;
    case "bagua": this.drawBaguaMotif(ctx); break;
  }
}
```

Delete every `open-fan` branch, fan rib, seam, hub, and small-fan drawing command. Keep the accepted leaf motif unchanged. Add restrained line motifs at `rgba(228, 231, 224, 0.14..0.18)`:

- Star disc: one centered five-point star outline with five short radial extensions.
- Hex jade: one inset six-sided outline.
- Vertical slip: horizontal lines at `y=350` and `y=520`.
- Lantern: five vertical curved ribs and horizontal bands at `y=275` and `y=585`.
- Bagua: eight rotated trigram groups at radius `125`, each using three short lines; alternate one broken line per group and draw no circular dots.

- [ ] **Step 4: Build after renderer changes**

Run: `npm.cmd run build`

Expected: PASS with no stale `open-fan` type reference.

### Task 3: Migrate All Fifteen Level Definitions

**Files:**
- Modify: `src/levels/goldenLevel.ts`
- Modify: `src/tests/levels.test.ts`
- Modify: `src/tests/levelGeometry.test.ts`

**Interfaces:**
- Consumes: `createLevel(source: LevelSource)` and the final fifteen `MapShapeId` values.
- Produces: fifteen `LevelDefinition` objects with required `shapeId` values.

- [ ] **Step 1: Replace level assertions with the final mapping**

```ts
expect(LEVELS.map((level) => level.shapeId)).toEqual([
  "rounded-slab", "tapered-tablet", "triangle", "shield", "hex-jade",
  "kite", "star-disc", "teardrop", "leaf", "mountain", "wide-h",
  "heart", "vertical-slip", "lantern", "bagua",
]);
expect(new Set(LEVELS.map((level) => JSON.stringify(level.polygon))).size).toBe(15);
```

Preserve the current target, blade-count, metal-edge-count, and descending-target assertions.

- [ ] **Step 2: Run level tests and verify failure**

Run: `npm.cmd run test -- src/tests/levels.test.ts`

Expected: FAIL because nine levels still use inline polygons and level 8 is still the retired fan.

- [ ] **Step 3: Convert every level to `createLevel`**

Use the exact mapping above. Preserve every existing blade's variant, radius field, speed, velocity, target, and guide. Start with these locked edge indices, preserving the existing edge counts:

```ts
const lockedEdgesByLevel = {
  4: [2], 5: [1, 4], 6: [1, 3], 7: [2, 7], 8: [3, 10],
  9: [4, 15], 10: [1, 5], 11: [2, 8], 12: [3, 9],
  13: [1, 4], 14: [3, 9], 15: [0, 2, 5],
};
```

Level 1 becomes `createLevel({ shapeId: "rounded-slab", ... })` and retains its guide. Level 3 becomes `triangle`; level 5 becomes `hex-jade`; level 8 becomes `teardrop`; levels 10 through 15 become `mountain`, `wide-h`, `heart`, `vertical-slip`, `lantern`, and `bagua`.

- [ ] **Step 4: Run geometry tests and adjust only unsafe centers**

Run: `npm.cmd run test -- src/tests/levels.test.ts src/tests/levelGeometry.test.ts`

Expected: initial failures name the exact level and blade. Move only failing `x` and `y` values toward the nearest broad interior region. For level 11, keep every blade in a corridor at least `2 * bladeCollisionRadius + 4` wide. Do not remove blades or lower speed.

- [ ] **Step 5: Re-run complete unit suite**

Run: `npm.cmd run test`

Expected: all unit tests pass with fifteen unique shape IDs and no detached locked edge.

### Task 4: Fifteen-Level Browser Regression and Documentation

**Files:**
- Modify: `e2e/golden-level.spec.ts`
- Modify: `README.md`
- Modify: `docs/superpowers/plans/2026-07-17-fifteen-map-campaign-implementation.md`

**Interfaces:**
- No new runtime API.

- [ ] **Step 1: Expand the all-level browser assertion**

Visit all fifteen unlocked levels at `390 x 844`. For each level, assert the exact final `data-shape`, capture `test-results/map-<id>.png`, and verify the document has no horizontal or vertical overflow. At `1440 x 900`, verify the portrait shell remains centered.

- [ ] **Step 2: Run final verification**

Run: `npm.cmd run build`

Expected: PASS.

Run: `npm.cmd run test`

Expected: all unit tests PASS.

Run: `npm.cmd run test:e2e`

Expected: all Playwright tests PASS and all fifteen screenshots are generated.

- [ ] **Step 3: Visually inspect all screenshots**

Reject a map if it has a detached sidewall, a seam spike, a blade touching the initial boundary, a motif stronger than the blades, or a concave pocket narrower than `54` logical pixels. Fix the responsible whole shape or spawn set and repeat all three verification commands.

- [ ] **Step 4: Update player-facing documentation and mark this plan complete**

Document the fifteen final map identities and state that complex concave maps and smooth curve rendering are future work. Mark every completed task checkbox in this plan; do not claim Git commits because this `v2` directory is not a Git repository.

## Player Test Handoff

Ask the player to test:

1. Whether the fifteen maps are distinguishable during normal play.
2. Whether level 8 is a clean water drop with no fan remnants.
3. Whether H-shaped level 11 or heart-shaped level 12 can trap a blade.
4. Whether motifs identify star disc, leaf, lantern, bamboo slip, and bagua without obscuring blades.
5. Whether difficulty still rises generally from level 1 through level 15.

Request three responses: the best-looking level IDs, any level where a blade sticks or clips, and any sudden difficulty spike.
