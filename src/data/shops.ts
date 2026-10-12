import geography from "./europe.json";
import cityPoints from "./city-points.json";
const pointLookup: Record<string, number[]> = cityPoints;
export type PerkId =
  | "meal"
  | "inventory"
  | "pricing"
  | "iot"
  | "pickup"
  | "loyalty";
export const PERKS: Record<
  PerkId,
  { title: string; benefit: string; description: string }
> = {
  meal: {
    title: "Meal deals",
    benefit: "Happier shoppers",
    description: "Lunch bundles give reputation a head start.",
  },
  inventory: {
    title: "Smarter stock",
    benefit: "+5% revenue · less waste",
    description:
      "Better stock planning boosts sales and halves food waste in the game.",
  },
  pricing: {
    title: "Prices in sync",
    benefit: "One price, everywhere",
    description: "Shelf labels, tills, and online orders update together.",
  },
  iot: {
    title: "Smart store",
    benefit: "Fresh food, safer aisles",
    description: "Fridges and cameras keep the agents informed.",
  },
  pickup: {
    title: "Robot teamwork",
    benefit: "Faster pickup",
    description: "Picking bots and staff share the same order updates.",
  },
  loyalty: {
    title: "Regular rewards",
    benefit: "More return visits",
    description: "Rewards give loyal shoppers a reason to come back.",
  },
};
export const COUNTRIES = geography.filter((c) => c.active);
export type Country = (typeof COUNTRIES)[number];
export interface Shop {
  id: string;
  countryId: string;
  country: string;
  name: string;
  city: string;
  neighborhood: string;
  color: string;
  style: number;
  perks: PerkId[];
  point: [number, number];
}
const cities: Record<string, string[]> = {
  FR: ["Paris", "Lyon", "Bordeaux"],
  DE: ["Berlin", "Hamburg", "Munich"],
  GB: ["London", "Manchester", "Bristol"],
  ES: ["Madrid", "Barcelona", "Valencia"],
  IT: ["Milan", "Rome", "Bologna"],
  PT: ["Lisbon", "Porto"],
  NL: ["Amsterdam", "Rotterdam"],
  BE: ["Brussels", "Antwerp"],
  AT: ["Vienna", "Salzburg"],
  CH: ["Zurich", "Geneva"],
  DK: ["Copenhagen", "Aarhus"],
  SE: ["Stockholm", "Gothenburg"],
  NO: ["Oslo", "Bergen"],
  FI: ["Helsinki", "Tampere"],
  PL: ["Warsaw", "Kraków"],
  CZ: ["Prague", "Brno"],
  IE: ["Dublin", "Cork"],
  GR: ["Athens", "Thessaloniki"],
  HU: ["Budapest", "Debrecen"],
  RO: ["Bucharest", "Cluj"],
  IS: ["Reykjavík", "Akureyri"],
  UA: ["Kyiv", "Lviv"],
  BY: ["Minsk", "Grodno"],
  RU: ["Moscow", "Saint Petersburg"],
  LT: ["Vilnius", "Kaunas"],
  LV: ["Riga", "Liepāja"],
  EE: ["Tallinn", "Tartu"],
  BG: ["Sofia", "Plovdiv"],
  AL: ["Tirana", "Durrës"],
  HR: ["Zagreb", "Split"],
  LU: ["Luxembourg", "Esch"],
  SI: ["Ljubljana", "Maribor"],
  SK: ["Bratislava", "Košice"],
  BA: ["Sarajevo", "Mostar"],
  MK: ["Skopje", "Bitola"],
  RS: ["Belgrade", "Novi Sad"],
  ME: ["Podgorica", "Kotor"],
  XK: ["Pristina", "Prizren"],
  KOS: ["Pristina", "Prizren"],
  MD: ["Chișinău", "Bălți"],
  TR: ["Istanbul", "Izmir"],
  CY: ["Nicosia", "Limassol"],
};
const palettes = ["#e5ae88", "#8ed4ba", "#96b7d5", "#ddaaa9", "#e9ca85"];
const perkSets: PerkId[][] = [
  ["meal", "inventory", "pricing"],
  ["inventory", "iot"],
  ["meal", "pickup", "loyalty"],
  ["pricing", "iot", "pickup"],
  ["inventory", "loyalty"],
];
export const SHOPS: Shop[] = COUNTRIES.flatMap((country, index) =>
  (cities[country.id] ?? ["Market Town", "Riverside"]).map((city, i) => ({
    id: `${country.id.toLowerCase()}-${i}`,
    countryId: country.id,
    country: country.name,
    city,
    neighborhood: ["Market", "Riverside", "Station"][i],
    name: `${city} ${["Market", "Riverside", "Station"][i]}`,
    color: palettes[(index + i) % palettes.length],
    style: index * 3 + i,
    perks: i === 0 ? perkSets[0] : perkSets[(index + i) % perkSets.length],
    point: (pointLookup[`${country.id}-${city}`] ?? [
      country.center[0] +
        (i === 1 ? 1 : -1) * Math.min(country.bounds[2] * 0.14, 18),
      country.center[1] +
        (i === 0 ? -1 : i === 1 ? 0.5 : 1) *
          Math.min(country.bounds[3] * 0.14, 22),
    ]) as [number, number],
  })),
);
export function shopById(id: string | null) {
  return SHOPS.find((shop) => shop.id === id);
}
