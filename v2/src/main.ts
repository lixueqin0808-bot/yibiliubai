import "./styles.css";
import { Game } from "./core/Game";
import { loadCampaignProgress, recordLevelCompletion, saveCampaignProgress } from "./core/campaignProgress";
import { LEVELS } from "./levels/goldenLevel";
import { createResultViewModel } from "./results/resultViewModel";
import { ResultSequence } from "./results/ResultSequence";
import type { LevelResult } from "./results/resultScoring";

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
const resultDialog = required<HTMLDialogElement>("#resultDialog");
const resultRank = required<HTMLElement>("#resultRank");
const resultLevel = required<HTMLElement>("#resultLabel");
const resultScore = required<HTMLElement>("#resultScore");
const resultTime = required<HTMLElement>("#resultTime");
const resultLives = required<HTMLElement>("#resultLives");
const resultCuts = required<HTMLElement>("#resultCuts");
const resultBest = required<HTMLElement>("#resultBest");
const resultHint = required<HTMLElement>("#resultHint");
const resultActions = [
  required<HTMLButtonElement>("#resultLevels"),
  required<HTMLButtonElement>("#again"),
  required<HTMLButtonElement>("#nextLevel"),
];
let campaign = loadCampaignProgress();
const resultSequence = new ResultSequence();

const game = new Game(canvas, {
  progressFill: required("#progressFill"),
  targetKnot: required(".target-knot"),
  lifeLeaves: Array.from(document.querySelectorAll<HTMLElement>(".life-dot")),
  levelIndicator: required("#levelIndicator"),
  pauseDialog: required("#pauseDialog"),
  resultDialog: required("#resultDialog"),
}, {
  onLevelComplete(result: LevelResult) {
    const previousBest = campaign.bestTimes[String(result.levelId)];
    campaign = recordLevelCompletion(campaign, result.levelId, LEVELS.length, result.elapsedMs);
    saveCampaignProgress(campaign);
    const view = createResultViewModel(result, previousBest);
    resultDialog.dataset.rank = view.rank;
    resultRank.textContent = view.label;
    resultScore.textContent = `${view.score} 分`;
    resultLevel.textContent = result.levelId === LEVELS.length ? "十五幅墨境已成" : `第 ${result.levelId} 幅已成`;
    resultTime.textContent = view.time;
    resultLives.textContent = view.lives;
    resultCuts.textContent = view.cuts;
    resultBest.textContent = view.best;
    resultHint.textContent = view.hint;
    renderLevelGrid();
    resultDialog.dataset.resultStage = "";
    resultActions.forEach((action) => { action.disabled = true; });
    resultSequence.play({
      showDialog: () => resultDialog.showModal(),
      revealRank: () => { resultDialog.dataset.resultStage = "dialog rank"; },
      playVoice: () => game.playResultVoice(result.rank),
      landStamp: () => { resultDialog.dataset.resultStage = "dialog rank stamp"; },
      playStamp: () => game.playStamp(),
      revealStats: () => { resultDialog.dataset.resultStage = "dialog rank stamp stats"; },
      unlockActions: () => {
        resultDialog.dataset.resultStage = "dialog rank stamp stats actions";
        resultActions.forEach((action) => { action.disabled = false; });
      },
    });
  },
});

resultDialog.addEventListener("click", (event) => {
  if (resultSequence.isFinished) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  resultSequence.skip();
}, true);

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
  resultSequence.cancel();
  if (game.isLastLevel) {
    resultDialog.close();
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
  resultSequence.cancel();
  resultDialog.close();
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

if (new URLSearchParams(window.location.search).has("result-test")) {
  (window as Window & {
    __YIBILIUBAI_TEST__?: { complete(input: Pick<LevelResult, "elapsedMs" | "lives" | "cuts">): void };
  }).__YIBILIUBAI_TEST__ = {
    complete: (input) => game.completeForTest(input),
  };
}
