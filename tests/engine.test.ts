import { describe, expect, it } from "vitest";
import { RetailGame, calculateScore, RESOURCE_KEYS } from "../src/engine/game";
import { correlate } from "../src/engine/correlation";
import { SITUATIONS } from "../src/engine/situations";
import { LocalEventBus, BackendEventAdapter } from "../src/engine/bus";
import type { Choice, GameState, RetailEvent } from "../src/engine/types";
function complete(
  seed: string,
  mode: "full" | "quick" = "full",
  policy: "model" | "approve" | "reject" = "model",
) {
  const game = new RetailGame(seed, mode);
  let s = game.snapshot();
  for (let n = 0; n < 35 && s.status !== "lost" && s.status !== "won"; n++) {
    const choice = policy === "model" ? s.proposal!.suggested : policy;
    s = game.resolve(choice);
    if (s.status === "report") s = game.nextDay();
    else if (s.status === "playing") s = game.nextDecision();
  }
  return s;
}
describe("retail simulation", () => {
  it("has 60 authored situations across 12 event patterns", () => {
    expect(SITUATIONS).toHaveLength(60);
    expect(new Set(SITUATIONS.map((t) => t.title)).size).toBe(60);
    expect(new Set(SITUATIONS.map((t) => t.family)).size).toBe(12);
    for (const t of SITUATIONS) {
      expect(t.approveLabel).not.toBe(t.rejectLabel);
      expect(Object.values(t.approve.delta).some((v) => v < 0)).toBe(true);
      expect(Object.values(t.reject.delta).some((v) => v !== 0)).toBe(true);
    }
  });
  it("replays the exact event trace and score from a seed and choices", () => {
    expect(complete("SAME-SHIFT")).toEqual(complete("SAME-SHIFT"));
    expect(complete("OTHER-SHIFT")).not.toEqual(complete("SAME-SHIFT"));
  });
  it("includes six decisions per day and reaches a full five-day ending", () => {
    const s = complete("BALANCED-EMPIRE");
    expect(s.status).toBe("won");
    expect(s.history).toHaveLength(30);
    expect(s.reports).toHaveLength(5);
    for (let day = 1; day <= 5; day++)
      expect(s.history.filter((h) => h.day === day)).toHaveLength(6);
  });
  it("quick mode ends after 18 strategic decisions", () => {
    const s = complete("QUICK", "quick");
    expect(s.status).toBe("won");
    expect(s.history).toHaveLength(18);
    expect(s.reports).toHaveLength(3);
  });
  it("correlates the canonical promotion + velocity + stock + delivery combination", () => {
    const s = new RetailGame("CORRELATION").snapshot();
    s.ops.promotion = 2;
    s.ops.demand = 1.8;
    s.ops.stockCover = 45;
    s.ops.supplierDelay = 50;
    s.resources.inventory = 22;
    s.events = [];
    for (const topic of [
      "marketing/campaign/started",
      "pos/sale/completed",
      "inventory/stock/low",
      "supplier/delivery/delayed",
    ])
      s.events.push({
        id: topic,
        sequence: 1,
        step: 1,
        minute: s.minutes,
        topic,
        category: "business",
        source: "test",
        data: {},
        simulated: true,
      });
    const d = correlate(s).find((d) => d.family === "stock");
    expect(d?.evidence).toHaveLength(4);
    expect(d?.rule).toContain("sales_velocity > 1.5");
  });
  it("does not correlate stale or incomplete event combinations", () => {
    const s = new RetailGame("WINDOW").snapshot();
    s.ops.promotion = 2;
    s.ops.demand = 1.8;
    s.ops.stockCover = 45;
    s.ops.supplierDelay = 50;
    s.resources.inventory = 22;
    s.events = s.events.map((e) => ({ ...e, minute: s.minutes - 91 }));
    expect(correlate(s)).toEqual([]);
    s.events = [];
    expect(correlate(s)).toEqual([]);
  });
  it("rejects automatically on timeout and records the default choice", () => {
    const a = new RetailGame("CLOCK"),
      b = new RetailGame("CLOCK");
    a.resolve("timeout");
    b.resolve("reject");
    expect(a.snapshot().resources).toEqual(b.snapshot().resources);
    expect(a.snapshot().history[0].choice).toBe("timeout");
    expect(
      a.snapshot().events.some((e) => e.topic === "player/timed_out"),
    ).toBe(true);
  });
  it("publishes causally linked events and verifies consequences", () => {
    const s = complete("CHAIN");
    const actions = s.events.filter(
      (e) => e.topic === "retail/action/executed",
    );
    expect(actions.length).toBeGreaterThan(0);
    for (const e of actions) {
      expect(e.causationId).toBeTruthy();
      expect(e.correlationId).toMatch(/^proposal-/);
    }
    expect(s.events.some((e) => e.topic === "retail/outcome/verified")).toBe(
      true,
    );
  });
  it("turns approved promotions into future demand, and orders into delayed deliveries", () => {
    let foundPromo = false,
      foundOrder = false;
    for (let i = 0; i < 10; i++) {
      const game = new RetailGame(`CAUSE-${i}`);
      for (let j = 0; j < 18; j++) {
        let s = game.snapshot();
        if (s.status === "lost" || s.status === "won") break;
        const family = s.proposal!.template.family;
        const prevDemand = s.ops.demand;
        s = game.resolve("approve");
        if (family === "promotion") {
          foundPromo = true;
          expect(s.ops.demand).toBeGreaterThan(prevDemand);
          expect(
            s.events.some(
              (e) => e.topic === "retail/marketing/promotion/activated",
            ),
          ).toBe(true);
        }
        if (s.pending.some((p) => p.kind === "delivery")) {
          foundOrder = true;
          expect(
            s.pending.find((p) => p.kind === "delivery")?.causedBy,
          ).toBeTruthy();
        }
        if (s.status === "report") game.nextDay();
        else if (s.status === "playing") game.nextDecision();
      }
    }
    expect(foundPromo).toBe(true);
    expect(foundOrder).toBe(true);
  });
  it("caps resources and score and never creates nonfinite telemetry across 50 seeds", () => {
    for (let i = 0; i < 50; i++) {
      const s = complete(`SWEEP-${i}`);
      for (const key of RESOURCE_KEYS) {
        expect(s.resources[key]).toBeGreaterThanOrEqual(0);
        expect(s.resources[key]).toBeLessThanOrEqual(100);
      }
      expect(s.score.total).toBeGreaterThanOrEqual(0);
      expect(s.score.total).toBeLessThanOrEqual(10000);
      expect(s.score).toEqual(calculateScore(s));
    }
  });
  it("does not permit duplicate execution of a decision or progression while a card is pending", () => {
    const game = new RetailGame("DOUBLE");
    game.nextDecision();
    expect(game.snapshot().turn).toBe(1);
    game.resolve("approve");
    game.resolve("approve");
    expect(game.snapshot().history).toHaveLength(1);
  });
  it("maintains a fixed mid-decision telemetry pulse", () => {
    const a = new RetailGame("PULSE"),
      b = new RetailGame("PULSE");
    a.livePulse();
    a.livePulse();
    b.livePulse();
    expect(a.snapshot()).toEqual(b.snapshot());
  });
  it("only runs bounded autonomy after unlock and with consent", () => {
    const game = new RetailGame("AUTO");
    game.setDelegation(true);
    let s = game.snapshot();
    for (let n = 0; n < 30; n++) {
      if (s.status === "won" || s.status === "lost") break;
      s = game.resolve(s.proposal!.suggested);
      if (s.status === "report") s = game.nextDay();
      else s = game.nextDecision();
    }
    const events = s.events.filter((e) =>
      e.topic.startsWith("agent/autonomy/"),
    );
    for (const e of events) {
      expect(e.step).toBeGreaterThan(6);
      if (e.topic.endsWith("replenishment")) expect(e.data.cash).toBe(-3);
    }
    expect(s.history.length).toBe(30);
  });
  it("isolates snapshots from engine state", () => {
    const g = new RetailGame("IMMUTABLE");
    const s = g.snapshot();
    s.resources.cash = 0;
    s.events.length = 0;
    expect(g.snapshot().resources.cash).toBeGreaterThan(0);
    expect(g.snapshot().events.length).toBeGreaterThan(0);
  });
});
describe("event adapters", () => {
  it("supports independent subscriptions and close", () => {
    const bus = new LocalEventBus();
    const trace: RetailEvent[] = [];
    const off = bus.subscribe((e) => trace.push(e));
    new RetailGame("BUS", "full", bus);
    expect(trace.length).toBeGreaterThan(10);
    off();
    bus.close();
    expect(() => bus.publish(trace[0])).not.toThrow();
  });
  it("rejects insecure backend URLs before opening a connection", () => {
    expect(() => new BackendEventAdapter("http://broker.example")).toThrow(
      "HTTPS",
    );
  });
});
