import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Shop } from "../data/shops";
import { shopArtwork } from "../data/shopArtwork";
import type { StoreSignal, SignalKind } from "../engine/storeTelemetry";

const routes = {
  stocky: [[65, 405], [93, 421], [70, 433]],
  penny: [[120, 453], [155, 470], [140, 444]],
  shield: [[704, 422], [736, 389], [716, 446]],
};
function Robot({ name, color, signals, kinds, still }: {
  name: keyof typeof routes; color: string; signals: StoreSignal[]; kinds: SignalKind[]; still: boolean;
}) {
  const signal = signals.find(s => kinds.includes(s.kind) && s.id.includes("-live-"));
  const sequence = Number(signal?.id.match(/-live-(\d+)$/)?.[1] ?? 0);
  const step = still ? 0 : Math.floor(sequence / 4) % routes[name].length;
  const [x, y] = routes[name][step];
  return <motion.g data-robot={name} data-task={signal?.topic} data-destination={`${x},${y}`}
    initial={false} animate={{ x, y }} transition={{ duration: still ? 0 : 1.35, ease: "easeInOut" }}>
    <ellipse cy="7" rx="15" ry="7" fill="#385d4530" />
    <path d="M-7 0v6m14-6v6" stroke="#365744" strokeWidth="5" strokeLinecap="round" />
    <rect x="-8" y="-22" width="16" height="24" rx="6" fill={color} />
    <path d="M-10-15l-6 7m26-7l6 7" stroke={color} strokeWidth="5" strokeLinecap="round" />
    <rect x="-14" y="-44" width="28" height="27" rx="9" fill="#eee8cc" stroke={color} strokeWidth="3" />
    <path d="M-9-31q3-5 6 0m6 0q3-5 6 0" stroke="#365744" strokeWidth="2" fill="none" />
    <path d="M-4-24q4 4 8 0" stroke="#365744" strokeWidth="1.5" fill="none" />
    <path d="M0-45v-7" stroke={color} strokeWidth="2" /><circle cy="-53" r="3" fill={color} />
  </motion.g>;
}
const shopperRoutes = [
  [[342, 335], [540, 354], [475, 434]],
  [[405, 275], [551, 360], [465, 424]],
  [[284, 335], [565, 376], [500, 429]],
  [[345, 363], [535, 373], [430, 436]],
];
function Shopper({ index, signals, still }: { index: number; signals: StoreSignal[]; still: boolean }) {
  const purchase = signals.find(s => s.kind === "purchase");
  const sequence = Number(purchase?.id.match(/-live-(\d+)$/)?.[1] ?? 0);
  const phase = still ? index % 3 : (Math.floor(sequence / 8) + index) % 3;
  const [x, y] = shopperRoutes[index][phase];
  const [arrived, setArrived] = useState(still);
  useEffect(() => {
    setArrived(still);
    if (still) return;
    const timer = window.setTimeout(() => setArrived(true), 1450);
    return () => clearTimeout(timer);
  }, [phase, still]);
  const activity = ["picking", "paying", "leaving"][phase];
  const skin = ["#b97a50", "#efd0ae", "#8e563c", "#d99b73"][index];
  const shirt = ["#8caec8", "#d4917b", "#c5b477", "#9cb08b"][index];
  return <motion.g data-shopper={index} data-destination={`${x},${y}`} data-activity={activity} data-interacting={arrived}
    initial={false} animate={{ x, y }} transition={{ duration: still ? 0 : 1.4, ease: "easeInOut" }}>
    <ellipse cy="2" rx="8" ry="4" fill="#385d4526" />
    <path d="M-3-7l-1 8m7-8l2 8" stroke="#425a57" strokeWidth="3" strokeLinecap="round" />
    <motion.path d="M-4-15l-3 7" stroke={skin} strokeWidth="2.5" strokeLinecap="round"
      initial={false} animate={{ rotate: arrived && phase === 0 && !still ? [0, 55, 55, 0] : 0 }}
      style={{ transformOrigin: "-4px -15px" }} transition={{ duration: 1.6 }} />
    <motion.path d="M4-15l3 6" stroke={skin} strokeWidth="2.5" strokeLinecap="round"
      initial={false} animate={{ rotate: arrived && phase === 1 && !still ? [0, -55, -55, 0] : 0 }}
      style={{ transformOrigin: "4px -15px" }} transition={{ duration: 1.6 }} />
    <path d="M-4-17h8l2 11H-6z" fill={shirt} />
    <path d="M0-19v4" stroke={skin} strokeWidth="3" />
    <circle cy="-23" r="4.5" fill={skin} />
    <path d="M-4.5-23q-1-8 7-6l3 6-3-3-7 2" fill={index % 2 ? "#7e5c46" : "#3e3934"} />
    <rect x="6" y="-7" width="5" height="7" rx="1" fill="#bc9b70" />
    <path d="M7-7v-2h3v2" fill="none" stroke="#bc9b70" strokeWidth="1" />
    {arrived && phase === 0 && <motion.g key={`pick-${phase}`} className="shopper-item"
      initial={still ? false : { x: -13, y: -24, opacity: 0 }}
      animate={{ x: still ? -9 : [-13, -9, 8], y: still ? -20 : [-24, -20, -4], opacity: 1 }} transition={{ duration: 1.6 }}>
      <rect width="5" height="7" rx="1" fill="#d8b365" /><path d="M1 2h3" stroke="#f7efd6" />
    </motion.g>}
    {arrived && phase === 1 && <motion.g className="shopper-payment" initial={still ? false : { opacity: 0 }}
      animate={{ opacity: 1 }} transition={{ duration: .3 }}>
      <rect x="8" y="-19" width="8" height="5" rx="1" fill="#718c72" /><path d="M8-17h8" stroke="#ead8a7" />
      <motion.path d="M-4-36l3 3 5-6" fill="none" stroke="#508e67" strokeWidth="2" strokeLinecap="round"
        initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: still ? 0 : .8, duration: .4 }} />
    </motion.g>}
  </motion.g>;
}
export function IsometricShop({ shop, signals = [], compact = false }: {
  shop: Shop; signals?: StoreSignal[]; compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const zones: Record<SignalKind, number[]> = {
    inventory: [310, 285], pricing: [598, 276], purchase: [586, 335], iot: [481, 194], agents: [411, 347],
  };
  const hub = [701, 52];
  return <svg className={`isometric-shop ${compact ? "compact" : ""}`} viewBox="0 0 760 507" role="img"
    aria-label={`Isometric ABC Shop, ${shop.name}, with human shoppers inside, robot agents outside, shelves, fridge, camera, and checkouts`}>
    <image className="shop-artwork" href={shopArtwork(shop.style)} width="760" height="507" preserveAspectRatio="xMidYMid meet" />
    {shopperRoutes.map((_, index) => <Shopper key={index} index={index} signals={signals} still={!!reduced || compact} />)}
    <Robot name="stocky" color="#8ed4ba" signals={signals} kinds={["inventory", "agents"]} still={!!reduced || compact} />
    <Robot name="penny" color="#e9ca85" signals={signals} kinds={["pricing", "purchase"]} still={!!reduced || compact} />
    <Robot name="shield" color="#96b7d5" signals={signals} kinds={["iot"]} still={!!reduced || compact} />
    {!compact && <g className="mesh-hub" transform={`translate(${hub.join(" ")})`}>
      <circle r="27" fill="#2d5440" stroke="#a0cdb0" strokeWidth="2" />
      <path d="M-11-5l11-7 11 7v14l-11 7-11-7zM-11-5L0 2l11-7M0 2v14" fill="none" stroke="#acdbbe" strokeWidth="2" />
      <text y="44" textAnchor="middle" fill="#526b51" fontSize="17" fontWeight="700">Solace</text>
    </g>}
    {!compact && signals.slice(0, 5).map(signal => {
      const target = signal.topic.includes("camera") ? [396, 67] : zones[signal.kind];
      return <g key={signal.id}>
        <motion.path d={`M${hub.join(" ")} Q${target[0] + 70} 35 ${target.join(" ")}`} fill="none" stroke={signal.color}
          strokeWidth="2" strokeDasharray="4 7" initial={{ opacity: 0 }} animate={{ opacity: reduced ? 0.25 : [0, .6, 0] }} transition={{ duration: 1.8 }} />
        {!reduced && <motion.g initial={{ x: hub[0], y: hub[1], opacity: 0 }}
          animate={{ x: [hub[0], target[0] + 50, target[0]], y: [hub[1], 50, target[1]], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.5, times: [0, .4, .8, 1] }}>
          <rect x="-17" y="-12" width="34" height="24" rx="8" fill={signal.color} stroke="#eff0df" strokeWidth="2" />
          <text textAnchor="middle" y="5" fontSize="14" fontWeight="800" fill="#284632">{signal.glyph}</text>
        </motion.g>}
        <motion.circle cx={target[0]} cy={target[1]} r="18" fill="none" stroke={signal.color} strokeWidth="2"
          initial={{ opacity: 0 }} animate={{ opacity: reduced ? .4 : [0, .7, 0], r: reduced ? 18 : [8, 27] }} transition={{ duration: 1.8 }} />
      </g>;
    })}
  </svg>;
}
