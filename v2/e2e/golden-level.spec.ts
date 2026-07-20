import { expect, test } from "@playwright/test";

test("mobile canvas renders and accepts the first cut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#startScreen")).toBeVisible();
  await page.screenshot({ path: "test-results/start-screen.png", fullPage: true });
  await page.locator("#startGame").click();
  await expect(page.locator("#startScreen")).toBeHidden();
  await expect(page.locator("#levelIndicator")).toHaveText("第 01 关");
  await expect.poll(() => page.locator(".target-knot").evaluate((element) => (element as HTMLElement).style.left)).toBe("48%");
  await expect(page.locator(".life-dot")).toHaveCount(3);
  await expect(page.locator("#settingsMenu")).toBeHidden();
  await page.locator("#settings").click();
  await expect(page.locator("#settingsMenu")).toBeVisible();
  await page.locator("#settings").click();
  await expect(page.locator("#settingsMenu")).toBeHidden();

  const nonPaperPixels = await page.locator("#game").evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");
    if (!context) return 0;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 64) {
      if (pixels[index] < 220 || pixels[index + 1] < 220 || pixels[index + 2] < 220) count += 1;
    }
    return count;
  });
  expect(nonPaperPixels).toBeGreaterThan(1000);

  await page.mouse.move(8, 300);
  await page.mouse.down();
  await page.mouse.move(382, 300, { steps: 12 });
  await expect.poll(() => page.locator("#progressFill").evaluate((element) => element.style.clipPath)).not.toBe("inset(0px 0% 0px 0px)");
  await page.mouse.up();
  await page.screenshot({ path: "test-results/golden-mobile.png", fullPage: true });

  await page.waitForTimeout(220);
  await page.mouse.move(8, 440);
  await page.mouse.down();
  await page.mouse.move(382, 440, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator("#resultDialog")).toBeVisible({ timeout: 2_500 });
  await expect(page.locator("#nextLevel")).toBeEnabled({ timeout: 2_500 });
  await page.locator("#nextLevel").click();
  await expect(page.locator("#game")).toHaveAttribute("data-level", "2");
  await expect(page.locator("#levelIndicator")).toHaveText("第 02 关");
  await page.screenshot({ path: "test-results/golden-result.png", fullPage: true });
});

test("desktop keeps the portrait game centered without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#startGame").click();
  const shell = page.locator(".game-shell");
  const box = await shell.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(430);
  expect(Math.abs(box!.x + box!.width / 2 - 720)).toBeLessThan(2);
  await page.mouse.move(box!.x + 4, box!.y + 312 * box!.height / 844);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width + 80, box!.y + 312 * box!.height / 844, { steps: 12 });
  await expect.poll(() => page.locator("#progressFill").evaluate((element) => element.style.clipPath)).not.toBe("inset(0px 0% 0px 0px)");
  await page.mouse.up();
  await page.screenshot({ path: "test-results/golden-desktop.png", fullPage: true });
});

test("returning players choose a level instead of being sent to the latest unlock", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("yibiliubai-v2-campaign", JSON.stringify({ unlockedThrough: 15, completed: Array.from({ length: 15 }, (_, index) => index + 1) }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#startGame").click();
  await expect(page.locator("#levelDialog")).toBeVisible();
  await expect(page.locator(".level-tile:not(:disabled)")).toHaveCount(15);
  await expect(page.locator("#game")).toHaveAttribute("data-level", "1");
});

test("locked edges render from the edge strip without a separate corner sprite", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("yibiliubai-v2-campaign", JSON.stringify({ unlockedThrough: 15, completed: [] }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#startGame").click();
  await page.getByRole("button", { name: "进入第 4 关" }).click();
  await expect(page.locator("#game")).toHaveAttribute("data-level", "4");

  const loadedCornerSprite = await page.evaluate(() => performance
    .getEntriesByType("resource")
    .some((entry) => entry.name.includes("ink-iron-corner-joint")));
  expect(loadedCornerSprite).toBe(false);
  const loadedEdgeStrip = await page.evaluate(() => performance
    .getEntriesByType("resource")
    .some((entry) => entry.name.includes("ink-silver-steel-edge-strip")));
  expect(loadedEdgeStrip).toBe(true);
  const loadedBevelStrip = await page.evaluate(() => performance
    .getEntriesByType("resource")
    .some((entry) => entry.name.includes("ink-slate-bevel-strip")));
  expect(loadedBevelStrip).toBe(true);

  await page.screenshot({ path: "test-results/locked-edge-level.png", fullPage: true });
});

test("all fifteen levels expose the final map silhouettes", async ({ page }) => {
  const expectedShapes = new Map([
    [1, "rounded-slab"],
    [2, "tapered-tablet"],
    [3, "triangle"],
    [4, "shield"],
    [5, "hex-jade"],
    [6, "kite"],
    [7, "star-disc"],
    [8, "teardrop"],
    [9, "leaf"],
    [10, "mountain"],
    [11, "wide-h"],
    [12, "heart"],
    [13, "vertical-slip"],
    [14, "lantern"],
    [15, "bagua"],
  ]);
  await page.addInitScript(() => {
    localStorage.setItem("yibiliubai-v2-campaign", JSON.stringify({ unlockedThrough: 15, completed: [] }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#startGame").click();

  for (const [level, shape] of expectedShapes) {
    await page.locator(".level-tile").nth(level - 1).click();
    await expect(page.locator("#game")).toHaveAttribute("data-level", String(level));
    await expect(page.locator("#game")).toHaveAttribute("data-shape", shape);
    if (level !== 15) {
      await page.locator("#settings").click();
      await page.locator("#openLevels").click();
      await expect(page.locator("#levelDialog")).toBeVisible();
    }
  }
});

test("all fifteen maps render with closed finite sidewall corners", async ({ page }) => {
  test.setTimeout(40_000);
  await page.addInitScript(() => {
    localStorage.setItem("yibiliubai-v2-campaign", JSON.stringify({ unlockedThrough: 15, completed: [] }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#startGame").click();

  for (let level = 1; level <= 15; level += 1) {
    await page.getByRole("button", { name: `进入第 ${level} 关` }).click();
    await expect(page.locator("#game")).toHaveAttribute("data-level", String(level));
    await page.waitForTimeout(100);
    await page.screenshot({ path: `test-results/map-${level}.png`, fullPage: true });
    if (level < 15) {
      await page.locator("#settings").click();
      await page.locator("#openLevels").click();
      await expect(page.locator("#levelDialog")).toBeVisible();
    }
  }
});

const resultCases = [
  ["hangbao", "夯爆了", { elapsedMs: 1_000, lives: 3, cuts: 8 }],
  ["top", "顶尖", { elapsedMs: 1_000, lives: 2, cuts: 8 }],
  ["ren-shang-ren", "人上人", { elapsedMs: 1_000, lives: 1, cuts: 8 }],
  ["npc", "NPC", { elapsedMs: 37_000, lives: 3, cuts: 8 }],
  ["la-wan-le", "拉完了", { elapsedMs: 55_000, lives: 3, cuts: 8 }],
] as const;

test.describe("result scoring flow", () => {
  for (const [rank, label, input] of resultCases) {
    test(`shows ${rank} with a locked-then-enabled result flow`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/?result-test=1");
      await page.locator("#startGame").click();
      await page.evaluate((value) => {
        const testWindow = window as typeof window & {
          __YIBILIUBAI_TEST__: { complete(input: typeof value): void };
        };
        testWindow.__YIBILIUBAI_TEST__.complete(value);
      }, input);
      const dialog = page.locator("#resultDialog");
      await expect(dialog).toBeHidden();
      await page.waitForTimeout(540);
      await expect(dialog).toBeVisible();
      await expect(page.locator("#nextLevel")).toBeDisabled();
      await page.waitForTimeout(950);
      await expect(dialog).toHaveAttribute("data-rank", rank);
      await expect(page.locator("#resultRank")).toHaveText(label);
      await expect(page.locator("#resultTime")).toHaveText(`${(input.elapsedMs / 1_000).toFixed(1)} 秒`);
      await expect(page.locator("#nextLevel")).toBeEnabled();
      if (rank === "hangbao") await page.screenshot({ path: "test-results/result-hangbao.png", fullPage: true });
    });
  }

  test("first dialog tap skips the animation without advancing the level", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?result-test=1");
    await page.locator("#startGame").click();
    await page.evaluate(() => {
      (window as typeof window & { __YIBILIUBAI_TEST__: { complete(input: { elapsedMs: number; lives: 1 | 2 | 3; cuts: number }): void } })
        .__YIBILIUBAI_TEST__.complete({ elapsedMs: 1_000, lives: 3, cuts: 3 });
    });
    await page.waitForTimeout(560);
    await page.locator("#resultDialog").click({ position: { x: 12, y: 12 } });
    await expect(page.locator("#nextLevel")).toBeEnabled();
    await expect(page.locator("#game")).toHaveAttribute("data-level", "1");
  });

  test("persists the faster best time after reload", async ({ page }) => {
    await page.goto("/?result-test=1");
    await page.locator("#startGame").click();
    const complete = (input: { elapsedMs: number; lives: 1 | 2 | 3; cuts: number }) => page.evaluate((value) => {
      (window as typeof window & { __YIBILIUBAI_TEST__: { complete(next: typeof value): void } })
        .__YIBILIUBAI_TEST__.complete(value);
    }, input);
    await complete({ elapsedMs: 20_000, lives: 3, cuts: 5 });
    await page.waitForTimeout(1_500);
    await page.locator("#again").click();
    await complete({ elapsedMs: 10_000, lives: 3, cuts: 5 });
    await page.waitForTimeout(1_500);
    await page.reload();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("yibiliubai-v2-campaign") ?? "{}"));
    expect(saved.bestTimes["1"]).toBe(10_000);
  });

  test("sound-off and reduced-motion modes still complete the result flow", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?result-test=1");
    await page.locator("#startGame").click();
    await page.locator("#settings").click();
    await page.locator("#sound").click();
    await page.evaluate(() => {
      (window as typeof window & { __YIBILIUBAI_TEST__: { complete(input: { elapsedMs: number; lives: 1 | 2 | 3; cuts: number }): void } })
        .__YIBILIUBAI_TEST__.complete({ elapsedMs: 1_000, lives: 3, cuts: 3 });
    });
    await expect(page.locator("#resultDialog")).toBeVisible({ timeout: 2_500 });
    await expect(page.locator("#nextLevel")).toBeEnabled({ timeout: 2_500 });
  });
});
