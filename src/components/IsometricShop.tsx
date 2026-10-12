import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import type { Shop } from "../data/shops";
import { shopArtwork } from "../data/shopArtwork";
import type { StoreSignal, SignalKind } from "../engine/storeTelemetry";

const shopperRoutes = [
  [[555, 410], [460, 360], [342, 335], [513, 368], [540, 354], [650, 453]],
  [[565, 400], [440, 302], [405, 275], [520, 382], [551, 360], [668, 440]],
  [[548, 414], [390, 380], [284, 335], [525, 396], [565, 376], [636, 461]],
  [[540, 408], [420, 360], [345, 363], [503, 382], [535, 373], [655, 447]],
];
const activities = ["entering", "browsing", "picking", "queuing", "paying", "leaving"];
function Shopper({ index, signals, still, paused }: { index: number; signals: StoreSignal[]; still: boolean; paused: boolean }) {
  const purchase = signals.find(s => s.kind === "purchase");
  const sequence = Number(purchase?.id.match(/-live-(\d+)$/)?.[1] ?? 0);
  const phase = still ? index % 6 : (Math.floor(sequence / 8) + index) % 6;
  const journey = shopperRoutes[index % shopperRoutes.length];
  const route = journey[phase];
  const offsetX = (Math.floor(index / 4) - 1) * 6, offsetY = (Math.floor(index / 4) % 2) * 5;
  const x = route[0] + offsetX, y = route[1] + offsetY;
  const origin = still ? route : phase === 0 ? journey[5] : phase === 5 ? journey[4] : route;
  const movement = useAnimationControls();
  useEffect(() => {
    if (paused) movement.stop();
    else void movement.start({ x, y, opacity: still ? 1 : phase === 5 ? [1, 1, 0] : 1,
      transition: { duration: still ? 0 : 1.4, ease: "easeInOut", times: [0, .8, 1] } });
    return () => movement.stop();
  }, [x, y, phase, paused, still, movement]);
  const [arrived, setArrived] = useState(still);
  const arrival = useRef({ phase, remaining: 1450 });
  useEffect(() => {
    if (still) { setArrived(true); return; }
    if (arrival.current.phase !== phase) {
      arrival.current = { phase, remaining: 1450 };
      setArrived(false);
    }
    if (paused || arrival.current.remaining <= 0) return;
    const started = Date.now();
    const timer = window.setTimeout(() => { arrival.current.remaining = 0; setArrived(true); }, arrival.current.remaining);
    return () => {
      clearTimeout(timer);
      arrival.current.remaining = Math.max(0, arrival.current.remaining - (Date.now() - started));
    };
  }, [phase, still, paused]);
  const skin = ["#b97a50", "#efd0ae", "#8e563c", "#d99b73"][index % 4];
  const shirt = ["#8caec8", "#d4917b", "#c5b477", "#9cb08b", "#b99bc2", "#cfba9d"][index % 6];
  return <motion.g data-shopper={index} data-destination={`${x},${y}`} data-activity={activities[phase]} data-interacting={arrived}
    initial={{ x: origin[0] + offsetX, y: origin[1] + offsetY, opacity: !still && phase === 0 ? 0 : 1 }} animate={movement}>
    <ellipse cy="2" rx="8" ry="4" fill="#385d4526" />
    <path d="M-3-7l-1 8m7-8l2 8" stroke="#425a57" strokeWidth="3" strokeLinecap="round" />
    <path className={arrived && phase === 2 ? "shopper-reach-pick" : ""} d="M-4-15l-3 7" stroke={skin} strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: "-4px -15px" }} />
    <path className={arrived && phase === 4 ? "shopper-reach-pay" : ""} d="M4-15l3 6" stroke={skin} strokeWidth="2.5" strokeLinecap="round" style={{ transformOrigin: "4px -15px" }} />
    <path d="M-4-17h8l2 11H-6z" fill={shirt} />
    <path d="M0-19v4" stroke={skin} strokeWidth="3" />
    <circle cy="-23" r="4.5" fill={skin} />
    <path d="M-4.5-23q-1-8 7-6l3 6-3-3-7 2" fill={index % 2 ? "#7e5c46" : "#3e3934"} />
    {phase >= 2 && <g><rect x="6" y="-7" width="5" height="7" rx="1" fill="#bc9b70" /><path d="M7-7v-2h3v2" fill="none" stroke="#bc9b70" strokeWidth="1" /></g>}
    {arrived && phase === 2 && <g className="shopper-item" transform="translate(-9 -20)">
      <rect width="5" height="7" rx="1" fill="#d8b365" /><path d="M1 2h3" stroke="#f7efd6" />
    </g>}
    {arrived && phase === 4 && <g className="shopper-payment">
      <rect x="8" y="-19" width="8" height="5" rx="1" fill="#718c72" /><path d="M8-17h8" stroke="#ead8a7" />
      <path className="shopper-payment-tick" d="M-4-36l3 3 5-6" fill="none" stroke="#508e67" strokeWidth="2" strokeLinecap="round" />
    </g>}
  </motion.g>;
}
export function IsometricShop({ shop, signals = [], compact = false, paused = false }: {
  shop: Shop; signals?: StoreSignal[]; compact?: boolean; paused?: boolean;
}) {
  const reduced = useReducedMotion();
  const zones: Record<SignalKind, number[]> = {
    inventory: [310, 285], pricing: [598, 276], purchase: [586, 335], iot: [481, 194], agents: [411, 347],
  };
  const hub = [701, 52];
  return <svg data-paused={paused} className={`isometric-shop ${compact ? "compact" : ""} ${reduced || compact ? "scene-still" : ""}`} viewBox="0 0 760 507" role="img"
    aria-label={`Isometric ABC Shop, ${shop.name}, with human shoppers entering, shopping, paying, and leaving, shelves, fridge, camera, and checkouts`}>
    <image className="shop-artwork" href={shopArtwork(shop.style)} width="760" height="507" preserveAspectRatio="xMidYMid meet" />
    {Array.from({ length: 12 }, (_, index) => <Shopper key={index} index={index} signals={signals} still={!!reduced || compact} paused={paused} />)}
    {!compact && <g className="mesh-hub" transform={`translate(${hub.join(" ")})`}>
      <circle r="27" fill="#2d5440" stroke="#a0cdb0" strokeWidth="2" />
      <path d="M-11-5l11-7 11 7v14l-11 7-11-7zM-11-5L0 2l11-7M0 2v14" fill="none" stroke="#acdbbe" strokeWidth="2" />
      <text y="44" textAnchor="middle" fill="#526b51" fontSize="17" fontWeight="700">Solace</text>
    </g>}
    {!compact && !paused && signals.filter(signal => Date.now() - signal.at < 2200).slice(0, 5).map(signal => {
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
