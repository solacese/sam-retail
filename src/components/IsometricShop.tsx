import { motion, useReducedMotion } from "motion/react";
import type { Shop } from "../data/shops";
import { shopArtwork } from "../data/shopArtwork";
import type { StoreSignal, SignalKind } from "../engine/storeTelemetry";

const routes = {
  stocky: [[345, 366], [410, 320], [446, 276]],
  penny: [[525, 380], [580, 385], [471, 407]],
  shield: [[489, 257], [490, 315], [481, 434]],
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
export function IsometricShop({ shop, signals = [], compact = false }: {
  shop: Shop; signals?: StoreSignal[]; compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const zones: Record<SignalKind, number[]> = {
    inventory: [310, 285], pricing: [598, 276], purchase: [586, 335], iot: [481, 194], agents: [411, 347],
  };
  const hub = [701, 52];
  return <svg className={`isometric-shop ${compact ? "compact" : ""}`} viewBox="0 0 760 507" role="img"
    aria-label={`Isometric ABC Shop, ${shop.name}, with shelves, picking robots, fridge, camera, and checkouts`}>
    <image className="shop-artwork" href={shopArtwork(shop.style)} width="760" height="507" preserveAspectRatio="xMidYMid meet" />
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
