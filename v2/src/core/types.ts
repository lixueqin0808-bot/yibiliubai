export interface Point {
  x: number;
  y: number;
}

export type Polygon = Point[];

export type GameStatus = "playing" | "paused" | "recovering" | "completed";

export interface CutPreview {
  start: Point;
  end: Point;
  danger: boolean;
}
