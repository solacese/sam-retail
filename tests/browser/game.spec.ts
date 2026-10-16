import { test, expect, type Page } from "@playwright/test";
async function openStore(page: Page) {
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Paris Flagship" }),
  ).toBeVisible();
  await expect(
    page
      .locator("canvas")
      .or(page.getByRole("heading", { name: "Your store, at a glance" })),
  ).toBeVisible();
}
async function pause(page: Page) {
  await page
    .getByRole("button", { name: "Pause simulation", exact: true })
    .click();
}
async function review(page: Page, title: string) {
  await page
    .getByRole("button")
    .filter({ has: page.getByText(title, { exact: true }) })
    .click();
  await expect(
    page.getByRole("dialog", { name: "A decision for your store" }),
  ).toBeVisible();
}
async function approve(page: Page, title: string, action: string) {
  await review(page, title);
  await page.getByRole("button", { name: action, exact: true }).click();
}
test("opens directly into a responsive shop without runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openStore(page);
  await expect(
    page.getByRole("region", { name: "Live store performance" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Europe", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".department-button").filter({ hasText: "Fruit & veg" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.waitForTimeout(600);
  expect(errors).toEqual([]);
});
test("manual pause, decision pause and resume preserve playback state", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  const initial = await page.getByTestId("store-clock").innerText();
  await page.waitForTimeout(1100);
  await expect(page.getByTestId("store-clock")).toHaveText(initial);
  await review(page, "Keep the apple shelf full");
  await page.waitForTimeout(1100);
  await expect(page.getByTestId("store-clock")).toHaveText(initial);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Play simulation", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await review(page, "Keep the apple shelf full");
  const frozen = await page.getByTestId("store-clock").innerText();
  await page.waitForTimeout(1100);
  await expect(page.getByTestId("store-clock")).toHaveText(frozen);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("store-clock")).not.toHaveText(frozen, {
    timeout: 5000,
  });
});
test("deal updates visible shelf prices and emits filtered pricing history", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await page
    .getByRole("button", { name: /Bakery/ })
    .filter({ has: page.locator(".dept-dot") })
    .click();
  await expect(page.getByText(/€3.49/)).toBeVisible();
  await page.getByRole("button", { name: "Close inspector" }).click();
  await approve(
    page,
    "Sell fresh food before it expires",
    "Launch a 20% bakery deal",
  );
  await page
    .getByRole("button", { name: /Bakery/ })
    .filter({ has: page.locator(".dept-dot") })
    .click();
  await expect(page.getByText(/€2.79 · deal/)).toBeVisible();
  await page.getByRole("button", { name: "Events", exact: true }).click();
  await page.getByRole("button", { name: "Pricing", exact: true }).click();
  await expect(page.locator(".stream-event")).toHaveCount(4);
  await expect(page.locator(".stream-event").first()).toContainText(
    "on shelf, till & online",
  );
  await expect(page.locator(".event-history code").first()).toContainText(
    "abc/retail/v1/fr/paris-flagship/price/",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Play simulation", exact: true }),
  ).toBeVisible();
});
test("Europe pauses flagship and offers one example store card", async ({
  page,
}) => {
  await openStore(page);
  await page.getByRole("button", { name: "Europe", exact: true }).click();
  const clock = await page.getByTestId("store-clock").innerText();
  await expect(
    page.locator(".country-label").getByText("France", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Choose France", exact: true })
    .click();
  await page
    .getByRole("button", { name: "ABC Shop · Paris Market", exact: true })
    .click();
  await expect(page.getByText("EXAMPLE STORE PROFILE")).toBeVisible();
  await expect(page.getByText("How Solace Agent Mesh helps")).toBeVisible();
  await expect(page.locator(".network-benefit")).toHaveCount(3);
  await expect(page.getByTestId("store-clock")).toHaveText(clock);
  await page.getByRole("button", { name: "Enter Paris Flagship" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByTestId("store-clock")).not.toHaveText(clock, {
    timeout: 5000,
  });
});
test("inspectors, speed and reset remain accessible on touch layouts", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await page.getByRole("button", { name: "2×", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "2×", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Checkouts", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Checkouts", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Checkout 3", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset camera", exact: true }).click();
  await page.getByRole("button", { name: "Reset store", exact: true }).click();
  await page
    .getByRole("button", { name: "Reset store", exact: true })
    .last()
    .click();
  await expect(page.getByTestId("store-clock")).toHaveText("09:00:00");
  await expect(page.getByTestId("sales")).toHaveText("€0.00");
  await expect(page.locator(".recommendation.pending")).toHaveCount(4);
});
test("event drawer supports pause, category filters and history", async ({
  page,
}) => {
  await openStore(page);
  await page.getByRole("button", { name: "Events", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await expect(page.locator(".stream-event").first()).toContainText(
    "Inventory",
  );
  expect(await page.locator(".stream-event").count()).toBeGreaterThan(10);
  const n = await page.locator(".stream-event").count();
  await page.waitForTimeout(600);
  await expect(page.locator(".stream-event")).toHaveCount(n);
  await page.getByRole("button", { name: "All events", exact: true }).click();
  await expect(page.locator(".stream-event").first()).toBeVisible();
});
test("reduced motion preserves useful operations and untimed decisions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openStore(page);
  await review(page, "Get the collection order ready");
  await expect(page.getByText("What happens", { exact: true })).toBeVisible();
  await expect(page.getByText("The tradeoff", { exact: true })).toBeVisible();
  const t = await page.getByTestId("store-clock").innerText();
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("store-clock")).toHaveText(t);
  await page
    .getByRole("button", { name: "Keep the colleague available", exact: true })
    .click();
  await expect(page.locator(".recommendation.declined")).toHaveCount(1);
});
test("without WebGL, operational view and decisions still work", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2" || type === "webgl") return null;
      return original.call(this, type as "2d", ...(args as []));
    } as typeof original;
  });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Your store, at a glance" }),
  ).toBeVisible();
  await page
    .getByTestId("shop-scene")
    .getByRole("button", { name: "Fruit & veg", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fruit & veg", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Apples", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close inspector" }).click();
  await approve(
    page,
    "Sell fresh food before it expires",
    "Launch a 20% bakery deal",
  );
  await expect(page.getByRole("status")).toContainText(
    "All prices are in sync",
  );
});
