import type { BoundarySegment } from "../geometry/polygon";
import { createMapShape, type MapShapeId } from "./mapShapes";
import type { BladeConfig, LevelDefinition } from "./goldenLevel";
import type { LevelTiming } from "../results/resultScoring";

export interface LevelSource {
  id: number;
  shapeId: MapShapeId;
  target: number;
  timing?: LevelTiming;
  blades: BladeConfig[];
  guide?: { start: { x: number; y: number }; end: { x: number; y: number } };
  lockedEdgeIndices?: number[];
}

function edgeSegments(shapeId: MapShapeId, indices: number[] | undefined): BoundarySegment[] | undefined {
  if (!indices?.length) return undefined;
  const polygon = createMapShape(shapeId);
  const unique = new Set<number>();
  for (const index of indices) {
    if (!Number.isInteger(index) || index < 0 || index >= polygon.length) {
      throw new Error(`${shapeId} has an invalid locked edge index: ${index}`);
    }
    if (unique.has(index)) throw new Error(`${shapeId} repeats locked edge index: ${index}`);
    unique.add(index);
  }
  return [...unique].map((index) => ({
    start: polygon[index],
    end: polygon[(index + 1) % polygon.length],
  }));
}

export function createLevel(source: LevelSource): LevelDefinition {
  const polygon = createMapShape(source.shapeId);
  return {
    id: source.id,
    shapeId: source.shapeId,
    target: source.target,
    timing: source.timing ?? { fastMs: 12_000, standardMs: 24_000, relaxedMs: 45_000 },
    polygon,
    blades: source.blades,
    guide: source.guide,
    metalEdges: edgeSegments(source.shapeId, source.lockedEdgeIndices),
  };
}
