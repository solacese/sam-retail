import { useEffect, useRef, useState } from "react";
import type { Shop } from "../data/shops";
import type { GameState } from "./types";
import { storeTopic } from "./storeTopics";
export type SignalKind =
  | "inventory"
  | "pricing"
  | "purchase"
  | "iot"
  | "agents";
export interface StoreSignal {
  id: string;
  kind: SignalKind;
  topic: string;
  label: string;
  detail: string;
  at: number;
  color: string;
  glyph: string;
}
export const SIGNAL_TYPES: Record<
  SignalKind,
  { label: string; color: string; glyph: string }
> = {
  inventory: { label: "Inventory", color: "#8ed4ba", glyph: "▣" },
  pricing: { label: "Pricing", color: "#e9ca85", glyph: "€" },
  purchase: { label: "Purchases", color: "#ddaaa9", glyph: "✓" },
  iot: { label: "IoT", color: "#96b7d5", glyph: "°" },
  agents: { label: "Agents", color: "#bca2f5", glyph: "↗" },
};
export const STORE_HISTORY_LIMIT = 600;
const products = ["Milk", "Coffee", "Pasta", "Apples", "Bread", "Lunch bundle"];
const cycle: SignalKind[] = [
  "purchase",
  "inventory",
  "pricing",
  "purchase",
  "iot",
  "agents",
  "inventory",
  "iot",
];
export function useStoreTelemetry(shop: Shop | null, game?: GameState | null, paused = false) {
  const [signals, setSignals] = useState<StoreSignal[]>([]);
  const playback = useRef(paused);
  useEffect(() => { playback.current = paused; }, [paused]);
  const count = useRef(0);
  const seen = useRef(new Set<string>());
  const visit = useRef({ seed: "", length: -1, epoch: 0 });
  useEffect(() => {
    setSignals([]);
    count.current = 0;
    seen.current.clear();
    if (!shop) return;
    const stock = products.map((_, i) => 48 + i * 7);
    const prices = [1.9, 4.5, 2.4, 3.2, 1.4, 5.9];
    let product = shop.style % products.length;
    const tick = () => {
      if (playback.current) return;
      const n = ++count.current;
      const kind = cycle[(n - 1) % cycle.length];
      let label = "",
        detail = "",
        topic = "";
      if (kind === "purchase") {
        product = (product + 1) % products.length;
        stock[product] = Math.max(0, stock[product] - 1);
        label = `${products[product]} purchased`;
        detail = `€${prices[product].toFixed(2)} · sale shared with stock and finance`;
        topic = storeTopic(shop, "purchase", "completed", `order-${n}`);
      }
      if (kind === "inventory") {
        const refill = stock[product] < 18;
        if (refill) stock[product] += 24;
        label = `${products[product]} stock ${refill ? "replenished" : "updated"}`;
        detail = `${stock[product]} available · shelf and online stock agree`;
        topic = storeTopic(shop, "inventory", refill ? "replenished" : "updated", products[product].toLowerCase().replaceAll(" ", "-"));
      }
      if (kind === "pricing") {
        const i = (Math.floor(n / 8) + shop.style) % products.length;
        prices[i] = Number(
          (1.8 + i * 0.65 + (Math.floor(n / 8) % 4) * 0.1).toFixed(2),
        );
        label = `${products[i]} price published`;
        detail = `€${prices[i].toFixed(2)} · shelf, till, and online updated together`;
        topic = storeTopic(shop, "price", "updated", products[i].toLowerCase().replaceAll(" ", "-"));
      }
      if (kind === "iot") {
        const fridge = n % 8 === 5;
        label = fridge ? "Fridge temperature checked" : "Safety camera checked";
        detail = fridge
          ? `${(3.4 + Math.sin(n) * 0.3).toFixed(1)}°C · fresh food protected`
          : "Entrance clear · safety agent informed";
        topic = fridge
          ? storeTopic(shop, "fridge", "temperatureUpdated", "fridge-1")
          : storeTopic(shop, "camera", "statusUpdated", "entrance-1");
      }
      if (kind === "agents") {
        label = "Picking robots coordinated";
        detail = `${products[product]} order routed · Stocky and Penny share the task`;
        topic = storeTopic(shop, "robot", "taskAssigned", "stocky");
      }
      const type = SIGNAL_TYPES[kind];
      const signal = {
        id: `${shop.id}-live-${n}`,
        kind,
        topic,
        label,
        detail,
        at: Date.now(),
        color: type.color,
        glyph: type.glyph,
      };
      setSignals((old) => [signal, ...old].slice(0, STORE_HISTORY_LIMIT));
    };
    for (let i = 0; i < 8; i++) tick();
    const timer = window.setInterval(tick, 420);
    return () => clearInterval(timer);
  }, [shop?.id]);
  useEffect(() => {
    if (!shop || !game || paused) return;
    if (
      visit.current.seed !== game.seed ||
      game.history.length < visit.current.length
    ) {
      seen.current.clear();
      visit.current.epoch++;
    }
    visit.current.seed = game.seed;
    visit.current.length = game.history.length;
    const fresh = game.events.filter((e) => !seen.current.has(e.id));
    game.events.forEach((e) => seen.current.add(e.id));
    const outcomes = fresh.filter((e) => e.topic === "retail/outcome/verified");
    if (!outcomes.length) return;
    setSignals((old) =>
      [
        ...outcomes
          .reverse()
          .map((e) => ({
            id: `decision-${visit.current.epoch}-${e.id}`,
            kind: "agents" as const,
            topic: storeTopic(shop, "decision", "applied", e.id),
            label: "Your decision applied",
            detail: String(e.data.outcome),
            at: Date.now(),
            color: SIGNAL_TYPES.agents.color,
            glyph: "✓",
          })),
        ...old,
      ].slice(0, STORE_HISTORY_LIMIT),
    );
  }, [shop?.id, game?.history.length, game?.seed, paused]);
  return signals;
}
