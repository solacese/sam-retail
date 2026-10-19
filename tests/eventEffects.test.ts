import { describe, expect, it } from "vitest";
import {
  advance,
  createStore,
  TILLS,
  type StoreState,
} from "../src/simulation/store";
import {
  EVENT_EFFECT_SECONDS,
  shopEventEffects,
} from "../src/shop/eventEffects";
function until(s: StoreState, predicate: () => boolean, seconds = 80) {
  for (let n = 0; n < seconds * 10 && !predicate(); n++) advance(s, 0.1);
  expect(predicate()).toBe(true);
}
describe("shop floor event feedback", () => {
  it("does not flash initial stock snapshots or generate activity", () => {
    const s = createStore();
    const before = structuredClone(s);
    expect(shopEventEffects(s)).toEqual([]);
    expect(s).toEqual(before);
  });
  it("places real shelf picks at the product's fixture", () => {
    const s = createStore();
    until(s, () => shopEventEffects(s).some((e) => e.kind === "inventory"));
    const effect = shopEventEffects(s).find((e) => e.kind === "inventory")!;
    const source = s.events.find((e) => e.id === effect.id)!;
    const product = s.products.find((p) =>
      source.topic.includes(`/stock/${p.id}/`),
    )!;
    expect(effect.position).toEqual([
      product.position[0],
      product.position[1] - 2,
    ]);
    expect(effect.description).toContain(source.message);
    expect(effect.label).toBe("Stock updated");
  });
  it("places a paid amount at the till that actually settled the basket", () => {
    const s = createStore();
    until(s, () =>
      s.people.some(
        (p) => p.role === "shopper" && p.stage === "paying" && p.timer < 3.9,
      ),
    );
    const payer = s.people.find(
      (p) => p.role === "shopper" && p.stage === "paying" && p.timer < 3.9,
    )!;
    const till = payer.checkout;
    payer.timer = 0;
    advance(s, 0.1);
    const effect = shopEventEffects(s).find((e) => e.kind === "payment")!;
    expect(effect).toBeDefined();
    expect(effect.position).toEqual(TILLS[till]);
    const transaction = s.transactions.at(-1)!;
    expect(effect.at).toBe(transaction.at);
    expect(effect.label).toBe(
      `Paid €${(transaction.revenue / 100).toFixed(2)}`,
    );
    expect(transaction.source).toBe("till");
  });
  it("coalesces repeated shelf events and expires on simulation time, including reset", () => {
    const s = createStore();
    until(s, () => shopEventEffects(s).some((e) => e.kind === "inventory"));
    const original = s.events.find((e) => e.id === shopEventEffects(s)[0].id)!;
    s.events.unshift({ ...original, id: 99999 });
    const effects = shopEventEffects(s);
    expect(effects[0].id).toBe(99999);
    expect(effects.some((e) => e.id === original.id)).toBe(false);
    // Merely rendering a paused snapshot never advances the feedback.
    expect(shopEventEffects(s)).toEqual(effects);
    s.time += EVENT_EFFECT_SECONDS;
    expect(shopEventEffects(s)).toEqual([]);
    expect(shopEventEffects(createStore())).toEqual([]);
  });
  it("ignores future, collection and floor-drop events instead of showing false payments or refills", () => {
    const s = createStore();
    s.time = 10;
    s.events = [
      {
        id: 1,
        at: 11,
        category: "inventory",
        topic: "abc/stock/sku-0/updated",
        message: "future",
      },
      {
        id: 2,
        at: 10,
        category: "purchases",
        topic: "abc/purchase/online/completed",
        message: "Collected",
        position: [0, 0],
      },
      {
        id: 3,
        at: 10,
        category: "inventory",
        topic: "abc/stock/sku-0/floor-updated",
        message: "Dropped",
      },
    ];
    expect(shopEventEffects(s)).toEqual([]);
  });
});
