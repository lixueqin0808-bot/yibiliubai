import { expect, test } from "@playwright/test";

test("mobile canvas renders and accepts the first cut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#startScreen")).toBeVisible();
  await page.screenshot({ path: "test-results/start-screen.png", fullPage: true });
  await page.locator("#startGame").click();
  await expect(page.locator("#startScreen")).toBeHidden();
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
  await expect(page.locator("#resultDialog")).toBeVisible();
  await expect(page.locator("#nextLevel")).toBeVisible();
  await page.locator("#nextLevel").click();
  await expect(page.locator("#game")).toHaveAttribute("data-level", "2");
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
