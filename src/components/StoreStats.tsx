import { useMemo } from "react";
import { RetailGame } from "../engine/game";
import type { Resources } from "../engine/types";
import type { Shop } from "../data/shops";
const stats = [
  { key: "inventory", label: "Inventory", color: "#71b99f" },
  { key: "security", label: "Security", color: "#7f9fb9" },
  { key: "reputation", label: "Reputation", color: "#cb9895" },
  { key: "cash", label: "Cash", color: "#c4a354" },
] as const;
export function StoreStats({ shop, resources }: { shop: Shop; resources?: Resources }) {
  const starting = useMemo(() => new RetailGame(`STORE-${shop.id}`, "week", undefined, shop.perks).snapshot().resources, [shop.id]);
  const current = resources ?? starting;
  return <div className="store-statistics" role="group" aria-label={`${shop.name} statistics`}>
    {stats.map(({ key, label, color }) => {
      const value = Math.max(0, Math.min(100, current[key]));
      const health = value < 25 ? "critical" : value < 50 ? "strained" : "healthy";
      return <div key={key} className="store-statistic" data-stat={key} data-health={health}
        aria-label={`${label}: ${health}`} title={`${label}: ${health}`}>
        <span>{label}</span>
        <div className="store-statistic-track" aria-hidden="true"><i style={{ width: `${value}%`, background: color }} /></div>
      </div>;
    })}
  </div>;
}
