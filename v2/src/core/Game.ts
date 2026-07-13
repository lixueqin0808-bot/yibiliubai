import type { CutPreview, GameStatus, Point, Polygon } from "./types";
import { AudioManager } from "../audio/AudioManager";
import { segmentHitsCircle, sweptCircleHitsSegment } from "../geometry/collision";
import { splitPolygon } from "../geometry/cut";
import { lineSide, pointInPolygon, polygonArea } from "../geometry/polygon";
import { GOLDEN_LEVEL, GOLDEN_POLYGON, LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../levels/goldenLevel";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import backgroundUrl from "../assets/xuan-paper-background.webp";
import dangerMarkUrl from "../assets/danger-mark.webp";
import inkBladeUrl from "../assets/ink-blade.webp";
import inkTextureUrl from "../assets/ink-map-texture.webp";

interface GameElements {
  progressText: HTMLElement;
  progressBar: HTMLElement;
  tip: HTMLElement;
  pauseDialog: HTMLDialogElement;
  resultDialog: HTMLDialogElement;
  resultMeta: HTMLElement;
  stars: HTMLElement;
}

interface CutEffect {
  lineStart: Point;
  lineEnd: Point;
  removed: Polygon;
  startedAt: number;
  normal: Point;
  particles: InkParticle[];
}

interface InkParticle {
  origin: Point;
  velocity: Point;
  size: number;
  life: number;
}

function loadImage(source: string): HTMLImageElement {
  const image = new Image();
  image.src = source;
  return image;
}

export class Game {
  private readonly context: CanvasRenderingContext2D;
  private readonly elements: GameElements;
  private polygon: Polygon = structuredClone(GOLDEN_POLYGON);
  private readonly initialArea = polygonArea(GOLDEN_POLYGON);
  private physics = new PhysicsWorld(
    this.polygon,
    GOLDEN_LEVEL.blade,
    GOLDEN_LEVEL.blade.radius,
    GOLDEN_LEVEL.blade.velocity,
    GOLDEN_LEVEL.blade.speed,
  );
  private preview: CutPreview | null = null;
  private status: GameStatus = "playing";
  private lastFrame = performance.now();
  private startTime = performance.now();
  private pausedAt = 0;
  private pausedDuration = 0;
  private effectiveCuts = 0;
  private cutEffect: CutEffect | null = null;
  private dangerPulse: { point: Point; startedAt: number } | null = null;
  private dangerLine: { start: Point; end: Point; startedAt: number } | null = null;
  private tipTimeout = 0;
  private readonly audio = new AudioManager();
  private lastBladePosition: Point = { ...GOLDEN_LEVEL.blade };
  private freezeUntil = 0;
  private inputLockedUntil = 0;
  private shakeUntil = 0;
  private activePointerId: number | null = null;
  private readonly backgroundImage = loadImage(backgroundUrl);
  private readonly dangerMarkImage = loadImage(dangerMarkUrl);
  private readonly inkBladeImage = loadImage(inkBladeUrl);
  private readonly inkTextureImage = loadImage(inkTextureUrl);
  private readonly reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(private readonly canvas: HTMLCanvasElement, elements: GameElements) {
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas 2D is unavailable");
    this.context = context;
    this.elements = elements;
    this.resizeCanvas();
    this.bindPointerEvents();
    window.addEventListener("resize", () => this.resizeCanvas());
    requestAnimationFrame((time) => this.frame(time));
  }

  restart(): void {
    this.polygon = structuredClone(GOLDEN_POLYGON);
    this.physics.reset(GOLDEN_LEVEL.blade, GOLDEN_LEVEL.blade.velocity, this.polygon);
    this.status = "playing";
    this.preview = null;
    this.cutEffect = null;
    this.dangerPulse = null;
    this.dangerLine = null;
    this.freezeUntil = 0;
    this.inputLockedUntil = 0;
    this.shakeUntil = 0;
    this.startTime = performance.now();
    this.pausedDuration = 0;
    this.effectiveCuts = 0;
    this.updateProgress();
    this.setTip("横划一笔", 1500);
    if (this.elements.pauseDialog.open) this.elements.pauseDialog.close();
    if (this.elements.resultDialog.open) this.elements.resultDialog.close();
  }

  pause(): void {
    if (this.status !== "playing") return;
    this.status = "paused";
    this.pausedAt = performance.now();
    this.elements.pauseDialog.showModal();
  }

  resume(): void {
    if (this.status !== "paused") return;
    this.pausedDuration += performance.now() - this.pausedAt;
    this.status = "playing";
    this.elements.pauseDialog.close();
  }

  toggleSound(): boolean {
    return this.audio.toggle();
  }

  get soundEnabled(): boolean {
    return this.audio.isEnabled;
  }

  private resizeCanvas(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = LOGICAL_WIDTH * ratio;
    this.canvas.height = LOGICAL_HEIGHT * ratio;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  private pointerPosition(event: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * LOGICAL_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * LOGICAL_HEIGHT,
    };
  }

  private bindPointerEvents(): void {
    this.canvas.addEventListener("pointerdown", (event) => {
      if (this.status !== "playing" || performance.now() < this.inputLockedUntil || this.activePointerId !== null) return;
      const point = this.pointerPosition(event);
      this.activePointerId = event.pointerId;
      this.canvas.setPointerCapture(event.pointerId);
      this.preview = { start: point, end: point, danger: false };
      this.audio.playStart();
      event.preventDefault();
    });

    const move = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId || !this.preview || this.status !== "playing") return;
      this.preview.end = this.pointerPosition(event);
      this.preview.danger = segmentHitsCircle(
        this.preview.start,
        this.preview.end,
        this.physics.position,
        GOLDEN_LEVEL.blade.radius + 2,
      );
      if (this.preview.danger) {
        this.fail(this.physics.position, this.preview.start, this.preview.end);
      } else if (this.attemptCut(this.preview.start, this.preview.end, true)) {
        this.clearGesture();
      }
      event.preventDefault();
    };

    const finish = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId || !this.preview || this.status !== "playing") return;
      const start = this.preview.start;
      const end = this.pointerPosition(event);
      this.clearGesture();
      this.attemptCut(start, end);
      event.preventDefault();
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", finish, { passive: false });
    window.addEventListener("pointercancel", (event) => {
      if (event.pointerId === this.activePointerId) this.clearGesture();
    });
    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }

  private clearGesture(): void {
    if (this.activePointerId !== null && this.canvas.hasPointerCapture(this.activePointerId)) {
      this.canvas.releasePointerCapture(this.activePointerId);
    }
    this.activePointerId = null;
    this.preview = null;
  }

  private attemptCut(start: Point, end: Point, silent = false): boolean {
    if (segmentHitsCircle(start, end, this.physics.position, GOLDEN_LEVEL.blade.radius + 2)) {
      this.fail(this.physics.position, start, end);
      return false;
    }

    const result = splitPolygon(this.polygon, start, end);
    if (!result) {
      if (!silent) this.setTip("这一笔没有切开", 1300);
      return false;
    }

    const blade = this.physics.position;
    const inPositive = pointInPolygon(blade, result.positive);
    const inNegative = pointInPolygon(blade, result.negative);
    if (inPositive === inNegative) {
      if (!silent) this.setTip("墨刃位置不明", 1300);
      return false;
    }

    const kept = inPositive ? result.positive : result.negative;
    const removed = inPositive ? result.negative : result.positive;
    this.polygon = kept;
    this.physics.setBoundary(this.polygon);
    this.effectiveCuts += 1;
    const now = performance.now();
    const cutStart = result.intersections[0];
    const cutEnd = result.intersections[1];
    const removedCenter = this.polygonCentroid(removed);
    const length = Math.max(1, Math.hypot(cutEnd.x - cutStart.x, cutEnd.y - cutStart.y));
    const direction = { x: (cutEnd.x - cutStart.x) / length, y: (cutEnd.y - cutStart.y) / length };
    const side = Math.sign(lineSide(cutStart, cutEnd, removedCenter)) || 1;
    const normal = { x: -direction.y * side, y: direction.x * side };
    const particles: InkParticle[] = Array.from({ length: this.reduceMotion ? 8 : 30 }, () => {
      const along = Math.random();
      const speed = 0.035 + Math.random() * 0.105;
      const scatter = (Math.random() - 0.5) * 0.08;
      return {
        origin: {
          x: cutStart.x + (cutEnd.x - cutStart.x) * along + normal.x * (Math.random() * 5),
          y: cutStart.y + (cutEnd.y - cutStart.y) * along + normal.y * (Math.random() * 5),
        },
        velocity: {
          x: normal.x * speed + direction.x * scatter,
          y: normal.y * speed + direction.y * scatter,
        },
        size: 1.5 + Math.random() * 4.5,
        life: 340 + Math.random() * 260,
      };
    });
    this.cutEffect = { lineStart: cutStart, lineEnd: cutEnd, removed, startedAt: now, normal, particles };
    this.freezeUntil = now + 55;
    this.inputLockedUntil = now + 180;
    this.shakeUntil = now + 170;
    this.audio.playSuccess();
    if (navigator.vibrate) navigator.vibrate(12);
    this.elements.progressText.classList.remove("impact");
    requestAnimationFrame(() => this.elements.progressText.classList.add("impact"));
    window.setTimeout(() => this.elements.progressText.classList.remove("impact"), 280);
    this.updateProgress();
    if (this.clearedRatio >= GOLDEN_LEVEL.target) this.complete();
    else this.setTip("", 0);
    return true;
  }

  private fail(point: Point, lineStart?: Point, lineEnd?: Point): void {
    if (this.status !== "playing") return;
    this.status = "failed";
    this.clearGesture();
    const now = performance.now();
    this.dangerPulse = { point: { ...point }, startedAt: now };
    this.dangerLine = lineStart && lineEnd ? { start: { ...lineStart }, end: { ...lineEnd }, startedAt: now } : null;
    this.freezeUntil = now + 65;
    this.shakeUntil = now + 190;
    this.setTip("切线碰到墨刃，重试", 520);
    this.audio.playFail();
    if (navigator.vibrate) navigator.vibrate(24);
    window.setTimeout(() => this.restart(), 520);
  }

  private complete(): void {
    this.status = "completed";
    const seconds = this.elapsedSeconds;
    const thresholds = GOLDEN_LEVEL.starThresholds;
    const starCount = seconds <= thresholds.three.seconds && this.effectiveCuts <= thresholds.three.cuts
      ? 3
      : seconds <= thresholds.two.seconds && this.effectiveCuts <= thresholds.two.cuts ? 2 : 1;
    this.elements.stars.textContent = "★".repeat(starCount) + "☆".repeat(3 - starCount);
    this.elements.stars.setAttribute("aria-label", `${starCount}星评价`);
    this.elements.resultMeta.textContent = `用时 ${seconds} 秒 · ${this.effectiveCuts} 笔`;
    this.audio.playComplete();
    window.setTimeout(() => this.elements.resultDialog.showModal(), 360);
  }

  private get clearedRatio(): number {
    return Math.max(0, Math.min(1, 1 - polygonArea(this.polygon) / this.initialArea));
  }

  private get elapsedSeconds(): number {
    return Math.max(1, Math.round((performance.now() - this.startTime - this.pausedDuration) / 1000));
  }

  private updateProgress(): void {
    const percent = Math.round(this.clearedRatio * 100);
    this.elements.progressText.textContent = `${percent}%`;
    this.elements.progressBar.style.width = `${percent}%`;
  }

  private setTip(message: string, duration: number): void {
    window.clearTimeout(this.tipTimeout);
    this.elements.tip.textContent = message;
    this.tipTimeout = window.setTimeout(() => {
      if (this.status === "playing") this.elements.tip.textContent = "";
    }, duration);
  }

  private frame(time: number): void {
    const delta = time - this.lastFrame;
    this.lastFrame = time;
    if (this.status === "playing" && time >= this.freezeUntil) {
      this.lastBladePosition = this.physics.position;
      this.physics.update(delta);
      if (this.preview && sweptCircleHitsSegment(
        this.lastBladePosition,
        this.physics.position,
        GOLDEN_LEVEL.blade.radius + 2,
        this.preview.start,
        this.preview.end,
      )) this.fail(this.physics.position, this.preview.start, this.preview.end);
    }
    this.draw(time);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  private draw(time: number): void {
    const ctx = this.context;
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.fillStyle = "#f4f4f2";
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    if (this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
      ctx.drawImage(this.backgroundImage, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    }

    ctx.save();
    if (!this.reduceMotion && time < this.shakeUntil) {
      const strength = Math.max(0, (this.shakeUntil - time) / 170) * 3.2;
      ctx.translate(Math.sin(time * 0.22) * strength, Math.cos(time * 0.31) * strength * 0.6);
    }
    this.drawPolygon(ctx);
    this.drawGuide(ctx, time);
    this.drawBlade(ctx, time);
    this.drawCutEffect(ctx, time);
    this.drawPreview(ctx);
    this.drawDanger(ctx, time);
    ctx.restore();
  }

  private drawPolygon(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    this.polygon.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = "#0c0c0b";
    ctx.fill();
    ctx.strokeStyle = "#050505";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.clip();
    if (this.inkTextureImage.complete && this.inkTextureImage.naturalWidth > 0) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(this.inkTextureImage, 28, 172, 334, 548);
    }
    ctx.restore();
  }

  private drawBlade(ctx: CanvasRenderingContext2D, time: number): void {
    const position = this.physics.position;
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(time * 0.004);
    if (this.inkBladeImage.complete && this.inkBladeImage.naturalWidth > 0) {
      const size = 46;
      ctx.drawImage(this.inkBladeImage, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }
    const bladeScale = GOLDEN_LEVEL.blade.radius / 18;
    ctx.scale(bladeScale, bladeScale);
    for (let index = 0; index < 4; index += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(5, -4);
      ctx.quadraticCurveTo(18, -9, 25, 0);
      ctx.quadraticCurveTo(17, 7, 5, 4);
      ctx.closePath();
      ctx.fillStyle = "#eeeeea";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#a5261f";
    ctx.fill();
    ctx.restore();
  }

  private drawGuide(ctx: CanvasRenderingContext2D, time: number): void {
    if (this.effectiveCuts > 0 || this.preview) return;
    const { start, end } = GOLDEN_LEVEL.guide;
    const pulse = 0.35 + Math.sin(time * 0.004) * 0.15;
    ctx.save();
    ctx.setLineDash([7, 8]);
    ctx.lineDashOffset = -time * 0.025;
    ctx.strokeStyle = `rgba(244,244,242,${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.restore();
  }

  private drawPreview(ctx: CanvasRenderingContext2D): void {
    if (!this.preview) return;
    ctx.save();
    ctx.strokeStyle = this.preview.danger ? "#a5261f" : "#f4f4f2";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.preview.danger ? "#a5261f" : "#ffffff";
    ctx.beginPath();
    ctx.moveTo(this.preview.start.x, this.preview.start.y);
    ctx.lineTo(this.preview.end.x, this.preview.end.y);
    ctx.stroke();
    ctx.restore();
  }

  private drawCutEffect(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.cutEffect) return;
    const age = time - this.cutEffect.startedAt;
    if (age > 650) {
      this.cutEffect = null;
      return;
    }
    const fade = Math.max(0, 1 - age / 520);
    const offset = Math.min(13, age * 0.032);
    ctx.save();
    ctx.translate(this.cutEffect.normal.x * offset, this.cutEffect.normal.y * offset);
    ctx.globalAlpha = fade * 0.5;
    ctx.fillStyle = "#171716";
    ctx.beginPath();
    this.cutEffect.removed.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
    if (this.inkTextureImage.complete && this.inkTextureImage.naturalWidth > 0) {
      ctx.clip();
      ctx.globalAlpha = fade * 0.5;
      ctx.drawImage(this.inkTextureImage, 28, 172, 334, 548);
    }
    ctx.restore();

    if (age < 210) {
      ctx.save();
      ctx.globalAlpha = 1 - age / 210;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 6 - age / 50;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(this.cutEffect.lineStart.x, this.cutEffect.lineStart.y);
      ctx.lineTo(this.cutEffect.lineEnd.x, this.cutEffect.lineEnd.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = "#171716";
    for (const particle of this.cutEffect.particles) {
      if (age > particle.life) continue;
      const progress = age / particle.life;
      const x = particle.origin.x + particle.velocity.x * age;
      const y = particle.origin.y + particle.velocity.y * age + progress * progress * 13;
      ctx.globalAlpha = (1 - progress) * 0.72;
      ctx.beginPath();
      ctx.ellipse(x, y, particle.size * (1 - progress * 0.35), particle.size * 0.55, progress * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawDanger(ctx: CanvasRenderingContext2D, time: number): void {
    if (this.dangerLine) {
      const lineAge = time - this.dangerLine.startedAt;
      if (lineAge <= 460) {
        ctx.save();
        ctx.globalAlpha = 1 - lineAge / 460;
        ctx.strokeStyle = "#a5261f";
        ctx.lineWidth = 5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#a5261f";
        ctx.beginPath();
        ctx.moveTo(this.dangerLine.start.x, this.dangerLine.start.y);
        ctx.lineTo(this.dangerLine.end.x, this.dangerLine.end.y);
        ctx.stroke();
        ctx.restore();
      } else {
        this.dangerLine = null;
      }
    }
    if (!this.dangerPulse) return;
    const age = time - this.dangerPulse.startedAt;
    if (age > 500) {
      this.dangerPulse = null;
      return;
    }
    const radius = 12 + age * 0.07;
    ctx.save();
    ctx.globalAlpha = 1 - age / 500;
    if (this.dangerMarkImage.complete && this.dangerMarkImage.naturalWidth > 0) {
      const size = radius * 3.4;
      ctx.drawImage(this.dangerMarkImage, this.dangerPulse.point.x - size / 2, this.dangerPulse.point.y - size / 2, size, size);
      ctx.restore();
      return;
    }
    ctx.strokeStyle = "#a5261f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.dangerPulse.point.x, this.dangerPulse.point.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private polygonCentroid(polygon: Polygon): Point {
    const total = polygon.reduce((sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }), { x: 0, y: 0 });
    return { x: total.x / polygon.length, y: total.y / polygon.length };
  }
}
