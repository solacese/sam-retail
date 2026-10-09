import { test, expect } from "@playwright/test";
async function freezeClock(page: import("@playwright/test").Page) {
  // Browser and host clocks can differ slightly, so use an explicit start
  // and pause one minute later before loading the app.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:01:00Z"));
}
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
test("Menu and Event X-Ray preserve the current untimed decision", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freezeClock(page);
  await openGame(page);
  const title = await page.locator(".decision-card h2").innerText();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Why this card?", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".rule-block code")).toContainText("AND");
  await expect(page.locator(".xray-events code").first()).toBeVisible();
  await page.clock.fastForward(300000);
  await page.getByRole("button", { name: "Back to the decision" }).click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.clock.fastForward(300000);
  await expect(
    page.getByRole("dialog", { name: "Menu", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByRole("button", { name: "Pause game" })).toHaveCount(0);
  await expect(page.locator(".decision-card h2")).toHaveText(title);
});
test("decisions have no time limit or automatic rejection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freezeClock(page);
  await openGame(page);
  const title = await page.locator(".decision-card h2").innerText();
  await page.clock.fastForward(300000);
  await expect(page.locator(".decision-card h2")).toHaveText(title);
  await expect(page.locator(".day-line, .turn-dots, .countdown")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Approve:/ })).toBeEnabled();
  await expect(page.locator(".card-timer")).toHaveCount(0);
});
test("keyboard decisions commit and Space pauses when gameplay has focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freezeClock(page);
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
  await freezeClock(page);
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
  await expect(page.locator(".decision-card")).toBeVisible();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Your operation", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Delegate bounded low-risk actions" }),
  ).toBeEnabled();
});
test("event stream and shop are optional panels", async ({ page }) => {
  await openGame(page);
  await expect(page.locator(".event-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByRole("button", { name: "Events", exact: true }).click();
  await expect(page.locator(".event-row")).not.toHaveCount(0);
  await expect(
    page.getByText("decision/proposed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .getByRole("button", { name: "Your operation", exact: true })
    .click();
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
    // Observe each frame before releasing: a remote CI browser can miss a
    // half-second exit between separate polling round trips.
    const exitCurve = page.evaluate(
      (expectedDirection) =>
        new Promise<boolean>((resolve) => {
          const started = performance.now();
          const observe = () => {
            const card = document.querySelector(".decision-card");
            if (card) {
              const matrix = new DOMMatrix(getComputedStyle(card).transform);
              if (
                Math.sign(matrix.e) === expectedDirection &&
                Math.abs(matrix.e) > 120 &&
                matrix.f < -5
              ) {
                resolve(true);
                return;
              }
            }
            if (!card || performance.now() - started > 2000) resolve(false);
            else requestAnimationFrame(observe);
          };
          requestAnimationFrame(observe);
        }),
      direction,
    );
    await page.mouse.up();
    expect(await exitCurve).toBe(true);
    await expect(page.getByText(result, { exact: true })).toBeVisible();
  });
}

test("results remain readable for 4.5 seconds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freezeClock(page);
  await openGame(page);
  await page.getByRole("button", { name: /^Approve:/ }).click();
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await page.clock.runFor(4000);
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Approve:/ })).toBeDisabled();
  await page.clock.runFor(700);
  await expect(page.getByText("APPROVED", { exact: true })).toHaveCount(0);
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

test("compact Events and Agents are visible, with full details in the menu", async ({ page }) => {
  await openGame(page);
  const choices = page.locator(".choice");
  await expect(choices.locator(".option-effects")).toHaveCount(0);
  await expect(choices.locator("strong")).toHaveCount(2);
  await expect(page.locator(".resource>small")).toHaveCount(0);
  await expect(page.locator(".decision-card .card-technical")).toHaveCount(0);
  await expect(page.locator(".card-context strong")).toHaveText(["Events", "Agents"]);
  await expect(page.locator(".card-context")).toBeVisible();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.getByText("Card details", { exact: true }).click();
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

test("phone browser height changes keep readable text and both choices on screen", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openGame(page);
  for (const [width, height] of [
    [393, 667],
    [393, 780],
    [320, 568],
    [430, 740],
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => document.fonts.ready);
    const layout = await page.evaluate(() => {
      const choice = document.querySelector(".choice.approve")!;
      const copy = document.querySelector(".decision-card .card-copy > p")!;
      const footer = document.querySelector(".site-footer")!;
      const context = document.querySelector(".card-context")!;
      return {
        width: innerWidth,
        height: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        choiceBottom: choice.getBoundingClientRect().bottom,
        choiceTop: choice.getBoundingClientRect().top,
        contextBottom: context.getBoundingClientRect().bottom,
        choiceHeight: choice.getBoundingClientRect().height,
        footerBottom: footer.getBoundingClientRect().bottom,
        copySize: parseFloat(getComputedStyle(copy).fontSize),
        choiceSize: parseFloat(
          getComputedStyle(choice.querySelector("strong")!).fontSize,
        ),
      };
    });
    expect(layout.scrollWidth).toBeLessThanOrEqual(width);
    expect(layout.scrollHeight).toBeLessThanOrEqual(height);
    expect(layout.choiceBottom).toBeLessThan(height);
    expect(layout.contextBottom).toBeLessThan(layout.choiceTop);
    expect(layout.footerBottom).toBeLessThanOrEqual(height);
    expect(layout.choiceHeight).toBeGreaterThanOrEqual(44);
    expect(layout.copySize).toBeGreaterThanOrEqual(16);
    expect(layout.choiceSize).toBeGreaterThanOrEqual(16);
  }
  await expect(page.getByRole("button", { name: "Pause game" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toBeVisible();
});
