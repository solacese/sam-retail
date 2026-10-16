import { describe, expect, it } from "vitest";
import {
  advance,
  createStore,
  decide,
  interact,
  DEPARTMENTS,
  ENTRY,
  FIXTURE_WIDTH,
  visibleRecommendations,
  decisionImpact,
  activeSecurityCase,
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
    expect(b.onFloor).toBe(
      s.floorItems.filter((i) => i.batchId === b.id && i.status !== "cleared")
        .length,
    );
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
        b.onFloor +
        b.sold +
        b.waste,
    ).toBe(b.received);
    for (const field of [
      "shelf",
      "backroom",
      "receiving",
      "inBaskets",
      "inTransit",
      "onFloor",
      "sold",
      "waste",
    ] as const)
      expect(b[field]).toBeGreaterThanOrEqual(0);
  }
}
describe("coherent retail simulation", () => {
  it("starts with 24 products, 12 shoppers, six colleagues and a security guard", () => {
    const s = createStore();
    expect(s.products).toHaveLength(24);
    expect(s.people.filter((p) => p.role === "shopper")).toHaveLength(12);
    expect(s.people.filter((p) => p.role === "employee")).toHaveLength(7);
    expect(s.people.filter((p) => p.job === "security")).toHaveLength(1);
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
    // Isolate service capacity: receipt-check stories change return-visit arrival times.
    baseline.nextSecurityAt = extra.nextSecurityAt = Infinity;
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

describe("shop-floor movement and manager priorities", () => {
  it("keeps visible people physically separated through arrivals, queueing, tasks and exits", () => {
    for (const seed of [42, 2401, 991]) {
      const s = createStore(seed);
      for (const kind of ["restock", "checkout", "online"] as const)
        decide(s, kind, true);
      let smallest = Infinity;
      for (let tick = 0; tick < 1600; tick++) {
        advance(s, 0.1);
        const visible = s.people.filter((p) => p.stage !== "outside");
        for (let a = 0; a < visible.length; a++)
          for (let b = a + 1; b < visible.length; b++)
            smallest = Math.min(
              smallest,
              Math.hypot(
                visible[a].position[0] - visible[b].position[0],
                visible[a].position[1] - visible[b].position[1],
              ),
            );
      }
      expect(smallest).toBeGreaterThanOrEqual(1.14 - 1e-6);
      expect(s.transactions.length).toBeGreaterThan(8);
    }
  });
  it("gives every floor colleague meaningful movement instead of parking them at the back wall", () => {
    const s = createStore(),
      travelled = new Map(s.people.map((p) => [p.id, 0]));
    for (let tick = 0; tick < 900; tick++) {
      const before = new Map(s.people.map((p) => [p.id, [...p.position]]));
      advance(s, 0.1);
      for (const p of s.people) {
        const prev = before.get(p.id)!;
        travelled.set(
          p.id,
          travelled.get(p.id)! +
            Math.hypot(p.position[0] - prev[0], p.position[1] - prev[1]),
        );
      }
    }
    for (const p of s.people.filter((p) => p.id >= 102))
      expect(travelled.get(p.id)).toBeGreaterThan(10);
    for (const p of s.people.filter((p) => p.role === "shopper"))
      expect(travelled.get(p.id)).toBeGreaterThan(10);
  });
  it("lets managers set opposing business policies while agents handle individual tasks", () => {
    const available = createStore(),
      lean = createStore();
    decide(available, "restock", true);
    decide(lean, "restock", false);
    expect(available.inventoryPolicy).toBe("availability");
    expect(lean.inventoryPolicy).toBe("lean");
    expect(available.recommendations[0].title).toBe(
      "Availability or leaner stock?",
    );
    decide(lean, "online", false);
    expect(lean.fulfilmentPolicy).toBe("instore");
    expect(lean.tasks.some((t) => t.kind === "online")).toBe(false);
    decide(available, "checkout", true);
    expect(available.servicePolicy).toBe("service");
    expect(available.checkouts[2]).toBe(false);
    run(available, 80);
    expect(available.checkouts[2]).toBe(true);
    conservation(available);
    conservation(lean);
  });
});

describe("expanded store and visible decision consequences", () => {
  it("sends full-store shoppers to all six departments and keeps routes clear of widened fixtures", () => {
    const s = createStore(),
      visits = new Map<number, Set<string>>();
    for (let tick = 0; tick < 3000; tick++) {
      advance(s, 0.1);
      for (const p of s.people.filter(
        (p) => p.role === "shopper" && p.stage === "picking",
      )) {
        const department = s.products.find(
          (v) => v.id === p.list[p.visited],
        )!.department;
        if (!visits.has(p.id)) visits.set(p.id, new Set());
        visits.get(p.id)!.add(department);
      }
    }
    expect(
      [...visits.values()].filter((v) => v.size === 6).length,
    ).toBeGreaterThanOrEqual(4);
    for (const d of DEPARTMENTS) {
      const path = routeBetween(ENTRY, [d.position[0], d.position[1] + 2]);
      expect(path.length).toBeGreaterThan(0);
      let previous = ENTRY;
      for (const target of path) {
        const steps = Math.max(
          1,
          Math.ceil(
            Math.hypot(target[0] - previous[0], target[1] - previous[1]) / 0.1,
          ),
        );
        for (let n = 1; n <= steps; n++) {
          const x = previous[0] + ((target[0] - previous[0]) * n) / steps;
          const z = previous[1] + ((target[1] - previous[1]) * n) / steps;
          for (const fixture of DEPARTMENTS)
            expect(
              Math.abs(x - fixture.position[0]) < FIXTURE_WIDTH / 2 + 0.3 &&
                Math.abs(z - fixture.position[1]) < 1.3,
            ).toBe(false);
        }
        previous = target;
      }
    }
    // Line-of-sight smoothing removes the tiny grid zigzags.
    expect(routeBetween([-18, -10], [18, -10])).toHaveLength(1);
    conservation(s);
  });
  it("offers two decisions at a time and replaces resolved choices instead of accumulating cards", () => {
    const s = createStore();
    expect(visibleRecommendations(s).map((r) => r.id)).toEqual([
      "restock",
      "meal",
    ]);
    for (const kind of ["meal", "checkout", "restock", "online"] as const) {
      expect(visibleRecommendations(s).length).toBeLessThanOrEqual(2);
      decide(s, kind, true);
    }
    expect(visibleRecommendations(s)).toHaveLength(0);
    expect(s.decisionLog).toHaveLength(4);
    decide(s, "meal", false);
    expect(s.decisionLog).toHaveLength(4);
  });
  it("a bakery deal redirects real shoppers and displays progress from actual tasks", () => {
    const s = createStore();
    const before = s.people.map((p) => p.list.length);
    decide(s, "meal", true);
    const changed = s.people.filter((p, i) => p.list.length > before[i]);
    expect(changed).toHaveLength(2);
    for (const p of changed) {
      expect(p.stage).toBe("shopping");
      expect(
        s.products.find((v) => v.id === p.list[p.visited])!.department,
      ).toBe("bakery");
      expect(p.destination).not.toBeNull();
    }
    decide(s, "checkout", true);
    expect(decisionImpact(s, "checkout")).toContain("walking to checkout 3");
    run(s, 50);
    expect(s.checkouts[2]).toBe(true);
    expect(decisionImpact(s, "checkout")).toContain("Checkout 3 is open");
    conservation(s);
  });
});

describe("little shop life", () => {
  it("lets a shopper visit a selected shelf and pick real goods", () => {
    const s = createStore(),
      p = s.people.find((p) => p.id === 0)!;
    expect(
      interact(s, { type: "browse", personId: p.id, departmentId: "drinks" })
        .ok,
    ).toBe(true);
    expect(p.stage).toBe("shopping");
    expect(p.list[p.visited]).toBe("sku-16");
    run(s, 20);
    expect(p.visited).toBeGreaterThan(0);
    expect(p.basket.some((l) => l.productId === "sku-16")).toBe(true);
    conservation(s);
  });
  it("pairs two people for a chat, respects their space, then resumes shopping", () => {
    const s = createStore();
    expect(interact(s, { type: "chat", personId: 0 }).ok).toBe(true);
    const a = s.activities[0];
    expect(a.people).toHaveLength(2);
    expect(new Set(a.people).size).toBe(2);
    expect(
      a.people.every(
        (id) => s.people.find((p) => p.id === id)!.stage === "interacting",
      ),
    ).toBe(true);
    expect(interact(s, { type: "dance", personId: 0 }).ok).toBe(false);
    for (let i = 0; i < 120; i++) {
      advance(s, 0.1);
      const [p, q] = a.people.map((id) => s.people.find((p) => p.id === id)!);
      expect(
        Math.hypot(
          p.position[0] - q.position[0],
          p.position[1] - q.position[1],
        ),
      ).toBeGreaterThanOrEqual(1.14 - 1e-6);
    }
    expect(a.stage).toBe("complete");
    expect(
      a.people.every((id) => !s.people.find((p) => p.id === id)!.activityId),
    ).toBe(true);
    conservation(s);
  });
  it("keeps checkout staff at work while allowing a wave, and finishes little dances", () => {
    const s = createStore();
    expect(interact(s, { type: "wave", personId: 100 }).ok).toBe(true);
    expect(s.people.find((p) => p.id === 100)!.stage).toBe("working");
    expect(interact(s, { type: "dance", personId: 100 }).ok).toBe(false);
    expect(interact(s, { type: "dance", personId: 0 }).ok).toBe(true);
    const a = s.activities[0];
    run(s, 4);
    expect(a.stage).toBe("complete");
    expect(s.people[0].stage).not.toBe("interacting");
    conservation(s);
  });
  it("accounts for dropped packaged goods until a real colleague clears them", () => {
    const s = createStore();
    s.nextMishapAt = Infinity;
    s.nextSocialAt = Infinity;
    expect(interact(s, { type: "wobble", departmentId: "pantry" }).ok).toBe(
      true,
    );
    const item = s.floorItems[0],
      batch = s.batches.find((b) => b.id === item.batchId)!;
    expect(batch.onFloor).toBe(1);
    expect(s.activities.some((a) => a.kind === "cleanup")).toBe(false);
    conservation(s);
    advance(s, 0.1);
    expect(item.status).toBe("assigned");
    const cleanup = s.activities.find((a) => a.kind === "cleanup")!;
    expect(cleanup.stage).toBe("approaching");
    expect(batch.onFloor).toBe(1);
    run(s, 70);
    expect(item.status).toBe("cleared");
    expect(batch.onFloor).toBe(0);
    expect(batch.waste).toBe(0);
    expect(
      s.events.some((e) => e.message.includes("returned to the display")),
    ).toBe(true);
    conservation(s);
  });
  it("records dropped fresh food as waste and bounds simultaneous mishaps", () => {
    const s = createStore();
    s.nextMishapAt = Infinity;
    s.nextSocialAt = Infinity;
    expect(interact(s, { type: "wobble", departmentId: "produce" }).ok).toBe(
      true,
    );
    const item = s.floorItems[0],
      batch = s.batches.find((b) => b.id === item.batchId)!;
    expect(interact(s, { type: "wobble", departmentId: "pantry" }).ok).toBe(
      true,
    );
    expect(interact(s, { type: "wobble", departmentId: "home" }).ok).toBe(
      false,
    );
    run(s, 75);
    expect(item.status).toBe("cleared");
    expect(batch.waste).toBeGreaterThanOrEqual(1);
    conservation(s);
  });
  it("does not assign one colleague to a tidy-up and a strategy task at once", () => {
    const s = createStore();
    expect(
      interact(s, { type: "tidy", personId: 102, departmentId: "produce" }).ok,
    ).toBe(true);
    for (const id of ["restock", "checkout", "online"] as const)
      decide(s, id, true);
    expect(s.tasks.some((t) => t.employeeId === 102)).toBe(false);
    const a = s.activities[0];
    run(s, 50);
    expect(a.stage).toBe("complete");
    conservation(s);
  });
  it("creates conversations and small mishaps without player commands", () => {
    const s = run(createStore(), 75);
    expect(
      s.events.some((e) => e.topic.endsWith("people/conversation/finished")),
    ).toBe(true);
    expect(
      s.events.some(
        (e) =>
          e.topic.includes("smartstore/floor/") &&
          e.topic.endsWith("/detected"),
      ),
    ).toBe(true);
    expect(
      s.events.some(
        (e) =>
          e.topic.includes("smartstore/floor/") && e.topic.endsWith("/cleared"),
      ),
    ).toBe(true);
    conservation(s);
  });
});

it("queues an approved service priority honestly while colleagues finish player activities", () => {
  const s = createStore();
  for (const [id, departmentId] of [
    [102, "produce"],
    [103, "bakery"],
    [104, "fresh"],
    [105, "home"],
  ] as const)
    expect(interact(s, { type: "tidy", personId: id, departmentId }).ok).toBe(
      true,
    );
  decide(s, "checkout", true);
  expect(s.tasks.some((t) => t.kind === "checkout")).toBe(false);
  expect(decisionImpact(s, "checkout")).toContain("after their current task");
  run(s, 80);
  expect(s.checkouts[2]).toBe(true);
  expect(decisionImpact(s, "checkout")).toContain("Checkout 3 is open");
  conservation(s);
});

describe("point-and-click directions", () => {
  it("accepts an open-floor order while nearby shoppers temporarily block the way", () => {
    const s = createStore(),
      p = s.people[0];
    p.position = [-7, -10];
    for (let i = 1; i <= 6; i++) {
      const angle = (i * Math.PI) / 3;
      s.people[i].position = [
        -7 + Math.cos(angle) * 1.3,
        -10 + Math.sin(angle) * 1.3,
      ];
    }
    const before = [...p.position];
    expect(
      interact(s, { type: "walk", personId: p.id, position: [7, -10] }).ok,
    ).toBe(true);
    expect(p.position).toEqual(before);
    expect(p.destination).toEqual([7, -10]);
    expect(p.route.length).toBeGreaterThan(0);
    conservation(s);
  });

  it("replaces a social activity without leaving its partner reserved", () => {
    const s = createStore();
    expect(interact(s, { type: "chat", personId: 0 }).ok).toBe(true);
    const chat = s.activities[0],
      partner = s.people.find((p) => p.id === chat.people[1])!;
    expect(
      interact(s, { type: "walk", personId: 0, position: [-7, -10] }).ok,
    ).toBe(true);
    expect(chat.stage).toBe("cancelled");
    expect(partner.activityId).toBeUndefined();
    expect(partner.stage).not.toBe("interacting");
    expect(s.activities.filter((a) => a.stage === "approaching")).toHaveLength(
      1,
    );
    conservation(s);
  });
  it("walks to a floor destination without teleporting, then resumes shopping", () => {
    const s = createStore(),
      p = s.people[0];
    s.nextSocialAt = s.nextMishapAt = Infinity;
    const initial = [...p.position],
      list = [...p.list];
    expect(
      interact(s, { type: "walk", personId: p.id, position: [-7, -10] }).ok,
    ).toBe(true);
    const activity = s.activities.find((a) => a.id === p.activityId)!;
    const target = [...p.destination!];
    expect(p.position).toEqual(initial);
    expect(p.route.length).toBeGreaterThan(0);
    let reached = false;
    for (let i = 0; i < 700 && activity.stage !== "complete"; i++) {
      const before = [...p.position];
      advance(s, 0.1);
      expect(
        Math.hypot(p.position[0] - before[0], p.position[1] - before[1]),
      ).toBeLessThan(0.4);
      if (
        Math.hypot(p.position[0] - target[0], p.position[1] - target[1]) < 0.1
      )
        reached = true;
    }
    expect(reached).toBe(true);
    expect(activity.stage).toBe("complete");
    expect(p.activityId).toBeUndefined();
    expect(p.list).toEqual(list);
    expect(p.stage).toBe("shopping");
    conservation(s);
  });
  it("releases a queue place while preserving the basket and allows a shelf order", () => {
    const s = createStore(),
      p = s.people.find((p) => p.stage === "queueing")!;
    const basket = structuredClone(p.basket);
    expect(
      interact(s, { type: "walk", personId: p.id, position: [-7, 6] }).ok,
    ).toBe(true);
    expect(p.stage).toBe("interacting");
    expect(p.basket).toEqual(basket);
    const walk = s.activities.find((a) => a.id === p.activityId)!;
    expect(
      interact(s, { type: "browse", personId: p.id, departmentId: "drinks" })
        .ok,
    ).toBe(true);
    expect(walk.stage).toBe("cancelled");
    expect(p.stage).toBe("shopping");
    expect(p.activityId).toBeUndefined();
    expect(s.products.find((v) => v.id === p.list[p.visited])!.department).toBe(
      "drinks",
    );
    expect(p.basket).toEqual(basket);
    conservation(s);
  });
  it("rejects blocked and invalid destinations without cancelling the current order", () => {
    const s = createStore(),
      p = s.people[0];
    expect(
      interact(s, { type: "walk", personId: p.id, position: [-7, -10] }).ok,
    ).toBe(true);
    const previous = structuredClone(p);
    for (const position of [
      [0, -6],
      [50, 50],
      [NaN, 0],
      [0, Infinity],
    ] as [number, number][])
      expect(interact(s, { type: "walk", personId: p.id, position }).ok).toBe(
        false,
      );
    expect(p).toEqual(previous);
    expect(
      interact(s, { type: "walk", personId: p.id, position: [7, -10] }).ok,
    ).toBe(true);
    expect(s.activities[0].stage).toBe("cancelled");
    expect(s.activities.filter((a) => a.stage === "approaching")).toHaveLength(
      1,
    );
    conservation(s);
  });
  it("keeps cashiers, transactions and reserved stock tasks intact", () => {
    const s = createStore();
    decide(s, "restock", true);
    const worker = s.people.find((p) => p.taskId)!;
    const before = structuredClone(worker);
    expect(
      interact(s, { type: "walk", personId: 100, position: [-7, 6] }).ok,
    ).toBe(false);
    expect(
      interact(s, { type: "walk", personId: worker.id, position: [-7, 6] }).ok,
    ).toBe(false);
    expect(worker).toEqual(before);
    run(s, 4);
    const paying = s.people.find((p) => p.stage === "paying")!;
    expect(paying).toBeDefined();
    const basket = structuredClone(paying.basket);
    expect(
      interact(s, { type: "walk", personId: paying.id, position: [-7, 6] }).ok,
    ).toBe(false);
    expect(paying.basket).toEqual(basket);
    conservation(s);
  });
});

describe("promotions, shopper needs and friendly security", () => {
  function until(s: StoreState, done: () => boolean, seconds = 100) {
    for (let i = 0; i < seconds * 10 && !done(); i++) advance(s, 0.1);
    expect(done()).toBe(true);
  }
  it("updates one price state and sends real shoppers towards the screen's offer", () => {
    const s = createStore(),
      before = structuredClone(s.batches);
    expect(interact(s, { type: "promotion", promotion: "lunch" }).ok).toBe(
      true,
    );
    for (const product of s.products)
      expect(product.price).toBe(
        Math.round(
          product.regularPrice *
            (["sku-6", "sku-11", "sku-16"].includes(product.id) ? 0.85 : 1),
        ),
      );
    expect(
      s.people.filter((p) => p.reaction?.text.includes("tasty")),
    ).toHaveLength(2);
    expect(s.people[0].list[0]).toBe("sku-6");
    expect(s.batches).toEqual(before);
    expect(s.transactions).toHaveLength(0);
    expect(interact(s, { type: "promotion", promotion: "lunch" }).ok).toBe(
      false,
    );
    expect(
      s.events.filter((e) => e.topic.includes("promotion/screen/noticed")),
    ).toHaveLength(2);
    conservation(s);
  });
  it("keeps an agent-approved bakery deal when the campaign changes", () => {
    const s = createStore();
    decide(s, "meal", true);
    expect(s.promotion).toBe("bakery");
    interact(s, { type: "promotion", promotion: "lunch" });
    expect(s.products[6].price).toBe(
      Math.round(s.products[6].regularPrice * 0.8),
    );
    interact(s, { type: "promotion", promotion: "welcome" });
    expect(s.products[16].price).toBe(s.products[16].regularPrice);
    expect(s.products[6].price).toBe(
      Math.round(s.products[6].regularPrice * 0.8),
    );
    conservation(s);
  });
  it("reserves a guide, fulfills a need only after a shelf pick and never grants free sales", () => {
    const s = createStore(),
      p = s.people[0];
    s.nextSocialAt = s.nextMishapAt = s.nextSecurityAt = Infinity;
    expect(interact(s, { type: "help-need", personId: p.id }).ok).toBe(true);
    expect(interact(s, { type: "help-need", personId: p.id }).ok).toBe(false);
    const a = s.activities.find((a) => a.kind === "help")!;
    const colleague = a.people.find((id) => id !== p.id)!;
    decide(s, "restock", true);
    expect(s.tasks.some((t) => t.employeeId === colleague)).toBe(false);
    expect(s.needsHelped).toBe(0);
    until(s, () => p.need?.status === "fulfilled");
    expect(s.needsHelped).toBe(1);
    expect(p.basket.some((l) => l.productId === "sku-18")).toBe(true);
    expect(
      s.events.some((e) => e.topic.endsWith("people/0/need/fulfilled")),
    ).toBe(true);
    conservation(s);
  });
  it("checks a genuine unpaid unit and settles it exactly once after the guard arrives", () => {
    const s = createStore();
    s.nextSocialAt = s.nextMishapAt = Infinity;
    until(s, () => !!activeSecurityCase(s));
    const c = activeSecurityCase(s)!,
      p = s.people.find((p) => p.id === c.shopperId)!,
      guard = s.people.find((p) => p.job === "security")!;
    expect(c.kind).toBe("receipt");
    expect(p.basket.reduce((n, l) => n + l.quantity, 0)).toBe(1);
    const before = metrics(s).revenue,
      guardPosition = [...guard.position];
    expect(interact(s, { type: "security-check", caseId: c.id }).ok).toBe(true);
    expect(interact(s, { type: "security-check", caseId: c.id }).ok).toBe(
      false,
    );
    expect(metrics(s).revenue).toBe(before);
    expect(guard.position).toEqual(guardPosition);
    until(s, () => c.stage === "resolved");
    expect(p.basket).toHaveLength(0);
    expect(s.transactions.filter((t) => t.source === "assisted")).toHaveLength(
      1,
    );
    expect(c.outcome).toContain("handheld");
    expect(p.securityCaseId).toBeUndefined();
    const count = s.transactions.length;
    expect(interact(s, { type: "security-check", caseId: c.id }).ok).toBe(
      false,
    );
    expect(s.transactions).toHaveLength(count);
    conservation(s);
  });
  it("can send the unpaid item back to a real staffed checkout without awarding revenue", () => {
    const s = createStore();
    until(s, () => !!activeSecurityCase(s));
    const c = activeSecurityCase(s)!,
      p = s.people.find((p) => p.id === c.shopperId)!;
    const before = metrics(s).revenue;
    expect(interact(s, { type: "security-checkout", caseId: c.id }).ok).toBe(
      true,
    );
    expect(c.stage).toBe("resolved");
    expect(p.stage).toBe("queueing");
    expect(p.basket.reduce((n, l) => n + l.quantity, 0)).toBe(1);
    expect(metrics(s).revenue).toBe(before);
    until(s, () => p.basket.length === 0);
    expect(metrics(s).revenue).toBeGreaterThan(before);
    conservation(s);
  });
  it("returns a paid bag and clears matched receipts without charging a second time", () => {
    const s = createStore();
    s.securityCompleted = 1; // Begin the deterministic story cycle at the paid-bag vignette.
    until(s, () => !!activeSecurityCase(s));
    const c = activeSecurityCase(s)!;
    expect(c.kind).toBe("bag");
    const paid = s.transactions.find((t) => t.id === c.transactionId)!;
    expect(paid.lines.length).toBeGreaterThan(0);
    expect(s.people.find((p) => p.id === c.shopperId)!.basket).toHaveLength(0);
    interact(s, { type: "security-check", caseId: c.id });
    until(s, () => c.stage === "resolved");
    expect(c.outcome).toContain("bag returned");
    expect(s.transactions.filter((t) => t.source === "assisted")).toHaveLength(
      0,
    );
    until(s, () => activeSecurityCase(s)?.kind === "clear", 180);
    const clear = activeSecurityCase(s)!;
    interact(s, { type: "security-check", caseId: clear.id });
    until(s, () => clear.stage === "resolved");
    expect(clear.outcome).toContain("All items paid");
    expect(s.transactions.filter((t) => t.source === "assisted")).toHaveLength(
      0,
    );
    expect(
      s.tasks.some(
        (t) => s.people.find((p) => p.id === t.employeeId)?.job === "security",
      ),
    ).toBe(false);
    conservation(s);
  });
});
