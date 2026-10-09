import { useId } from "react";
import { AGENTS } from "../engine/situations";
import type { AgentId, GameState } from "../engine/types";
export function AgentAvatar({
  id,
  large = false,
}: {
  id: AgentId;
  large?: boolean;
}) {
  const color = AGENTS[id].color;
  return (
    <svg
      viewBox={large ? "0 0 240 204" : "30 0 180 180"}
      role="img"
      aria-label={`${id} avatar`}
      className={`agent-avatar ${large ? "large" : ""}`}
    >
      {large && (
        <>
          <ellipse
            cx="120"
            cy="188"
            rx="72"
            ry="8"
            fill="#1c3233"
            opacity=".08"
          />
          <circle cx="120" cy="105" r="86" fill={color} opacity=".15" />
          <path d="m27 68 5-12 5 12 12 5-12 5-5 12-5-12-12-5z" fill={color} />
          <circle cx="205" cy="57" r="5" fill={color} />
          <path d="m191 145 4-9 4 9 9 4-9 4-4 9-4-9-9-4z" fill={color} />
        </>
      )}
      <path
        d="M76 180v-37c0-18 17-31 44-31s44 13 44 31v37"
        fill={color}
        stroke="#243e40"
        strokeWidth="3"
      />
      <path d="M85 145v35m70-35v35" stroke="#243e40" strokeWidth="3" />
      <path
        d="M70 143c-22 0-27 17-18 24m118-24c22 0 27 17 18 24"
        stroke="#243e40"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <circle
        cx="120"
        cy="22"
        r="7"
        fill={color}
        stroke="#243e40"
        strokeWidth="3"
      />
      <path d="M120 29v16" stroke="#243e40" strokeWidth="4" />
      <rect
        x="55"
        y="74"
        width="16"
        height="29"
        rx="7"
        fill={color}
        stroke="#243e40"
        strokeWidth="3"
      />
      <rect
        x="169"
        y="74"
        width="16"
        height="29"
        rx="7"
        fill={color}
        stroke="#243e40"
        strokeWidth="3"
      />
      <rect
        x="68"
        y="43"
        width="104"
        height="89"
        rx="26"
        fill="#f8f5e9"
        stroke="#243e40"
        strokeWidth="3"
      />
      <rect x="80" y="58" width="80" height="55" rx="17" fill="#243e40" />
      <ellipse cx="100" cy="80" rx="5" ry="7" fill={color} />
      <ellipse cx="140" cy="80" rx="5" ry="7" fill={color} />
      <path
        d="M108 96q12 10 24 0"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="120" cy="121" r="3" fill="#243e40" />
      {id === "PENNY" && (
        <>
          <path
            d="M87 76h26v16H87zm40 0h26v16h-26m-14-10h14"
            fill="none"
            stroke="#f7cf77"
            strokeWidth="2"
          />
          <circle cx="120" cy="155" r="12" fill="#243e40" />
          <text
            x="120"
            y="160"
            fill={color}
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
          >
            $
          </text>
        </>
      )}
      {id === "STOCKY" && (
        <>
          <path
            d="M91 46v-8h58v8"
            fill={color}
            stroke="#243e40"
            strokeWidth="3"
          />
          <path
            d="M103 143h34v26h-34zm0 0 17 7 17-7m-17 7v19"
            fill="#f8f5e9"
            stroke="#243e40"
            strokeWidth="2"
          />
        </>
      )}
      {id === "SHIELD" && (
        <>
          <path
            d="m120 137 15 6v10q-2 11-15 17-13-6-15-17v-10z"
            fill="#243e40"
          />
          <path
            d="m113 152 5 5 10-11"
            stroke={color}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M70 53q50-36 100 0"
            fill={color}
            stroke="#243e40"
            strokeWidth="3"
          />
        </>
      )}
      {id === "SPARK" && (
        <>
          <path d="m114 137-8 17h12l-5 19 21-26h-12l6-10z" fill="#243e40" />
          <path
            d="m146 43 12-13 8 14"
            fill={color}
            stroke="#243e40"
            strokeWidth="3"
          />
          <path
            d="m85 65 10-3m50 0 10 3"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}
      {id === "SAM" && (
        <>
          <path d="m110 136 10 8 10-8-4 25h-12z" fill="#243e40" />
          <path
            d="m92 45 8-11h40l8 11"
            fill={color}
            stroke="#243e40"
            strokeWidth="3"
          />
        </>
      )}
    </svg>
  );
}
export function Shop({
  state,
  hero = false,
}: {
  state?: GameState;
  hero?: boolean;
}) {
  const id = useId().replaceAll(":", "");
  const inventory = state?.resources.inventory ?? 72,
    security = state?.resources.security ?? 70,
    reputation = state?.resources.reputation ?? 78;
  const delivery = Boolean(state?.pending.some((p) => p.kind === "delivery"));
  const crowd = state
    ? Math.max(1, Math.min(5, Math.ceil(state.ops.queue)))
    : 3;
  return (
    <svg
      viewBox="0 0 600 465"
      className={`shop-scene ${hero ? "hero-scene" : ""}`}
      role="img"
      aria-label={`ABC Shop. Inventory ${Math.round(inventory)}%, ${crowd} shoppers${delivery ? ", delivery on the way" : ""}.`}
    >
      <defs>
        <linearGradient id={`${id}ground`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#254745" />
          <stop offset="1" stopColor="#172b31" />
        </linearGradient>
        <linearGradient id={`${id}window`} x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#d3ece0" />
          <stop offset="1" stopColor="#8fc4b5" />
        </linearGradient>
        <pattern
          id={`${id}tiles`}
          width="38"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 22h38M0 0v22"
            fill="none"
            stroke="#396157"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <circle cx="315" cy="214" r="187" fill="#56dabc" opacity=".025" />
      <circle
        cx="315"
        cy="214"
        r="145"
        fill="none"
        stroke="#56dabc"
        strokeDasharray="3 8"
        opacity=".16"
      />
      <path d="m47 326 299-144 218 136-289 151z" fill={`url(#${id}ground)`} />
      <path
        d="m47 326 299-144 218 136-289 151z"
        fill={`url(#${id}tiles)`}
        opacity=".35"
      />
      <ellipse cx="320" cy="351" rx="178" ry="48" fill="#071719" opacity=".4" />
      <path d="m152 211 243-87 94 53v162l-244 96-93-61z" fill="#c7d5b9" />
      <path d="m395 124 94 53v162l-94-51z" fill="#8eaa97" />
      <path d="m152 211 243-87v164l-243 86z" fill="#efe8cc" />
      <path d="m140 210 253-98 110 60-259 101z" fill="#f5edd6" />
      <path d="m140 210 104 63v14l-104-62z" fill="#608f7f" />
      <path d="m244 273 259-101v14L244 287z" fill="#79ae9a" />
      <path d="m171 220 196-69v28l-196 71z" fill="#173b3b" />
      <text
        x="196"
        y="332"
        transform="matrix(.96 -.34 0 1 1 -33)"
        fill="#70e4c4"
        fontSize="27"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        letterSpacing="3"
      >
        ABC SHOP
      </text>
      <path d="m163 252 210-74 0 14-210 75z" fill="#2b7869" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <path
            d={`m${163 + i * 26.25} ${252 - i * 9.25} 26.25-9.25 9 19-26.25 9.25z`}
            fill={i % 2 ? "#f0e9d0" : "#4ccb9f"}
          />
          <path
            d={`m${172 + i * 26.25} ${271 - i * 9.25} 26.25-9.25v12q-13 10-26.25 9.25z`}
            fill={i % 2 ? "#e0dcc8" : "#32a47e"}
          />
        </g>
      ))}
      <path d="m170 284 113-40v81l-113 42z" fill="#224f4b" />
      <path d="m178 289 97-34v61l-97 35z" fill={`url(#${id}window)`} />
      <path d="m180 309 94-34m-94 53 94-34" stroke="#567f65" strokeWidth="5" />
      {Array.from(
        { length: inventory > 55 ? 12 : inventory > 25 ? 7 : 3 },
        (_, i) => (
          <g
            key={i}
            transform={`translate(${185 + (i % 6) * 14},${297 + Math.floor(i / 6) * 20 - (i % 6) * 5})`}
          >
            <path
              d="M0 0v12l8-3V-3z"
              fill={["#e8b170", "#f2e8c4", "#db8f73", "#f3d572"][i % 4]}
            />
            <path d="M1 2 7 0" stroke="#f5f0de" strokeWidth="2" />
          </g>
        ),
      )}
      <path d="m292 240 62-22v82l-62 23z" fill="#234b43" />
      <path d="m298 244 50-18v60l-50 18z" fill={`url(#${id}window)`} />
      <path d="M322 236v60" stroke="#456d5c" strokeWidth="3" />
      <path d="M315 272v12" stroke="#e6c47c" strokeWidth="3" />
      <path d="m303 255 24-9v15l-24 9z" fill="#edb57b" />
      <text
        x="305"
        y="266"
        fill="#243b35"
        fontSize="9"
        fontWeight="800"
        transform="rotate(-19 305 266)"
      >
        OPEN
      </text>
      <path d="m174 370 181-68v9l-181 67z" fill="#b9c9a5" />
      <path d="m177 378 177-67 14 9-178 68z" fill="#788e76" />
      <path d="m410 199 50 28v57l-50-27z" fill="#527d72" />
      <path d="m416 210 37 21v36l-37-20z" fill="#c2d8c0" />
      <path d="m434 220v36m-17-17 35 19" stroke="#527d72" strokeWidth="3" />
      <path d="m466 190 11 6v13l-11-6z" fill="#264c46" />
      <circle
        cx="471"
        cy="200"
        r="3"
        fill={security < 30 ? "#fa8b7c" : "#76e4ba"}
        className="shop-blink"
      />
      <g className="shop-customer customer-one" transform="translate(260 343)">
        <ellipse cx="0" cy="24" rx="11" ry="4" fill="#0c2727" opacity=".5" />
        <path
          d="M-5 9v13m11-13v13"
          stroke="#c6c3b6"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="-8" y="-9" width="17" height="23" rx="6" fill="#d9a0b6" />
        <circle cy="-16" r="7" fill="#c38d68" />
        <path d="M-7-19q2-12 13-3" fill="#2d4040" />
        <path d="m8 5 11 5" stroke="#c38d68" strokeWidth="4" />
        <path d="m16 9 11-4 1 16-12 4z" fill="#efe3b5" />
      </g>
      {crowd >= 2 && (
        <g
          className="shop-customer customer-two"
          transform="translate(354 356)"
        >
          <ellipse cx="0" cy="24" rx="11" ry="4" fill="#0c2727" opacity=".5" />
          <path
            d="M-5 8v15m11-15v15"
            stroke="#253f3c"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="-8" y="-10" width="17" height="23" rx="6" fill="#e1bd74" />
          <circle cy="-17" r="7" fill="#e2b78c" />
          <path d="M-7-20q1-11 15 0" fill="#654b35" />
          <path d="m-9 2-9 10" stroke="#e2b78c" strokeWidth="4" />
          <path d="m-23 10 12-4 2 16-12 4z" fill="#bad9bd" />
        </g>
      )}
      {crowd >= 3 && (
        <g
          className="shop-customer customer-three"
          transform="translate(217 396)"
        >
          <path
            d="M-5 8v15m11-15v15"
            stroke="#35505b"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <rect x="-8" y="-10" width="17" height="23" rx="6" fill="#8eb9c1" />
          <circle cy="-17" r="7" fill="#a47253" />
          <path d="M-8-20q1-12 16 0" fill="#1e3635" />
          <path d="m8 2 11 8" stroke="#a47253" strokeWidth="4" />
        </g>
      )}
      <g transform="translate(493 349)">
        <path d="M-12 0h26l-4 28h-19z" fill="#ba956d" />
        <path d="M0 0v-56" stroke="#68836d" strokeWidth="4" />
        <circle cy="-42" r="25" fill="#416b50" />
        <circle cx="-9" cy="-52" r="18" fill="#608d61" />
        <circle cx="10" cy="-42" r="19" fill="#54865b" />
        <circle cy="-28" r="17" fill="#477853" />
      </g>
      <g transform="translate(116 299)">
        <path d="M-10 0h21l-3 22h-15z" fill="#ba956d" />
        <path d="M0 0v-27" stroke="#60865c" strokeWidth="4" />
        <ellipse cy="-25" rx="13" ry="21" fill="#659566" />
      </g>
      <g
        className={delivery ? "shop-van arriving" : "shop-van"}
        transform="translate(61 377)"
      >
        <path d="m0 0 62-24 32 16v36L33 52 0 31z" fill="#4ebca2" />
        <path d="m62-24 32 16v36L62 12z" fill="#2d8d78" />
        <path d="m65-17 24 13v13L65-4z" fill="#bbe6d4" />
        <path d="m6 2 48-17v23L6 25z" fill="#75d3b4" />
        <text
          x="10"
          y="17"
          fill="#164d43"
          fontSize="10"
          fontWeight="700"
          transform="rotate(-20 10 17)"
        >
          FRESH!
        </text>
        <ellipse cx="17" cy="36" rx="7" ry="10" fill="#183833" />
        <ellipse cx="73" cy="23" rx="7" ry="10" fill="#183833" />
        <circle cx="17" cy="36" r="3" fill="#adbbb0" />
        <circle cx="73" cy="23" r="3" fill="#adbbb0" />
      </g>
      <g transform="translate(420 91)">
        <path d="m0 0 2-22" stroke="#96b5a6" strokeWidth="2" />
        <path d="m-16-26 26-5 8 9-26 5z" fill="#b4a0de" />
        <path d="m-13-21 21-4" stroke="#403755" strokeWidth="2" />
      </g>
      <g className="shop-sparkles" fill="#7addbc">
        <path d="m112 170 3-8 3 8 8 3-8 3-3 8-3-8-8-3z" />
        <circle cx="476" cy="102" r="3" />
        <circle cx="79" cy="236" r="2" />
        <path d="m529 260 2-6 2 6 6 2-6 2-2 6-2-6-6-2z" />
      </g>
      {reputation > 65 && (
        <g transform="translate(330 130)">
          <rect x="0" y="-36" width="68" height="28" rx="14" fill="#ead8ac" />
          <text
            x="34"
            y="-18"
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#254844"
          >
            ★ 4.9
          </text>
          <path d="m20-8 5 7 5-7" fill="#ead8ac" />
        </g>
      )}
    </svg>
  );
}
