import { OrthographicCamera, Vector3 } from "three";
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

async function selectPerson(page: Page, name = "Mia") {
  const people = page.locator(".people-list");
  if ((await people.getAttribute("open")) === null)
    await people.locator("summary").click();
  await people
    .getByRole("button", { name: new RegExp(`^Select ${name},`) })
    .click();
  await expect(
    page.getByRole("region", { name: "Person actions" }),
  ).toBeVisible();
}
test("people have playful actions and return to their shopping after a dance", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await selectPerson(page);
  await page.getByRole("button", { name: "Wave hello", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Mia says hello");
  if (!(await page.getByRole("region", { name: "Person actions" }).isVisible()))
    await selectPerson(page);
  await page
    .getByRole("button", { name: "Do a happy dance", exact: true })
    .click();
  if (!(await page.getByRole("region", { name: "Person actions" }).isVisible()))
    await selectPerson(page);
  await expect(page.getByTestId("person-activity")).toContainText("dance");
  await page
    .getByRole("button", { name: "Close inspector", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await page.waitForTimeout(4000);
  await selectPerson(page);
  await expect(page.getByTestId("person-activity")).not.toContainText(
    "happy dance",
  );
});
test("shelves can send shoppers over, take a tumble and coordinate cleanup", async ({
  page,
}) => {
  await openStore(page);
  await pause(page);
  await page
    .locator(".department-button")
    .filter({ hasText: "Pantry" })
    .click();
  await page
    .getByRole("button", { name: "Send a shopper here", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("on the way to pantry");
  const total = await page.getByTestId("total-inventory").innerText();
  if (
    !(await page
      .getByRole("button", { name: "A little shelf wobble", exact: true })
      .isVisible())
  )
    await page
      .locator(".department-button")
      .filter({ hasText: "Pantry" })
      .click();
  await page
    .getByRole("button", { name: "A little shelf wobble", exact: true })
    .click();
  await expect(page.getByTestId("inventory-floor")).toHaveText("1");
  await expect(page.getByTestId("total-inventory")).toHaveText(total);
  if (
    await page
      .getByRole("button", { name: "Close inspector", exact: true })
      .isVisible()
  )
    await page
      .getByRole("button", { name: "Close inspector", exact: true })
      .click();
  await page.getByRole("button", { name: "2×", exact: true }).click();
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  const pulse = page.getByRole("complementary", {
    name: "Live store information",
  });
  await pulse
    .getByRole("combobox", { name: "Filter live events" })
    .selectOption("inventory");
  await expect(
    pulse
      .locator(".pulse-event")
      .filter({ hasText: "returned to the display" }),
  ).toBeVisible({ timeout: 35000 });
});
test("a person can start a conversation and the selection works without WebGL", async ({
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
  await openStore(page);
  await pause(page);
  await selectPerson(page);
  await page
    .getByRole("button", { name: "Say hello to someone", exact: true })
    .click();
  if (!(await page.getByRole("region", { name: "Person actions" }).isVisible()))
    await selectPerson(page);
  await expect(page.getByTestId("person-activity")).toHaveText(
    "Going to say hello",
  );
  await expect(
    page.getByRole("button", { name: "Do a happy dance", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Close inspector", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Play simulation", exact: true })
    .click();
  await page.waitForTimeout(9000);
  await page.getByRole("button", { name: "Events", exact: true }).click();
  await page.getByRole("button", { name: "Operations", exact: true }).click();
  await expect(
    page.locator(".stream-event").filter({ hasText: "friendly chat" }).first(),
  ).toBeVisible();
});

test("a tap on a 3D shopper opens the contextual person menu", async ({
  page,
}, testInfo) => {
  await openStore(page);
  await pause(page);
  if (!(await page.locator("canvas").count()))
    test.skip(true, "This device uses the operational fallback.");
  await page.getByRole("button", { name: "Reset store", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset store", exact: true })
    .click();
  await page.waitForTimeout(400);
  const canvas = page.locator("canvas"),
    box = (await canvas.boundingBox())!;
  const camera = new OrthographicCamera(
    -box.width / 2,
    box.width / 2,
    box.height / 2,
    -box.height / 2,
    0.1,
    150,
  );
  camera.position.set(35, 43, 45);
  camera.lookAt(0, 0, 1.5);
  camera.zoom = Math.min(
    box.width / (box.width < 700 ? 59 : 58),
    box.height / 35,
  );
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  const point = new Vector3(-14.7, 1.4, -4).project(camera);
  const position = {
    x: ((point.x + 1) * box.width) / 2,
    y: ((1 - point.y) * box.height) / 2,
  };
  if (testInfo.project.name === "desktop") await canvas.click({ position });
  else await canvas.tap({ position });
  const menu = page.getByRole("region", { name: "Person actions" });
  await expect(
    menu.getByRole("heading", { name: "Mia", exact: true }),
  ).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Wave hello", exact: true }),
  ).toBeVisible();
});
