import { motion, useReducedMotion } from "motion/react";
import type { Shop } from "../data/shops";
import type { StoreSignal } from "../engine/storeTelemetry";
const point = (u: number, v: number, z = 0) => [
  365 + (u - v) * 24,
  115 + (u + v) * 14 - z * 26,
];
const poly = (pts: number[][]) => pts.map((p) => p.join(",")).join(" ");
function Box({
  u,
  v,
  w,
  d,
  h,
  color,
  top = "#e9e7cc",
}: {
  u: number;
  v: number;
  w: number;
  d: number;
  h: number;
  color: string;
  top?: string;
}) {
  const a = point(u, v),
    b = point(u + w, v),
    c = point(u + w, v + d),
    e = point(u, v + d);
  const at = point(u, v, h),
    bt = point(u + w, v, h),
    ct = point(u + w, v + d, h),
    et = point(u, v + d, h);
  return (
    <g>
      <polygon points={poly([e, c, ct, et])} fill={color} />
      <polygon
        points={poly([b, c, ct, bt])}
        fill={color}
        filter="brightness(.84)"
      />
      <polygon points={poly([at, bt, ct, et])} fill={top} />
      <polyline
        points={poly([a, b, c, e, a])}
        fill="none"
        stroke="#203f311a"
        strokeWidth="1"
      />
    </g>
  );
}
function Robot({ u, v, color }: { u: number; v: number; color: string }) {
  const [x, y] = point(u, v);
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="5" rx="13" ry="7" fill="#385d4530" />
      <rect x="-7" y="-19" width="14" height="19" rx="5" fill={color} />
      <rect
        x="-12"
        y="-37"
        width="24"
        height="22"
        rx="7"
        fill="#eee8cc"
        stroke={color}
        strokeWidth="3"
      />
      <path
        d="M-7 -26q3-5 6 0m3 0q3-5 6 0"
        stroke="#365744"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M-3 -20q3 3 6 0"
        stroke="#365744"
        strokeWidth="1.4"
        fill="none"
      />
      <path d="M0-39v-7" stroke={color} strokeWidth="2" />
      <circle cy="-47" r="3" fill={color} />
      <path d="M-6 0v5m12-5v5" stroke="#365744" strokeWidth="4" />
    </g>
  );
}
function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cy="7" rx="20" ry="9" fill="#476f4530" />
      <path d="M0-8v18" stroke="#8a7053" strokeWidth="6" />
      <ellipse cy="-20" rx="22" ry="27" fill="#6d9270" />
      <ellipse cx="-8" cy="-27" rx="12" ry="17" fill="#88a77a" />
    </g>
  );
}
export function IsometricShop({
  shop,
  signals = [],
  compact = false,
}: {
  shop: Shop;
  signals?: StoreSignal[];
  compact?: boolean;
}) {
  const reduced = useReducedMotion();
  const width = 10 + (shop.style % 3),
    depth = 8 + (shop.style % 2);
  const zones: Record<string, number[]> = {
    inventory: point(3, 3, 1.5),
    pricing: point(width - 2, depth - 1, 1),
    purchase: point(width - 1, depth - 2, 1),
    iot: point(7, 0, 2.5),
    agents: point(5, 6, 1),
  };
  return (
    <svg
      className={`isometric-shop ${compact ? "compact" : ""}`}
      viewBox="0 0 760 440"
      role="img"
      aria-label={`Isometric ABC Shop, ${shop.name}, with shelves, picking robots, fridge, camera, and checkouts`}
    >
      <defs>
        <filter id={`grain-${shop.id}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".65"
            numOctaves="3"
            seed={shop.style + 3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".06" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <g filter={`url(#grain-${shop.id})`}>
        <ellipse cx="370" cy="320" rx="280" ry="90" fill="#2a493621" />
        <Box
          u={-1}
          v={-1}
          w={width + 2}
          d={depth + 2}
          h={0.3}
          color="#75916b"
          top="#9caf81"
        />
        <Box
          u={0}
          v={0}
          w={width}
          d={depth}
          h={0.4}
          color="#adbaa0"
          top="#e5dfbf"
        />
        <polygon
          points={poly([
            point(0, 0, 0.4),
            point(width, 0, 0.4),
            point(width, 0, 4),
            point(0, 0, 4),
          ])}
          fill="#dcdabe"
        />
        <polygon
          points={poly([
            point(0, 0, 0.4),
            point(0, depth, 0.4),
            point(0, depth, 4),
            point(0, 0, 4),
          ])}
          fill="#c2cba8"
        />
        {[1, 3, 5].map((i) => (
          <polygon
            key={i}
            points={poly([
              point(0, i, 1.3),
              point(0, i + 1.2, 1.3),
              point(0, i + 1.2, 3.1),
              point(0, i, 3.1),
            ])}
            fill="#789d8c"
            stroke="#f0e8ce"
            strokeWidth="3"
          />
        ))}
        <Box
          u={6}
          v={0.2}
          w={3.4}
          d={0.8}
          h={2.9}
          color="#7fadb1"
          top="#a5c4bf"
        />
        <polygon
          points={poly([
            point(6, 1, 1),
            point(9.4, 1, 1),
            point(9.4, 1, 2.7),
            point(6, 1, 2.7),
          ])}
          fill="#d4e4db"
          stroke="#6a979a"
          strokeWidth="3"
        />
        {[6.7, 7.6, 8.5].map((u) => (
          <path
            key={u}
            d={`M${point(u, 1, 1.2).join(",")}L${point(u, 1, 2.6).join(",")}`}
            stroke="#94b6ad"
            strokeWidth="3"
          />
        ))}
        <g
          transform={`translate(${point(1.5 + (shop.style % 11) * 0.13, 0, 3.2).join(" ")})`}
        >
          <rect x="-13" y="-5" width="22" height="12" rx="4" fill="#527462" />
          <path d="M8-3l12-5v18L8 6" fill="#385745" />
          <circle cx="17" cy="1" r="2" fill="#9ddac3" />
        </g>
        {Array.from({ length: 2 + (shop.style % 2) }, (_, i) => (
          <g key={i}>
            <Box
              u={1.6 + i * 2.5}
              v={2.3}
              w={1.25}
              d={3.4}
              h={1.5}
              color="#849678"
              top="#c9cead"
            />
            {[0, 1, 2, 3].map((j) => {
              const [x, y] = point(2.2 + i * 2.5, 2.7 + j * 0.75, 1.6);
              return (
                <g key={j} transform={`translate(${x} ${y})`}>
                  <ellipse
                    rx="10"
                    ry="6"
                    fill={j % 2 ? shop.color : "#a7bd81"}
                  />
                  <path
                    d="M-4-2l2-4m6 4l2-4"
                    stroke="#627b50"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </g>
        ))}
        <Box
          u={width - 2.2}
          v={depth - 2.4}
          w={1.4}
          d={2}
          h={1.1}
          color={shop.color}
          top="#ede6cd"
        />
        <g
          transform={`translate(${point(width - 1.6, depth - 1.5, 1.2).join(" ")})`}
        >
          <rect x="-8" y="-19" width="16" height="13" rx="2" fill="#426451" />
          <rect x="-5" y="-16" width="10" height="7" fill="#a9d9bf" />
        </g>
        <Robot u={3.3 + (shop.style % 3) * 0.5} v={6.6} color="#8ed4ba" />
        <Robot u={width - 3} v={4.6} color="#ddaaa9" />
        <Robot u={1.6} v={depth - 1} color="#96b7d5" />
        <Tree x={110 + (shop.style % 3) * 8} y={330} />
        <Tree x={660} y={280} />
        <g transform="translate(555 363)">
          <rect
            x="-30"
            y="-12"
            width="53"
            height="23"
            rx="6"
            fill={shop.color}
          />
          <rect x="12" y="-8" width="28" height="19" rx="5" fill="#e7e4ce" />
          <rect x="22" y="-5" width="12" height="8" rx="2" fill="#719d91" />
          <circle cx="-15" cy="12" r="7" fill="#365342" />
          <circle cx="28" cy="12" r="7" fill="#365342" />
        </g>
        <g transform={`translate(${point(0, depth, 3.2).join(" ")})`}>
          <rect
            x="-45"
            y="-13"
            width="92"
            height="24"
            rx="5"
            fill={shop.color}
          />
          <text
            textAnchor="middle"
            y="4"
            fontSize="14"
            fontWeight="800"
            fill="#294837"
          >
            ABC SHOP
          </text>
        </g>
      </g>
      {!compact && (
        <g className="mesh-hub" transform="translate(674 90)">
          <circle r="31" fill="#2d5440" stroke="#a0cdb0" strokeWidth="2" />
          <path
            d="M-11-5l11-7 11 7v14l-11 7-11-7zM-11-5L0 2l11-7M0 2v14"
            fill="none"
            stroke="#acdbbe"
            strokeWidth="2"
          />
          <text
            y="52"
            textAnchor="middle"
            fill="#526b51"
            fontSize="15"
            fontWeight="700"
          >
            Solace
          </text>
        </g>
      )}
      {!compact &&
        signals.slice(0, 5).map((signal) => {
          const target = signal.topic.includes("camera")
            ? point(1.5 + (shop.style % 11) * 0.13, 0, 3.2)
            : zones[signal.kind];
          return (
            <g key={signal.id}>
              <motion.path
                d={`M674 90 Q${target[0] + 70} 45 ${target.join(" ")}`}
                fill="none"
                stroke={signal.color}
                strokeWidth="2"
                strokeDasharray="4 7"
                initial={{ opacity: 0 }}
                animate={{ opacity: reduced ? 0.25 : [0, 0.6, 0] }}
                transition={{ duration: 1.8 }}
              />
              {!reduced && (
                <motion.g
                  initial={{ x: 674, y: 90, opacity: 0 }}
                  animate={{
                    x: [674, target[0] + 50, target[0]],
                    y: [90, 60, target[1]],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{ duration: 1.5, times: [0, 0.4, 0.8, 1] }}
                >
                  <rect
                    x="-17"
                    y="-12"
                    width="34"
                    height="24"
                    rx="8"
                    fill={signal.color}
                    stroke="#eff0df"
                    strokeWidth="2"
                  />
                  <text
                    textAnchor="middle"
                    y="5"
                    fontSize="14"
                    fontWeight="800"
                    fill="#284632"
                  >
                    {signal.glyph}
                  </text>
                </motion.g>
              )}
              <motion.circle
                cx={target[0]}
                cy={target[1]}
                r="18"
                fill="none"
                stroke={signal.color}
                strokeWidth="2"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: reduced ? 0.4 : [0, 0.7, 0],
                  r: reduced ? 18 : [8, 27],
                }}
                transition={{ duration: 1.8 }}
              />
            </g>
          );
        })}
    </svg>
  );
}
