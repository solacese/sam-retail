import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  Radio,
  ScanLine,
} from "lucide-react";
import type { Category, GameState, RetailEvent } from "../engine/types";
const labels: Record<Category, string> = {
  business: "Business event",
  pattern: "Pattern detected",
  agent: "Agent triggered",
  message: "Agent message",
  decision: "Decision required",
  action: "Action executed",
  outcome: "Outcome verified",
};
export function EventStream({
  state,
  onXray,
}: {
  state: GameState;
  onXray: () => void;
}) {
  const events = state.events.slice(-45).reverse();
  const time = (e: RetailEvent) =>
    `${String(Math.floor((e.minute % 1440) / 60)).padStart(2, "0")}:${String(Math.floor(e.minute % 60)).padStart(2, "0")}`;
  return (
    <aside className="event-panel">
      <details open className="stream-details">
        <summary>
          <span className="eyebrow">
            <Radio size={14} /> EVENT MESH
          </span>
          <ChevronDown size={16} />
        </summary>
        <div className="stream-heading">
          <h3>The ripple effect.</h3>
          <span className="live-indicator">Simulated</span>
        </div>
        <p className="panel-subtitle">
          Every decision starts a chain reaction.
        </p>
        <div className="event-stream" aria-label="Live simulated event stream">
          {events.map((e) => (
            <div key={e.id} className={`event-row event-${e.category}`}>
              <div className="event-dot" />
              <div className="event-content">
                <div className="event-meta">
                  <span>{labels[e.category]}</span>
                  <time>{time(e)}</time>
                </div>
                <p>{e.topic}</p>
                {(e.data.title ||
                  e.data.message ||
                  e.data.outcome ||
                  e.data.reason) && (
                  <small>
                    {String(
                      e.data.title ||
                        e.data.message ||
                        e.data.outcome ||
                        e.data.reason,
                    )}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="event-stream-footer">
          <Activity size={13} />
          <span>
            {state.events.at(-1)?.sequence ?? 0} events · local event bus
          </span>
        </div>
      </details>
      <button
        className="xray-banner"
        onClick={onXray}
        disabled={!state.proposal}
      >
        <ScanLine size={23} />
        <span>
          <strong>Follow the why.</strong>
          <small>Open the Event X-Ray</small>
        </span>
        <ArrowUpRight size={17} />
      </button>
    </aside>
  );
}
