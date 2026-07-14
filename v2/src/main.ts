import "./styles.css";
import { Game } from "./core/Game";

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const canvas = required<HTMLCanvasElement>("#game");
const game = new Game(canvas, {
  progressFill: required("#progressFill"),
  lifeLeaves: Array.from(document.querySelectorAll<HTMLElement>(".life-dot")),
  pauseDialog: required("#pauseDialog"),
  resultDialog: required("#resultDialog"),
});

const settingsMenu = required<HTMLElement>("#settingsMenu");
required<HTMLButtonElement>("#pause").addEventListener("click", () => game.pause());
required<HTMLButtonElement>("#resume").addEventListener("click", () => game.resume());
required<HTMLButtonElement>("#dialogRestart").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#again").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#nextLevel").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#levels").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#resultLevels").addEventListener("click", () => game.restart());

required<HTMLButtonElement>("#settings").addEventListener("click", () => {
  settingsMenu.hidden = !settingsMenu.hidden;
});
const soundButton = required<HTMLButtonElement>("#sound");
function renderSoundState(): void {
  const enabled = game.soundEnabled;
  soundButton.textContent = enabled ? "♪" : "×";
  soundButton.setAttribute("aria-label", enabled ? "关闭音乐" : "打开音乐");
  soundButton.setAttribute("title", enabled ? "关闭音乐" : "打开音乐");
  soundButton.setAttribute("aria-pressed", String(enabled));
}

soundButton.addEventListener("click", () => {
  game.toggleSound();
  renderSoundState();
});
renderSoundState();
