import { useEffect, useState } from "react";
import {
  Radio,
  Snowflake,
  Camera,
  Package,
  Tag,
  ShoppingBag,
  Bot,
} from "lucide-react";
import type { Shop } from "../data/shops";
import {
  SIGNAL_TYPES,
  type SignalKind,
  type StoreSignal,
} from "../engine/storeTelemetry";
import { IsometricShop } from "./IsometricShop";
const icons = {
  inventory: Package,
  pricing: Tag,
  purchase: ShoppingBag,
  iot: Snowflake,
  agents: Bot,
};
export function StoreDashboard({
  shop,
  signals,
}: {
  shop: Shop;
  signals: StoreSignal[];
}) {
  const [filter, setFilter] = useState<SignalKind | "all">("all");
  const [held, setHeld] = useState<StoreSignal[] | null>(null);
  useEffect(() => {
    setHeld(null);
    setFilter("all");
  }, [shop.id]);
  const shown = (held ?? signals)
    .filter((s) => filter === "all" || s.kind === filter)
    .slice(0, 24);
  return (
    <aside
      className="store-dashboard"
      aria-label={`${shop.name} live shop view`}
    >
      <div className="store-view-title">
        <div>
          <span className="atlas-kicker">YOUR SHOP</span>
          <h2>{shop.name}</h2>
        </div>
        <span className="live-pill">
          <Radio size={14} /> Live demo
        </span>
      </div>
      <div className="store-stage">
        <IsometricShop shop={shop} signals={signals} />
        <div className="store-status">
          <span>
            <Tag size={14} /> Prices in sync
          </span>
          <span>
            <Camera size={14} /> Store connected
          </span>
        </div>
      </div>
      <div className="feed-toolbar">
        <h3>Events</h3>
        <button
          onClick={() => setHeld(held ? null : signals)}
          aria-pressed={!!held}
        >
          {held ? "Resume feed" : "Hold feed"}
        </button>
      </div>
      <div
        className="feed-filters"
        role="group"
        aria-label="Filter shop events"
      >
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        {(Object.keys(SIGNAL_TYPES) as SignalKind[]).map((kind) => (
          <button
            key={kind}
            aria-pressed={filter === kind}
            onClick={() => setFilter(kind)}
          >
            {SIGNAL_TYPES[kind].label}
          </button>
        ))}
      </div>
      <div
        className="shop-event-feed"
        aria-label="Shop event feed"
        tabIndex={0}
      >
        {shown.map((event) => {
          const Icon = icons[event.kind];
          return (
            <div
              className={`shop-event-row kind-${event.kind}`}
              key={event.id}
              data-kind={event.kind}
              style={{ "--event-color": event.color } as React.CSSProperties}
            >
              <Icon size={18} />
              <div>
                <strong>{event.label}</strong>
                <p>{event.detail}</p>
                <code>{event.topic}</code>
              </div>
            </div>
          );
        })}
        {!shown.length && (
          <p className="feed-empty">The next update is on its way.</p>
        )}
      </div>
    </aside>
  );
}
