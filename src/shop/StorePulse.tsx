import { useState } from "react";
import { ArrowUpRight, Box, Thermometer } from "lucide-react";
import type { Category, StoreState } from "../simulation/store";
import { EVENT_COLORS } from "./eventEffects";
const categories: Record<Category, { label: string; color: string }> = {
  inventory: { label: "Inventory", color: EVENT_COLORS.inventory },
  pricing: { label: "Pricing", color: "#c39c56" },
  purchases: { label: "Purchases", color: EVENT_COLORS.payment },
  iot: { label: "Devices", color: "#7aabb0" },
  agents: { label: "Agents", color: "#a392b4" },
  operations: { label: "Operations", color: "#a2aa84" },
};
const eventTime = (n: number) =>
  `${String(9 + Math.floor(n / 3600)).padStart(2, "0")}:${String(Math.floor(n / 60) % 60).padStart(2, "0")}:${String(Math.floor(n) % 60).padStart(2, "0")}`;
export function StorePulse({
  state,
  running,
  onOpenEvents,
}: {
  state: StoreState;
  running: boolean;
  onOpenEvents: () => void;
}) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const totals = state.batches.reduce(
    (n, b) => ({
      shelf: n.shelf + b.shelf,
      backroom: n.backroom + b.backroom,
      receiving: n.receiving + b.receiving,
      held: n.held + b.inBaskets + b.inTransit,
      floor: n.floor + b.onFloor,
    }),
    { shelf: 0, backroom: 0, receiving: 0, held: 0, floor: 0 },
  );
  const total =
    totals.shelf +
    totals.backroom +
    totals.receiving +
    totals.held +
    totals.floor;
  const rows = state.events
    .filter((e) => filter === "all" || e.category === filter)
    .slice(0, 32);
  const windowEnd = Math.floor(state.time / 2) * 2 + 2;
  const bins = Array.from({ length: 15 }, (_, i) => {
    const start = windowEnd - 30 + i * 2;
    const events = state.events.filter(
      (e) =>
        (filter === "all" || e.category === filter) &&
        e.at >= Math.max(0, start) &&
        e.at < start + 2,
    );
    return { start, events, count: events.length };
  });
  const maximum = Math.max(1, ...bins.map((b) => b.count)),
    count = bins.reduce((n, b) => n + b.count, 0);
  return (
    <aside className="store-pulse" aria-label="Live store information">
      <header className="pulse-heading">
        <h2>Store pulse</h2>
        <span className="pulse-status">
          <span className={running ? "status-dot" : "status-dot held"} />
          {running ? "Live" : "Paused"}
        </span>
      </header>
      <section className="pulse-inventory" aria-label="Inventory on hand">
        <span className="pulse-label">
          <Box size={15} />
          Total inventory
        </span>
        <div className="pulse-big-number">
          <strong data-testid="total-inventory">
            {total.toLocaleString()}
          </strong>
          <span>units on hand</span>
        </div>
        <div
          className="inventory-distribution"
          role="img"
          aria-label={`${totals.shelf} units on shelves, ${totals.backroom} in backroom, ${totals.held} held in baskets or staff transfers, ${totals.receiving} at receiving, ${totals.floor} awaiting floor cleanup`}
        >
          {[
            { key: "shelf", value: totals.shelf },
            { key: "backroom", value: totals.backroom },
            { key: "held", value: totals.held },
            { key: "receiving", value: totals.receiving },
            { key: "floor", value: totals.floor },
          ].map((part) => (
            <span
              key={part.key}
              className={`stock-${part.key}`}
              style={{ width: `${total ? (part.value / total) * 100 : 0}%` }}
            />
          ))}
        </div>
        <dl className="inventory-breakdown">
          <div>
            <dt>
              <i className="stock-shelf" />
              On shelves
            </dt>
            <dd data-testid="inventory-shelf">{totals.shelf}</dd>
          </div>
          <div>
            <dt>
              <i className="stock-backroom" />
              Backroom
            </dt>
            <dd data-testid="inventory-backroom">{totals.backroom}</dd>
          </div>
          <div>
            <dt>
              <i className="stock-held" />
              Baskets & transfers
            </dt>
            <dd data-testid="inventory-held">{totals.held}</dd>
          </div>
          {totals.floor > 0 && (
            <div>
              <dt>
                <i className="stock-floor" />
                On floor · cleanup
              </dt>
              <dd data-testid="inventory-floor">{totals.floor}</dd>
            </div>
          )}
          {totals.receiving > 0 && (
            <div>
              <dt>
                <i className="stock-receiving" />
                Receiving
              </dt>
              <dd>{totals.receiving}</dd>
            </div>
          )}
        </dl>
      </section>
      <section className="pulse-devices" aria-label="Live device readings">
        <span className="pulse-label">
          <Thermometer size={15} />
          Fresh food fridge
        </span>
        <div className="temperature-reading">
          <strong data-testid="fridge-temperature">
            {state.fridge.toFixed(1)}
            <small>°C</small>
          </strong>
          <span>Within target</span>
        </div>
        <div
          className="temperature-gauge"
          role="img"
          aria-label={`Fridge ${state.fridge.toFixed(1)} degrees Celsius. Store target 2 to 5 degrees.`}
        >
          <span className="temperature-target" />
          <span
            className="temperature-marker"
            style={{
              left: `${Math.max(0, Math.min(100, (state.fridge / 8) * 100))}%`,
            }}
          />
        </div>
        <div className="gauge-caption">
          <span>0°C</span>
          <span>Target 2–5°C</span>
          <span>8°C</span>
        </div>
      </section>
      <section className="pulse-activity" aria-label="Recent event activity">
        <div className="pulse-section-heading">
          <span className="pulse-label">Event activity</span>
          <span>
            {count} <small>/ 30s</small>
          </span>
        </div>
        <div
          className="activity-bars"
          role="img"
          aria-label={`Event activity over the last 30 seconds: ${count} events`}
        >
          {bins.map((bin, i) => (
            <div
              key={i}
              className="activity-bin"
              style={{ height: `${Math.max(3, (bin.count / maximum) * 100)}%` }}
              title={`${bin.start < 0 ? "Before opening" : eventTime(bin.start)} · ${bin.count} events`}
            >
              {Object.entries(categories).map(([category, meta]) => {
                const n = bin.events.filter(
                  (e) => e.category === category,
                ).length;
                return n > 0 ? (
                  <span
                    key={category}
                    style={{
                      height: `${(n / bin.count) * 100}%`,
                      background: meta.color,
                    }}
                  />
                ) : null;
              })}
            </div>
          ))}
        </div>
        <div className="activity-caption">
          <span>30 seconds ago</span>
          <span>Now</span>
        </div>
      </section>
      <section className="pulse-stream" aria-label="Live event feed">
        <div className="pulse-section-heading">
          <h3>Event feed</h3>
          <label className="pulse-filter">
            <span className="sr-only">Filter live events</span>
            <select
              aria-label="Filter live events"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Category | "all")}
            >
              <option value="all">All events</option>
              {Object.entries(categories).map(([id, meta]) => (
                <option key={id} value={id}>
                  {meta.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            aria-label="Open full event history"
            onClick={onOpenEvents}
          >
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="pulse-event-list" data-testid="live-event-feed">
          {rows.map((event) => (
            <article
              className="pulse-event"
              data-event-id={event.id}
              key={event.id}
            >
              <span
                className="pulse-event-dot"
                style={{ background: categories[event.category].color }}
              />
              <div>
                <div className="pulse-event-meta">
                  <strong style={{ color: categories[event.category].color }}>
                    {categories[event.category].label}
                  </strong>
                  <time>{eventTime(event.at)}</time>
                </div>
                <p>{event.message}</p>
                <code title={event.topic}>
                  {event.topic.replace("abc/retail/v1/fr/paris-flagship/", "")}
                </code>
              </div>
            </article>
          ))}
          {rows.length === 0 && (
            <p className="pulse-empty">
              No{" "}
              {filter === "all"
                ? "store"
                : categories[filter].label.toLowerCase()}{" "}
              events yet.
            </p>
          )}
        </div>
      </section>
    </aside>
  );
}
