import area from "@turf/area";
import { polygon as turfPolygon } from "@turf/helpers";
import { getCountryFeatures } from "@/lib/countryLookup";
import { COUNTRY_ISO_NUMERIC, isCountryHotspot } from "@/lib/countryIso";
import { pickLargestPolygon } from "@/lib/posterLayout/geometry";
import type { ZoomTier } from "@/lib/posterLayout/types";

export type AreaBand = "tiny" | "small" | "medium" | "large" | "huge";

const areaCache = new Map<string, number>();

/** Approximate km² for hotspot city-states without TopoJSON polygons. */
const HOTSPOT_AREA_KM2: Record<string, number> = {
  sg: 730,
  hk: 1_100,
};

/**
 * Country land area in km² (largest polygon). Cached.
 */
export function getCountryAreaKm2(countryCode: string): number {
  const cached = areaCache.get(countryCode);
  if (cached !== undefined) return cached;

  if (isCountryHotspot(countryCode)) {
    const v = HOTSPOT_AREA_KM2[countryCode] ?? 1_000;
    areaCache.set(countryCode, v);
    return v;
  }

  const iso = COUNTRY_ISO_NUMERIC[countryCode];
  if (!iso) {
    areaCache.set(countryCode, 50_000);
    return 50_000;
  }

  const feature = getCountryFeatures().find((f) => f.isoId === iso);
  if (!feature) {
    areaCache.set(countryCode, 50_000);
    return 50_000;
  }

  try {
    const poly = pickLargestPolygon(feature.geometry);
    const m2 = area(turfPolygon(poly.coordinates));
    const km2 = Math.max(1, m2 / 1_000_000);
    areaCache.set(countryCode, km2);
    return km2;
  } catch {
    areaCache.set(countryCode, 50_000);
    return 50_000;
  }
}

export function getAreaBand(countryCode: string): AreaBand {
  const km2 = getCountryAreaKm2(countryCode);
  if (km2 < 50_000) return "tiny";
  if (km2 < 300_000) return "small";
  if (km2 < 1_000_000) return "medium";
  if (km2 < 3_000_000) return "large";
  return "huge";
}

/** Max posters by area band × zoom tier (before geometry / mobile). */
export function areaTierCap(band: AreaBand, tier: ZoomTier): number {
  const table: Record<AreaBand, Record<ZoomTier, number>> = {
    tiny: { world: 0, continent: 1, country: 2 },
    small: { world: 1, continent: 2, country: 4 },
    medium: { world: 1, continent: 3, country: 8 },
    large: { world: 2, continent: 4, country: 10 },
    huge: { world: 2, continent: 5, country: 14 },
  };
  return table[band][tier];
}

export function posterCapForCountry(
  countryCode: string,
  tier: ZoomTier,
  geometryCapacity: number,
  isMobile: boolean
): number {
  const band = getAreaBand(countryCode);
  const areaCap = areaTierCap(band, tier);

  if (areaCap === 0) return 0;

  let cap = Math.min(areaCap, Math.max(geometryCapacity, 1));
  // If geometry says 0 but area allows, still allow 1 for non-world (fallback poster)
  if (geometryCapacity <= 0) {
    cap = tier === "world" ? 0 : Math.min(areaCap, 1);
  }

  if (isMobile) {
    if (cap <= 0) return 0;
    return Math.max(1, Math.floor(cap / 2));
  }
  return cap;
}

/** Inward buffer distance (km) — smaller countries use tighter inset. */
export function safeBufferKmForBand(band: AreaBand): number {
  switch (band) {
    case "tiny":
      return 8;
    case "small":
      return 18;
    case "medium":
      return 30;
    case "large":
      return 45;
    case "huge":
      return 60;
  }
}
