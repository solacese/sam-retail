import { describe, expect, it } from "vitest";
import { SHOPS } from "../src/data/shops";
import { matchesSubscription, storeSubscriptions, storeTopic } from "../src/engine/storeTopics";
const paris = SHOPS.find(s => s.id === "fr-0")!;
const lyon = SHOPS.find(s => s.id === "fr-1")!;
describe("shop-scoped Solace topic filters", () => {
  it("routes price updates to the selected shop only", () => {
    const filter = storeSubscriptions(paris, "pricing")[0];
    expect(storeTopic(paris, "price", "updated", "milk")).toBe("abc/retail/price/updated/v1/fr/fr-0/milk");
    expect(matchesSubscription(storeTopic(paris, "price", "updated", "milk"), filter)).toBe(true);
    expect(matchesSubscription(storeTopic(lyon, "price", "updated", "milk"), filter)).toBe(false);
    expect(matchesSubscription(storeTopic(paris, "inventory", "updated", "milk"), filter)).toBe(false);
  });
  it("routes both camera and fridge events through the IoT filter", () => {
    const filters = storeSubscriptions(paris, "iot");
    for (const object of ["fridge", "camera"]) {
      expect(filters.some(f => matchesSubscription(storeTopic(paris, object, "updated", "device-1"), f))).toBe(true);
    }
  });
  it("treats * as exactly one level and terminal > as one or more", () => {
    expect(matchesSubscription("abc/price/updated", "abc/*/updated")).toBe(true);
    expect(matchesSubscription("abc/a/b/updated", "abc/*/updated")).toBe(false);
    expect(matchesSubscription("abc/price", "abc/price/>")).toBe(false);
    expect(matchesSubscription("abc/price/v1/fr", "abc/price/>")).toBe(true);
    expect(matchesSubscription("abc/price/v1/fr", "abc/>/fr")).toBe(false);
  });
});
