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
