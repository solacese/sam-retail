import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Coins,
  Copy,
  GitBranch,
  HelpCircle,
  Info,
  Megaphone,
  Package,
  Pause,
  Play,
  Radio,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { RetailGame, DAYS, RESOURCE_KEYS, rankFor } from "./engine/game";
import { AGENTS } from "./engine/situations";
import type {
  AgentId,
  Choice,
  Effect,
  GameState,
  Resource,
  Resources,
} from "./engine/types";
import { AgentAvatar, Shop } from "./components/Illustrations";
import { EventStream } from "./components/EventStream";
import { Modal } from "./components/Modal";
const ICONS = {
  inventory: Package,
  security: ShieldCheck,
  reputation: Megaphone,
  cash: Coins,
};
const LABELS = {
  inventory: "Inventory",
  security: "Security",
  reputation: "Reputation",
  cash: "Cash",
};
const DEMO_MODELS: Record<AgentId, string> = {
  SAM: "GPT",
  STOCKY: "Claude",
  PENNY: "Claude",
  SHIELD: "GPT",
  SPARK: "Gemini",
};
const COLORS = {
  inventory: "#8ed4ba",
  security: "#96b7d5",
  reputation: "#ddaaa9",
  cash: "#e2c485",
};
type Dialog =
  | "tutorial"
  | "xray"
  | "architecture"
  | "restart"
  | "events"
  | "shop"
  | null;
const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
function readBest(mode: string) {
  try {
    return Number(localStorage.getItem(`minimart-best-${mode}`)) || 0;
  } catch {
    return 0;
  }
}
function makeSeed() {
  return `MM-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 7)}`;
}
function dailySeed() {
  return `DAILY-${new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())}`;
}
function ResourcesBar({
  resources,
  preview,
}: {
  resources: Resources;
  preview?: Resources;
}) {
  return (
    <div className="resources-bar">
      {RESOURCE_KEYS.map((k) => {
        const Icon = ICONS[k],
          n = Math.round(resources[k]),
          delta = preview?.[k] ?? 0;
        return (
          <div
            className={`resource ${n < 25 ? "critical" : ""}`}
            key={k}
            style={{ "--resource-color": COLORS[k] } as React.CSSProperties}
            title={`${LABELS[k]}: ${n < 25 ? "critical" : n < 50 ? "strained" : "healthy"}${delta ? `. ${delta > 0 ? "Increases" : "Decreases"} with this choice.` : ""}`}
          >
            <span className="resource-icon">
              <Icon size={23} strokeWidth={1.6} />
              {delta !== 0 && (
                <span
                  className={`resource-preview ${delta > 0 ? "up" : "down"}`}
                >
                  {delta > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                </span>
              )}
            </span>
            <span className="resource-label">{LABELS[k]}</span>
            <div
              className="resource-track"
              role="meter"
              aria-label={LABELS[k]}
              aria-valuenow={n}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                animate={{ width: `${n}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
function OptionEffects({
  effect,
  resources,
}: {
  effect: Effect;
  resources: Resources;
}) {
  const later: string[] = [];
  if (effect.delivery) later.push("Delivery arrives in 2 decisions");
  if (effect.waste && effect.waste > 0)
    later.push("Spoilage risk later: stock and cash loss");
  if (effect.waste && effect.waste < 0)
    later.push("Fresher stock; less spoilage");
  if (effect.promotion)
    later.push(`Promotion runs for ${effect.promotion} decisions`);
  if (effect.demand)
    later.push(
      effect.demand > 0 ? "Customer demand rises" : "Customer demand falls",
    );
  if (effect.fraud && effect.fraud > 0)
    later.push("Fraud risk rises; loss in 2 decisions");
  if (effect.fraud && effect.fraud < 0) later.push("Fraud pressure falls");
  if (effect.staff)
    later.push(
      effect.staff > 0
        ? "More staff; shorter queues"
        : "Fewer staff; longer queues",
    );
  if (effect.equipment)
    later.push(
      effect.equipment > 0
        ? "Equipment reliability improves"
        : "Equipment risk increases",
    );
  if (effect.loyalty)
    later.push(
      effect.loyalty > 0
        ? "More returning customers"
        : "Fewer returning customers",
    );
  if (effect.margin)
    later.push(
      effect.margin > 0 ? "Trading margin improves" : "Trading margin falls",
    );
  if (effect.delay)
    later.push(
      effect.delay < 0 ? "Supplier delay reduced" : "Supplier delay increases",
    );
  const closes = RESOURCE_KEYS.some((k) => resources[k] + effect.delta[k] <= 0);
  return (
    <span className="option-effects">
      <span className="effect-now">IMMEDIATE EFFECTS</span>
      {RESOURCE_KEYS.filter((k) => effect.delta[k] !== 0).map((k) => {
        const d =
          Math.round(
            (Math.max(0, Math.min(100, resources[k] + effect.delta[k])) -
              resources[k]) *
              10,
          ) / 10;
        return (
          <span className="option-effect" key={k}>
            <span>{LABELS[k]}</span>
            <b className={d > 0 ? "gain" : "cost"}>
              {d > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{" "}
              {d > 0 ? "up" : "down"}
            </b>
          </span>
        );
      })}
      {closes && <span className="option-warning">This closes the shop</span>}
      {later.length > 0 && (
        <span className="option-later">
          {later.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      )}
    </span>
  );
}
function ScoreFormula({ state }: { state: GameState }) {
  return (
    <div className="score-formula">
      {[
        ["Survival", state.score.survival, 3500],
        ["Resource balance", state.score.balance, 2000],
        ["Profitability", state.score.profit, 1500],
        ["Customer happiness", state.score.customers, 1000],
        ["Crisis management", state.score.crises, 1000],
        ["Agent collaboration", state.score.collaboration, 1000],
      ].map(([label, n, max]) => (
        <div key={label}>
          <span>{label}</span>
          <span>
            {Number(n).toLocaleString()}{" "}
            <small>/ {Number(max).toLocaleString()}</small>
          </span>
        </div>
      ))}
      <div>
        <span>Stockout, fraud & waste penalties</span>
        <span>−{state.score.penalties}</span>
      </div>
    </div>
  );
}
export default function App() {
  const query = new URLSearchParams(window.location.search);
  const [seed, setSeed] = useState(query.get("seed")?.slice(0, 64) || makeSeed);
  const [mode, setMode] = useState<"full" | "quick">(
    query.get("mode") === "quick" ? "quick" : "full",
  );
  const [engine, setEngine] = useState<RetailGame | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [paused, setPaused] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [feedback, setFeedback] = useState(false);
  const [sound, setSound] = useState(false);
  const [best, setBest] = useState(readBest(mode));
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("");
  const [hoverChoice, setHoverChoice] = useState<"approve" | "reject" | null>(
    null,
  );
  const [dragX, setDragX] = useState(0);
  const [sessionBest, setSessionBest] = useState(false);
  const gameRef = useRef<HTMLElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const reduced = useReducedMotion();
  const tone = useCallback(
    (yes: boolean) => {
      if (!sound) return;
      try {
        const ctx = audioRef.current ?? new AudioContext();
        audioRef.current = ctx;
        void ctx.resume();
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(yes ? 440 : 260, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(
          yes ? 660 : 196,
          ctx.currentTime + 0.12,
        );
        g.gain.setValueAtTime(0.06, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.19);
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.2);
      } catch {
        /* Optional sound. */
      }
    },
    [sound],
  );
  const start = (newSeed = seed) => {
    const next = new RetailGame(newSeed.trim() || makeSeed(), mode);
    setEngine(next);
    setState(next.snapshot());
    setSeed(next.snapshot().seed);
    setPaused(false);
    setFeedback(false);
    setDialog(null);
    setBest(readBest(mode));
    setSessionBest(false);
    setCopied(false);
    setShareText("");
    setTimeout(() => gameRef.current?.focus(), 0);
  };
  const decide = useCallback(
    (choice: Choice) => {
      if (!engine || !state?.proposal || paused || dialog || feedback) return;
      tone(choice === "approve");
      setState(engine.resolve(choice));
      setFeedback(true);
      setHoverChoice(null);
      setDragX(0);
    },
    [engine, state?.proposal, paused, dialog, feedback, tone],
  );
  useEffect(() => {
    if (!feedback || paused || dialog) return;
    const t = window.setTimeout(() => {
      if (engine) {
        setState(engine.nextDecision());
        setFeedback(false);
        gameRef.current?.focus();
      }
    }, 1700);
    return () => clearTimeout(t);
  }, [feedback, engine, paused, dialog]);
  useEffect(() => {
    setHoverChoice(null);
    setDragX(0);
  }, [state?.proposal?.id]);
  useEffect(() => {
    if (
      !engine ||
      !state?.proposal ||
      state.status !== "playing" ||
      paused ||
      dialog ||
      feedback
    )
      return;
    const pulse = window.setTimeout(() => setState(engine.livePulse()), 6000);
    return () => clearTimeout(pulse);
  }, [engine, state?.proposal?.id, state?.status, paused, dialog, feedback]);
  useEffect(() => {
    const hide = () => {
      if (
        document.hidden &&
        (state?.status === "playing" || state?.status === "report")
      )
        setPaused(true);
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [state?.status]);
  useEffect(() => {
    if (state && (state.status === "won" || state.status === "lost")) {
      const old = readBest(state.mode);
      if (state.score.total > old) {
        try {
          localStorage.setItem(
            `minimart-best-${state.mode}`,
            String(state.score.total),
          );
        } catch {
          /* Storage is optional. */
        }
        setBest(state.score.total);
        setSessionBest(true);
      }
    }
  }, [state?.status, state?.score.total, state?.mode]);
  useEffect(() => setBest(readBest(mode)), [mode]);
  useEffect(() => {
    if (state && !paused && !dialog) gameRef.current?.focus();
  }, [paused, dialog, state?.proposal?.id]);
  const share = async () => {
    if (!state) return;
    const url = new URL(window.location.href);
    url.search = `?seed=${encodeURIComponent(state.seed)}&mode=${state.mode}`;
    const text = `I scored ${state.score.total.toLocaleString()}/10,000 in Solace MiniMart! ${rankFor(state.score.total)}. Can you beat my shift? Seed: ${state.seed}\n${url}`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "MiniMart — Swipe to Survive",
          text,
          url: url.toString(),
        });
      else await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setShareText(text);
    }
  };
  const home = () => {
    setState(null);
    setEngine(null);
    setPaused(false);
    setFeedback(false);
    setDialog(null);
    setSeed(makeSeed());
  };
  const p = state?.proposal;
  const playing = Boolean(state && (state.status === "playing" || feedback));
  const end =
    state && (state.status === "won" || state.status === "lost") && !feedback;
  const preview = p
    ? p.template[
        dragX > 20
          ? "approve"
          : dragX < -20
            ? "reject"
            : (hoverChoice ?? p.suggested)
      ].delta
    : undefined;
  const keyDown = (e: React.KeyboardEvent) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    )
      return;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      decide(e.key === "ArrowRight" ? "approve" : "reject");
    }
    if (
      e.code === "Space" &&
      e.target === e.currentTarget &&
      state &&
      !dialog
    ) {
      e.preventDefault();
      setPaused((v) => !v);
    }
  };
  const lastReport = state?.reports.at(-1);
  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="solace-brand"
          href="https://solace.com"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={`${import.meta.env.BASE_URL}solace-logo.svg`}
            alt="Solace"
          />
        </a>
        <button
          className="wordmark"
          onClick={() => (state ? setDialog("restart") : home())}
        >
          minimart<span>SWIPE TO SURVIVE</span>
        </button>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setSound((v) => !v)}
            aria-label={sound ? "Mute sound" : "Enable sound"}
            aria-pressed={sound}
          >
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button
            className="icon-button"
            aria-label={state ? "Pause game" : "How to play"}
            onClick={() =>
              state ? setPaused((v) => !v) : setDialog("tutorial")
            }
          >
            {state ? <Pause size={17} /> : <HelpCircle size={18} />}
          </button>
        </div>
      </header>
      {!state && (
        <main className="lobby">
          <p className="lobby-intro">Every event changes everything.</p>
          <ResourcesBar
            resources={{
              inventory: 60,
              security: 60,
              reputation: 60,
              cash: 60,
            }}
          />
          <div className="card-stack lobby-stack">
            <div className="stack-back" />
            <section className="game-card welcome-card">
              <div className="welcome-scene">
                <Shop hero />
              </div>
              <div className="card-copy">
                <span className="character-name">YOU, THE NEW CEO</span>
                <h1>
                  A small store.
                  <br />A big responsibility.
                </h1>
                <p>
                  Five agents have opinions.
                  <br />
                  You have the final say.
                  <br />
                  Keep the doors open.
                </p>
                <span className="welcome-flourish">✦</span>
              </div>
            </section>
          </div>
          <button
            className="primary-button start-button"
            onClick={() => start()}
          >
            Open for business <ArrowRight size={17} />
          </button>
          <div className="lobby-options">
            <button
              onClick={() => setMode((v) => (v === "full" ? "quick" : "full"))}
              aria-label="Change game length"
            >
              {mode === "full" ? "5 days · untimed" : "Quick shift · 3 days"}{" "}
              <ChevronDown size={11} />
            </button>
            <button
              onClick={() => {
                const s = dailySeed();
                setSeed(s);
                start(s);
              }}
            >
              Daily challenge <ArrowUpRight size={11} />
            </button>
          </div>
          <details className="seed-settings">
            <summary>Choose a seed</summary>
            <label>
              Same seed. Same starting conditions.
              <input
                aria-label="Challenge seed"
                value={seed}
                maxLength={64}
                onChange={(e) => setSeed(e.target.value)}
              />
            </label>
          </details>
          <div className="lobby-best">
            <Trophy size={12} /> PERSONAL BEST{" "}
            <strong>{best ? best.toLocaleString() : "—"}</strong>
          </div>
        </main>
      )}
      {state && (
        <main
          ref={gameRef}
          tabIndex={0}
          onKeyDown={keyDown}
          className="game-main"
          aria-label="MiniMart gameplay. Left arrow reject, right arrow approve, space pause."
        >
          <ResourcesBar
            resources={state.resources}
            preview={Math.abs(dragX) > 20 || hoverChoice ? preview : undefined}
          />
          <div className="day-line">
            <span>
              DAY {state.day} <i>·</i> {DAYS[state.day - 1]}
            </span>
            <span>{state.turn} / 6</span>
          </div>
          {playing && (
            <>
              <div className="card-stack">
                <div className="stack-back" />
                <AnimatePresence mode={reduced ? "sync" : "wait"}>
                  {feedback && state.lastResult ? (
                    <motion.div
                      className="game-card result-card"
                      key={`result-${state.history.length}`}
                      initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reduced ? undefined : { opacity: 0 }}
                    >
                      <div className={`result-mark ${state.lastResult.choice}`}>
                        {state.lastResult.choice === "approve" ? (
                          <Check size={27} />
                        ) : (
                          <X size={27} />
                        )}
                      </div>
                      <span className="character-name">
                        {state.lastResult.choice === "approve"
                          ? "APPROVED"
                          : state.lastResult.choice === "timeout"
                            ? "TIME’S UP · REJECTED"
                            : "REJECTED"}
                      </span>
                      <h2>{state.lastResult.title}</h2>
                      <p>{state.lastResult.outcome}</p>
                      <div className="result-deltas">
                        {RESOURCE_KEYS.filter(
                          (k) => state.lastResult!.delta[k] !== 0,
                        ).map((k) => {
                          const Icon = ICONS[k],
                            d = state.lastResult!.delta[k];
                          return (
                            <span
                              key={k}
                              className={d > 0 ? "positive" : "negative"}
                            >
                              <Icon size={16} />
                              {d > 0 ? (
                                <ArrowUp size={13} />
                              ) : (
                                <ArrowDown size={13} />
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    p && (
                      <motion.div
                        className="game-card decision-card"
                        key={p.id}
                        initial={
                          reduced ? false : { opacity: 0, y: 15, rotate: -2 }
                        }
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        exit={
                          reduced
                            ? undefined
                            : {
                                opacity: 0,
                                x: dragX < 0 ? -120 : 120,
                                rotate: dragX < 0 ? -12 : 12,
                              }
                        }
                        drag={reduced ? false : "x"}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.6}
                        onDrag={(_, i) => setDragX(i.offset.x)}
                        onDragEnd={(_, i) => {
                          if (
                            Math.abs(i.offset.x) > 65 ||
                            Math.abs(i.velocity.x) > 650
                          )
                            decide(i.offset.x > 0 ? "approve" : "reject");
                          setDragX(0);
                        }}
                        style={
                          {
                            touchAction: "pan-y",
                            "--agent-color": AGENTS[p.template.agent].color,
                          } as React.CSSProperties
                        }
                      >
                        <div className="portrait-scene">
                          <img
                            className="generated-portrait"
                            src={`${import.meta.env.BASE_URL}portraits/${p.template.agent.toLowerCase()}.png`}
                            alt={`${p.template.agent}, ${AGENTS[p.template.agent].role}`}
                            draggable={false}
                          />
                          {p.crisis && (
                            <span className="crisis-label">
                              CLOSING-TIME CRISIS
                            </span>
                          )}
                          <div className="portrait-title">
                            <strong>{p.template.agent}</strong>
                            <span>{AGENTS[p.template.agent].role}</span>
                          </div>
                          {Math.abs(dragX) > 20 && (
                            <span
                              className={`swipe-answer ${dragX > 0 ? "yes" : "no"}`}
                            >
                              {dragX > 0
                                ? p.template.approveLabel
                                : p.template.rejectLabel}
                            </span>
                          )}
                        </div>
                        <div className="card-copy">
                          <h2>{p.template.title}</h2>
                          <p>{p.template.situation}</p>
                          <div className="card-advice">
                            <span>SAM</span>
                            <p>
                              {p.updated ? "New events. " : ""}
                              {p.suggested === "approve"
                                ? p.template.recommendation
                                : `${p.template.rejectLabel}. Protect the resource buffer.`}
                            </p>
                            {p.updated && (
                              <span
                                className="updated-dot"
                                title={p.updateReason}
                              />
                            )}
                          </div>
                          <div className="card-technical">
                            <div className="technical-model">
                              <span>MODEL</span>
                              <strong>{DEMO_MODELS[p.template.agent]}</strong>
                              <small>simulated</small>
                            </div>
                            <div className="technical-events">
                              <span>EVENTS CORRELATED</span>
                              <code>
                                {[
                                  ...new Set(
                                    p.evidence.map((e) => e.event.topic),
                                  ),
                                ].join(", ")}
                              </code>
                            </div>
                          </div>
                          <button
                            className="why-button"
                            onClick={() => setDialog("xray")}
                          >
                            <ScanLine size={12} /> Why this card?
                          </button>
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
              <div className="decision-buttons">
                <button
                  className="choice reject"
                  onPointerEnter={() => setHoverChoice("reject")}
                  onPointerLeave={() => setHoverChoice(null)}
                  onFocus={() => setHoverChoice("reject")}
                  onBlur={() => setHoverChoice(null)}
                  onClick={() => decide("reject")}
                  disabled={feedback || !p || paused || !!dialog}
                  aria-label={`Reject: ${p?.template.rejectLabel ?? "Decision committed"}`}
                >
                  <span>
                    <ArrowLeft size={16} /> REJECT
                  </span>
                  <strong>
                    {p?.template.rejectLabel ?? "Decision committed"}
                  </strong>
                  {p && (
                    <OptionEffects
                      effect={p.template.reject}
                      resources={state.resources}
                    />
                  )}
                </button>
                <button
                  className="choice approve"
                  onPointerEnter={() => setHoverChoice("approve")}
                  onPointerLeave={() => setHoverChoice(null)}
                  onFocus={() => setHoverChoice("approve")}
                  onBlur={() => setHoverChoice(null)}
                  onClick={() => decide("approve")}
                  disabled={feedback || !p || paused || !!dialog}
                  aria-label={`Approve: ${p?.template.approveLabel ?? "Decision committed"}`}
                >
                  <span>
                    APPROVE <ArrowRight size={16} />
                  </span>
                  <strong>
                    {p?.template.approveLabel ?? "On to the next event"}
                  </strong>
                  {p && (
                    <OptionEffects
                      effect={p.template.approve}
                      resources={state.resources}
                    />
                  )}
                </button>
              </div>
              <div className="turn-line">
                <div
                  className="turn-dots"
                  aria-label={`Decision ${state.turn} of 6`}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <span
                      className={
                        i < state.turn - 1
                          ? "done"
                          : i === state.turn - 1
                            ? "current"
                            : ""
                      }
                      key={i}
                    />
                  ))}
                </div>
                <span className="countdown">
                  {feedback ? "Decision committed" : "Take your time"}
                </span>
              </div>
              <p className="controls-hint">
                Swipe the card · ← → to decide · Space to pause
              </p>
            </>
          )}
          {state.status === "report" && !feedback && (
            <section className="game-card report-card">
              <div className="report-symbol">✦</div>
              <span className="character-name">DAY {state.day} COMPLETE</span>
              <h2>Still in business.</h2>
              <p>
                The shutters are down.
                <br />
                Your next shift is calling.
              </p>
              <div className="report-grid">
                {[
                  ["Revenue", money(lastReport!.revenue)],
                  ["Profit", money(lastReport!.profit)],
                  ["Stockouts", lastReport!.stockouts],
                  ["Fraud incidents", lastReport!.fraud],
                  ["Satisfaction", `${lastReport!.satisfaction}%`],
                  ["Agent interventions", lastReport!.interventions],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="daily-score">
                <span>Day’s score</span>
                <strong>
                  {lastReport!.score >= 0 ? "+" : ""}
                  {lastReport!.score.toLocaleString()}
                </strong>
              </div>
              <p className="unlock">
                <Zap size={12} />
                {state.day === 1
                  ? "Stock monitoring unlocked"
                  : state.day === 2
                    ? "Security alerts unlocked"
                    : "Marketing guardrails unlocked"}
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  if (engine) {
                    setState(engine.nextDay());
                    gameRef.current?.focus();
                  }
                }}
              >
                Open day {state.day + 1}
                <ArrowRight size={16} />
              </button>
              <small className="report-next">
                Take your time. Continue when you’re ready.
              </small>
            </section>
          )}
          {end && (
            <section className="game-card end-card">
              <Trophy size={28} />
              <span className="character-name">
                {state.status === "won" ? "YOU SURVIVED" : "SHOP CLOSED"}
              </span>
              <h2>
                {state.status === "won"
                  ? "Long live MiniMart."
                  : `${LABELS[state.failure!]} hit zero.`}
              </h2>
              <p>{rankFor(state.score.total)}</p>
              <div className="final-score">
                {state.score.total.toLocaleString()}
                <small>/ 10,000</small>
              </div>
              {sessionBest && (
                <span className="new-best">NEW PERSONAL BEST</span>
              )}
              <details className="score-details">
                <summary>
                  The story of your shift <ChevronDown size={12} />
                </summary>
                <div className="end-insights">
                  <p>
                    <strong>Best call</strong>
                    {
                      [...state.history].sort((a, b) => b.score - a.score)[0]
                        ?.title
                    }
                  </p>
                  <p>
                    <strong>Hardest lesson</strong>
                    {
                      [...state.history].sort((a, b) => a.score - b.score)[0]
                        ?.title
                    }
                  </p>
                  <p>
                    <strong>Biggest crisis</strong>
                    {[...state.history]
                      .filter((h) => h.crisis)
                      .sort((a, b) => a.score - b.score)[0]?.title ??
                      "Your first shift’s growing pains"}
                  </p>
                  <p>
                    <strong>Business impact</strong>
                    {money(state.profit)} profit · {state.interventions}{" "}
                    interventions
                  </p>
                </div>
                <ScoreFormula state={state} />
                <p className="formula-note">
                  Survival & balance scale with decisions completed. Profit caps
                  at {money(state.mode === "quick" ? 1300 : 2200)}. Crises and
                  collaboration scale with your mode. Penalties: 65 per
                  stockout, 50 per fraud incident, 8 per wasted unit.
                </p>
              </details>
              <button
                className="primary-button"
                onClick={() => start(makeSeed())}
              >
                One more shift <RotateCcw size={16} />
              </button>
              <div className="replay-actions">
                <button onClick={() => start(state.seed)}>Same seed</button>
                <button onClick={share}>
                  <Copy size={12} />
                  {copied ? "Shared!" : "Share score"}
                </button>
              </div>
              {shareText && (
                <textarea
                  aria-label="Copy score summary"
                  className="share-fallback"
                  readOnly
                  value={shareText}
                />
              )}
              <small className="end-best">
                Personal best: {best.toLocaleString()}
              </small>
              <button className="text-button" onClick={home}>
                Back to the storefront
              </button>
            </section>
          )}
          <div className="optional-panels">
            <button onClick={() => setDialog("shop")}>
              <ShoppingBag size={13} /> Shop
            </button>
            <button onClick={() => setDialog("events")}>
              <Radio size={13} /> Events
            </button>
            <button onClick={() => setDialog("architecture")}>
              <Info size={13} /> The mesh
            </button>
          </div>
        </main>
      )}
      <footer className="site-footer">
        <span>
          <span className="sim-dot" /> SIMULATED AGENTS & EVENTS
        </span>
        <button onClick={() => setDialog("tutorial")}>How to play</button>
        <a
          href="https://github.com/solacese/sam-retail"
          target="_blank"
          rel="noreferrer"
          aria-label="View source code"
        >
          <GitBranch size={12} />
        </a>
      </footer>
      {paused && !dialog && (
        <Modal
          title="Paused"
          onClose={() => {
            setPaused(false);
            gameRef.current?.focus();
          }}
        >
          <div className="pause-art">
            <AgentAvatar id="SAM" large />
          </div>
          <h2>Take a breather.</h2>
          <p>The store can wait.</p>
          <button
            className="primary-button"
            autoFocus
            onClick={() => {
              setPaused(false);
              gameRef.current?.focus();
            }}
          >
            Resume <Play size={16} />
          </button>
          <button className="text-button" onClick={() => setDialog("restart")}>
            Restart shift
          </button>
        </Modal>
      )}
      {dialog === "tutorial" && (
        <Modal title="How to play" onClose={() => setDialog(null)}>
          <h2>
            One card.
            <br />
            Two choices.
          </h2>
          <p>
            Swipe right to approve. Swipe left to reject.
            <br />
            The buttons and arrow keys work too.
          </p>
          <ul className="tutorial-list">
            <li>
              <Package size={18} />
              <span>
                Keep inventory, security, reputation, and cash above zero.
              </span>
            </li>
            <li>
              <Pause size={18} />
              <span>
                There is no time limit. Think it through. Days wait for you to
                continue. Space pauses live updates.
              </span>
            </li>
            <li>
              <ScanLine size={18} />
              <span>
                “Why this card?” reveals the agents’ disagreement and the events
                behind it. Reading panels pauses the clock.
              </span>
            </li>
            <li>
              <Zap size={18} />
              <span>
                Your choices echo: promotions create rushes, orders arrive
                later, and stock can spoil.
              </span>
            </li>
          </ul>
          <p className="fine-print">
            Six decisions per day. Read the effects under each option before
            choosing. Days wait for you to continue. Five days for a full game,
            three for a quick shift. Same seed + same decisions + same mid-card
            timing = the same game.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              setDialog(null);
              if (!state) start();
              else gameRef.current?.focus();
            }}
          >
            Got it <Check size={16} />
          </button>
        </Modal>
      )}
      {dialog === "xray" && p && (
        <Modal title="Event X-Ray" wide onClose={() => setDialog(null)}>
          <span className="eyebrow">
            SIMULATED EVENTS · ACTUAL ENGINE TRACE
          </span>
          <h2>Why this card?</h2>
          <div className="agent-debate">
            {[
              [p.template.agent, p.template.opinion],
              [p.template.peer, p.template.peerOpinion],
            ].map(([id, line]) => (
              <div key={id}>
                <div
                  className="debate-avatar"
                  style={{ background: `${AGENTS[id as AgentId].color}30` }}
                >
                  <AgentAvatar id={id as AgentId} />
                </div>
                <p>
                  <strong>{id}</strong>“{line}”
                </p>
              </div>
            ))}
          </div>
          <div className="xray-events">
            {p.evidence.map(({ event, fact }, i) => (
              <div key={`${event.id}-${i}`}>
                <Check size={15} />
                <div>
                  <strong>{fact}</strong>
                  <code>{event.topic}</code>
                  <small>
                    EVENT {event.id} · STORE MINUTE {event.minute}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="rule-block">
            <span className="eyebrow">90-MINUTE ROLLING WINDOW</span>
            <code>{p.rule}</code>
          </div>
          <div className="xray-conclusion">
            <strong>
              {p.template.agent} + {p.template.peer} → SAM → you
            </strong>
            <p>{p.recommendation}</p>
            {p.updated && (
              <p className="update-reason">Updated: {p.updateReason}</p>
            )}
            <small>
              {p.confidence}% rule confidence. A deterministic model values
              scarce resources 3× and abundant resources 0.3×. Model labels are
              illustrative. No LLM or live broker is connected.
            </small>
          </div>
          <button
            className="primary-button"
            onClick={() => {
              setDialog(null);
              gameRef.current?.focus();
            }}
          >
            Back to the decision <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {dialog === "events" && state && (
        <Modal title="Event stream" wide onClose={() => setDialog(null)}>
          <EventStream state={state} onXray={() => setDialog("xray")} />
        </Modal>
      )}
      {dialog === "shop" && state && (
        <Modal title="Your MiniMart" onClose={() => setDialog(null)}>
          <h2>Your little empire.</h2>
          <Shop state={state} />
          <div className="report-grid">
            {[
              ["Revenue", money(state.revenue)],
              ["Profit", money(state.profit)],
              ["Stock cover", `${state.ops.stockCover} min`],
              ["Checkout queue", Math.round(state.ops.queue)],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="team-members">
            {(Object.keys(AGENTS) as AgentId[]).map((id) => (
              <div key={id}>
                <AgentAvatar id={id} />
                <strong>{id}</strong>
                <small>{AGENTS[id].role}</small>
              </div>
            ))}
          </div>
          <div className="autonomy">
            <div>
              <Zap size={15} />
              <strong>Delegate small tasks</strong>
              <button
                className={`toggle ${state.delegated ? "on" : ""}`}
                onClick={() =>
                  engine && setState(engine.setDelegation(!state.delegated))
                }
                disabled={state.day < 2 || !playing}
                aria-label="Delegate bounded low-risk actions"
                aria-pressed={state.delegated}
              >
                <span />
              </button>
            </div>
            <p>
              {state.day < 2
                ? "Unlocks after day 1. Your six strategic decisions remain."
                : state.day === 2
                  ? "STOCKY: one top-up/day, max 6 inventory for 3 cash. Only if inventory <35 and cash >28."
                  : state.day === 3
                    ? "Stock top-ups + one SHIELD alert/day. Alerts reduce fraud pressure without spending."
                    : "Stock top-ups + security alerts + one SPARK campaign pause/day when stock is low."}
            </p>
          </div>
          <p className="seed-note">Seed: {state.seed}</p>
        </Modal>
      )}
      {dialog === "architecture" && (
        <Modal title="Behind the mesh" wide onClose={() => setDialog(null)}>
          <h2>
            Events have
            <br />
            consequences.
          </h2>
          <div className="architecture-steps">
            {[
              [
                "01",
                "Events",
                "Sales, returns, delays, queues. The store publishes its own signals.",
              ],
              [
                "02",
                "Patterns",
                "A rolling event window and store state activate matching situations. 60 templates, no shuffled deck.",
              ],
              [
                "03",
                "Agents",
                "Specialists weigh competing priorities. SAM presents a deterministic recommendation.",
              ],
              [
                "04",
                "You",
                "Approve or reject. Your action creates new events — and tomorrow’s problems.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <p>
                  <strong>{t}</strong>
                  {d}
                </p>
              </div>
            ))}
          </div>
          <p className="simulation-note">
            This browser demo uses simulated agents and a local event bus. The
            backend adapter prepares the same event contract for PubSub+ and
            Solace Agent Mesh. Real connectivity needs a configured backend;
            credentials stay server-side.
          </p>
          <div className="architecture-links">
            <a href="https://solace.com" target="_blank" rel="noreferrer">
              Solace <ArrowUpRight size={12} />
            </a>
            <a
              href="https://solacelabs.github.io/solace-agent-mesh/"
              target="_blank"
              rel="noreferrer"
            >
              Agent Mesh <ArrowUpRight size={12} />
            </a>
            <a
              href="https://github.com/solacese/sam-retail/tree/main/docs"
              target="_blank"
              rel="noreferrer"
            >
              Integration docs <ArrowUpRight size={12} />
            </a>
          </div>
        </Modal>
      )}
      {dialog === "restart" && (
        <Modal title="New shift" onClose={() => setDialog(null)}>
          <h2>Start fresh?</h2>
          <p>Your current shift will end.</p>
          <button className="primary-button" onClick={() => start()}>
            Restart this seed <RotateCcw size={16} />
          </button>
          <button className="text-button" onClick={home}>
            Back to the storefront
          </button>
        </Modal>
      )}
    </div>
  );
}
