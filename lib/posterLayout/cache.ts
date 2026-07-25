import type { CountryPosterLayoutResult, LayoutRequest } from "./types";

const cache = new Map<string, CountryPosterLayoutResult>();

export function layoutCacheKey(req: LayoutRequest): string {
  const scaleBucket = Math.round(req.posterScale * 20) / 20;
  const ids = req.films.map((f) => f.id).join(",");
  // Short hash-ish to keep keys bounded when many films
  let h = 0;
  for (let i = 0; i < ids.length; i += 1) {
    h = (Math.imul(31, h) + ids.charCodeAt(i)) | 0;
  }
  return [
    req.countryCode,
    req.tier,
    scaleBucket,
    req.isMobile ? "m" : "d",
    req.films.length,
    h >>> 0,
  ].join("|");
}

export function getCachedLayout(
  key: string
): CountryPosterLayoutResult | undefined {
  return cache.get(key);
}

export function setCachedLayout(
  key: string,
  value: CountryPosterLayoutResult
): void {
  cache.set(key, value);
}

export function clearLayoutCache(): void {
  cache.clear();
}
