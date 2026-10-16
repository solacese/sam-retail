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
  // Work through the two-item decision queue until the requested priority appears.
  for (
    let n = 0;
    n < 4 &&
    (await page
      .locator(".recommendation")
      .filter({ hasText: title })
      .count()) === 0;
    n++
  ) {
    await page.locator(".recommendation").first().click();
    await page.getByRole("dialog").locator(".secondary").click();
  }
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
  await review(page, "Availability or leaner stock?");
  await page.waitForTimeout(1100);
  await expect(page.getByTestId("store-clock")).toHaveText(initial);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(
    page.getByRole("button", { name: "Play simulation", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await review(page, "Availability or leaner stock?");
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
    "Protect margin or reduce food waste?",
    "Favor lower food waste",
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
  await expect(page.locator(".recommendation.pending")).toHaveCount(2);
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
  await review(page, "Online promises or in-store capacity?");
  await expect(page.getByText("What happens", { exact: true })).toBeVisible();
  await expect(page.getByText("The tradeoff", { exact: true })).toBeVisible();
  const t = await page.getByTestId("store-clock").innerText();
  await page.waitForTimeout(1500);
  await expect(page.getByTestId("store-clock")).toHaveText(t);
  await page
    .getByRole("button", { name: "Prioritize in-store shoppers", exact: true })
    .click();
  await expect(page.getByTestId("decision-impact-online")).toBeVisible();
  await expect(
    page.getByText("In-store shoppers prioritized", { exact: true }),
  ).toBeVisible();
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
    "Protect margin or reduce food waste?",
    "Favor lower food waste",
  );
  await expect(page.getByRole("status")).toContainText(
    "All prices are in sync",
  );
});

test("manager decisions set store priorities instead of assigning individual shelf jobs", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await approve(
    page,
    "Availability or leaner stock?",
    "Protect product availability",
  );
  await expect(
    page.getByText("Availability prioritized", { exact: true }),
  ).toBeVisible();
  await review(page, "Service or lower operating costs?");
  await page
    .getByRole("button", { name: "Hold operating costs", exact: true })
    .click();
  await expect(
    page.getByText("Operating costs held", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Send a colleague to restock",
      exact: true,
    }),
  ).toHaveCount(0);
});

test("live information stays beside the desktop shop and stacks below it on phones", async ({
  page,
}, testInfo) => {
  await openStore(page);
  await pause(page);
  const pulse = page.getByRole("complementary", {
    name: "Live store information",
  });
  await expect(
    pulse.getByRole("heading", { name: "Store pulse" }),
  ).toBeVisible();
  await expect(pulse.getByTestId("fridge-temperature")).toContainText("°C");
  await expect(
    pulse.getByRole("img", { name: /Fridge .*degrees Celsius/ }),
  ).toBeVisible();
  const read = async (id: string) =>
    Number((await pulse.getByTestId(id).innerText()).replaceAll(",", ""));
  expect(await read("total-inventory")).toBe(
    (await read("inventory-shelf")) +
      (await read("inventory-backroom")) +
      (await read("inventory-held")),
  );
  const left = await pulse.boundingBox(),
    shop = await page
      .getByRole("region", { name: "Paris Flagship shop floor" })
      .boundingBox();
  if (testInfo.project.name === "desktop") {
    expect(left!.x + left!.width).toBeLessThanOrEqual(shop!.x + 1);
    const feed = await pulse.getByTestId("live-event-feed").boundingBox();
    expect(feed!.height).toBeGreaterThanOrEqual(180);
    expect(feed!.y + 100).toBeLessThan(900);
  } else expect(left!.y).toBeGreaterThanOrEqual(shop!.y + shop!.height - 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("live feed filters, visualizes price updates and respects the shared pause control", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await approve(
    page,
    "Protect margin or reduce food waste?",
    "Favor lower food waste",
  );
  const pulse = page.getByRole("complementary", {
    name: "Live store information",
  });
  await pulse
    .getByRole("combobox", { name: "Filter live events" })
    .selectOption("pricing");
  await expect(pulse.locator(".pulse-event")).toHaveCount(4);
  await expect(pulse.locator(".pulse-event").first()).toContainText(
    "on shelf, till & online",
  );
  await expect(
    pulse.getByRole("img", { name: /Event activity over the last 30 seconds/ }),
  ).toBeVisible();
  const first = await pulse
    .locator(".pulse-event")
    .first()
    .getAttribute("data-event-id");
  await page.waitForTimeout(700);
  await expect(pulse.locator(".pulse-event").first()).toHaveAttribute(
    "data-event-id",
    first!,
  );
  await pulse.getByRole("button", { name: "Open full event history" }).click();
  await expect(
    page.getByRole("dialog", { name: "The event stream" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await pulse
    .getByRole("combobox", { name: "Filter live events" })
    .selectOption("iot");
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await expect(
    pulse
      .locator(".pulse-event")
      .filter({ hasText: "fridge/fresh/temperature" })
      .first(),
  ).toBeVisible({ timeout: 10000 });
});

test("presents at most two decisions and shows the actual work they cause", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await expect(page.locator(".recommendation")).toHaveCount(2);
  await approve(
    page,
    "Protect margin or reduce food waste?",
    "Favor lower food waste",
  );
  await expect(page.locator(".recommendation")).toHaveCount(2);
  await expect(page.getByTestId("decision-impact-meal")).toContainText(
    "Bakery prices −20%",
  );
  await approve(
    page,
    "Service or lower operating costs?",
    "Invest in customer service",
  );
  await expect(page.locator(".recommendation")).toHaveCount(2);
  await expect(page.getByTestId("decision-impact-checkout")).toContainText(
    "walking to checkout 3",
  );
  await page.getByRole("button", { name: "2×", exact: true }).click();
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await expect(page.getByTestId("decision-impact-checkout")).toContainText(
    "Checkout 3 is open",
    { timeout: 35000 },
  );
  await page.getByRole("button", { name: "Checkouts", exact: true }).click();
  const inspector = page.locator(".inspector");
  await expect(inspector.getByText("Open", { exact: true })).toHaveCount(3);
});
