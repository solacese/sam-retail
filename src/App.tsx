import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Globe2,
  Leaf,
  Maximize2,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import {
  DEPARTMENTS,
  visibleRecommendations,
  decisionImpact,
  evidence,
  metrics,
  stock,
  type Category,
  type DecisionKind,
  type StoreState,
  type StoreCommand,
} from "./simulation/store";
import { useSimulation } from "./simulation/useSimulation";
import { EuropeNetwork } from "./shop/EuropeNetwork";
import {
  PersonInspector,
  ShelfActions,
  FloorInspector,
  PeopleList,
} from "./shop/PeopleControls";
import { StorePulse } from "./shop/StorePulse";
const StoreScene = lazy(() => import("./shop/StoreScene"));
const money = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n / 100);
const clock = (n: number) =>
  `${String(9 + Math.floor(n / 3600)).padStart(2, "0")}:${String(Math.floor(n / 60) % 60).padStart(2, "0")}:${String(Math.floor(n) % 60).padStart(2, "0")}`;
const categoryLabels: Record<Category, string> = {
  inventory: "Inventory",
  pricing: "Pricing",
  purchases: "Purchases",
  iot: "IoT",
  agents: "Agents",
  operations: "Operations",
};
function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null!);
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => {
      el.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "dialog wide-dialog" : "dialog"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <header className="dialog-heading">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
function Inspector({
  id,
  state,
  onClose,
  command,
}: {
  id: string;
  state: StoreState;
  onClose: () => void;
  command: (command: StoreCommand) => void;
}) {
  const department = DEPARTMENTS.find((d) => d.id === id),
    products = state.products.filter((p) => p.department === id),
    m = metrics(state);
  const names: Record<string, string> = {
    stockroom: "Stockroom",
    receiving: "Receiving",
    checkouts: "Checkouts",
    pickup: "Order collection",
  };
  return (
    <section className="inspector">
      <div className="section-heading">
        <span className="eyebrow">STORE INSPECTOR</span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close inspector"
        >
          <X size={17} />
        </button>
      </div>
      <h2>{department?.name ?? names[id]}</h2>
      {department ? (
        <>
          <p className="muted">
            {department.kind === "fridge"
              ? `${state.fridge.toFixed(1)}°C · safely chilled`
              : "Shelf and backroom stock, updated as people shop."}
          </p>
          <ShelfActions id={id} command={command} />
          <div className="product-table">
            <div className="product-row table-head">
              <span>Product / price</span>
              <span>Shelf</span>
              <span>Back</span>
            </div>
            {products.map((p) => {
              const n = stock(state, p.id),
                expiry = Math.min(
                  ...state.batches
                    .filter((b) => b.productId === p.id && b.shelf > 0)
                    .map((b) => b.expiresAt),
                );
              return (
                <div className="product-row" key={p.id}>
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      {money(p.price)}
                      {state.mealActive && id === "bakery" ? " · deal" : ""}
                      {expiry < 600
                        ? ` · ${Math.max(0, Math.ceil((expiry - state.time) / 60))}m to expiry`
                        : ""}
                    </small>
                  </span>
                  <b className={n.shelf < 6 ? "low-stock" : ""}>{n.shelf}</b>
                  <span>{n.backroom}</span>
                </div>
              );
            })}
          </div>
          <div className="inspector-note">
            <Radio size={15} /> One price across shelf, checkout & online.
          </div>
        </>
      ) : id === "checkouts" ? (
        <>
          <p className="muted">
            {m.queue} shoppers waiting · average wait {Math.round(m.wait)}s
          </p>
          {state.checkouts.map((open, i) => (
            <div className="detail-line" key={i}>
              <span>Checkout {i + 1}</span>
              <strong>{open ? "Open" : "Closed"}</strong>
            </div>
          ))}
          <p className="fine-print">
            Additional staffing cost: {money(state.operatingCosts)}
          </p>
        </>
      ) : id === "pickup" ? (
        <>
          <p className="muted">
            {state.onlineComplete
              ? "The pantry order is ready for collection."
              : "A four-item pantry order is waiting for a colleague."}
          </p>
          <div className="detail-line">
            <span>Orders completed</span>
            <strong>{state.onlineComplete}</strong>
          </div>
        </>
      ) : (
        <>
          <p className="muted">
            {id === "receiving"
              ? "Deliveries are checked in, then moved to backroom stock."
              : "Reserve stock is available for colleague-led replenishment."}
          </p>
          <div className="detail-line">
            <span>
              {id === "receiving" ? "At receiving" : "Backroom units"}
            </span>
            <strong>
              {state.batches.reduce(
                (n, b) => n + (id === "receiving" ? b.receiving : b.backroom),
                0,
              )}
            </strong>
          </div>
          <div className="detail-line">
            <span>Colleagues available</span>
            <strong>
              {
                state.people.filter(
                  (p) => p.role === "employee" && p.id >= 102 && !p.taskId,
                ).length
              }{" "}
              / 6
            </strong>
          </div>
          <div className="detail-line">
            <span>Deliveries received</span>
            <strong>{state.deliveryCount}</strong>
          </div>
          <p className="fine-print">
            Next delivery follows the store schedule, every 75 seconds.
          </p>
        </>
      )}
    </section>
  );
}
function actionStatus(state: StoreState, id: DecisionKind) {
  return id === "restock"
    ? state.inventoryPolicy === "availability"
      ? "Availability prioritized"
      : "Lean stock prioritized"
    : id === "checkout"
      ? state.servicePolicy === "service"
        ? "Service budget approved"
        : "Operating costs held"
      : id === "meal"
        ? state.freshPolicy === "waste"
          ? "Waste reduction prioritized"
          : "Full-price margin protected"
        : state.fulfilmentPolicy === "online"
          ? "Online promises prioritized"
          : "In-store shoppers prioritized";
}
export default function App() {
  const [panel, setPanel] = useState<
      "events" | "europe" | "help" | "reset" | null
    >(null),
    [decision, setDecision] = useState<DecisionKind | null>(null),
    [selected, setSelected] = useState<string | null>(null),
    [cameraReset, setCameraReset] = useState(0),
    [category, setCategory] = useState<Category | "all">("all"),
    [notice, setNotice] = useState("");
  const sim = useSimulation(
      !!decision || panel === "europe" || panel === "help" || panel === "reset",
    ),
    s = sim.snapshot,
    m = metrics(s),
    priorities = visibleRecommendations(s);
  const command = (action: StoreCommand, focusShop = true) => {
    const result = sim.command(action);
    setNotice(
      result.message +
        (result.ok && !sim.running ? " Press Play to watch." : ""),
    );
    if (result.ok && focusShop && window.innerWidth <= 760) {
      if (!selected?.startsWith("person:")) setSelected(null);
      requestAnimationFrame(() =>
        document.querySelector(".shop-stage")?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        }),
      );
    }
  };
  const sceneSelect = (id: string) => {
    const person = sim.store.current.people.find(
      (p) => selected === `person:${p.id}`,
    );
    if (person && DEPARTMENTS.some((d) => d.id === id)) {
      command(
        {
          type: person.role === "shopper" ? "browse" : "tidy",
          personId: person.id,
          departmentId: id,
        },
        false,
      );
    } else setSelected(id);
  };
  const rec = s.recommendations.find((r) => r.id === decision);
  useEffect(() => {
    if (selected)
      document.querySelector(".store-sidebar")?.scrollTo({ top: 0 });
  }, [selected]);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(id);
  }, [notice]);
  return (
    <div className="app">
      <header className="app-header">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          aria-label="ABC Shop home"
        >
          <span className="brand-mark">
            <Store size={24} />
          </span>
          <span>
            ABC Shop<small>Paris Flagship</small>
          </span>
        </a>
        <div className="header-status">
          <span className="status-dot" />
          <span>
            Connected by <b>Solace</b>
          </span>
        </div>
        <nav aria-label="Store views">
          <button
            aria-label="Europe"
            className={panel === "europe" ? "nav-button active" : "nav-button"}
            onClick={() => setPanel("europe")}
          >
            <Globe2 size={19} />
            <span>Europe</span>
          </button>
          <button
            className="nav-button"
            aria-label="Events"
            onClick={() => setPanel("events")}
          >
            <Activity size={19} />
            <span>Events</span>
          </button>
          <button
            className="icon-button"
            aria-label="How to play"
            onClick={() => setPanel("help")}
          >
            <CircleHelp size={20} />
          </button>
        </nav>
      </header>
      <section className="kpi-strip" aria-label="Live store performance">
        <div className="kpi">
          <span>
            <ShoppingBasket size={15} />
            Sales
          </span>
          <strong data-testid="sales">{money(m.revenue)}</strong>
          <small>{s.transactions.length} purchases</small>
        </div>
        <div className="kpi">
          <span>
            <Activity size={15} />
            Gross margin
          </span>
          <strong>
            {m.margin.toFixed(1)}
            <em>%</em>
          </strong>
          <small>{money(m.profit)} gross profit</small>
        </div>
        <div className="kpi">
          <span>
            <Box size={15} />
            Availability
          </span>
          <strong>
            {m.availability.toFixed(0)}
            <em>%</em>
          </strong>
          <small>{m.units.toLocaleString()} units in stock</small>
        </div>
        <div className="kpi">
          <span>
            <Leaf size={15} />
            Food waste
          </span>
          <strong>
            {m.waste}
            <em> units</em>
          </strong>
          <small>{m.wasteRate.toFixed(1)}% of sold + wasted</small>
        </div>
        <div className="kpi">
          <span>
            <Clock3 size={15} />
            Queue time
          </span>
          <strong>
            {Math.round(m.wait)}
            <em>s</em>
          </strong>
          <small>{m.queue} shoppers waiting</small>
        </div>
        <div className="kpi">
          <span>
            <Users size={15} />
            Satisfaction
          </span>
          <strong>
            {m.satisfaction}
            <em>%</em>
          </strong>
          <small>
            {
              s.people.filter(
                (p) => p.role === "shopper" && p.stage !== "outside",
              ).length
            }{" "}
            shoppers in store
          </small>
        </div>
      </section>
      <main className="workspace">
        <StorePulse
          state={s}
          running={sim.running}
          onOpenEvents={() => setPanel("events")}
        />
        <section className="shop-stage" aria-label="Paris Flagship shop floor">
          <div className="scene-caption">
            <div>
              <span className="eyebrow">ABC SHOP · THE SHOP FLOOR</span>
              <h1>Paris Flagship</h1>
            </div>
            <span className="live-badge">
              <span
                className={sim.running ? "status-dot" : "status-dot held"}
              />
              {sim.running ? "LIVE" : "PAUSED"}
              <time data-testid="store-clock">{clock(s.time)}</time>
            </span>
          </div>
          <div className="canvas-wrap" data-testid="shop-scene">
            <Suspense
              fallback={
                <div className="scene-loading">Opening your store…</div>
              }
            >
              <StoreScene
                state={s}
                store={sim.store}
                running={sim.runningRef}
                selected={selected}
                onSelect={sceneSelect}
                onFloorClick={(position) => {
                  if (selected?.startsWith("person:"))
                    command(
                      {
                        type: "walk",
                        personId: Number(selected.split(":")[1]),
                        position,
                      },
                      false,
                    );
                }}
                cameraReset={cameraReset}
                active={!panel && !decision}
              />
            </Suspense>
          </div>
          <div className="scene-footer">
            <div className="playback-controls">
              <button
                className="play-button"
                onClick={() => sim.setPlaying((v) => !v)}
                aria-label={
                  sim.playing ? "Pause simulation" : "Play simulation"
                }
                disabled={!!decision || panel === "europe"}
              >
                {sim.playing ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" />
                )}
              </button>
              <div className="speed-switch" aria-label="Simulation speed">
                <button
                  aria-pressed={sim.speed === 1}
                  onClick={() => sim.setSpeed(1)}
                >
                  1×
                </button>
                <button
                  aria-pressed={sim.speed === 2}
                  onClick={() => sim.setSpeed(2)}
                >
                  2×
                </button>
              </div>
              <button
                className="icon-button"
                aria-label="Reset camera"
                onClick={() => setCameraReset((n) => n + 1)}
              >
                <Maximize2 size={17} />
              </button>
              <button
                className="icon-button"
                aria-label="Reset store"
                onClick={() => setPanel("reset")}
              >
                <RotateCcw size={17} />
              </button>
            </div>
            <span className="camera-hint">
              Click a person or shelf · drag to explore
            </span>
          </div>
        </section>
        <aside
          className={`store-sidebar${selected ? " has-selection" : ""}${selected?.startsWith("person:") ? " has-person" : ""}`}
          aria-label="Store operations"
        >
          {selected?.startsWith("person:") ? (
            <PersonInspector
              key={selected}
              id={Number(selected.split(":")[1])}
              state={s}
              command={command}
              onClose={() => setSelected(null)}
            />
          ) : selected?.startsWith("floor:") ? (
            <FloorInspector
              id={Number(selected.split(":")[1])}
              state={s}
              command={command}
              onClose={() => setSelected(null)}
            />
          ) : selected ? (
            <Inspector
              id={selected}
              state={s}
              command={command}
              onClose={() => setSelected(null)}
            />
          ) : (
            <>
              <div className="section-heading">
                <span className="eyebrow">YOUR AGENT TEAM</span>
                <span className="count-pill">
                  {priorities.length} to review
                </span>
              </div>
              <p className="agent-intro">
                {priorities.length
                  ? "You set the priorities. Your team handles the details."
                  : "All priorities set. Your team is on it."}
              </p>
              <div className="recommendations">
                {priorities.map((r) => (
                  <button
                    key={r.id}
                    className={`recommendation ${r.status}`}
                    disabled={r.status !== "pending"}
                    onClick={() => setDecision(r.id)}
                  >
                    <span className="rec-agent">
                      {r.status === "pending" ? (
                        <Sparkles size={14} />
                      ) : (
                        <Check size={14} />
                      )}{" "}
                      {r.agent}
                    </span>
                    <strong>{r.title}</strong>
                    <span className="rec-evidence">{evidence(s, r.id)}</span>
                    <span className="rec-link">
                      {r.status === "pending"
                        ? "Review decision"
                        : actionStatus(s, r.id)}{" "}
                      {r.status === "pending" && <ArrowRight size={15} />}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
          {s.decisionLog.length > 0 && (
            <section
              className="store-changes"
              aria-label="Your choices in action"
            >
              <div className="section-heading">
                <span className="eyebrow">YOUR CHOICES IN ACTION</span>
              </div>
              {[...s.decisionLog]
                .reverse()
                .slice(0, 2)
                .map((choice) => (
                  <article
                    className="decision-outcome"
                    data-testid={`decision-impact-${choice.id}`}
                    key={choice.id}
                  >
                    <Check size={15} />
                    <div>
                      <strong>{actionStatus(s, choice.id)}</strong>
                      <p>{decisionImpact(s, choice.id)}</p>
                    </div>
                  </article>
                ))}
            </section>
          )}
          <PeopleList state={s} onSelect={setSelected} />
          <section className="department-list">
            <div className="section-heading">
              <span className="eyebrow">DEPARTMENTS</span>
              <span className="tiny-muted">On shelf</span>
            </div>
            {DEPARTMENTS.map((d) => {
              const ps = s.products.filter((p) => p.department === d.id),
                units = ps.reduce((n, p) => n + stock(s, p.id).shelf, 0);
              return (
                <button
                  key={d.id}
                  className={
                    selected === d.id
                      ? "department-button selected"
                      : "department-button"
                  }
                  onClick={() => setSelected(d.id)}
                >
                  <span className="dept-dot" style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <strong>{units}</strong>
                  <ChevronRight size={14} />
                </button>
              );
            })}
            <div className="utility-inspectors">
              {["checkouts", "stockroom", "receiving", "pickup"].map((id) => (
                <button key={id} onClick={() => setSelected(id)}>
                  {id === "pickup"
                    ? "Collection"
                    : id[0].toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>
          </section>
          <footer className="sidebar-footer">
            <span className="status-dot" /> Solace Agent Mesh{" "}
            <span>Local demo</span>
          </footer>
        </aside>
      </main>
      {notice && (
        <div role="status" className="toast">
          <Check size={18} />
          {notice}
        </div>
      )}
      {rec && (
        <Dialog
          title="A decision for your store"
          onClose={() => setDecision(null)}
        >
          <div className="decision-content">
            <span className="agent-label">
              <Sparkles size={16} /> {rec.agent}
            </span>
            <h3>{rec.title}</h3>
            <p className="decision-evidence">{evidence(s, rec.id)}</p>
            <div className="decision-explanation">
              <h4>What happens</h4>
              <p>{rec.consequence}</p>
              <h4>The tradeoff</h4>
              <p>{rec.tradeoff}</p>
            </div>
            <div className="decision-events">
              <span className="eyebrow">EVENTS CORRELATED</span>
              <code>
                abc/retail/v1/fr/paris-flagship/
                {rec.id === "restock"
                  ? "stock/sku-0/updated"
                  : rec.id === "checkout"
                    ? "checkout/staffing/updated"
                    : rec.id === "meal"
                      ? "batch/bakery/expiry"
                      : "order/collection/requested"}
              </code>
              <span className="fine-print">
                Local agent rules review the current store state. The shop is
                paused while you decide.
              </span>
            </div>
            <button
              className="primary"
              onClick={() => {
                if (sim.choose(rec.id, true)) {
                  setNotice(
                    rec.id === "meal"
                      ? "Bakery deal is live. All prices are in sync."
                      : decisionImpact(sim.store.current, rec.id),
                  );
                  setDecision(null);
                } else setNotice("That priority has already been set.");
              }}
            >
              {rec.action}
              <ArrowRight size={17} />
            </button>
            <button
              className="secondary"
              onClick={() => {
                sim.choose(rec.id, false);
                setNotice(decisionImpact(sim.store.current, rec.id));
                setDecision(null);
              }}
            >
              {rec.alternative}
            </button>
          </div>
        </Dialog>
      )}
      {panel === "events" && (
        <Dialog title="The event stream" wide onClose={() => setPanel(null)}>
          <div className="event-toolbar">
            <span className="stream-status">
              <span
                className={sim.running ? "status-dot" : "status-dot held"}
              />
              {sim.running ? "Streaming" : "Paused"} · {s.events.length} / 600
              events
            </span>
            <button
              className="secondary compact"
              onClick={() => sim.setPlaying((v) => !v)}
            >
              {sim.playing ? <Pause size={15} /> : <Play size={15} />}{" "}
              {sim.playing ? "Pause" : "Play"}
            </button>
          </div>
          <div className="filter-row" role="group" aria-label="Filter events">
            {(
              ["all", ...Object.keys(categoryLabels)] as (Category | "all")[]
            ).map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c === "all" ? "All events" : categoryLabels[c]}
              </button>
            ))}
          </div>
          <div className="event-history" data-testid="event-history">
            {s.events
              .filter((e) => category === "all" || e.category === category)
              .map((e) => (
                <article className={`stream-event ${e.category}`} key={e.id}>
                  <time>{clock(e.at)}</time>
                  <div>
                    <span className="event-category">
                      {categoryLabels[e.category]}
                    </span>
                    <p>{e.message}</p>
                    <code>{e.topic}</code>
                  </div>
                </article>
              ))}
            {!s.events.some(
              (e) => category === "all" || e.category === category,
            ) && (
              <p className="empty-state">
                No {category} events yet. Activity appears here as the shop
                runs.
              </p>
            )}
          </div>
          <p className="event-footnote">
            Events come from this store’s local simulation. No live broker or
            model is connected.
          </p>
        </Dialog>
      )}
      {panel === "europe" && (
        <Dialog title="Across Europe" wide onClose={() => setPanel(null)}>
          <EuropeNetwork
            onReturn={() => {
              setPanel(null);
              setCameraReset((n) => n + 1);
            }}
          />
        </Dialog>
      )}
      {panel === "help" && (
        <Dialog title="Welcome to ABC Shop" onClose={() => setPanel(null)}>
          <div className="help-content">
            <p>
              Explore a working supermarket, help its agents, and watch your
              decisions reach the shop floor.
            </p>
            <ul>
              <li>
                Drag the shop to move around. Scroll or pinch to zoom. Use two
                fingers or right-drag to rotate.
              </li>
              <li>
                Select a department or fixture to inspect its stock, prices, and
                status. The department list offers the same controls.
              </li>
              <li>
                Select a person, then click the floor to walk there or a shelf
                to browse or tidy it. Choose another person to switch; close
                their panel to return to inspecting the shop.
              </li>
              <li>
                Review a recommendation to compare its benefits and tradeoffs.
                There is no decision timer.
              </li>
              <li>
                Pause, change speed, or open Events to explore the same activity
                in the stream.
              </li>
            </ul>
            <p>
              This is a deterministic local demonstration of Solace event-driven
              coordination. Stores and benefits are illustrative; no live Solace
              broker or AI model is connected.
            </p>
            <button className="primary" onClick={() => setPanel(null)}>
              Back to the shop <ArrowRight size={17} />
            </button>
          </div>
        </Dialog>
      )}
      {panel === "reset" && (
        <Dialog title="Start a fresh store?" onClose={() => setPanel(null)}>
          <div className="help-content">
            <p>
              This resets stock, sales, staff tasks, and decisions to the same
              starting conditions.
            </p>
            <button
              className="primary"
              onClick={() => {
                sim.reset();
                setSelected(null);
                setPanel(null);
                setCameraReset((n) => n + 1);
                setNotice("A fresh day at Paris Flagship.");
              }}
            >
              Reset store <RotateCcw size={17} />
            </button>
            <button className="secondary" onClick={() => setPanel(null)}>
              Keep this store
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
