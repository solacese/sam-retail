import {
  DEPARTMENTS,
  metrics,
  personName,
  personActivity,
  decisionImpact,
  type StoreState,
} from "../simulation/store";
export const storeTime = (seconds: number) =>
  `${String(9 + Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}:${String(Math.floor(seconds) % 60).padStart(2, "0")}`;
export function shopContext(s: StoreState) {
  const m = metrics(s);
  const totals = s.batches.reduce(
    (n, b) => ({
      shelf: n.shelf + b.shelf,
      backroom: n.backroom + b.backroom,
      receiving: n.receiving + b.receiving,
      baskets: n.baskets + b.inBaskets,
      transfers: n.transfers + b.inTransit,
      floor: n.floor + b.onFloor,
    }),
    { shelf: 0, backroom: 0, receiving: 0, baskets: 0, transfers: 0, floor: 0 },
  );
  return {
    store: "ABC Shop · Paris Flagship",
    at: storeTime(s.time),
    source: "This browser’s running retail simulation",
    performance: {
      revenueEuros: m.revenue / 100,
      grossProfitEuros: m.profit / 100,
      grossMarginPercent: m.margin,
      purchases: s.transactions.length,
      availabilityPercent: m.availability,
      wasteUnits: m.waste,
      queueingShoppers: m.queue,
      averageQueueSeconds: m.wait,
      customerSatisfactionPercent: m.satisfaction,
    },
    inventory: {
      totalOnHand: Object.values(totals).reduce((a, b) => a + b, 0),
      ...totals,
      products: s.products.map((p) => {
        const batches = s.batches.filter((b) => b.productId === p.id);
        const locations = batches.reduce(
          (n, b) => ({
            shelf: n.shelf + b.shelf,
            backroom: n.backroom + b.backroom,
            receiving: n.receiving + b.receiving,
            baskets: n.baskets + b.inBaskets,
            transfers: n.transfers + b.inTransit,
            floor: n.floor + b.onFloor,
            sold: n.sold + b.sold,
            waste: n.waste + b.waste,
          }),
          {
            shelf: 0,
            backroom: 0,
            receiving: 0,
            baskets: 0,
            transfers: 0,
            floor: 0,
            sold: 0,
            waste: 0,
          },
        );
        const expiry = Math.min(
          ...batches.filter((b) => b.shelf > 0).map((b) => b.expiresAt),
        );
        return {
          name: p.name,
          department: DEPARTMENTS.find((d) => d.id === p.department)!.name,
          priceEuros: p.price / 100,
          regularPriceEuros: p.regularPrice / 100,
          ...locations,
          minutesToShelfExpiry: Number.isFinite(expiry)
            ? Math.max(0, Math.ceil((expiry - s.time) / 60))
            : null,
        };
      }),
    },
    operations: {
      colleagues: s.people
        .filter((p) => p.role === "employee")
        .map((p) => ({
          name: personName(p),
          activity: personActivity(s, p),
        })),
      fridgeCelsius: s.fridge,
      fridgeTargetCelsius: [2, 5],
      promotion: s.promotion,
      shoppersInStore: s.people.filter(
        (p) => p.role === "shopper" && p.stage !== "outside",
      ).length,
      checkouts: s.checkouts.map((open, i) => ({
        terminal: i + 1,
        open,
        waiting: s.people.filter(
          (p) => p.stage === "queueing" && p.checkout === i,
        ).length,
        serving: s.people
          .filter((p) => p.stage === "paying" && p.checkout === i)
          .map(personName),
      })),
      activeTasks: s.tasks
        .filter((t) => t.stage !== "complete")
        .map((t) => ({
          kind: t.kind,
          stage: t.stage,
          colleague: personName(s.people.find((p) => p.id === t.employeeId)!),
          product: s.products.find((p) => p.id === t.productId)?.name,
        })),
      shopperNeeds: s.people
        .filter((p) => p.need && p.need.status !== "fulfilled")
        .map((p) => ({ person: personName(p), need: { ...p.need! } })),
    },
    incidents: {
      security: s.securityCases.map((c) => ({
        id: c.id,
        person: personName(s.people.find((p) => p.id === c.shopperId)!),
        kind: c.kind,
        reason: c.origin,
        status: c.stage,
        outcome: c.outcome,
        checkout: c.checkout === undefined ? undefined : c.checkout + 1,
        checkoutPayment:
          c.checkout === undefined
            ? undefined
            : c.paymentTransactionId
              ? "paid"
              : "pending",
      })),
      floor: s.floorItems
        .filter((i) => i.status !== "cleared")
        .map((i) => ({
          item: s.products.find((p) => p.id === i.productId)!.name,
          status: i.status,
          at: storeTime(i.at),
        })),
    },
    decisions: s.recommendations.map((r) => ({
      title: r.title,
      status: r.status,
      proposal: r.action,
      alternative: r.alternative,
      consequence: r.consequence,
      tradeoff: r.tradeoff,
      observedOutcome: decisionImpact(s, r.id),
    })),
    recentEvents: s.events
      .filter(
        (e) =>
          !["camera/entrance/occupancy", "fridge/fresh/temperature"].some(
            (suffix) => e.topic.endsWith(suffix),
          ),
      )
      .slice(0, 60)
      .map((e) => ({
        at: storeTime(e.at),
        category: e.category,
        topic: e.topic,
        message: e.message,
      })),
  };
}
