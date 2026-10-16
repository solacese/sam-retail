import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, MapPin } from "lucide-react";
import {
  COUNTRIES,
  SHOPS,
  PERKS,
  type Country,
  type Shop,
} from "../data/shops";
import { shopArtwork } from "../data/shopArtwork";
import { CountryMap } from "./CountryMap";
export function EuropeNetwork({ onReturn }: { onReturn: () => void }) {
  const [country, setCountry] = useState<Country | null>(null),
    [shop, setShop] = useState<Shop | null>(null);
  const selectCountry = (value: Country) => {
    setCountry(value);
    setShop(null);
  };
  return (
    <div className="network-layout">
      <div className="network-map">
        <div className="map-heading">
          <div>
            <span className="eyebrow">THE ABC SHOP NETWORK</span>
            <h2>{country ? country.name : "Good things, across Europe."}</h2>
          </div>
          {country && (
            <button
              className="text-button"
              onClick={() => {
                setCountry(null);
                setShop(null);
              }}
            >
              <ArrowLeft size={16} /> Europe
            </button>
          )}
        </div>
        <CountryMap
          country={country}
          onCountry={selectCountry}
          onShop={setShop}
        />
        <label className="country-select">
          Country
          <select
            value={country?.id ?? ""}
            onChange={(e) => {
              const c = COUNTRIES.find((c) => c.id === e.target.value);
              if (c) selectCountry(c);
            }}
          >
            <option value="">Choose a country</option>
            {[...COUNTRIES]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <aside className="network-sidebar">
        {shop ? (
          <article className="network-store-card">
            <img
              src={shopArtwork(shop.style)}
              alt={`Illustration of ABC Shop ${shop.name}`}
            />
            <span className="eyebrow">EXAMPLE STORE PROFILE</span>
            <h3>ABC Shop · {shop.name}</h3>
            <p>
              <MapPin size={14} /> {shop.city}, {shop.country}
            </p>
            <div className="profile-stats">
              <div>
                <strong>{(1800 + shop.style * 37).toLocaleString()}</strong>
                <span>m² floor area</span>
              </div>
              <div>
                <strong>{24 + (shop.style % 28)}</strong>
                <span>colleagues</span>
              </div>
            </div>
            <h4>How Solace Agent Mesh helps</h4>
            {shop.perks.map((id) => (
              <div className="network-benefit" key={id}>
                <Check size={16} />
                <div>
                  <strong>{PERKS[id].title}</strong>
                  <p>{PERKS[id].description}</p>
                </div>
              </div>
            ))}
            <p className="fine-print">
              Illustrative benefits, not measured commercial results. Explore
              the running simulation in Paris.
            </p>
            <button className="primary" onClick={onReturn}>
              Enter Paris Flagship <ArrowUpRight size={17} />
            </button>
          </article>
        ) : (
          <>
            <span className="eyebrow">
              {country ? "CHOOSE A STORE" : "ONE CONNECTED NETWORK"}
            </span>
            <h3>
              {country
                ? "Different shops. Shared intelligence."
                : `${SHOPS.length} shops. Local decisions.`}
            </h3>
            <p className="muted">
              Discover how connected inventory, prices, and devices help each
              store.
            </p>
            {country ? (
              <div className="country-shops">
                {SHOPS.filter((s) => s.countryId === country.id).map((s) => (
                  <button key={s.id} onClick={() => setShop(s)}>
                    <MapPin size={18} />
                    <span>ABC Shop · {s.name}</span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="network-note">
                <span className="status-dot" /> Your Paris Flagship is waiting.
                Its simulation is paused while you explore.
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}
