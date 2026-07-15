import "./styles.css";
import { Game } from "./core/Game";
import { loadCampaignProgress, recordLevelCompletion, saveCampaignProgress } from "./core/campaignProgress";
import { LEVELS } from "./levels/goldenLevel";

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const canvas = required<HTMLCanvasElement>("#game");
const startScreen = required<HTMLElement>("#startScreen");
const settingsMenu = required<HTMLElement>("#settingsMenu");
const tutorialDialog = required<HTMLDialogElement>("#tutorialDialog");
const levelDialog = required<HTMLDialogElement>("#levelDialog");
const levelGrid = required<HTMLElement>("#levelGrid");
const resultLabel = required<HTMLElement>("#resultLabel");
let campaign = loadCampaignProgress();

const game = new Game(canvas, {
  progressFill: required("#progressFill"),
  lifeLeaves: Array.from(document.querySelectorAll<HTMLElement>(".life-dot")),
  pauseDialog: required("#pauseDialog"),
  resultDialog: required("#resultDialog"),
}, {
  onLevelComplete(levelId) {
    campaign = recordLevelCompletion(campaign, levelId, LEVELS.length);
    saveCampaignProgress(campaign);
    resultLabel.textContent = levelId === LEVELS.length ? "十五幅墨境已成" : `第 ${levelId} 幅已成`;
    renderLevelGrid();
  },
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>("button");
  if (!button || button.id === "startGame" || button.id === "sound") return;
  game.playUiTap();
});

function renderLevelGrid(): void {
  levelGrid.replaceChildren(...LEVELS.map((level) => {
    const unlocked = level.id <= campaign.unlockedThrough;
    const complete = campaign.completed.includes(level.id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `level-tile${complete ? " is-complete" : ""}`;
    button.disabled = !unlocked;
    button.setAttribute("aria-label", unlocked ? `进入第 ${level.id} 关` : `第 ${level.id} 关尚未解锁`);
    button.innerHTML = unlocked ? `<b>${level.id}</b><span>${complete ? "已成" : "入画"}</span>` : "<b>·</b><span>未开</span>";
    button.addEventListener("click", () => {
      levelDialog.close();
      game.startLevel(level.id);
      startScreen.hidden = true;
    });
    return button;
  }));
}

function openLevels(): void {
  settingsMenu.hidden = true;
  renderLevelGrid();
  if (!levelDialog.open) levelDialog.showModal();
}

required<HTMLButtonElement>("#startGame").addEventListener("click", () => {
  if (campaign.unlockedThrough === 1) {
    game.startLevel(1);
    startScreen.hidden = true;
  } else {
    openLevels();
  }
});
required<HTMLButtonElement>("#openTutorial").addEventListener("click", () => tutorialDialog.showModal());
required<HTMLButtonElement>("#closeTutorial").addEventListener("click", () => tutorialDialog.close());
required<HTMLButtonElement>("#openLevels").addEventListener("click", openLevels);
required<HTMLButtonElement>("#closeLevels").addEventListener("click", () => levelDialog.close());

required<HTMLButtonElement>("#pause").addEventListener("click", () => game.pause());
required<HTMLButtonElement>("#resume").addEventListener("click", () => game.resume());
required<HTMLButtonElement>("#dialogRestart").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#again").addEventListener("click", () => game.restart());
required<HTMLButtonElement>("#nextLevel").addEventListener("click", () => {
  if (game.isLastLevel) {
    required<HTMLDialogElement>("#resultDialog").close();
    openLevels();
  } else {
    game.nextLevel();
  }
});
required<HTMLButtonElement>("#levels").addEventListener("click", () => {
  required<HTMLDialogElement>("#pauseDialog").close();
  openLevels();
});
required<HTMLButtonElement>("#resultLevels").addEventListener("click", () => {
  required<HTMLDialogElement>("#resultDialog").close();
  openLevels();
});

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
renderLevelGrid();
