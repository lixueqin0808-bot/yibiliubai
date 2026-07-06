const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  levelTitle: document.getElementById("levelTitle"),
  clearedText: document.getElementById("clearedText"),
  targetText: document.getElementById("targetText"),
  strokeText: document.getElementById("strokeText"),
  progressBar: document.getElementById("progressBar"),
  targetMarker: document.getElementById("targetMarker"),
  coachTip: document.getElementById("coachTip"),
  toast: document.getElementById("toast"),
  overlay: document.getElementById("overlay"),
  overlayKicker: document.getElementById("overlayKicker"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  primaryButton: document.getElementById("primaryButton"),
  soundButton: document.getElementById("soundButton"),
  tutorialPanel: document.getElementById("tutorialPanel"),
  tutorialButton: document.getElementById("tutorialButton"),
  tutorialClose: document.getElementById("tutorialClose"),
  restartButton: document.getElementById("restartButton"),
  nextButton: document.getElementById("nextButton"),
};

const levels = [
  {
    title: "初入画境 1-1",
    target: 50,
    strokes: 8,
    polygon: [
      [300, 185],
      [880, 175],
      [945, 430],
      [720, 565],
      [360, 530],
      [230, 350],
    ],
    spirits: [{ x: 560, y: 340, vx: 118, vy: 88, r: 17 }],
    seals: [],
  },
  {
    title: "初入画境 1-2",
    target: 56,
    strokes: 8,
    polygon: [
      [250, 210],
      [910, 215],
      [910, 510],
      [260, 515],
    ],
    spirits: [{ x: 585, y: 360, vx: 132, vy: 96, r: 17 }],
    seals: [],
  },
  {
    title: "初入画境 1-3",
    target: 60,
    strokes: 7,
    polygon: [
      [280, 175],
      [810, 160],
      [960, 350],
      [790, 560],
      [360, 540],
      [205, 365],
    ],
    spirits: [{ x: 590, y: 360, vx: 142, vy: 112, r: 17 }],
    seals: [],
  },
  {
    title: "面积策略 2-1",
    target: 62,
    strokes: 7,
    polygon: [
      [210, 255],
      [600, 150],
      [975, 255],
      [885, 515],
      [480, 560],
      [190, 450],
    ],
    spirits: [{ x: 610, y: 360, vx: 150, vy: 115, r: 16 }],
    seals: [],
  },
  {
    title: "面积策略 2-2",
    target: 66,
    strokes: 7,
    polygon: [
      [260, 170],
      [870, 185],
      [990, 375],
      [790, 545],
      [415, 570],
      [185, 430],
      [210, 260],
    ],
    spirits: [{ x: 610, y: 390, vx: 158, vy: -126, r: 16 }],
    seals: [],
  },
  {
    title: "面积策略 2-3",
    target: 70,
    strokes: 7,
    polygon: [
      [195, 220],
      [490, 145],
      [780, 170],
      [990, 330],
      [875, 560],
      [520, 590],
      [250, 500],
    ],
    spirits: [{ x: 585, y: 365, vx: 168, vy: 130, r: 16 }],
    seals: [],
  },
  {
    title: "墨池惊灵 3-1",
    target: 66,
    strokes: 8,
    polygon: [
      [245, 200],
      [830, 155],
      [965, 345],
      [805, 560],
      [345, 560],
      [190, 360],
    ],
    spirits: [
      { x: 470, y: 310, vx: 145, vy: 100, r: 16 },
      { x: 715, y: 410, vx: -120, vy: 125, r: 16 },
    ],
    seals: [],
  },
  {
    title: "墨池惊灵 3-2",
    target: 70,
    strokes: 8,
    polygon: [
      [220, 170],
      [560, 145],
      [925, 220],
      [965, 500],
      [710, 585],
      [355, 545],
      [170, 390],
    ],
    spirits: [
      { x: 440, y: 315, vx: 158, vy: 118, r: 15 },
      { x: 730, y: 370, vx: -136, vy: 144, r: 16 },
    ],
    seals: [],
  },
  {
    title: "墨池惊灵 3-3",
    target: 72,
    strokes: 8,
    polygon: [
      [240, 165],
      [600, 135],
      [925, 210],
      [1000, 475],
      [735, 600],
      [340, 570],
      [160, 385],
    ],
    spirits: [
      { x: 430, y: 310, vx: 170, vy: 115, r: 15 },
      { x: 690, y: 305, vx: -130, vy: 155, r: 17 },
      { x: 735, y: 480, vx: 95, vy: -155, r: 15 },
    ],
    seals: [],
  },
  {
    title: "朱砂封印 4-1",
    target: 68,
    strokes: 8,
    polygon: [
      [260, 160],
      [910, 195],
      [930, 520],
      [600, 590],
      [230, 500],
      [190, 275],
    ],
    spirits: [
      { x: 480, y: 265, vx: 135, vy: 130, r: 16 },
      { x: 695, y: 450, vx: -145, vy: 115, r: 16 },
    ],
    seals: [{ x: 595, y: 360, r: 34 }],
  },
  {
    title: "朱砂封印 4-2",
    target: 72,
    strokes: 8,
    polygon: [
      [225, 210],
      [515, 145],
      [880, 185],
      [975, 430],
      [760, 580],
      [375, 560],
      [175, 410],
    ],
    spirits: [
      { x: 420, y: 350, vx: 155, vy: 116, r: 15 },
      { x: 720, y: 330, vx: -135, vy: 150, r: 16 },
    ],
    seals: [
      { x: 575, y: 280, r: 28 },
      { x: 645, y: 465, r: 28 },
    ],
  },
  {
    title: "朱砂封印 4-3",
    target: 74,
    strokes: 8,
    polygon: [
      [210, 190],
      [500, 135],
      [780, 155],
      [990, 315],
      [920, 545],
      [620, 610],
      [300, 540],
      [150, 370],
    ],
    spirits: [
      { x: 410, y: 300, vx: 175, vy: 120, r: 15 },
      { x: 720, y: 410, vx: -155, vy: 135, r: 16 },
    ],
    seals: [
      { x: 560, y: 395, r: 30 },
      { x: 815, y: 305, r: 28 },
    ],
  },
  {
    title: "山河显影 5-1",
    target: 76,
    strokes: 9,
    polygon: [
      [200, 225],
      [410, 145],
      [720, 150],
      [960, 275],
      [940, 515],
      [705, 610],
      [380, 570],
      [155, 430],
    ],
    spirits: [
      { x: 430, y: 300, vx: 175, vy: 120, r: 15 },
      { x: 650, y: 395, vx: -160, vy: 145, r: 16 },
      { x: 790, y: 300, vx: -110, vy: -150, r: 15 },
    ],
    seals: [{ x: 570, y: 465, r: 30 }],
    kois: [{ x: 515, y: 350, r: 22 }],
  },
  {
    title: "山河显影 5-2",
    target: 78,
    strokes: 9,
    polygon: [
      [190, 200],
      [470, 125],
      [790, 155],
      [1010, 300],
      [965, 515],
      [745, 615],
      [405, 585],
      [160, 445],
    ],
    spirits: [
      { x: 390, y: 310, vx: 185, vy: 128, r: 15 },
      { x: 610, y: 420, vx: -155, vy: 158, r: 16 },
      { x: 790, y: 335, vx: -128, vy: -166, r: 15 },
    ],
    seals: [
      { x: 535, y: 265, r: 27 },
      { x: 740, y: 505, r: 29 },
    ],
    kois: [{ x: 610, y: 325, r: 22 }],
  },
  {
    title: "山河显影 5-3",
    target: 80,
    strokes: 9,
    polygon: [
      [185, 230],
      [390, 135],
      [655, 130],
      [920, 215],
      [1010, 430],
      [855, 590],
      [575, 625],
      [300, 555],
      [140, 390],
    ],
    spirits: [
      { x: 380, y: 315, vx: 188, vy: 135, r: 15 },
      { x: 590, y: 410, vx: -165, vy: 158, r: 16 },
      { x: 805, y: 330, vx: -135, vy: -170, r: 15 },
    ],
    seals: [
      { x: 520, y: 250, r: 27 },
      { x: 690, y: 505, r: 29 },
      { x: 815, y: 455, r: 25 },
    ],
    kois: [
      { x: 470, y: 395, r: 21 },
      { x: 720, y: 330, r: 21 },
    ],
  },
];

let state = {};
let pointer = null;
let toastTimer = 0;
let coachTimer = 0;
let lastTime = performance.now();
let audio = {
  ctx: null,
  master: null,
  enabled: true,
  unlocked: false,
};

const chapters = [
  { name: "初入画境", subtitle: "基础教学", from: 0, to: 2 },
  { name: "留白取势", subtitle: "面积策略", from: 3, to: 5 },
  { name: "墨池惊灵", subtitle: "多个墨灵", from: 6, to: 8 },
  { name: "朱砂封印", subtitle: "朱印障碍", from: 9, to: 11 },
  { name: "山河显影", subtitle: "综合挑战", from: 12, to: 14 },
];

function clonePoints(points) {
  return points.map(([x, y]) => ({ x, y }));
}

function getChapterInfo(index = state.levelIndex || 0) {
  return chapters.find((chapter) => index >= chapter.from && index <= chapter.to) || chapters[0];
}

function ensureAudio() {
  if (!audio.enabled) return false;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  if (!audio.ctx) {
    audio.ctx = new AudioContext();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.22;
    audio.master.connect(audio.ctx.destination);
  }
  if (audio.ctx.state === "suspended") audio.ctx.resume();
  audio.unlocked = true;
  return true;
}

function setSoundEnabled(enabled) {
  audio.enabled = enabled;
  ui.soundButton.textContent = enabled ? "音效开" : "音效关";
  ui.soundButton.setAttribute("aria-pressed", String(enabled));
  ui.soundButton.classList.toggle("sound-off", !enabled);
  if (audio.master) audio.master.gain.setTargetAtTime(enabled ? 0.22 : 0.0001, audio.ctx.currentTime, 0.02);
}

function playTone({ type = "sine", frequency = 440, endFrequency = frequency, duration = 0.18, gain = 0.12, delay = 0 }) {
  if (!ensureAudio()) return;
  const now = audio.ctx.currentTime + delay;
  const osc = audio.ctx.createOscillator();
  const amp = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), now + duration);
  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(amp);
  amp.connect(audio.master);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

function playNoise({ duration = 0.18, gain = 0.08, delay = 0, filter = 900 }) {
  if (!ensureAudio()) return;
  const now = audio.ctx.currentTime + delay;
  const length = Math.max(1, Math.floor(audio.ctx.sampleRate * duration));
  const buffer = audio.ctx.createBuffer(1, length, audio.ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const source = audio.ctx.createBufferSource();
  const amp = audio.ctx.createGain();
  const biquad = audio.ctx.createBiquadFilter();
  biquad.type = "lowpass";
  biquad.frequency.setValueAtTime(filter, now);
  amp.gain.setValueAtTime(gain, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  source.buffer = buffer;
  source.connect(biquad);
  biquad.connect(amp);
  amp.connect(audio.master);
  source.start(now);
}

function playSound(name) {
  if (!audio.enabled) return;
  if (name === "brush") {
    playNoise({ duration: 0.08, gain: 0.035, filter: 1300 });
  }
  if (name === "success") {
    playNoise({ duration: 0.24, gain: 0.065, filter: 1050 });
    playTone({ type: "triangle", frequency: 420, endFrequency: 720, duration: 0.16, gain: 0.06, delay: 0.04 });
  }
  if (name === "fail") {
    playTone({ type: "sawtooth", frequency: 180, endFrequency: 72, duration: 0.22, gain: 0.09 });
    playNoise({ duration: 0.12, gain: 0.045, filter: 520, delay: 0.02 });
  }
  if (name === "stamp") {
    playNoise({ duration: 0.08, gain: 0.12, filter: 460 });
    playTone({ type: "sine", frequency: 116, endFrequency: 92, duration: 0.2, gain: 0.08 });
  }
  if (name === "page") {
    playTone({ type: "sine", frequency: 520, endFrequency: 640, duration: 0.1, gain: 0.035 });
  }
}

function resetLevel(index = state.levelIndex || 0) {
  const level = levels[index];
  state = {
    levelIndex: index,
    polygon: clonePoints(level.polygon),
    initialArea: Math.abs(polygonArea(clonePoints(level.polygon))),
    spirits: level.spirits.map((spirit) => ({ ...spirit })),
    seals: level.seals.map((seal) => ({ ...seal })),
    kois: (level.kois || []).map((koi) => ({ ...koi })),
    strokes: level.strokes,
    won: false,
    lost: false,
    running: true,
    shake: 0,
    hasSuccessfulCut: false,
    hasDragged: false,
    showDemoLine: index === 0,
    chapterIntro: 2.6,
    stampEffect: null,
    effects: [],
  };
  pointer = null;
  updateUi();
  if (index === 0) ui.tutorialPanel.classList.remove("hidden");
  else ui.tutorialPanel.classList.add("hidden");
  ui.overlay.classList.add("hidden");
  if (audio.unlocked) playSound("page");
  showCoach(index === 0 ? "先照着虚线试一笔：从浓墨左侧拖到右侧，避开墨灵。" : "观察墨灵位置，切掉没有墨灵的一侧。", 3600);
}

function getLevel() {
  return levels[state.levelIndex];
}

function polygonArea(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

function clearedPercent() {
  const current = Math.abs(polygonArea(state.polygon));
  return Math.max(0, Math.min(100, ((state.initialArea - current) / state.initialArea) * 100));
}

function pointInPolygon(point, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    const hit =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (hit) inside = !inside;
  }
  return inside;
}

function lineSide(a, b, p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function lineIntersectionWithSegment(a, b, c, d) {
  const dxLine = b.x - a.x;
  const dyLine = b.y - a.y;
  const dxEdge = d.x - c.x;
  const dyEdge = d.y - c.y;
  const denom = dxLine * dyEdge - dyLine * dxEdge;
  if (Math.abs(denom) < 0.0001) return null;
  const t = ((c.x - a.x) * dyEdge - (c.y - a.y) * dxEdge) / denom;
  const u = ((c.x - a.x) * dyLine - (c.y - a.y) * dxLine) / denom;
  if (u < -0.0001 || u > 1.0001) return null;
  return { x: a.x + t * dxLine, y: a.y + t * dyLine };
}

function clipPolygon(poly, a, b, keepPositive) {
  const output = [];
  for (let i = 0; i < poly.length; i++) {
    const current = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const currentInside = keepPositive ? lineSide(a, b, current) >= -0.01 : lineSide(a, b, current) <= 0.01;
    const prevInside = keepPositive ? lineSide(a, b, prev) >= -0.01 : lineSide(a, b, prev) <= 0.01;
    if (currentInside !== prevInside) {
      const hit = lineIntersectionWithSegment(a, b, prev, current);
      if (hit) output.push(hit);
    }
    if (currentInside) output.push({ ...current });
  }
  return dedupePolygon(output);
}

function dedupePolygon(poly) {
  return poly.filter((point, index) => {
    const prev = poly[(index + poly.length - 1) % poly.length];
    return Math.hypot(point.x - prev.x, point.y - prev.y) > 0.5;
  });
}

function segmentDistanceToPoint(a, b, p) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq));
  const x = a.x + t * dx;
  const y = a.y + t * dy;
  return Math.hypot(p.x - x, p.y - y);
}

function segmentIntersectionsWithPolygon(a, b, poly) {
  const hits = [];
  for (let i = 0; i < poly.length; i++) {
    const c = poly[i];
    const d = poly[(i + 1) % poly.length];
    const hit = segmentIntersection(a, b, c, d);
    if (hit && !hits.some((item) => Math.hypot(item.x - hit.x, item.y - hit.y) < 1)) hits.push(hit);
  }
  return hits;
}

function segmentIntersection(a, b, c, d) {
  const r = { x: b.x - a.x, y: b.y - a.y };
  const s = { x: d.x - c.x, y: d.y - c.y };
  const denom = r.x * s.y - r.y * s.x;
  if (Math.abs(denom) < 0.0001) return null;
  const u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / denom;
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / denom;
  if (t >= -0.0001 && t <= 1.0001 && u >= -0.0001 && u <= 1.0001) {
    return { x: a.x + t * r.x, y: a.y + t * r.y };
  }
  return null;
}

function attemptCut(start, end) {
  if (state.won || state.lost) return;
  if (Math.hypot(end.x - start.x, end.y - start.y) < 42) {
    addCutLine(start, end, true);
    playSound("fail");
    showCoach("这一笔太短。按住鼠标，把线拖到浓墨另一侧再松开。", 2600);
    return;
  }
  const hits = segmentIntersectionsWithPolygon(start, end, state.polygon);
  if (hits.length < 2) {
    addCutLine(start, end, true);
    playSound("fail");
    showCoach("笔锋需要完整穿过浓墨：从外面划入，再从另一边划出。", 2800);
    return;
  }
  const hitSpiritItem = state.spirits.find((item) => segmentDistanceToPoint(start, end, item) < item.r + 8);
  const hitSealItem = state.seals.find((item) => segmentDistanceToPoint(start, end, item) < item.r + 8);
  const hitKoiItem = state.kois.find((item) => segmentDistanceToPoint(start, end, item) < item.r + 8);
  const hitSpirit = Boolean(hitSpiritItem);
  const hitSeal = Boolean(hitSealItem);
  const hitKoi = Boolean(hitKoiItem);
  const danger = hitSpirit || hitSeal || hitKoi;
  if (danger) {
    spendStroke();
    state.shake = 16;
    addCutLine(start, end, true);
    addDangerPulse(hitSpiritItem || hitSealItem || hitKoiItem, hitSpirit ? "墨灵" : hitSeal ? "朱印" : "锦鲤");
    playSound("fail");
    showCoach(
      hitSpirit
        ? "切线碰到了墨灵，损失一笔。等墨灵移开再切。"
        : hitSeal
          ? "切线碰到了朱印，损失一笔。绕开红色印章。"
          : "切线碰到了锦鲤，损失一笔。锦鲤要被保护在浓墨里。",
      3200,
    );
    return;
  }

  const positive = clipPolygon(state.polygon, start, end, true);
  const negative = clipPolygon(state.polygon, start, end, false);
  if (positive.length < 3 || negative.length < 3) {
    showCoach("这一笔没有真正切开浓墨，试着拉得更长、更斜一点。", 2800);
    playSound("fail");
    return;
  }

  const positiveSpirits = state.spirits.filter((spirit) => pointInPolygon(spirit, positive));
  const negativeSpirits = state.spirits.filter((spirit) => pointInPolygon(spirit, negative));
  let keep = null;
  let removed = null;
  if (positiveSpirits.length > 0 && negativeSpirits.length === 0) keep = positive;
  if (negativeSpirits.length > 0 && positiveSpirits.length === 0) keep = negative;
  if (keep === positive) removed = negative;
  if (keep === negative) removed = positive;
  if (!keep) {
    addCutLine(start, end, true);
    playSound("fail");
    showCoach("两边都有墨灵，所以没有哪一块能被清掉。试着把所有墨灵留在同一侧。", 3400);
    return;
  }

  const keptSealOutside = state.seals.some((seal) => !pointInPolygon(seal, keep));
  if (keptSealOutside) {
    addCutLine(start, end, true);
    playSound("fail");
    showCoach("朱印也要留在浓墨里，不能把它切到留白区域。", 3000);
    return;
  }

  const keptKoiOutside = state.kois.some((koi) => !pointInPolygon(koi, keep));
  if (keptKoiOutside) {
    addCutLine(start, end, true);
    playSound("fail");
    showCoach("锦鲤必须留在浓墨里。先判断墨灵保留侧，再避开锦鲤落笔。", 3400);
    return;
  }

  spendStroke();
  addCutLine(start, end, false);
  addInkBurst(removed, start, end);
  state.polygon = keep;
  state.hasSuccessfulCut = true;
  state.showDemoLine = false;
  updateUi();
  playSound("success");
  showCoach("切割成功：有墨灵的一侧被保留，另一侧变成留白。", 3200);
  if (clearedPercent() >= getLevel().target) completeLevel();
}

function spendStroke() {
  state.strokes -= 1;
  updateUi();
  if (state.strokes <= 0 && clearedPercent() < getLevel().target) {
    state.lost = true;
    state.running = false;
    showOverlay("笔势已尽", "还差一点留白。重试本关时，优先切掉没有墨灵的大块区域。", "重试", () => resetLevel(state.levelIndex));
  }
}

function completeLevel() {
  state.won = true;
  state.running = false;
  state.stampEffect = { age: 0, life: 1.1 };
  playSound("stamp");
  const last = state.levelIndex === levels.length - 1;
  const completedIndex = state.levelIndex;
  setTimeout(() => {
    if (!state.won || state.levelIndex !== completedIndex) return;
    showOverlay(
      "山水显影",
      last ? "MVP 的 15 个关卡已经完成。" : "这一关的留白已经完成。",
      last ? "重玩" : "下一关",
      () => resetLevel(last ? 0 : completedIndex + 1),
    );
  }, 680);
}

function showOverlay(title, text, button, action) {
  ui.overlayKicker.textContent = "一笔留白";
  ui.overlayTitle.textContent = title;
  ui.overlayText.textContent = text;
  ui.primaryButton.textContent = button;
  ui.primaryButton.onclick = () => {
    ensureAudio();
    action();
  };
  ui.overlay.classList.remove("hidden");
}

function updateUi() {
  if (!state.polygon) return;
  const level = getLevel();
  const chapter = getChapterInfo(state.levelIndex);
  const cleared = Math.round(clearedPercent());
  ui.levelTitle.textContent = `${chapter.name} · ${level.title}`;
  ui.clearedText.textContent = `${cleared}%`;
  ui.targetText.textContent = `${level.target}%`;
  ui.strokeText.textContent = state.strokes;
  ui.progressBar.style.width = `${cleared}%`;
  ui.targetMarker.style.left = `${level.target}%`;
  ui.nextButton.disabled = !state.won;
}

function showToast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("show"), 1400);
}

function showCoach(text, duration = 2600) {
  ui.coachTip.textContent = text;
  ui.coachTip.classList.remove("hidden");
  clearTimeout(coachTimer);
  coachTimer = setTimeout(() => ui.coachTip.classList.add("hidden"), duration);
}

function addCutLine(start, end, danger) {
  state.effects.push({
    type: "cutLine",
    start: { ...start },
    end: { ...end },
    danger,
    age: 0,
    life: danger ? 0.42 : 0.32,
  });
}

function addDangerPulse(item, label) {
  if (!item) return;
  state.effects.push({
    type: "dangerPulse",
    x: item.x,
    y: item.y,
    r: item.r,
    label,
    age: 0,
    life: 0.72,
  });
}

function addInkBurst(poly, start, end) {
  if (!poly || poly.length < 3) return;
  const center = polygonCentroid(poly);
  const particles = [];
  for (let i = 0; i < 24; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 28 + Math.random() * 78;
    particles.push({
      x: center.x + (Math.random() - 0.5) * 60,
      y: center.y + (Math.random() - 0.5) * 44,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 3 + Math.random() * 8,
    });
  }
  state.effects.push({
    type: "inkBurst",
    polygon: poly.map((point) => ({ ...point })),
    center,
    start: { ...start },
    end: { ...end },
    particles,
    age: 0,
    life: 0.78,
  });
}

function polygonCentroid(poly) {
  const total = poly.reduce(
    (sum, point) => {
      sum.x += point.x;
      sum.y += point.y;
      return sum;
    },
    { x: 0, y: 0 },
  );
  return { x: total.x / poly.length, y: total.y / poly.length };
}

function updateEffects(dt) {
  if (!state.effects) return;
  if (state.chapterIntro > 0) state.chapterIntro = Math.max(0, state.chapterIntro - dt);
  if (state.stampEffect) {
    state.stampEffect.age += dt;
    if (state.stampEffect.age >= state.stampEffect.life) state.stampEffect = null;
  }
  for (const effect of state.effects) {
    effect.age += dt;
    if (effect.type === "inkBurst") {
      for (const particle of effect.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= 0.965;
        particle.vy *= 0.965;
      }
    }
  }
  state.effects = state.effects.filter((effect) => effect.age < effect.life);
}

function closestPolygonEdge(point, poly) {
  let minDist = Infinity;
  let result = null;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 0.001) continue;
    let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = a.x + t * dx;
    const cy = a.y + t * dy;
    const dist = Math.hypot(point.x - cx, point.y - cy);
    if (dist < minDist) {
      minDist = dist;
      const nx = -dy;
      const ny = dx;
      const nLen = Math.hypot(nx, ny);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const testX = midX + (nx / nLen) * 5;
      const testY = midY + (ny / nLen) * 5;
      let inwardX, inwardY;
      if (pointInPolygon({ x: testX, y: testY }, poly)) {
        inwardX = nx / nLen;
        inwardY = ny / nLen;
      } else {
        inwardX = -nx / nLen;
        inwardY = -ny / nLen;
      }
      result = { x: inwardX, y: inwardY };
    }
  }
  return result;
}

function reflectVelocity(vx, vy, nx, ny, jitterAmount) {
  const dot = vx * nx + vy * ny;
  const jitter = (Math.random() - 0.5) * jitterAmount;
  const speed = Math.hypot(vx, vy);
  let rvx = vx - 2 * dot * nx;
  let rvy = vy - 2 * dot * ny;
  const rSpeed = Math.hypot(rvx, rvy);
  if (rSpeed > 0.001) {
    rvx = (rvx / rSpeed) * speed + (Math.random() - 0.5) * jitter * speed;
    rvy = (rvy / rSpeed) * speed + (Math.random() - 0.5) * jitter * speed;
  }
  return { x: rvx, y: rvy };
}

function updateSpirits(dt) {
  if (!state.running || !state.polygon) return;
  for (const spirit of state.spirits) {
    spirit.x += spirit.vx * dt;
    spirit.y += spirit.vy * dt;

    if (!pointInPolygon(spirit, state.polygon)) {
      spirit.x -= spirit.vx * dt;
      spirit.y -= spirit.vy * dt;
      const normal = closestPolygonEdge(spirit, state.polygon);
      if (normal) {
        const reflected = reflectVelocity(spirit.vx, spirit.vy, normal.x, normal.y, 0.15);
        spirit.vx = reflected.x;
        spirit.vy = reflected.y;
        spirit.x += spirit.vx * dt * 2;
        spirit.y += spirit.vy * dt * 2;
      }
    }

    for (const seal of state.seals) {
      const dist = Math.hypot(spirit.x - seal.x, spirit.y - seal.y);
      if (dist < spirit.r + seal.r + 4 && dist > 0.001) {
        const nx = (spirit.x - seal.x) / dist;
        const ny = (spirit.y - seal.y) / dist;
        const reflected = reflectVelocity(spirit.vx, spirit.vy, nx, ny, 0.15);
        spirit.vx = reflected.x;
        spirit.vy = reflected.y;
        spirit.x += spirit.vx * dt * 2;
        spirit.y += spirit.vy * dt * 2;
      }
    }

    for (const koi of state.kois) {
      const dist = Math.hypot(spirit.x - koi.x, spirit.y - koi.y);
      if (dist < spirit.r + koi.r + 4 && dist > 0.001) {
        const nx = (spirit.x - koi.x) / dist;
        const ny = (spirit.y - koi.y) / dist;
        const reflected = reflectVelocity(spirit.vx, spirit.vy, nx, ny, 0.15);
        spirit.vx = reflected.x;
        spirit.vy = reflected.y;
        spirit.x += spirit.vx * dt * 2;
        spirit.y += spirit.vy * dt * 2;
      }
    }
  }
  if (pointer) {
    const hit = state.spirits.some((spirit) => segmentDistanceToPoint(pointer.start, pointer.current, spirit) < spirit.r + 5);
    pointer.danger =
      hit ||
      state.seals.some((seal) => segmentDistanceToPoint(pointer.start, pointer.current, seal) < seal.r + 5) ||
      state.kois.some((koi) => segmentDistanceToPoint(pointer.start, pointer.current, koi) < koi.r + 5);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    state.shake *= 0.84;
  }
  drawPaperScene();
  drawInkEffects("behind");
  if (!state.polygon) {
    ctx.restore();
    return;
  }
  drawPolygon();
  drawInkEffects("front");
  drawSeals();
  drawKois();
  drawSpirits();
  drawDemoLine();
  drawFeedbackEffects();
  drawChapterIntro();
  drawStampEffect();
  drawPointer();
  ctx.restore();
}

function drawPaperScene() {
  ctx.save();
  const reveal = state.polygon ? Math.max(0.18, clearedPercent() / 100) : 0.18;
  ctx.globalAlpha = 0.1 + reveal * 0.32;
  ctx.strokeStyle = "#3f715b";
  ctx.lineWidth = 2.5 + reveal * 2.5;
  drawMountain(110, 585, 0.9);
  drawMountain(695, 610, 0.7);
  drawMountain(355, 620, 0.55);
  ctx.globalAlpha = 0.08 + reveal * 0.24;
  ctx.fillStyle = "#151515";
  ctx.beginPath();
  ctx.arc(905, 190, 46, 0, Math.PI * 2);
  ctx.fill();
  drawBambooShadow(92, 150, reveal);
  drawBambooShadow(1025, 165, reveal * 0.82);
  ctx.restore();
}

function drawMountain(x, y, scale) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 90 * scale, y - 210 * scale, x + 210 * scale, y);
  ctx.quadraticCurveTo(x + 300 * scale, y - 150 * scale, x + 405 * scale, y);
  ctx.stroke();
}

function drawBambooShadow(x, y, alpha) {
  ctx.save();
  ctx.globalAlpha = Math.min(0.22, alpha * 0.18);
  ctx.strokeStyle = "#151515";
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const offset = i * 16;
    ctx.beginPath();
    ctx.moveTo(x + offset, y + 360);
    ctx.quadraticCurveTo(x + offset - 18, y + 200, x + offset + 12, y);
    ctx.stroke();
    for (let j = 0; j < 4; j++) {
      const leafY = y + 80 + j * 58;
      ctx.beginPath();
      ctx.moveTo(x + offset, leafY);
      ctx.quadraticCurveTo(x + offset + 44, leafY - 18, x + offset + 70, leafY - 8);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawPolygon() {
  ctx.save();
  const poly = state.polygon;
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  const grad = ctx.createLinearGradient(220, 170, 940, 590);
  grad.addColorStop(0, "#050505");
  grad.addColorStop(0.55, "#201f1c");
  grad.addColorStop(1, "#080808");
  ctx.fillStyle = grad;
  ctx.shadowColor = "rgba(10, 8, 6, 0.42)";
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(8, 8, 8, 0.62)";
  ctx.lineWidth = 9;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "rgba(244, 235, 216, 0.4)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    const y = 210 + i * 22;
    ctx.moveTo(210 + Math.sin(i) * 20, y);
    ctx.bezierCurveTo(410, y - 32, 670, y + 44, 960, y - 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSeals() {
  ctx.save();
  for (const seal of state.seals) {
    ctx.translate(seal.x, seal.y);
    ctx.rotate(0.08);
    ctx.fillStyle = "#b7352d";
    ctx.strokeStyle = "rgba(78, 20, 16, 0.38)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-seal.r, -seal.r, seal.r * 2, seal.r * 2, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 241, 219, 0.92)";
    ctx.font = "bold 18px Microsoft YaHei";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("印", 0, 1);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();
}

function drawSpirits() {
  ctx.save();
  for (const spirit of state.spirits) {
    const angle = Math.atan2(spirit.vy, spirit.vx);
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = spirit.r * 0.7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(spirit.x - Math.cos(angle) * 42, spirit.y - Math.sin(angle) * 42);
    ctx.lineTo(spirit.x - Math.cos(angle) * 12, spirit.y - Math.sin(angle) * 12);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const grad = ctx.createRadialGradient(spirit.x - 5, spirit.y - 6, 2, spirit.x, spirit.y, spirit.r + 9);
    grad.addColorStop(0, "#f0e7d4");
    grad.addColorStop(0.18, "#55504a");
    grad.addColorStop(1, "#050505");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(spirit.x, spirit.y, spirit.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(183, 53, 45, 0.82)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
}

function drawKois() {
  if (!state.kois || state.kois.length === 0) return;
  ctx.save();
  for (const koi of state.kois) {
    const sway = Math.sin(performance.now() / 360 + koi.x * 0.01) * 0.16;
    ctx.translate(koi.x, koi.y);
    ctx.rotate(sway);
    ctx.fillStyle = "rgba(255, 245, 218, 0.95)";
    ctx.strokeStyle = "rgba(183, 53, 45, 0.86)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, koi.r * 1.22, koi.r * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(183, 53, 45, 0.9)";
    ctx.beginPath();
    ctx.moveTo(-koi.r * 1.12, 0);
    ctx.lineTo(-koi.r * 1.85, -koi.r * 0.58);
    ctx.lineTo(-koi.r * 1.72, koi.r * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(koi.r * 0.26, -koi.r * 0.1, koi.r * 0.34, koi.r * 0.22, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#151515";
    ctx.beginPath();
    ctx.arc(koi.r * 0.72, -koi.r * 0.14, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.restore();
}

function drawInkEffects(layer) {
  if (!state.effects) return;
  ctx.save();
  for (const effect of state.effects) {
    if (effect.type !== "inkBurst") continue;
    const t = Math.min(1, effect.age / effect.life);
    const alpha = Math.max(0, 1 - t);
    if (layer === "behind") {
      ctx.globalAlpha = alpha * 0.72;
      ctx.fillStyle = "#181715";
      ctx.beginPath();
      ctx.moveTo(effect.polygon[0].x, effect.polygon[0].y);
      for (let i = 1; i < effect.polygon.length; i++) ctx.lineTo(effect.polygon[i].x, effect.polygon[i].y);
      ctx.closePath();
      ctx.fill();
    }
    if (layer === "front") {
      ctx.globalAlpha = alpha * 0.75;
      ctx.fillStyle = "#171717";
      for (const particle of effect.particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r * (1 - t * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

function drawFeedbackEffects() {
  if (!state.effects) return;
  ctx.save();
  for (const effect of state.effects) {
    const t = Math.min(1, effect.age / effect.life);
    const alpha = 1 - t;
    if (effect.type === "cutLine") {
      ctx.globalAlpha = alpha;
      ctx.lineCap = "round";
      ctx.lineWidth = effect.danger ? 12 : 14;
      ctx.strokeStyle = effect.danger ? "rgba(183, 53, 45, 0.9)" : "rgba(244, 235, 216, 0.86)";
      ctx.beginPath();
      ctx.moveTo(effect.start.x, effect.start.y);
      ctx.lineTo(effect.end.x, effect.end.y);
      ctx.stroke();
      ctx.lineWidth = effect.danger ? 4 : 5;
      ctx.strokeStyle = effect.danger ? "rgba(255, 240, 220, 0.65)" : "rgba(14, 14, 14, 0.72)";
      ctx.stroke();
    }
    if (effect.type === "dangerPulse") {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "rgba(183, 53, 45, 0.94)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.r + 10 + t * 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(183, 53, 45, 0.92)";
      ctx.font = "bold 15px Microsoft YaHei";
      ctx.textAlign = "center";
      ctx.fillText(`碰到${effect.label}`, effect.x, effect.y - effect.r - 24);
    }
  }
  ctx.restore();
}

function drawChapterIntro() {
  if (!state.chapterIntro || state.chapterIntro <= 0) return;
  const chapter = getChapterInfo(state.levelIndex);
  const t = Math.min(1, state.chapterIntro / 2.6);
  const alpha = Math.min(1, t * 1.6);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 249, 235, 0.86)";
  ctx.strokeStyle = "rgba(183, 53, 45, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(430, 132, 320, 88, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#b7352d";
  ctx.font = "bold 18px Microsoft YaHei";
  ctx.fillText(chapter.subtitle, 590, 158);
  ctx.fillStyle = "#151515";
  ctx.font = "bold 30px Microsoft YaHei";
  ctx.fillText(chapter.name, 590, 192);
  ctx.restore();
}

function drawStampEffect() {
  if (!state.stampEffect) return;
  const t = Math.min(1, state.stampEffect.age / state.stampEffect.life);
  const scale = t < 0.22 ? 1.8 - t * 3.2 : 1;
  const alpha = t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.15);
  ctx.save();
  ctx.translate(590, 360);
  ctx.scale(scale, scale);
  ctx.rotate(-0.08);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(183, 53, 45, 0.88)";
  ctx.strokeStyle = "rgba(94, 24, 19, 0.55)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(-82, -82, 164, 164, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 241, 219, 0.92)";
  ctx.font = "bold 34px Microsoft YaHei";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("留白", 0, -18);
  ctx.fillText("已成", 0, 28);
  ctx.restore();
}

function drawDemoLine() {
  if (!state.showDemoLine || state.levelIndex !== 0 || pointer || state.hasSuccessfulCut) return;
  const alpha = 0.48 + Math.sin(performance.now() / 260) * 0.16;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.setLineDash([16, 12]);
  ctx.lineCap = "round";
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(183, 53, 45, 0.76)";
  ctx.beginPath();
  ctx.moveTo(270, 260);
  ctx.lineTo(900, 455);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(183, 53, 45, 0.88)";
  ctx.beginPath();
  ctx.arc(270, 260, 9, 0, Math.PI * 2);
  ctx.arc(900, 455, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "bold 16px Microsoft YaHei";
  ctx.textAlign = "center";
  ctx.fillText("从这里拖到这里", 585, 330);
  ctx.restore();
}

function drawPointer() {
  if (!pointer) return;
  ctx.save();
  ctx.lineCap = "round";

  const trail = pointer.trail;
  if (trail && trail.length >= 2) {
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1];
      const curr = trail[i];
      const dt = Math.max(1, curr.time - prev.time);
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const speed = Math.hypot(dx, dy) / (dt / 1000);
      const width = Math.max(3, 16 - Math.min(speed * 0.01, 13));
      const alpha = 0.45 + (i / trail.length) * 0.4;

      ctx.globalAlpha = alpha * (pointer.danger ? 0.65 : 0.82);
      ctx.lineWidth = width;
      ctx.strokeStyle = pointer.danger
        ? "rgba(183, 53, 45, 0.82)"
        : "rgba(15, 15, 15, 0.82)";
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.72;
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "rgba(255, 249, 235, 0.7)";
    ctx.beginPath();
    ctx.moveTo(trail[0].x, trail[0].y);
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.lineTo(pointer.current.x, pointer.current.y);
    ctx.stroke();
  } else {
    ctx.lineWidth = 13;
    ctx.strokeStyle = pointer.danger
      ? "rgba(183, 53, 45, 0.78)"
      : "rgba(15, 15, 15, 0.78)";
    ctx.beginPath();
    ctx.moveTo(pointer.start.x, pointer.start.y);
    ctx.lineTo(pointer.current.x, pointer.current.y);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 249, 235, 0.74)";
    ctx.stroke();
  }

  drawPointerDangerHints();
  ctx.restore();
}

function drawPointerDangerHints() {
  const items = [...state.spirits, ...state.seals, ...state.kois];
  for (const item of items) {
    const distance = segmentDistanceToPoint(pointer.start, pointer.current, item);
    if (distance >= item.r + 18) continue;
    const strength = Math.max(0, 1 - distance / (item.r + 18));
    ctx.globalAlpha = 0.28 + strength * 0.5;
    ctx.strokeStyle = "rgba(183, 53, 45, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.r + 8 + strength * 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  updateSpirits(dt);
  updateEffects(dt);

  if (pointer && audio.enabled && audio.unlocked && now - pointer.lastBrushSound > 160) {
    const trail = pointer.trail;
    if (trail && trail.length >= 2) {
      const prev = trail[trail.length - 2];
      const curr = trail[trail.length - 1];
      const sDt = Math.max(1, curr.time - prev.time);
      const speed = Math.hypot(curr.x - prev.x, curr.y - prev.y) / (sDt / 1000);
      const freq = 600 + Math.min(speed * 0.6, 800);
      playTone({ type: "sine", frequency: freq, endFrequency: freq * 0.7, duration: 0.06, gain: 0.025 });
      playNoise({ duration: 0.04, gain: 0.015, filter: 1100 });
    }
    pointer.lastBrushSound = now;
  }

  draw();
  requestAnimationFrame(loop);
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (state.won || state.lost || ui.overlay.classList.contains("hidden") === false) return;
  ensureAudio();
  playSound("brush");
  canvas.setPointerCapture(event.pointerId);
  if (!state.hasDragged) {
    state.hasDragged = true;
    state.showDemoLine = false;
    showCoach("保持按住，把笔锋拖到浓墨另一侧再松开。", 2200);
  }
  const pos = pointerPosition(event);
  const now = performance.now();
  pointer = {
    start: pos,
    current: pos,
    danger: false,
    trail: [{ x: pos.x, y: pos.y, time: now }],
    lastSampleTime: now,
    lastBrushSound: now,
  };
});

canvas.addEventListener("pointermove", (event) => {
  event.preventDefault();
  if (!pointer) return;
  pointer.current = pointerPosition(event);
  const now = performance.now();
  if (now - pointer.lastSampleTime > 22) {
    pointer.trail.push({ x: pointer.current.x, y: pointer.current.y, time: now });
    pointer.lastSampleTime = now;
    if (pointer.trail.length > 70) pointer.trail.shift();
  }
});

canvas.addEventListener("pointerup", (event) => {
  event.preventDefault();
  if (!pointer) return;
  const cut = { start: pointer.start, end: pointerPosition(event) };
  pointer = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  attemptCut(cut.start, cut.end);
});

canvas.addEventListener("pointercancel", (event) => {
  event.preventDefault();
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  pointer = null;
});

window.addEventListener(
  "touchmove",
  (event) => {
    if (event.target === canvas) event.preventDefault();
  },
  { passive: false },
);

ui.restartButton.addEventListener("click", () => resetLevel(state.levelIndex));
ui.soundButton.addEventListener("click", () => {
  if (!audio.enabled) {
    setSoundEnabled(true);
    ensureAudio();
    playSound("page");
  } else {
    playSound("page");
    setSoundEnabled(false);
  }
});
ui.tutorialButton.addEventListener("click", () => ui.tutorialPanel.classList.toggle("hidden"));
ui.tutorialClose.addEventListener("click", () => ui.tutorialPanel.classList.add("hidden"));
ui.nextButton.addEventListener("click", () => {
  if (state.won) resetLevel(Math.min(state.levelIndex + 1, levels.length - 1));
});

ui.primaryButton.onclick = () => {
  ensureAudio();
  resetLevel(0);
};
ui.nextButton.disabled = true;
setSoundEnabled(true);
showOverlay("第一关", "黑色大块是浓墨，黑色小球是墨灵。按住鼠标从浓墨一边拖到另一边，切掉没有墨灵的部分。", "开始练习", () => resetLevel(0));
requestAnimationFrame(loop);
