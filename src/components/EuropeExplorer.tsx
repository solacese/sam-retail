import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  Heart,
  Tag,
  ShieldCheck,
  Bot,
  Gift,
} from "lucide-react";
import geography from "../data/europe.json";
import { COUNTRY_LABELS } from "../data/countryLabels";
import {
  COUNTRIES,
  SHOPS,
  PERKS,
  type Country,
  type Shop,
} from "../data/shops";
import type { StoreSignal } from "../engine/storeTelemetry";
import { IsometricShop } from "./IsometricShop";
import { StoreDashboard } from "./StoreDashboard";
const perkIcons = {
  meal: Heart,
  inventory: Leaf,
  pricing: Tag,
  iot: ShieldCheck,
  pickup: Bot,
  loyalty: Gift,
};
const shades = ["#9cad85", "#afbb8e", "#b5c39b", "#92ab84", "#bac79c"];
function CountryMap({
  country,
  onCountry,
  onShop,
}: {
  country: Country | null;
  onCountry: (c: Country) => void;
  onShop: (s: Shop) => void;
}) {
  let view = [0, 0, 826, 680];
  if (country) {
    const [x, y, w, h] = country.bounds;
    const width = Math.max(w * 1.5, (h * 1.5 * 826) / 680);
    const height = (width * 680) / 826;
    view = [x + w / 2 - width / 2, y + h / 2 - height / 2, width, height];
  }
  const scale = view[2] / 826;
  const shops = country ? SHOPS.filter((s) => s.countryId === country.id) : [];
  return (
    <div className={`europe-map-frame ${country ? "country-map-frame" : "continent-map-frame"}`}>
      <svg
        className="europe-map"
        viewBox={view.join(" ")}
        role="group"
        aria-label={
          country
            ? `${country.name} shop map`
            : "Choose a country on the Europe map"
        }
      >
        <defs>
          <pattern
            id="sea-lines"
            width="35"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 25q9-5 18 0t18 0"
              fill="none"
              stroke="#b3ccb72a"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          x={view[0]}
          y={view[1]}
          width={view[2]}
          height={view[3]}
          fill="#254b3a"
        />
        <rect
          x={view[0]}
          y={view[1]}
          width={view[2]}
          height={view[3]}
          fill="url(#sea-lines)"
        />
        {geography.map((c, i) => (
          <path
            key={`${c.id}-shadow`}
            aria-hidden="true"
            d={c.path}
            fill="#142f28"
            transform={`translate(0 ${4 * scale})`}
            stroke="#142f28"
            strokeWidth={2 * scale}
          />
        ))}
        {geography.map((c, i) =>
          c.active && !country ? (
            <path
              key={c.id}
              d={c.path}
              role="button"
              aria-label={`Choose ${c.name}`}
              tabIndex={0}
              onClick={() => onCountry(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCountry(c);
                }
              }}
              className="country-shape"
              fill={shades[i % shades.length]}
              stroke="#e6e6c3"
              strokeWidth={1.2 * scale}
              fillRule="evenodd"
            >
              <title>{c.name}</title>
            </path>
          ) : (
            <path
              key={c.id}
              aria-hidden="true"
              d={c.path}
              fill={
                country?.id === c.id
                  ? "#c8d7a6"
                  : c.active
                    ? "#7d9b77"
                    : "#5a7d62"
              }
              stroke="#dfe6bd"
              strokeWidth={1.2 * scale}
              fillRule="evenodd"
            />
          ),
        )}
        {!country && COUNTRIES.map(c => {
          const label = COUNTRY_LABELS[c.id] ?? { x: c.center[0], y: c.center[1] };
          const lines = label.lines ?? [c.name];
          return <g key={`label-${c.id}`} className="country-label" aria-hidden="true">
            {label.callout && <path d={`M${c.center.join(" ")}L${label.x} ${label.y - 5}`} className="country-label-line" />}
            <text x={label.x} y={label.y} textAnchor="middle" className={label.callout ? "country-label-callout" : ""}>
              {lines.map((line, i) => <tspan key={line} x={label.x} dy={i === 0 ? 0 : 16}>{line}</tspan>)}
            </text>
          </g>;
        })}
        {shops.map((shop, i) => (
          <g
            key={shop.id}
            transform={`translate(${shop.point.join(" ")}) scale(${scale})`}
            role="button"
            tabIndex={0}
            aria-label={`Open ${shop.name} shop`}
            onClick={() => onShop(shop)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onShop(shop);
              }
            }}
            className="map-shop-pin"
          >
            <circle r="21" fill={shop.color} stroke="#f4efd8" strokeWidth="3" />
            <path d="M-10-2H10V10H-10zM-12-2l12-10 12 10" fill="#30513d" />
            <rect x="-3" y="3" width="6" height="7" fill="#efe5c8" />
            <g transform={`translate(0 ${i === 0 ? -39 : 39})`}>
              <rect
                x={-shop.city.length * 4.8 - 12}
                y="-13"
                width={shop.city.length * 9.6 + 24}
                height="26"
                rx="13"
                fill="#f0ead4"
              />
              <text
                textAnchor="middle"
                y="5"
                fontSize="16"
                fontWeight="700"
                fill="#294e37"
              >
                {shop.city}
              </text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
export function EuropeExplorer({
  country,
  shop,
  signals,
  onCountry,
  onShop,
  onBack,
  onStart,
  visitLabel,
}: {
  country: Country | null;
  shop: Shop | null;
  signals: StoreSignal[];
  onCountry: (c: Country | null) => void;
  onShop: (s: Shop) => void;
  onBack: () => void;
  onStart: () => void;
  visitLabel: string;
}) {
  if (shop)
    return (
      <main className="explorer shop-explorer">
        <section className="shop-profile">
          <button className="atlas-back" onClick={onBack}>
            <ArrowLeft size={18} /> {shop.country} shops
          </button>
          <span className="atlas-kicker">
            ABC SHOP · {shop.city.toUpperCase()}
          </span>
          <h1>{shop.name}</h1>
          <p className="explorer-intro">
            Busy aisles, online orders, and five agents connected by Solace.
          </p>
          <div className="shop-perks">
            {shop.perks.map((id) => {
              const Icon = perkIcons[id],
                perk = PERKS[id];
              return (
                <div className="shop-perk" key={id}>
                  <span className="perk-icon">
                    <Icon size={23} />
                  </span>
                  <div>
                    <h2>{perk.title}</h2>
                    <strong>{perk.benefit}</strong>
                    <p>{perk.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="primary-button week-start" onClick={onStart}>
            {visitLabel} <ArrowRight size={19} />
          </button>
          <p className="week-invite">
            They handle the live updates. You help with the tough choices.
          </p>
        </section>
        <StoreDashboard shop={shop} signals={signals} />
      </main>
    );
  return (
    <main className="explorer atlas-explorer">
      <div className="atlas-heading">
        {country && (
          <button className="atlas-back" onClick={() => onCountry(null)}>
            <ArrowLeft size={18} /> Europe
          </button>
        )}
        <span className="atlas-kicker">
          {country ? "CHOOSE YOUR SHOP" : "THE ABC SHOP WORLD"}
        </span>
        <h1>{country ? country.name : "A little help. All over Europe."}</h1>
        <p className="explorer-intro">
          {country
            ? "Every shop has its own perks and a team to help."
            : "Pick a country, find your shop, and join its agents for a week."}
        </p>
      </div>
      <div className="atlas-layout">
        <CountryMap country={country} onCountry={onCountry} onShop={onShop} />
        <section className="atlas-side">
          <label className="country-picker">
            Country
            <select
              aria-label="Choose a country"
              value={country?.id ?? ""}
              onChange={(e) =>
                onCountry(
                  COUNTRIES.find((c) => c.id === e.target.value) ?? null,
                )
              }
            >
              <option value="">Choose a country</option>
              {COUNTRIES.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {country ? (
            <div className="country-shops">
              {SHOPS.filter((s) => s.countryId === country.id).map((s) => (
                <button
                  className="shop-choice"
                  key={s.id}
                  onClick={() => onShop(s)}
                  aria-label={`Visit ABC Shop ${s.name}`}
                >
                  <div className="shop-thumbnail">
                    <IsometricShop shop={s} compact />
                  </div>
                  <span>
                    <strong>{s.name}</strong>
                    <small>
                      {s.perks.length} store perks <ArrowRight size={16} />
                    </small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="atlas-welcome">
              <div className="tiny-robot" aria-hidden="true">
                <span>⌒ ⌒</span>
                <i />
              </div>
              <h2>Your agents are ready.</h2>
              <p>Meal deals. Less food waste. Robots working together.</p>
              <p>Choose a country on the map to get started.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
