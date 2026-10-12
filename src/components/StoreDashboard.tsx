import { useEffect, useRef, useState } from "react";
import {
  Radio,
  Pause,
  Play,
  Snowflake,
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
import { matchesSubscription, storeSubscriptions } from "../engine/storeTopics";
import { StoreStats } from "./StoreStats";
import type { Resources } from "../engine/types";
import { IsometricShop } from "./IsometricShop";
const eventTime = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
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
  resources,
  paused,
  onTogglePlayback,
}: {
  shop: Shop;
  signals: StoreSignal[];
  resources?: Resources;
  paused: boolean;
  onTogglePlayback: () => void;
}) {
  const [filter, setFilter] = useState<SignalKind | "all">("all");
  const feed = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setFilter("all");
  }, [shop.id]);
  useEffect(() => { if (feed.current) feed.current.scrollTop = 0; }, [filter, shop.id]);
  const subscriptions = storeSubscriptions(shop, filter);
  const shown = signals
    .filter((s) => subscriptions.some(pattern => matchesSubscription(s.topic, pattern)));
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
          <Radio size={14} /> {paused ? "Paused" : "Live demo"}
        </span>
      </div>
      <div className="store-stage">
        <IsometricShop shop={shop} signals={signals} paused={paused} />
        <StoreStats shop={shop} resources={resources} />
      </div>
      <div className="feed-toolbar">
        <h3>Events</h3>
        <button
          onClick={onTogglePlayback}
          aria-label={paused ? "Play shop activity" : "Pause shop activity"}
          aria-pressed={paused}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
          {paused ? "Play" : "Pause"}
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
            title={storeSubscriptions(shop, kind).join(" · ")}
            aria-pressed={filter === kind}
            onClick={() => setFilter(kind)}
          >
            {SIGNAL_TYPES[kind].label}
          </button>
        ))}
      </div>
      <div
        ref={feed}
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
                <div className="event-row-heading"><strong>{event.label}</strong>
                  <time dateTime={new Date(event.at).toISOString()}>{eventTime.format(event.at)}</time>
                </div>
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
