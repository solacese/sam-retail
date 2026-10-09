import { LocalEventBus, type EventAdapter } from "./bus";
import { correlate } from "./correlation";
import { SITUATIONS } from "./situations";
import type {
  Category,
  Choice,
  Effect,
  GameState,
  RetailEvent,
  Resource,
  Resources,
  ScoreBreakdown,
} from "./types";
export const DAYS = [
  "Grand Opening",
  "Growing Pains",
  "Operational Chaos",
  "The Perfect Storm",
  "Retail Empire",
];
export const RESOURCE_KEYS: Resource[] = [
  "inventory",
  "security",
  "reputation",
  "cash",
];
const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, n));
export function seedHash(seed: string) {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function calculateScore(s: GameState): ScoreBreakdown {
  const progress = s.history.length / (s.mode === "quick" ? 18 : 30);
  const survival = Math.round(3500 * progress);
  const values = Object.values(s.resources),
    average = values.reduce((a, b) => a + b, 0) / 4;
  const balance = Math.round(
    2000 *
      clamp(
        (average - (Math.max(...values) - Math.min(...values)) * 0.25) / 80,
        0,
        1,
      ) *
      progress,
  );
  const profit = Math.round(
    1500 * clamp(s.profit / (s.mode === "quick" ? 1300 : 2200), 0, 1),
  );
  const customers = Math.round(
    ((1000 * s.resources.reputation) / 100) * progress,
  );
  const crises = Math.round(
    (1000 * s.crisesManaged) / (s.mode === "quick" ? 3 : 5),
  );
  const collaboration = Math.round(
    1000 * clamp(s.interventions / (s.mode === "quick" ? 18 : 30), 0, 1),
  );
  const penalties = Math.round(
    s.stockouts * 65 + s.fraudIncidents * 50 + s.waste * 8,
  );
  return {
    survival,
    balance,
    profit,
    customers,
    crises,
    collaboration,
    penalties,
    total: clamp(
      survival +
        balance +
        profit +
        customers +
        crises +
        collaboration -
        penalties,
      0,
      10000,
    ),
  };
}
export class RetailGame {
  private randomState: number;
  private sequence = 0;
  private used = new Map<string, number>();
  private dayStart = {
    revenue: 0,
    profit: 0,
    stockouts: 0,
    fraud: 0,
    interventions: 0,
    score: 0,
  };
  private liveUpdated = false;
  private autoCounts = [0, 0, 0, 0];
  private s: GameState;
  constructor(
    seed: string,
    mode: "full" | "quick" = "full",
    private bus: EventAdapter = new LocalEventBus(),
  ) {
    this.randomState = seedHash(seed);
    this.s = {
      seed,
      mode,
      day: 1,
      turn: 1,
      step: 0,
      minutes: 540,
      resources: { inventory: 60, security: 60, reputation: 60, cash: 60 },
      ops: {
        demand: 1.15,
        stockCover: 150,
        supplierDelay: 0,
        promotion: 0,
        queue: 2,
        fraud: 0.4,
        freshness: 85,
        equipment: 96,
        margin: 0.26,
        loyalty: 0.5,
        staff: 2,
        volatility: 0.3,
      },
      events: [],
      proposal: null,
      pending: [],
      history: [],
      reports: [],
      revenue: 0,
      profit: 0,
      stockouts: 0,
      fraudIncidents: 0,
      waste: 0,
      interventions: 0,
      crisesManaged: 0,
      delegated: false,
      status: "playing",
      score: {
        survival: 0,
        balance: 0,
        profit: 0,
        customers: 0,
        crises: 0,
        collaboration: 0,
        penalties: 0,
        total: 0,
      },
    };
    this.advanceSimulation();
    this.propose();
  }
  private random() {
    this.randomState += 0x6d2b79f5;
    let t = this.randomState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  snapshot() {
    return structuredClone(this.s);
  }
  private emit(
    topic: string,
    category: Category,
    data: RetailEvent["data"],
    source = "Retail simulator",
    correlationId?: string,
    causationId?: string,
  ) {
    const event: RetailEvent = {
      id: `${seedHash(this.s.seed).toString(16)}-${++this.sequence}`,
      sequence: this.sequence,
      step: this.s.step,
      minute: this.s.minutes,
      topic,
      category,
      source,
      data,
      correlationId,
      causationId,
      simulated: true,
    };
    this.s.events.push(event);
    if (this.s.events.length > 240) this.s.events.shift();
    this.bus.publish(event);
    return event;
  }
  private checkFailure() {
    const failure = RESOURCE_KEYS.find((key) => this.s.resources[key] <= 0);
    if (failure) {
      this.s.status = "lost";
      this.s.failure = failure;
      this.s.proposal = null;
      this.s.score = calculateScore(this.s);
      return true;
    }
    return false;
  }
  private change(delta: Partial<Resources>) {
    for (const key of RESOURCE_KEYS)
      this.s.resources[key] = clamp(this.s.resources[key] + (delta[key] ?? 0));
  }
  private advanceSimulation() {
    const s = this.s,
      o = s.ops,
      r = s.resources;
    s.step++;
    s.minutes = 540 + (s.day - 1) * 540 + (s.turn - 1) * 75;
    // Delayed consequences retain the originating decision id, across day boundaries.
    const due = s.pending.filter((p) => p.due <= s.step);
    s.pending = s.pending.filter((p) => p.due > s.step);
    for (const p of due) {
      if (p.kind === "delivery") {
        this.change({ inventory: p.amount });
        o.supplierDelay = 0;
        this.emit(
          "supplier/delivery/arrived",
          "business",
          { units: p.amount },
          "Supplier",
          undefined,
          p.causedBy,
        );
      }
      if (p.kind === "waste") {
        const loss = Math.max(
          0,
          Math.round(p.amount * (1 - o.freshness / 150)),
        );
        if (loss > 0) {
          this.change({ inventory: -loss, cash: -Math.ceil(loss / 2) });
          s.waste += loss;
          o.freshness = clamp(o.freshness - 4);
          this.emit(
            "inventory/spoilage/recorded",
            "business",
            { units: loss },
            "Cold-chain sensor",
            undefined,
            p.causedBy,
          );
        }
      }
      if (p.kind === "incident") {
        this.change({ security: -p.amount, cash: -p.amount / 2 });
        s.fraudIncidents++;
        this.emit(
          "security/loss/confirmed",
          "business",
          { loss: p.amount },
          "Transaction monitor",
          undefined,
          p.causedBy,
        );
      }
    }
    o.demand = clamp(
      o.demand * 0.73 +
        0.35 +
        (this.random() - 0.45) * 0.6 +
        (o.promotion > 0 ? 0.5 : 0) +
        s.day * 0.025,
      0.6,
      2.8,
    );
    o.promotion = Math.max(0, o.promotion - 1);
    o.supplierDelay = clamp(
      o.supplierDelay * 0.65 + this.random() * 65 - 16 + s.day * 2,
      0,
      120,
    );
    o.fraud = clamp(
      o.fraud * 0.75 +
        this.random() * 0.75 +
        (o.promotion > 0 ? 0.35 : 0) +
        s.day * 0.035,
      0,
      3,
    );
    o.queue = clamp(
      o.demand * 5 + this.random() * 4 - o.staff * 2 + (s.turn === 6 ? 2 : 0),
      0,
      16,
    );
    o.equipment = clamp(o.equipment - (2 + this.random() * 6 + s.day));
    o.freshness = clamp(
      o.freshness - (2 + this.random() * 8) + (r.inventory < 40 ? 4 : 0),
    );
    o.volatility = clamp(0.25 + this.random() * 0.5 + s.day * 0.035, 0, 1);
    o.margin = clamp(o.margin + (this.random() - 0.56) * 0.055, 0.12, 0.4);
    o.loyalty = clamp(o.loyalty + (r.reputation - 55) / 1000, 0.2, 0.95);
    if (s.turn === 6) {
      o.demand = clamp(o.demand + 0.25 + s.day * 0.04, 0.6, 2.8);
      o.queue += 1 + s.day * 0.3;
    }
    const revenue = Math.round(
      (120 + this.random() * 140) * o.demand * (r.inventory > 15 ? 1 : 0.55),
    );
    const profit = Math.round(revenue * o.margin - 26 - o.staff * 6);
    s.revenue += revenue;
    s.profit += profit;
    this.change({
      inventory: -Math.round(o.demand * (1.6 + s.day * 0.25)),
      cash: profit / 40,
      security: -(o.fraud > 0.95 ? 1 + s.day * 0.3 : 0.3),
      reputation: -(o.queue > 5 ? 1.5 : 0.2),
    });
    if (s.step === 1)
      Object.assign(r, {
        inventory: 60,
        security: 60,
        reputation: 60,
        cash: 60,
      });
    o.stockCover = Math.round((r.inventory / o.demand) * 2.8);
    if (r.inventory < 18) {
      s.stockouts++;
      this.change({ reputation: -3, cash: -2 });
      this.emit("inventory/stockout", "business", { stockouts: s.stockouts });
      this.emit("store/shelf/empty", "business", { aisle: "essentials" });
    }
    if (o.fraud > 1.65 && r.security < 48) {
      s.fraudIncidents++;
      this.change({ cash: -3, security: -2 });
      this.emit("security/loss/confirmed", "business", { loss: 3 });
    }
    this.autonomy();
    this.telemetry();
    this.checkFailure();
    s.score = calculateScore(s);
  }
  private telemetry() {
    const s = this.s,
      o = s.ops,
      r = s.resources;
    this.emit(
      "pos/sale/completed",
      "business",
      { velocity: Number(o.demand.toFixed(2)), revenue: s.revenue },
      "Checkout",
    );
    this.emit(
      "inventory/stock/updated",
      "business",
      { health: Math.round(r.inventory), cover: o.stockCover },
      "Stock sensor",
    );
    if (o.stockCover < 100 || r.inventory < 48)
      this.emit(
        "inventory/stock/low",
        "business",
        { cover: o.stockCover, health: r.inventory },
        "Stock sensor",
      );
    this.emit(
      "supplier/offer/received",
      "business",
      { bulkOffer: true },
      "Supplier",
    );
    if (o.supplierDelay > 30)
      this.emit(
        "supplier/delivery/delayed",
        "business",
        { delay: Math.round(o.supplierDelay) },
        "Supplier",
      );
    if (o.promotion > 0)
      this.emit(
        "marketing/campaign/started",
        "business",
        { remaining: o.promotion },
        "Promotion service",
      );
    if (o.fraud > 0.65 || r.security < 48)
      this.emit(
        "security/transaction/suspicious",
        "business",
        { anomalies: Number(o.fraud.toFixed(2)) },
        "Transaction monitor",
      );
    this.emit(
      "security/risk/updated",
      "business",
      { health: Math.round(r.security), pressure: Number(o.fraud.toFixed(2)) },
      "Security monitor",
    );
    if (r.reputation < 57 || o.queue > 5)
      this.emit(
        "customer/review/negative",
        "business",
        { satisfaction: Math.round(r.reputation) },
        "Customer feedback",
      );
    this.emit(
      "operations/queue/updated",
      "business",
      { waiting: Math.round(o.queue) },
      "Queue sensor",
    );
    if (o.queue > 3.5)
      this.emit(
        "operations/queue/long",
        "business",
        { waiting: Math.round(o.queue) },
        "Queue sensor",
      );
    this.emit(
      "operations/staff/updated",
      "business",
      { staff: o.staff },
      "Rota service",
    );
    this.emit(
      "marketing/opportunity/detected",
      "business",
      { audience: true },
      "Audience monitor",
    );
    this.emit(
      "inventory/freshness/updated",
      "business",
      { freshness: Math.round(o.freshness) },
      "Cold-chain sensor",
    );
    if (o.equipment < 72)
      this.emit(
        "operations/equipment/degraded",
        "business",
        { reliability: Math.round(o.equipment) },
        "Equipment sensor",
      );
    this.emit(
      "finance/cash/updated",
      "business",
      { health: Math.round(r.cash) },
      "Ledger",
    );
    if (r.cash < 35)
      this.emit(
        "finance/cash/critical",
        "business",
        { health: Math.round(r.cash) },
        "Ledger",
      );
    this.emit(
      "finance/margin/updated",
      "business",
      { margin: Number(o.margin.toFixed(3)) },
      "Ledger",
    );
    this.emit(
      "customer/loyalty/updated",
      "business",
      { returning: Number(o.loyalty.toFixed(2)) },
      "Loyalty service",
    );
    this.emit(
      "operations/forecast/updated",
      "business",
      { volatility: Number(o.volatility.toFixed(2)) },
      "Forecast service",
    );
  }
  private autonomy() {
    const s = this.s;
    if (!s.delegated) return;
    if (
      s.day >= 2 &&
      s.resources.inventory < 35 &&
      s.resources.cash > 28 &&
      this.autoCounts[0] < 1
    ) {
      this.change({ inventory: 6, cash: -3 });
      s.interventions++;
      this.autoCounts[0]++;
      this.emit(
        "agent/autonomy/replenishment",
        "action",
        { inventory: 6, cash: -3, limit: "one small order per day" },
        "STOCKY",
      );
    }
    if (s.day >= 3 && s.ops.fraud > 0.9 && this.autoCounts[1] < 1) {
      s.ops.fraud = clamp(s.ops.fraud - 0.3, 0, 3);
      s.interventions++;
      this.autoCounts[1]++;
      this.emit(
        "agent/autonomy/security_alert",
        "action",
        { pressureReduction: 0.3, limit: "one alert per day; no spending" },
        "SHIELD",
      );
    }
    if (
      s.day >= 4 &&
      s.ops.promotion > 0 &&
      s.resources.inventory < 35 &&
      this.autoCounts[2] < 1
    ) {
      s.ops.promotion = 0;
      s.interventions++;
      this.autoCounts[2]++;
      this.emit(
        "agent/autonomy/marketing_guardrail",
        "action",
        { promotion: false, limit: "one pause per day; no spending" },
        "SPARK",
      );
    }
  }
  setDelegation(value: boolean) {
    this.s.delegated = value;
    this.emit(
      "player/delegation/updated",
      "action",
      {
        enabled: value,
        limits: "max 3 cash/day; 6 inventory/day; alerts only",
      },
      "Player",
    );
    return this.snapshot();
  }
  private propose() {
    if (this.s.status !== "playing") return;
    const s = this.s;
    const detections = correlate(s);
    const previous = s.history.at(-1)?.title;
    const recentFamilies = s.history.slice(-6).map((h) => h.family);
    const ranked = detections
      .flatMap((d) =>
        SITUATIONS.filter(
          (t) =>
            t.family === d.family &&
            t.minDay <= s.day &&
            t.threshold <= d.pressure,
        ).map((t) => ({
          t,
          d,
          priority:
            d.priority +
            (d.priority >= 15
              ? 10
              : -(
                  recentFamilies.filter((f) => f === t.family).length * 2.2 +
                  (s.history.at(-1)?.family === t.family ? 2 : 0)
                )) +
            (this.used.has(t.id) ? -1 : 1) +
            (previous === t.title ? -6 : 0) +
            this.random() * 2 +
            t.threshold,
        })),
      )
      .sort((a, b) => b.priority - a.priority);
    // Seeded weighted shuffle among currently correlated situations. Critical risks still take priority.
    const pool = ranked.filter((c) => c.priority >= ranked[0]?.priority - 3);
    const weights = pool.map((c) =>
      Math.exp((c.priority - pool[0].priority) / 2),
    );
    let draw = this.random() * weights.reduce((n, w) => n + w, 0);
    const chosen =
      pool.find((_, i) => (draw -= weights[i]) <= 0) ?? pool.at(-1);
    if (!chosen) throw new Error("No operational situation detected.");
    const { t, d } = chosen;
    this.used.set(t.id, s.step);
    const id = `proposal-${s.step}`;
    const decision = this.recommend(t.approve, t.reject);
    s.proposal = {
      id,
      template: t,
      evidence: d.evidence,
      rule: d.rule,
      confidence: Math.round(
        clamp(77 + d.evidence.length * 3 + d.pressure * 8, 0, 97),
      ),
      crisis: s.turn === 6,
      updated: false,
      recommendation:
        decision === "reject"
          ? `${t.rejectLabel}. Protect what is running low.`
          : t.recommendation,
      suggested: decision,
    };
    this.emit(
      `retail/situation/${t.family}_risk`,
      "pattern",
      { rule: d.rule, title: t.title },
      "Correlation engine",
      id,
      d.evidence[0].event.id,
    );
    this.emit(
      "agent/triggered",
      "agent",
      { agent: t.agent, expertise: t.family },
      t.agent,
      id,
    );
    this.emit(
      "agent/message",
      "message",
      { from: t.agent, to: t.peer, message: t.opinion },
      t.agent,
      id,
    );
    this.emit(
      "agent/message",
      "message",
      { from: t.peer, to: "SAM", message: t.peerOpinion },
      t.peer,
      id,
    );
    this.emit(
      "decision/proposed",
      "decision",
      {
        title: t.title,
        recommendation: decision,
        confidence: s.proposal.confidence,
      },
      "SAM",
      id,
    );
    this.liveUpdated = false;
  }
  private recommend(a: Effect, b: Effect) {
    const quality = (e: Effect) =>
      RESOURCE_KEYS.reduce(
        (sum, k) =>
          sum +
          e.delta[k] *
            (this.s.resources[k] < 32 ? 3 : this.s.resources[k] > 80 ? 0.3 : 1),
        0,
      ) - (e.demand && e.demand > 0 && this.s.ops.stockCover < 90 ? 8 : 0);
    return quality(a) >= quality(b) ? "approve" : "reject";
  }
  /** One deterministic mid-card telemetry pulse. Pause and X-Ray freeze it. */
  livePulse() {
    const s = this.s,
      p = s.proposal;
    if (s.status !== "playing" || !p || this.liveUpdated)
      return this.snapshot();
    this.liveUpdated = true;
    s.ops.demand = clamp(
      s.ops.demand + (this.random() - 0.25) * 0.35,
      0.6,
      2.8,
    );
    s.ops.queue = clamp(s.ops.queue + (this.random() - 0.3) * 2, 0, 16);
    s.ops.stockCover = Math.round((s.resources.inventory / s.ops.demand) * 2.8);
    this.emit(
      "pos/sale/completed",
      "business",
      { velocity: Number(s.ops.demand.toFixed(2)), midDecision: true },
      "Checkout",
      p.id,
    );
    const material = s.ops.demand > 1.65 || s.ops.queue > 6;
    if (material) {
      p.suggested = this.recommend(p.template.approve, p.template.reject);
      p.updated = true;
      p.updateReason =
        s.ops.queue > 6
          ? "More customers are waiting at checkout."
          : "Sales are higher than expected.";
      p.confidence = clamp(p.confidence + 2, 0, 99);
      p.recommendation = `${p.updateReason} ${p.suggested === "approve" ? p.template.recommendation : `${p.template.rejectLabel}. Protect what is running low.`}`;
      const e = s.events.at(-1)!;
      p.evidence.push({
        event: e,
        fact: `New demand ${s.ops.demand.toFixed(2)}× forecast; queue ${Math.round(s.ops.queue)}`,
      });
      this.emit(
        "agent/recommendation/updated",
        "message",
        { reason: p.updateReason, recommendation: p.suggested },
        "SAM",
        p.id,
        e.id,
      );
    }
    return this.snapshot();
  }
  resolve(choice: Choice) {
    const s = this.s,
      p = s.proposal;
    if (s.status !== "playing" || !p) return this.snapshot();
    const actual = choice === "timeout" ? "reject" : choice;
    const e = p.template[actual];
    const before = { ...s.resources };
    const action = this.emit(
      `player/${choice === "timeout" ? "timed_out" : actual === "approve" ? "approved" : "rejected"}`,
      "action",
      { title: p.template.title, default: choice === "timeout" },
      "Player",
      p.id,
    );
    this.change(e.delta);
    if (e.delta.cash < 0) s.profit += Math.round(e.delta.cash * 8);
    else {
      s.revenue += Math.round(e.delta.cash * 15);
      s.profit += Math.round(e.delta.cash * 5);
    }
    const o = s.ops;
    if (e.demand) o.demand = clamp(o.demand + e.demand, 0.6, 2.8);
    if (e.promotion) {
      o.promotion = e.promotion;
      this.emit(
        "retail/marketing/promotion/activated",
        "action",
        { duration: e.promotion },
        "SPARK",
        p.id,
        action.id,
      );
      this.emit(
        "marketing/campaign/started",
        "business",
        { remaining: e.promotion },
        "Promotion service",
        p.id,
        action.id,
      );
    }
    if (e.delivery) {
      s.pending.push({
        due: s.step + 2,
        kind: "delivery",
        amount: e.delivery,
        causedBy: action.id,
      });
      this.emit(
        "supplier/order/created",
        "action",
        { quantity: e.delivery, arrivalStep: s.step + 2 },
        "STOCKY",
        p.id,
        action.id,
      );
    }
    if (e.waste && e.waste > 0)
      s.pending.push({
        due: s.step + 3,
        kind: "waste",
        amount: e.waste,
        causedBy: action.id,
      });
    if (e.waste && e.waste < 0) {
      o.freshness = clamp(o.freshness + 20);
      this.emit(
        "inventory/clearance/completed",
        "business",
        { rescued: -e.waste },
        "STOCKY",
        p.id,
        action.id,
      );
    }
    if (e.fraud) {
      o.fraud = clamp(o.fraud + e.fraud, 0, 3);
      if (e.fraud > 0)
        s.pending.push({
          due: s.step + 2,
          kind: "incident",
          amount: 3 + s.day,
          causedBy: action.id,
        });
    }
    if (e.staff) o.staff = clamp(o.staff + e.staff, 1, 4);
    if (e.equipment) o.equipment = clamp(o.equipment + e.equipment);
    if (e.loyalty) o.loyalty = clamp(o.loyalty + e.loyalty, 0.2, 0.95);
    if (e.margin) o.margin = clamp(o.margin + e.margin, 0.12, 0.4);
    if (e.delay) o.supplierDelay = clamp(o.supplierDelay + e.delay, 0, 120);
    s.interventions++;
    const delta = Object.fromEntries(
      RESOURCE_KEYS.map((k) => [
        k,
        Math.round((s.resources[k] - before[k]) * 10) / 10,
      ]),
    ) as Resources;
    const impact = RESOURCE_KEYS.reduce(
      (n, k) => n + delta[k] * (before[k] < 35 ? 2 : 1),
      0,
    );
    if (p.crisis && impact >= 0) s.crisesManaged++;
    const history = {
      family: p.template.family,
      templateId: p.template.id,
      title: p.template.title,
      choice,
      delta,
      day: s.day,
      score: impact,
      crisis: p.crisis,
      outcome:
        choice === "timeout"
          ? `Time’s up — ${p.template.rejectLabel.toLowerCase()}. ${e.outcome}`
          : e.outcome,
    };
    s.history.push(history);
    s.lastResult = history;
    this.emit(
      "retail/action/executed",
      "action",
      { choice: actual, ...delta },
      "Action executor",
      p.id,
      action.id,
    );
    this.emit(
      "retail/outcome/verified",
      "outcome",
      {
        outcome: history.outcome,
        inventory: Math.round(s.resources.inventory),
        cash: Math.round(s.resources.cash),
      },
      "Resource monitor",
      p.id,
      action.id,
    );
    s.proposal = null;
    s.score = calculateScore(s);
    if (this.checkFailure()) return this.snapshot();
    if (s.turn === 6) {
      this.report();
      s.status = s.day === (s.mode === "quick" ? 3 : 5) ? "won" : "report";
    }
    return this.snapshot();
  }
  private report() {
    const s = this.s,
      b = this.dayStart;
    s.reports.push({
      day: s.day,
      revenue: s.revenue - b.revenue,
      profit: s.profit - b.profit,
      stockouts: s.stockouts - b.stockouts,
      fraud: s.fraudIncidents - b.fraud,
      satisfaction: Math.round(s.resources.reputation),
      interventions: s.interventions - b.interventions,
      score: s.score.total - b.score,
    });
  }
  nextDecision() {
    if (this.s.status !== "playing" || this.s.proposal) return this.snapshot();
    this.s.turn++;
    this.advanceSimulation();
    this.propose();
    return this.snapshot();
  }
  nextDay() {
    if (this.s.status !== "report") return this.snapshot();
    const s = this.s;
    this.dayStart = {
      revenue: s.revenue,
      profit: s.profit,
      stockouts: s.stockouts,
      fraud: s.fraudIncidents,
      interventions: s.interventions,
      score: s.score.total,
    };
    s.day++;
    s.turn = 1;
    s.status = "playing";
    this.autoCounts = [0, 0, 0, 0];
    s.lastResult = undefined;
    s.ops.freshness = clamp(s.ops.freshness + 18);
    s.ops.staff = clamp(s.ops.staff - 0.3, 1, 4);
    this.emit("store/day/opened", "business", { day: s.day });
    this.advanceSimulation();
    this.propose();
    return this.snapshot();
  }
}
export const rankFor = (score: number) =>
  score >= 8500
    ? "Retail royalty"
    : score >= 7000
      ? "Retail leader"
      : score >= 5000
        ? "Store team leader"
        : score >= 3000
          ? "Retail operator"
          : "A promising first shift";
