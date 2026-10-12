import type { Shop } from "../data/shops";
import type { SignalKind } from "./storeTelemetry";

// Domain / object / action / version / country / shop / entity.
export function storeTopic(shop: Shop, object: string, action: string, entity: string) {
  return `abc/retail/${object}/${action}/v1/${shop.countryId.toLowerCase()}/${shop.id}/${entity}`;
}
export function storeSubscriptions(shop: Shop, kind: SignalKind | "all") {
  const objects = { inventory: ["inventory"], pricing: ["price"], purchase: ["purchase"], iot: ["fridge", "camera"], agents: ["robot", "decision"] };
  return (kind === "all" ? ["*"] : objects[kind]).map(object => storeTopic(shop, object, "*", ">"));
}
// This demo uses whole-level * and terminal > (one or more levels).
export function matchesSubscription(topic: string, subscription: string) {
  const levels = topic.split("/"), pattern = subscription.split("/");
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === ">") return i === pattern.length - 1 && levels.length > i;
    if (levels[i] === undefined || (pattern[i] !== "*" && pattern[i] !== levels[i])) return false;
  }
  return levels.length === pattern.length;
}
