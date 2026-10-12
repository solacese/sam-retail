export const SHOP_ARTWORK = [
  "city-market", "riverside", "station", "garden", "coastal",
  "alpine", "canal", "bakery", "modern", "sunny-market",
] as const;
export function shopArtwork(style: number) {
  return `${import.meta.env.BASE_URL}shops/${SHOP_ARTWORK[style % SHOP_ARTWORK.length]}.webp`;
}
