import { expect, test } from "@playwright/test";

test("mobile canvas renders and accepts the first cut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".level-mark")).toHaveText("01");

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
  await expect(page.locator("#progressText")).not.toHaveText("0%");
  await page.mouse.up();
  await page.screenshot({ path: "test-results/golden-mobile.png", fullPage: true });

  await page.waitForTimeout(220);
  await page.mouse.move(8, 440);
  await page.mouse.down();
  await page.mouse.move(382, 440, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator("#resultDialog")).toBeVisible();
  await expect(page.locator("#resultMeta")).toContainText("2 笔");
  await page.screenshot({ path: "test-results/golden-result.png", fullPage: true });
});

test("desktop keeps the portrait game centered without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const shell = page.locator(".game-shell");
  const box = await shell.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeLessThanOrEqual(430);
  expect(Math.abs(box!.x + box!.width / 2 - 720)).toBeLessThan(2);
  await page.mouse.move(box!.x + 4, box!.y + 312 * box!.height / 844);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width + 80, box!.y + 312 * box!.height / 844, { steps: 12 });
  await expect(page.locator("#progressText")).not.toHaveText("0%");
  await page.mouse.up();
  await page.screenshot({ path: "test-results/golden-desktop.png", fullPage: true });
});
