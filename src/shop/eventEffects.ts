import { type Point, type StoreState } from "../simulation/store";

export const EVENT_EFFECT_SECONDS = 3.2;
export const EVENT_COLORS = { payment: "#408dcb", inventory: "#58a775" };
export interface ShopEventEffect {
  id: number;
  at: number;
  kind: "payment" | "inventory";
  position: Point;
  label: string;
  description: string;
}

/** A small, bounded view of real events; never generates activity of its own. */
export function shopEventEffects(state: StoreState): ShopEventEffect[] {
  const effects: ShopEventEffect[] = [];
  const occupied = new Set<string>();
  for (const event of state.events) {
    const age = state.time - event.at;
    // Initial stock snapshots are setup, rather than activity on the shop floor.
    if (age < 0 || age >= EVENT_EFFECT_SECONDS || event.at === 0) continue;
    let effect: ShopEventEffect | undefined;
    let fixture = "";
    if (event.topic.endsWith("/purchase/till/completed") && event.position) {
      fixture = `till:${event.position.join(":")}`;
      effect = {
        id: event.id,
        at: event.at,
        kind: "payment",
        position: event.position,
        label: `Paid ${event.message.match(/€[\d.]+/)?.[0] ?? ""}`.trim(),
        description: `Payment completed: ${event.message}`,
      };
    } else if (event.category === "inventory") {
      const match = event.topic.match(
        /\/stock\/([^/]+)\/(updated|picked|replenished)$/,
      );
      const product = match && state.products.find((p) => p.id === match[1]);
      if (product) {
        fixture = `shelf:${product.department}`;
        effect = {
          id: event.id,
          at: event.at,
          kind: "inventory",
          position: event.position ?? [
            product.position[0],
            product.position[1] - 2,
          ],
          label:
            match![2] === "replenished"
              ? "Shelf refilled"
              : match![2] === "picked"
                ? "Stock picked"
                : "Stock updated",
          description: `Inventory updated: ${event.message}`,
        };
      }
    }
    // One bubble per fixture: the most recent event wins, keeping faces readable.
    if (effect && !occupied.has(fixture)) {
      occupied.add(fixture);
      effects.push(effect);
      if (effects.length === 7) break;
    }
  }
  return effects;
}
