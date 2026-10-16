import { describe, expect, it } from "vitest";
import {
  advance,
  createStore,
  decide,
  DEPARTMENTS,
  metrics,
  routeBetween,
  stock,
  type StoreState,
} from "../src/simulation/store";
function run(s: StoreState, seconds: number) {
  for (let i = 0; i < seconds * 10; i++) advance(s, 0.1);
  return s;
}
function conservation(s: StoreState) {
  for (const b of s.batches) {
    expect(b.inBaskets).toBe(
      s.people
        .flatMap((p) => p.basket)
        .filter((l) => l.batchId === b.id)
        .reduce((n, l) => n + l.quantity, 0),
    );
    expect(b.inTransit).toBe(
      s.tasks
        .flatMap((t) => t.cargo)
        .filter((l) => l.batchId === b.id)
        .reduce((n, l) => n + l.quantity, 0),
    );
    expect(
      b.shelf +
        b.backroom +
        b.receiving +
        b.inBaskets +
        b.inTransit +
        b.sold +
        b.waste,
    ).toBe(b.received);
    for (const field of [
      "shelf",
      "backroom",
      "receiving",
      "inBaskets",
      "inTransit",
      "sold",
      "waste",
    ] as const)
      expect(b[field]).toBeGreaterThanOrEqual(0);
  }
}
describe("coherent retail simulation", () => {
  it("starts with 24 products, 32 shoppers and eight colleagues", () => {
    const s = createStore();
    expect(s.products).toHaveLength(24);
    expect(s.people.filter((p) => p.role === "shopper")).toHaveLength(32);
    expect(s.people.filter((p) => p.role === "employee")).toHaveLength(8);
    expect(s.transactions).toHaveLength(0);
    conservation(s);
  });
  it("replays the same activity for the same seed", () => {
    expect(run(createStore(42), 80)).toEqual(run(createStore(42), 80));
  });
  it("conserves every batch through shopping, replenishment, delivery and expiry", () => {
    const s = createStore();
    decide(s, "restock", true);
    decide(s, "online", true);
    decide(s, "meal", true);
    for (let i = 0; i < 2500; i++) {
      advance(s, 0.1);
      if (i % 100 === 0) conservation(s);
    }
    conservation(s);
    expect(s.batches.some((b) => b.waste > 0)).toBe(true);
    expect(s.deliveryCount).toBe(3);
  });
  it("recognizes sales only at payment and calculates gross profit from transaction costs", () => {
    const s = createStore();
    run(s, 4);
    expect(s.people.some((p) => p.basket.length)).toBe(true);
    expect(metrics(s).revenue).toBe(0);
    run(s, 110);
    expect(s.transactions.length).toBeGreaterThan(0);
    const m = metrics(s);
    expect(m.revenue).toBe(s.transactions.reduce((n, t) => n + t.revenue, 0));
    expect(m.profit).toBe(
      s.transactions.reduce((n, t) => n + t.revenue - t.cost, 0),
    );
    expect(m.margin).toBeCloseTo((m.profit / m.revenue) * 100);
  });
  it("moves reserved stock with a real colleague before replenishing a shelf", () => {
    const s = createStore();
    expect(decide(s, "restock", true)).toBe(true);
    expect(stock(s, "sku-0").shelf).toBe(5);
    expect(s.tasks[0].stage).toBe("source");
    run(s, 60);
    expect(s.tasks[0].stage).toBe("complete");
    expect(
      s.events.some((e) => e.topic.endsWith("stock/sku-0/replenished")),
    ).toBe(true);
    expect(stock(s, "sku-0").backroom).toBe(18);
    conservation(s);
  });
  it("opens checkout only after the colleague arrives and charges staffing once", () => {
    const s = createStore();
    decide(s, "checkout", true);
    expect(s.checkouts[2]).toBe(false);
    run(s, 50);
    expect(s.checkouts[2]).toBe(true);
    expect(s.operatingCosts).toBe(2200);
    expect(decide(s, "checkout", true)).toBe(false);
    run(s, 10);
    expect(s.operatingCosts).toBe(2200);
  });
  it("shares discounted prices across channels and charges that price in subsequent sales", () => {
    const s = createStore();
    decide(s, "meal", true);
    expect(s.products[4].price).toBe(
      Math.round(s.products[4].regularPrice * 0.8),
    );
    run(s, 120);
    for (const t of s.transactions)
      for (const line of t.lines)
        expect(line.unitPrice).toBe(
          s.products.find((p) => p.id === line.productId)!.price,
        );
    expect(s.events.filter((e) => e.category === "pricing")).toHaveLength(4);
  });
  it("picks and settles an online order through inventory and payment", () => {
    const s = createStore();
    decide(s, "online", true);
    run(s, 80);
    expect(s.onlineComplete).toBe(1);
    const tx = s.transactions.find((t) => t.source === "online");
    expect(tx).toBeDefined();
    expect(tx!.lines.reduce((n, l) => n + l.quantity, 0)).toBe(4);
    expect(s.people.some((p) => p.taskId === "task-online")).toBe(false);
    conservation(s);
  });
  it("declining preserves operations and cannot be applied again", () => {
    const s = createStore();
    decide(s, "meal", false);
    expect(s.mealActive).toBe(false);
    expect(s.tasks).toHaveLength(0);
    expect(decide(s, "meal", true)).toBe(false);
  });
  it("routes shoppers around every fixture instead of through shelves", () => {
    for (const d of DEPARTMENTS) {
      const path = routeBetween([12, 14], [d.position[0], d.position[1] + 2]);
      expect(path.length).toBeGreaterThan(0);
      for (const [x, z] of path)
        for (const shelf of DEPARTMENTS)
          expect(
            Math.abs(x - shelf.position[0]) < 3.8 &&
              Math.abs(z - shelf.position[1]) < 1.3,
          ).toBe(false);
    }
  });
  it("continues serving shoppers, with bounded event history and finite numbers", () => {
    const s = createStore();
    decide(s, "checkout", true);
    run(s, 500);
    expect(s.transactions.length).toBeGreaterThan(20);
    expect(s.events).toHaveLength(600);
    expect(new Set(s.events.map((e) => e.id)).size).toBe(600);
    expect(
      s.events.every((e) =>
        e.topic.startsWith("abc/retail/v1/fr/paris-flagship/"),
      ),
    ).toBe(true);
    for (const value of Object.values(metrics(s)))
      expect(Number.isFinite(value)).toBe(true);
    conservation(s);
  });
});

describe("retailer outcomes", () => {
  it("a fresh-food deal sells more bakery stock before expiry", () => {
    const regular = createStore(),
      deal = createStore();
    decide(deal, "meal", true);
    run(regular, 200);
    run(deal, 200);
    const bakerySold = (s: StoreState) =>
      s.batches
        .filter(
          (b) =>
            s.products.find((p) => p.id === b.productId)!.department ===
            "bakery",
        )
        .reduce((n, b) => n + b.sold, 0);
    expect(bakerySold(deal)).toBeGreaterThan(bakerySold(regular));
    expect(metrics(deal).waste).toBeLessThan(metrics(regular).waste);
  });
  it("an extra staffed checkout reduces experienced waiting", () => {
    const baseline = createStore(),
      extra = createStore();
    decide(extra, "checkout", true);
    run(baseline, 90);
    run(extra, 90);
    const average = (s: StoreState) =>
      s.queueSamples.reduce((n, v) => n + v, 0) / s.queueSamples.length;
    expect(average(extra)).toBeLessThan(average(baseline));
  });
  it("assigns different colleagues and reports the actual picked product", () => {
    const s = createStore();
    for (const id of ["restock", "checkout", "online"] as const)
      decide(s, id, true);
    expect(new Set(s.tasks.map((t) => t.employeeId)).size).toBe(3);
    run(s, 70);
    expect(s.events.some((e) => e.topic.endsWith("stock/sku-12/picked"))).toBe(
      true,
    );
    expect(s.events.some((e) => e.topic.endsWith("stock/sku-15/picked"))).toBe(
      true,
    );
    conservation(s);
  });
});
