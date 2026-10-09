import type { Evidence, Family, GameState, RetailEvent } from "./types";
export interface Detection {
  family: Family;
  evidence: Evidence[];
  rule: string;
  pressure: number;
  priority: number;
}
/** The window is in simulated store minutes, independent of browser frame rate. */
export function correlate(state: GameState): Detection[] {
  const recent = state.events.filter(
    (e) => e.category === "business" && e.minute >= state.minutes - 90,
  );
  const latest = (topic: string): RetailEvent | undefined =>
    recent.findLast((e) => e.topic === topic);
  const { ops: o, resources: r } = state;
  const out: Detection[] = [];
  const add = (
    family: Family,
    condition: boolean,
    topics: [string, string][],
    rule: string,
    pressure: number,
    priority: number,
  ) => {
    if (!condition) return;
    const evidence = topics.map(([topic, fact]) => ({
      event: latest(topic),
      fact,
    }));
    if (evidence.some((e) => !e.event)) return;
    out.push({
      family,
      evidence: evidence as Evidence[],
      rule,
      pressure: Math.max(0, Math.min(1, pressure)),
      priority,
    });
  };
  const promotionRisk =
    o.promotion > 0 &&
    o.demand > 1.5 &&
    o.stockCover < 60 &&
    o.supplierDelay > 30;
  add(
    "stock",
    o.stockCover < 100 || r.inventory < 48,
    promotionRisk
      ? [
          [
            "marketing/campaign/started",
            `Promotion active for ${o.promotion} more turns`,
          ],
          [
            "pos/sale/completed",
            `Sales velocity ${o.demand.toFixed(2)}× forecast`,
          ],
          [
            "inventory/stock/low",
            `Stock cover ${Math.round(o.stockCover)} minutes`,
          ],
          [
            "supplier/delivery/delayed",
            `Supplier delay ${Math.round(o.supplierDelay)} minutes`,
          ],
        ]
      : [
          [
            "inventory/stock/low",
            `Stock cover ${Math.round(o.stockCover)} minutes`,
          ],
          ["pos/sale/completed", `Demand ${o.demand.toFixed(2)}× forecast`],
        ],
    promotionRisk
      ? "promotion_active AND sales_velocity > 1.5 × forecast AND stock_cover < 60m AND supplier_delay > 30m"
      : "(stock_cover < 100m OR inventory < 48) AND recent_sales > 0",
    1 - o.stockCover / 130,
    r.inventory < 28 ? 15 : 5 + (100 - o.stockCover) / 30,
  );
  add(
    "supplier",
    o.margin < 0.31 && r.cash > 26 && r.inventory < 82,
    [
      ["supplier/offer/received", "Supplier has an available bulk offer"],
      [
        "finance/margin/updated",
        `Trading margin ${(o.margin * 100).toFixed(0)}%`,
      ],
    ],
    "bulk_offer_available AND margin < 31% AND cash > 26 AND inventory < 82",
    (0.31 - o.margin) * 3,
    5,
  );
  add(
    "fraud",
    o.fraud > 0.65 || r.security < 48,
    [
      [
        "security/transaction/suspicious",
        `${o.fraud.toFixed(1)} anomalous transactions per interval`,
      ],
      [
        "security/risk/updated",
        `Security health ${Math.round(r.security)}/100`,
      ],
    ],
    "(transaction_anomalies > 0.65 OR security < 48) AND recent_security_telemetry",
    o.fraud / 3,
    r.security < 28 ? 15 : 5 + o.fraud,
  );
  add(
    "review",
    r.reputation < 57 || o.queue > 5,
    [
      [
        "customer/review/negative",
        `Customer satisfaction ${Math.round(r.reputation)}%`,
      ],
      ["operations/queue/updated", `${Math.round(o.queue)} shoppers waiting`],
    ],
    "(satisfaction < 57 OR queue > 5) AND negative_review_received",
    1 - r.reputation / 100,
    r.reputation < 27 ? 15 : 5,
  );
  add(
    "promotion",
    o.promotion === 0 && r.inventory > 34 && o.demand < 1.7,
    [
      ["marketing/opportunity/detected", "A local audience is available"],
      ["pos/sale/completed", `Sales velocity ${o.demand.toFixed(2)}× forecast`],
      [
        "inventory/stock/updated",
        `Inventory health ${Math.round(r.inventory)}/100`,
      ],
    ],
    "promotion_inactive AND demand < 1.7 × forecast AND inventory > 34 AND audience_available",
    Math.max(0.1, 1.7 - o.demand),
    6,
  );
  add(
    "staff",
    o.queue > 3.5,
    [
      [
        "operations/queue/long",
        `${Math.round(o.queue)} customers in the queue`,
      ],
      [
        "operations/staff/updated",
        `${o.staff.toFixed(1)} effective staff on shift`,
      ],
    ],
    "queue > 3.5 AND checkout_telemetry_received",
    o.queue / 12,
    5 + o.queue / 5,
  );
  add(
    "waste",
    o.freshness < 65 && r.inventory > 24,
    [
      ["inventory/freshness/updated", `Freshness ${Math.round(o.freshness)}%`],
      [
        "inventory/stock/updated",
        `${Math.round(r.inventory)} inventory health`,
      ],
    ],
    "freshness < 65 AND inventory > 24",
    1 - o.freshness / 100,
    5 + (65 - o.freshness) / 20,
  );
  add(
    "equipment",
    o.equipment < 72,
    [
      [
        "operations/equipment/degraded",
        `Equipment reliability ${Math.round(o.equipment)}%`,
      ],
      [
        "inventory/freshness/updated",
        `Chilled-stock freshness ${Math.round(o.freshness)}%`,
      ],
    ],
    "equipment_reliability < 72 AND cold_chain_telemetry_received",
    1 - o.equipment / 100,
    5 + (72 - o.equipment) / 20,
  );
  add(
    "delivery",
    o.supplierDelay > 30 && o.stockCover < 150,
    [
      [
        "supplier/delivery/delayed",
        `Supplier ${Math.round(o.supplierDelay)} minutes late`,
      ],
      [
        "inventory/stock/updated",
        `Stock cover ${Math.round(o.stockCover)} minutes`,
      ],
    ],
    "supplier_delay > 30m AND stock_cover < 150m",
    o.supplierDelay / 100,
    5 + o.supplierDelay / 30,
  );
  add(
    "cash",
    r.cash < 48 || o.margin < 0.17,
    [
      [
        r.cash < 35 ? "finance/cash/critical" : "finance/cash/updated",
        `Cash health ${Math.round(r.cash)}/100`,
      ],
      [
        "finance/margin/updated",
        `Trading margin ${(o.margin * 100).toFixed(0)}%`,
      ],
    ],
    "(cash < 48 OR margin < 17%) AND margin_telemetry_received",
    1 - r.cash / 100,
    r.cash < 28 ? 16 : 6,
  );
  add(
    "loyalty",
    o.loyalty > 0.42 && r.cash > 22,
    [
      [
        "customer/loyalty/updated",
        `${Math.round(o.loyalty * 100)}% returning shoppers`,
      ],
      ["pos/sale/completed", "Repeat purchase activity observed"],
    ],
    "returning_shoppers > 42% AND cash > 22 AND recent_sales > 0",
    o.loyalty,
    5.5,
  );
  add(
    "resilience",
    o.volatility > 0.4 && (o.queue > 3 || o.fraud > 0.7),
    [
      [
        "operations/forecast/updated",
        `Forecast volatility ${(o.volatility * 100).toFixed(0)}%`,
      ],
      ["security/risk/updated", `Fraud pressure ${o.fraud.toFixed(1)}`],
      ["operations/queue/updated", `Queue length ${Math.round(o.queue)}`],
    ],
    "forecast_volatility > 40% AND (queue > 3 OR fraud_pressure > 0.7)",
    o.volatility,
    4.5,
  );
  return out;
}
