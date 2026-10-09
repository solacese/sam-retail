import { test, expect } from "@playwright/test";
async function openGame(page: import("@playwright/test").Page) {
  await page.goto("?seed=BROWSER-TEST");
  await page.getByRole("button", { name: "Open for business" }).click();
}
test("mobile and desktop launch a single-card game without overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openGame(page);
  await expect(page.getByRole("meter")).toHaveCount(4);
  await expect(page.getByRole("button", { name: /^Approve:/ })).toBeVisible();
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    bottom: document.querySelector(".choice.approve")!.getBoundingClientRect()
      .bottom,
    height: innerHeight,
  }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  expect(sizes.bottom).toBeLessThan(sizes.height);
  expect(errors).toEqual([]);
});
test("pause and Event X-Ray preserve the current untimed decision", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await openGame(page);
  await page
    .getByRole("button", { name: "Why this card?", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".rule-block code")).toContainText("AND");
  await expect(page.locator(".xray-events code").first()).toBeVisible();
  await page.clock.fastForward(300000);
  await page.getByRole("button", { name: "Back to the decision" }).click();
  await page.getByRole("button", { name: "Pause game" }).click();
  await expect(
    page.getByRole("heading", { name: "Take a breather." }),
  ).toBeVisible();
  await page.clock.fastForward(300000);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(page.locator(".turn-dots")).toHaveAttribute(
    "aria-label",
    "Decision 1 of 6",
  );
});
test("decisions have no time limit or automatic rejection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await openGame(page);
  await page.clock.fastForward(300000);
  await expect(page.locator(".turn-dots")).toHaveAttribute(
    "aria-label",
    "Decision 1 of 6",
  );
  await expect(page.locator(".countdown")).toHaveText("Take your time");
  await expect(page.getByRole("button", { name: /^Approve:/ })).toBeEnabled();
  await expect(page.locator(".card-timer")).toHaveCount(0);
});
test("keyboard decisions commit and Space pauses when gameplay has focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await openGame(page);
  await page.locator(".game-main").focus();
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await page.clock.runFor(4700);
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText("REJECTED", { exact: true })).toBeVisible();
});
test("six decisions reach the daily report and autonomy unlock", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await openGame(page);
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: /^Approve:/ }).click();
    await page.clock.runFor(4700);
  }
  await expect(page.getByText("DAY 1 COMPLETE", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Stock monitoring unlocked", { exact: false }),
  ).toBeVisible();
  await page.clock.fastForward(60000);
  await expect(page.getByText("DAY 1 COMPLETE", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Open day 2" }).click();
  await expect(page.locator(".turn-dots")).toHaveAttribute(
    "aria-label",
    "Decision 1 of 6",
  );
  await page.getByRole("button", { name: "Shop", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Delegate bounded low-risk actions" }),
  ).toBeEnabled();
});
test("event stream and shop are optional panels", async ({ page }) => {
  await openGame(page);
  await expect(page.locator(".event-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "Events", exact: true }).click();
  await expect(page.locator(".event-row")).not.toHaveCount(0);
  await expect(
    page.getByText("decision/proposed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Shop", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Your retail operation." }),
  ).toBeVisible();
  await expect(page.getByText("Seed: BROWSER-TEST")).toBeVisible();
});
for (const [direction, result] of [
  [1, "APPROVED"],
  [-1, "REJECTED"],
] as const) {
  test(`pointer swipe tilts and arcs the card before ${result.toLowerCase()}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await openGame(page);
    const card = page.locator(".decision-card");
    await expect(card).toHaveCSS("opacity", "1");
    const b = await card.boundingBox();
    if (!b) throw Error("Missing card");
    await page.mouse.move(b.x + b.width / 2, b.y + 80);
    await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + direction * 120, b.y + 85, {
      steps: 12,
    });
    await expect
      .poll(() =>
        card.evaluate((el, expectedDirection) => {
          const matrix = new DOMMatrix(getComputedStyle(el).transform);
          return (
            Math.sign(matrix.b) === expectedDirection &&
            Math.abs(matrix.b) > 0.05 &&
            matrix.f < -1
          );
        }, direction),
      )
      .toBe(true);
    await page.mouse.up();
    await expect
      .poll(() =>
        page.evaluate((expectedDirection) => {
          const card = document.querySelector(".decision-card");
          if (!card) return false;
          const matrix = new DOMMatrix(getComputedStyle(card).transform);
          return (
            Math.sign(matrix.e) === expectedDirection &&
            Math.abs(matrix.e) > 120 &&
            matrix.f < -5
          );
        }, direction),
      )
      .toBe(true);
    await expect(page.getByText(result, { exact: true })).toBeVisible();
  });
}

test("results remain readable for 4.5 seconds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await openGame(page);
  await page.getByRole("button", { name: /^Approve:/ }).click();
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await page.clock.runFor(4000);
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await expect(page.locator(".turn-dots")).toHaveAttribute(
    "aria-label",
    "Decision 1 of 6",
  );
  await page.clock.runFor(700);
  await expect(page.locator(".turn-dots")).toHaveAttribute(
    "aria-label",
    "Decision 2 of 6",
  );
  await expect(page.getByRole("button", { name: /^Approve:/ })).toBeEnabled();
});

test("small viewport and reduced-motion preferences remain playable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 640 });
  await openGame(page);
  await expect(page.getByRole("button", { name: /^Approve:/ })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
  await page.getByRole("button", { name: /^Reject:/ }).click();
  await expect(page.getByText("REJECTED", { exact: true })).toBeVisible();
});

test("choices show only their labels and cards show technical context", async ({
  page,
}) => {
  await openGame(page);
  const choices = page.locator(".choice");
  await expect(choices.locator(".option-effects")).toHaveCount(0);
  await expect(choices.locator("strong")).toHaveCount(2);
  await expect(page.locator(".resource>small")).toHaveCount(0);
  await expect(page.locator(".technical-events code")).toContainText("/");
  await expect(page.locator(".technical-agent strong")).toHaveText(
    /GPT|Claude|Gemini/,
  );
  await expect(page.locator(".card-technical")).not.toContainText("simulated");
  await expect(page.locator(".technical-agent")).toContainText("proposes to");
  await expect(page.locator(".card-technical > div").first()).toHaveClass(
    "technical-events",
  );
});
