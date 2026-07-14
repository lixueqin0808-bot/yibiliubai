import type { CutPreview, GameStatus, Point, Polygon } from "./types";
import { AudioManager } from "../audio/AudioManager";
import { segmentHitsCircle, sweptCircleHitsSegment } from "../geometry/collision";
import { splitPolygon } from "../geometry/cut";
import { distanceToSegment, lineSide, pointInPolygon, polygonArea, visibleBoundarySegments } from "../geometry/polygon";
import { LEVELS, LOGICAL_HEIGHT, LOGICAL_WIDTH, type LevelDefinition } from "../levels/goldenLevel";
import { PhysicsWorld } from "../physics/PhysicsWorld";
import { applyBladeHit, remainingRatio, ROUND_LIVES } from "./roundState";
import backgroundUrl from "../assets/xuan-paper-background.webp";
import dangerMarkUrl from "../assets/danger-mark.webp";
import inkBladeFourUrl from "../assets/ink-blade-four.webp";
import inkBladeFiveUrl from "../assets/ink-blade-five.webp";
import inkIronEdgeUrl from "../assets/ink-iron-edge.webp";
import inkTextureUrl from "../assets/ink-map-texture.webp";

interface GameElements {
  progressFill: HTMLElement;
  lifeLeaves: HTMLElement[];
  pauseDialog: HTMLDialogElement;
  resultDialog: HTMLDialogElement;
}

interface GameCallbacks {
  onLevelStart?: (levelId: number) => void;
  onLevelComplete?: (levelId: number) => void;
}

interface CutEffect {
  lineStart: Point;
  lineEnd: Point;
  removed: Polygon;
  startedAt: number;
  normal: Point;
  particles: InkParticle[];
  rotation: number;
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
  private levelIndex = 0;
  private level: LevelDefinition = LEVELS[0];
  private polygon: Polygon = structuredClone(this.level.polygon);
  private initialArea = polygonArea(this.level.polygon);
  private physics = this.createPhysics(this.level);
  private preview: CutPreview | null = null;
  private status: GameStatus = "paused";
  private lastFrame = performance.now();
  private effectiveCuts = 0;
  private lives = ROUND_LIVES;
  private cutEffect: CutEffect | null = null;
  private dangerPulse: { point: Point; startedAt: number } | null = null;
  private dangerLine: { start: Point; end: Point; startedAt: number } | null = null;
  private invalidLine: { start: Point; end: Point; startedAt: number } | null = null;
  private readonly audio = new AudioManager();
  private lastBladePositions: Point[] = this.physics.map((blade) => blade.position);
  private freezeUntil = 0;
  private inputLockedUntil = 0;
  private shakeUntil = 0;
  private activePointerId: number | null = null;
  private readonly backgroundImage = loadImage(backgroundUrl);
  private readonly dangerMarkImage = loadImage(dangerMarkUrl);
  private readonly inkBladeFourImage = loadImage(inkBladeFourUrl);
  private readonly inkBladeFiveImage = loadImage(inkBladeFiveUrl);
  private readonly inkIronEdgeImage = loadImage(inkIronEdgeUrl);
  private readonly inkTextureImage = loadImage(inkTextureUrl);
  private readonly reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    elements: GameElements,
    private readonly callbacks: GameCallbacks = {},
  ) {
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
    this.loadLevel(this.levelIndex);
  }

  startLevel(levelId: number): void {
    const index = LEVELS.findIndex((level) => level.id === levelId);
    if (index >= 0) this.loadLevel(index);
  }

  get currentLevelId(): number {
    return this.level.id;
  }

  get isLastLevel(): boolean {
    return this.levelIndex === LEVELS.length - 1;
  }

  nextLevel(): void {
    this.loadLevel((this.levelIndex + 1) % LEVELS.length);
  }

  private loadLevel(index: number): void {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.canvas.dataset.level = String(this.level.id);
    this.polygon = structuredClone(this.level.polygon);
    this.initialArea = polygonArea(this.level.polygon);
    this.physics = this.createPhysics(this.level);
    this.lastBladePositions = this.physics.map((blade) => blade.position);
    this.status = "playing";
    this.preview = null;
    this.cutEffect = null;
    this.dangerPulse = null;
    this.dangerLine = null;
    this.freezeUntil = 0;
    this.inputLockedUntil = 0;
    this.shakeUntil = 0;
    this.effectiveCuts = 0;
    this.lives = ROUND_LIVES;
    this.invalidLine = null;
    this.updateHud();
    this.callbacks.onLevelStart?.(this.level.id);
    if (this.elements.pauseDialog.open) this.elements.pauseDialog.close();
    if (this.elements.resultDialog.open) this.elements.resultDialog.close();
  }

  pause(): void {
    if (this.status !== "playing") return;
    this.status = "paused";
    this.elements.pauseDialog.showModal();
  }

  resume(): void {
    if (this.status !== "paused") return;
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
      this.preview.danger = this.physics.some((blade, index) => segmentHitsCircle(
        this.preview!.start,
        this.preview!.end,
        blade.position,
        this.level.blades[index].radius + 2,
      ));
      if (this.preview.danger) {
        this.handleBladeHit(this.dangerBladePosition(this.preview.start, this.preview.end), this.preview.start, this.preview.end);
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
    const hitBlade = this.physics.find((blade, index) => segmentHitsCircle(
      start,
      end,
      blade.position,
      this.level.blades[index].radius + 2,
    ));
    if (hitBlade) {
      this.handleBladeHit(hitBlade.position, start, end);
      return false;
    }

    const result = splitPolygon(this.polygon, start, end);
    if (!result) {
      if (!silent) this.showInvalidCut(start, end);
      return false;
    }

    if (this.level.metalEdges?.some((metal) => result.intersections.some(
      (intersection) => distanceToSegment(intersection, metal.start, metal.end) <= 9,
    ))) {
      if (!silent) this.showInvalidCut(start, end);
      return false;
    }

    const bladeSides = this.physics.map((blade) => pointInPolygon(blade.position, result.positive));
    if (bladeSides.some((side) => side !== bladeSides[0])) {
      if (!silent) this.showInvalidCut(start, end);
      return false;
    }

    const kept = bladeSides[0] ? result.positive : result.negative;
    const removed = bladeSides[0] ? result.negative : result.positive;
    this.polygon = kept;
    this.physics.forEach((blade) => blade.setBoundary(this.polygon));
    this.effectiveCuts += 1;
    const now = performance.now();
    const cutStart = result.intersections[0];
    const cutEnd = result.intersections[1];
    const removedCenter = this.polygonCentroid(removed);
    const length = Math.max(1, Math.hypot(cutEnd.x - cutStart.x, cutEnd.y - cutStart.y));
    const direction = { x: (cutEnd.x - cutStart.x) / length, y: (cutEnd.y - cutStart.y) / length };
    const side = Math.sign(lineSide(cutStart, cutEnd, removedCenter)) || 1;
    const normal = { x: -direction.y * side, y: direction.x * side };
    const particles: InkParticle[] = Array.from({ length: this.reduceMotion ? 4 : 10 }, () => {
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
    this.cutEffect = {
      lineStart: cutStart,
      lineEnd: cutEnd,
      removed,
      startedAt: now,
      normal,
      particles,
      rotation: (Math.random() - 0.5) * 0.12,
    };
    this.freezeUntil = now + 55;
    this.inputLockedUntil = now + 180;
    this.shakeUntil = now + 170;
    this.audio.playSuccess();
    if (navigator.vibrate) navigator.vibrate(12);
    this.updateHud();
    if (this.remainingAreaRatio <= this.level.target) this.complete();
    return true;
  }

  private handleBladeHit(point: Point, lineStart?: Point, lineEnd?: Point): void {
    if (this.status !== "playing") return;
    this.status = "recovering";
    this.clearGesture();
    const now = performance.now();
    this.dangerPulse = { point: { ...point }, startedAt: now };
    this.dangerLine = lineStart && lineEnd ? { start: { ...lineStart }, end: { ...lineEnd }, startedAt: now } : null;
    this.freezeUntil = now + 65;
    this.shakeUntil = now + 190;
    this.audio.playFail();
    if (navigator.vibrate) navigator.vibrate(24);
    const result = applyBladeHit(this.lives);
    this.lives = result.lives;
    this.updateHud();
    window.setTimeout(() => {
      if (result.shouldRestart) this.restart();
      else if (this.status === "recovering") this.status = "playing";
    }, 520);
  }

  private complete(): void {
    this.status = "completed";
    this.audio.playComplete();
    this.callbacks.onLevelComplete?.(this.level.id);
    window.setTimeout(() => this.elements.resultDialog.showModal(), 360);
  }

  private get remainingAreaRatio(): number {
    return remainingRatio(polygonArea(this.polygon), this.initialArea);
  }

  private updateHud(): void {
    const hiddenPercent = Math.max(0, 100 - this.remainingAreaRatio * 100);
    this.elements.progressFill.style.clipPath = `inset(0 ${hiddenPercent}% 0 0)`;
    this.elements.lifeLeaves.forEach((leaf, index) => {
      leaf.classList.toggle("is-spent", index >= this.lives);
    });
  }

  private showInvalidCut(start: Point, end: Point): void {
    this.invalidLine = { start: { ...start }, end: { ...end }, startedAt: performance.now() };
    this.audio.playInvalid();
  }

  private frame(time: number): void {
    const delta = time - this.lastFrame;
    this.lastFrame = time;
    if (this.status === "playing" && time >= this.freezeUntil) {
      this.physics.forEach((blade, index) => {
        const lastPosition = blade.position;
        blade.update(delta);
        this.lastBladePositions[index] = blade.position;
        if (this.preview && sweptCircleHitsSegment(
          lastPosition,
          blade.position,
          this.level.blades[index].radius + 2,
          this.preview.start,
          this.preview.end,
        )) this.handleBladeHit(blade.position, this.preview.start, this.preview.end);
      });
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
    this.drawMetalSegments(ctx);
    this.drawGuide(ctx, time);
    this.physics.forEach((blade, index) => this.drawBlade(ctx, time, blade.position, index));
    this.drawCutEffect(ctx, time);
    this.drawPreview(ctx);
    this.drawInvalidCut(ctx, time);
    this.drawDanger(ctx, time);
    ctx.restore();
  }

  private drawPolygon(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    this.polygon.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = "#0b0b0a";
    ctx.shadowColor = "rgba(0, 0, 0, 0.62)";
    ctx.shadowBlur = 13;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.clip();
    if (this.inkTextureImage.complete && this.inkTextureImage.naturalWidth > 0) {
      ctx.globalAlpha = 0.78;
      ctx.drawImage(this.inkTextureImage, 28, 172, 334, 548);
    }
    const inkWash = ctx.createLinearGradient(0, 230, 0, 640);
    inkWash.addColorStop(0, "rgba(255, 255, 255, 0.055)");
    inkWash.addColorStop(0.42, "rgba(0, 0, 0, 0)");
    inkWash.addColorStop(1, "rgba(0, 0, 0, 0.24)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = inkWash;
    ctx.fillRect(0, 180, LOGICAL_WIDTH, 500);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    this.polygon.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(187, 187, 175, 0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  private drawBlade(ctx: CanvasRenderingContext2D, time: number, position: Point, index: number): void {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(time * (0.004 + index * 0.0007));
    const blade = this.level.blades[index];
    const image = blade.variant === "five" ? this.inkBladeFiveImage : this.inkBladeFourImage;
    if (image.complete && image.naturalWidth > 0) {
      const size = blade.variant === "five" ? 56 : 42;
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.restore();
      return;
    }
    const bladeScale = blade.radius / 18;
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
    if (this.effectiveCuts > 0 || this.preview || !this.level.guide) return;
    const { start, end } = this.level.guide;
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

  private drawMetalSegments(ctx: CanvasRenderingContext2D): void {
    if (!this.level.metalEdges) return;
    ctx.save();
    ctx.lineCap = "round";
    visibleBoundarySegments(this.polygon, this.level.metalEdges).forEach((metal) => {
      const length = Math.hypot(metal.end.x - metal.start.x, metal.end.y - metal.start.y);
      const angle = Math.atan2(metal.end.y - metal.start.y, metal.end.x - metal.start.x);
      if (this.inkIronEdgeImage.complete && this.inkIronEdgeImage.naturalWidth > 0) {
        ctx.save();
        ctx.translate(metal.start.x, metal.start.y);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.92;
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 3;
        ctx.drawImage(this.inkIronEdgeImage, 0, -8, length, 16);
        ctx.restore();
        return;
      }
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#353535";
      ctx.shadowBlur = 5;
      ctx.shadowColor = "#050505";
      ctx.beginPath();
      ctx.moveTo(metal.start.x, metal.start.y);
      ctx.lineTo(metal.end.x, metal.end.y);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#aaa9a1";
      ctx.stroke();
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#353535";
    });
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

  private drawInvalidCut(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.invalidLine) return;
    const age = time - this.invalidLine.startedAt;
    if (age > 180) {
      this.invalidLine = null;
      return;
    }
    ctx.save();
    ctx.globalAlpha = 1 - age / 180;
    ctx.strokeStyle = "#777773";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.invalidLine.start.x, this.invalidLine.start.y);
    ctx.lineTo(this.invalidLine.end.x, this.invalidLine.end.y);
    ctx.stroke();
    ctx.restore();
  }

  private drawCutEffect(ctx: CanvasRenderingContext2D, time: number): void {
    if (!this.cutEffect) return;
    const age = time - this.cutEffect.startedAt;
    if (age > 560) {
      this.cutEffect = null;
      return;
    }
    const fade = Math.max(0, 1 - age / 540);
    const offset = Math.min(48, age * 0.12);
    const center = this.polygonCentroid(this.cutEffect.removed);
    ctx.save();
    ctx.translate(center.x + this.cutEffect.normal.x * offset, center.y + this.cutEffect.normal.y * offset);
    ctx.rotate(this.cutEffect.rotation * Math.min(1, age / 220));
    ctx.translate(-center.x, -center.y);
    ctx.globalAlpha = fade * 0.76;
    ctx.fillStyle = "#171716";
    ctx.beginPath();
    this.cutEffect.removed.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();
    if (this.inkTextureImage.complete && this.inkTextureImage.naturalWidth > 0) {
      ctx.clip();
      ctx.globalAlpha = fade * 0.72;
      ctx.drawImage(this.inkTextureImage, 28, 172, 334, 548);
    }
    ctx.restore();

    if (age < 180) {
      ctx.save();
      ctx.globalAlpha = 1 - age / 210;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 7 - age / 42;
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

  private createPhysics(level: LevelDefinition): PhysicsWorld[] {
    return level.blades.map((blade) => new PhysicsWorld(
      this.polygon,
      blade,
      blade.radius,
      blade.velocity,
      blade.speed,
    ));
  }

  private dangerBladePosition(start: Point, end: Point): Point {
    const hit = this.physics.find((blade, index) => segmentHitsCircle(
      start,
      end,
      blade.position,
      this.level.blades[index].radius + 2,
    ));
    return hit?.position ?? this.physics[0].position;
  }
}
