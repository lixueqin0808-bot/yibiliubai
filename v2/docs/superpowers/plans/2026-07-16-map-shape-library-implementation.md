# Map Shape Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fifteen near-duplicate level polygons with fifteen distinct, validated map silhouettes while preserving the current art, physics, cutting rules, difficulty data, and mobile layout.

**Architecture:** Add a focused map-shape factory that produces clockwise simple polygons, then add a level factory that converts locked edge indices into the existing `BoundarySegment[]` contract. Keep `Game`, `PhysicsWorld`, cutting, sidewall rendering, and asset loading unchanged unless a regression test proves a compatibility defect.

**Tech Stack:** TypeScript 7, Canvas 2D, Matter.js 0.20, Vitest 4, Playwright 1.61, Vite 8.

## Progress

- [x] Tasks 1 through 5 completed on 2026-07-17: polygon validation, fifteen-shape library, index-based locked edges, campaign geometry checks, and six-map checkpoint.
- [ ] Tasks 6 and 7 remain intentionally paused until the user validates the six representative maps in play.
- [x] Checkpoint refinement completed on 2026-07-17: redesigned the fan and leaf silhouettes, added a clipped fan-rib motif, and added a left-top level indicator. Build, unit, and browser regression tests passed.
- [x] Second checkpoint refinement completed on 2026-07-17: shortened the fan silhouette, repositioned level 8 blades for its lower playable area, and added clipped leaf veins. Build, unit, and browser regression tests passed.
- [x] Fan silhouette replacement completed on 2026-07-17: replaced the shell-like fan with a large fan face, lower fan axis, and a clipped small-fan motif. Build, unit, and browser regression tests passed.
- [x] Final fan-map replacement completed on 2026-07-17: replaced the prior fan map with connected opposing large and small fan faces, a visible central seam, large-fan-only blade spawns, and no small-fan ribs. Build, unit, and browser regression tests passed.

## Global Constraints

- Do not add or regenerate visual assets.
- Do not implement true curved collision or cutting; approximate curves with 12 to 24 polygon vertices.
- Do not implement bomb blades or any other blade trait in this plan.
- Do not change the existing target ratios, blade counts, blade variants, or blade speeds unless a level is geometrically impossible.
- Keep every map as one simple closed region with no holes, disconnected pieces, or self-intersections.
- Run `npm.cmd run build`, `npm.cmd run test`, and `npm.cmd run test:e2e` before handoff.

---

### Task 1: Add Polygon Validation Primitives

**Files:**
- Modify: `src/geometry/polygon.ts`
- Modify: `src/tests/polygon.test.ts`

**Interfaces:**
- Produces: `signedPolygonArea(polygon: Polygon): number`
- Produces: `isSimplePolygon(polygon: Polygon): boolean`
- Consumes: existing `segmentIntersection`, `polygonArea`, and `Polygon`

- [ ] **Step 1: Write failing winding and self-intersection tests**

Add tests proving that clockwise and counter-clockwise polygons have opposite signed areas, a rectangle is simple, and a bow-tie polygon is not simple.

```ts
expect(signedPolygonArea([{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 10, y: 10 }, { x: 10, y: 0 }])).toBeLessThan(0);
expect(isSimplePolygon([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }])).toBe(true);
expect(isSimplePolygon([{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 }])).toBe(false);
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd run test -- src/tests/polygon.test.ts`

Expected: FAIL because the two exports do not exist.

- [ ] **Step 3: Implement signed area and non-adjacent edge intersection checks**

`signedPolygonArea` must use the shoelace sum without `Math.abs`. `isSimplePolygon` must compare every edge pair except identical and adjacent pairs, including the first-last adjacency.

- [ ] **Step 4: Run the focused test**

Run: `npm.cmd run test -- src/tests/polygon.test.ts`

Expected: PASS.

### Task 2: Build the Fifteen-Shape Map Factory

**Files:**
- Create: `src/levels/mapShapes.ts`
- Create: `src/tests/mapShapes.test.ts`

**Interfaces:**
- Produces: `type MapShapeId = "rounded-slab" | "tapered-tablet" | "hex-jade" | "shield" | "octagonal-seal" | "kite" | "star-disc" | "open-fan" | "leaf" | "teardrop" | "ruyi-cloud" | "mountain" | "vertical-slip" | "horizontal-seal" | "bagua"`
- Produces: `MAP_SHAPE_IDS: readonly MapShapeId[]`
- Produces: `createMapShape(shapeId: MapShapeId): Polygon`
- Consumes: `dedupePolygon`, `signedPolygonArea`, `isSimplePolygon`

- [ ] **Step 1: Write failing shape-catalog tests**

Test all fifteen IDs for uniqueness, 3 to 24 vertices, clockwise winding, simple geometry, minimum adjacent edge length of 10, area between 45,000 and 95,000 logical pixels, and bounds inside `x=60..330`, `y=225..640`.

```ts
for (const shapeId of MAP_SHAPE_IDS) {
  const polygon = createMapShape(shapeId);
  expect(polygon.length).toBeGreaterThanOrEqual(3);
  expect(polygon.length).toBeLessThanOrEqual(24);
  expect(signedPolygonArea(polygon)).toBeLessThan(0);
  expect(isSimplePolygon(polygon)).toBe(true);
}
expect(new Set(MAP_SHAPE_IDS.map((id) => JSON.stringify(createMapShape(id)))).size).toBe(15);
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm.cmd run test -- src/tests/mapShapes.test.ts`

Expected: FAIL because `mapShapes.ts` does not exist.

- [ ] **Step 3: Implement reusable shape helpers**

Implement private helpers for arc sampling, coordinate translation, winding normalization, and final validation. Throw a descriptive error containing the shape ID when a generated polygon violates a bound.

- [ ] **Step 4: Implement the first six representative silhouettes**

Implement `tapered-tablet`, `shield`, `kite`, `star-disc`, `open-fan`, and `leaf`. Use at most 20 samples for circular or lens outlines.

- [ ] **Step 5: Implement the remaining nine silhouettes**

Implement `rounded-slab`, `hex-jade`, `octagonal-seal`, `teardrop`, `ruyi-cloud`, `mountain`, `vertical-slip`, `horizontal-seal`, and `bagua`. Keep `ruyi-cloud` shallowly asymmetric and keep `bagua` as an outer octagonal silhouette with no hole.

- [ ] **Step 6: Run the shape tests**

Run: `npm.cmd run test -- src/tests/mapShapes.test.ts`

Expected: PASS for all fifteen shapes.

### Task 3: Add the Level Factory and Index-Based Locked Edges

**Files:**
- Create: `src/levels/createLevel.ts`
- Create: `src/tests/createLevel.test.ts`
- Modify: `src/levels/goldenLevel.ts`

**Interfaces:**
- Produces: `interface LevelSource` with `id`, `shapeId`, `target`, `blades`, optional `guide`, and optional `lockedEdgeIndices`
- Produces: `createLevel(source: LevelSource): LevelDefinition`
- Consumes: `createMapShape(shapeId)`
- Preserves: `LevelDefinition.metalEdges?: BoundarySegment[]`

- [ ] **Step 1: Write failing locked-edge conversion tests**

Create a level with locked edge indices `[0, 2]` and assert that the returned segments exactly equal polygon edges `0 -> 1` and `2 -> 3`. Assert that negative, duplicate, and out-of-range indices throw.

- [ ] **Step 2: Run the test and verify failure**

Run: `npm.cmd run test -- src/tests/createLevel.test.ts`

Expected: FAIL because `createLevel.ts` does not exist.

- [ ] **Step 3: Implement `createLevel`**

Generate the polygon once, validate and deduplicate indices, then map every index to `{ start: polygon[index], end: polygon[(index + 1) % polygon.length] }`. Return the existing `LevelDefinition` shape so `Game.ts` needs no format change.

- [ ] **Step 4: Migrate level 4 as a representative integration**

Replace its inline polygon with `shapeId: "shield"` and its coordinate metal edge with one locked edge index. Keep target and blade movement values unchanged; adjust only blade centers that fail the safety test introduced in Task 4.

- [ ] **Step 5: Run factory and existing level tests**

Run: `npm.cmd run test -- src/tests/createLevel.test.ts src/tests/levels.test.ts`

Expected: PASS.

### Task 4: Add Automatic Level Geometry Safety Tests

**Files:**
- Create: `src/tests/levelGeometry.test.ts`
- Modify: `src/tests/levels.test.ts`

**Interfaces:**
- Consumes: `LEVELS`, `pointInPolygon`, `distanceToPolygonEdge`, `bladeCollisionRadius`, `isSimplePolygon`
- Produces no runtime API.

- [ ] **Step 1: Add campaign-wide safety assertions**

For every level, assert that the polygon is simple, every blade center is inside, every blade has edge clearance of `bladeCollisionRadius(blade) + 2`, and every pair of blades has center distance greater than the sum of collision radii.

- [ ] **Step 2: Add locked-edge integrity assertions**

Assert every `metalEdges` segment matches one complete edge of the initial polygon within a 0.01 tolerance.

- [ ] **Step 3: Run the new tests and record failing levels**

Run: `npm.cmd run test -- src/tests/levelGeometry.test.ts`

Expected: migrated levels may fail until spawn coordinates and edge indices are tuned; failures must name the level ID.

- [ ] **Step 4: Adjust only unsafe spawn coordinates**

Move blade centers toward safe open regions while retaining variant, radius field, speed, and velocity. Do not reduce blade counts to make tests pass.

- [ ] **Step 5: Re-run the safety tests**

Run: `npm.cmd run test -- src/tests/levelGeometry.test.ts`

Expected: PASS.

### Task 5: Deliver the Six-Map Geometry Checkpoint

**Files:**
- Modify: `src/levels/goldenLevel.ts`
- Modify: `e2e/golden-level.spec.ts`

**Interfaces:**
- Consumes: `createLevel`, six representative `MapShapeId` values
- Preserves: current level IDs, progression, target ratios, and UI.

- [ ] **Step 1: Assign representative silhouettes to levels 2, 4, 6, 7, 8, and 9**

Use tapered tablet, shield, kite, star disc, open fan, and leaf respectively. Keep level 1 unchanged until the full migration to avoid disturbing the tutorial checkpoint prematurely.

- [ ] **Step 2: Add a browser geometry probe**

Expose only in development/test builds a canvas data attribute containing the current shape ID, then assert the six selected levels report six distinct IDs. Do not add visible debugging text.

- [ ] **Step 3: Run build and unit tests**

Run: `npm.cmd run build`

Expected: TypeScript and Vite build pass.

Run: `npm.cmd run test`

Expected: all unit tests pass.

- [ ] **Step 4: Run the fifteen-level screenshot test**

Run: `npm.cmd run test:e2e`

Expected: all Playwright tests pass and `test-results/map-1.png` through `map-15.png` are produced.

- [ ] **Step 5: Review the six screenshots before full migration**

Reject the batch if any curved outline has obvious saw-tooth edges, sidewall spikes, detached locked edges, clipped shadows, or blades touching the initial boundary.

### Task 6: Migrate All Fifteen Levels

**Files:**
- Modify: `src/levels/goldenLevel.ts`
- Modify: `src/tests/levels.test.ts`
- Modify: `src/tests/levelGeometry.test.ts`

**Interfaces:**
- Consumes: all fifteen `MapShapeId` values and `createLevel`
- Produces: fifteen level definitions with unique shape IDs.

- [ ] **Step 1: Assign one silhouette to each level**

Use the exact mapping from the design spec. Keep IDs, targets, blade counts, variants, speeds, and velocity vectors unchanged.

- [ ] **Step 2: Convert every locked edge to an index**

Choose complete edges that preserve each level's intended route restriction. Level 4 has one locked edge, levels 5 through 14 retain their current counts, and level 15 retains three.

- [ ] **Step 3: Fix geometry-test failures one level at a time**

Only change blade centers and locked edge indices. If a shape itself fails, fix it in `mapShapes.ts` and re-run all shape tests before continuing.

- [ ] **Step 4: Assert all shape IDs are unique across the campaign**

Update `levels.test.ts` to expect fifteen unique `shapeId` values and preserve the strictly descending target sequence.

- [ ] **Step 5: Run the complete unit suite**

Run: `npm.cmd run test`

Expected: all tests pass.

### Task 7: Mobile Regression, Difficulty Review, and Documentation

**Files:**
- Modify: `e2e/golden-level.spec.ts`
- Modify: `README.md` if present, otherwise create `README.md`
- Modify: `关卡扩展蓝图.md`
- Modify: `待优化清单.md`

**Interfaces:**
- No new runtime API.

- [ ] **Step 1: Extend the all-level browser test**

At 390 x 844, visit all fifteen levels, assert the canvas shape ID, capture a screenshot, and verify the page has no horizontal or vertical overflow.

- [ ] **Step 2: Add desktop containment coverage**

At 1440 x 900, verify the portrait shell remains centered and every map's rendered non-paper pixel bounds remain inside the shell.

- [ ] **Step 3: Run final verification**

Run: `npm.cmd run build`

Expected: PASS.

Run: `npm.cmd run test`

Expected: PASS.

Run: `npm.cmd run test:e2e`

Expected: PASS, including fifteen screenshots.

- [ ] **Step 4: Update player-facing documentation**

Document that the campaign contains fifteen distinct silhouettes and three chapters. Do not advertise bomb blades or traits as implemented features.

- [ ] **Step 5: Record the next-version backlog**

Add a concise backlog entry for a separately designed blade-trait system. First candidate: an 8-second bomb blade that telegraphs and splits into three small four-blade enemies. Record required follow-up work: timer state, warning animation, safe child spawning, overlap resolution, audio, balancing, and tests.

## Final Player Test Checklist

Ask the user to test these exact points:

1. Can all fifteen silhouettes be distinguished immediately?
2. Do round, fan, leaf, and teardrop boundaries reflect blades naturally?
3. Does any valid cross-map cut fail without explanation?
4. Does any blade spawn on an edge, overlap another blade, or become permanently stuck?
5. Does every silver locked edge cover one complete map edge and disappear with a removed region?
6. Does difficulty generally rise from level 1 to level 15 without a sudden unfair spike?

Request three pieces of feedback: best-looking level IDs, uncomfortable level IDs with reasons, and levels that feel clearly too easy or too hard.
