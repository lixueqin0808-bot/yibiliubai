import "./styles.css";
import { Game } from "./core/Game";

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const canvas = required<HTMLCanvasElement>("#game");
const game = new Game(canvas, {
  progressText: required("#progressText"),
  progressBar: required("#progressBar"),
  tip: required("#tip"),
  pauseDialog: required("#pauseDialog"),
  resultDialog: required("#resultDialog"),
  resultMeta: required("#resultMeta"),
  stars: required("#stars"),
});

required<HTMLButtonElement>("#restart").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#pause").addEventListener("click", () => game.pause());
required<HTMLButtonElement>("#resume").addEventListener("click", () => game.resume());
required<HTMLButtonElement>("#dialogRestart").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#again").addEventListener("click", () => game.restart());

const soundButton = required<HTMLButtonElement>("#sound");
function renderSoundState(): void {
  const enabled = game.soundEnabled;
  soundButton.textContent = enabled ? "♪" : "×";
  soundButton.setAttribute("aria-label", enabled ? "关闭声音" : "打开声音");
  soundButton.setAttribute("title", enabled ? "关闭声音" : "打开声音");
  soundButton.setAttribute("aria-pressed", String(enabled));
}
soundButton.addEventListener("click", () => {
  game.toggleSound();
  renderSoundState();
});
renderSoundState();
