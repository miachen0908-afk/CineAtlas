import {
  getAreaBand,
  posterCapForCountry,
  safeBufferKmForBand,
} from "@/lib/countryArea";
import {
  collidesAny,
  gapPaddingMeters,
  posterSizeMeters,
  toRect,
  type Rect,
} from "./collision";
import { getCachedLayout, layoutCacheKey, setCachedLayout } from "./cache";
import {
  buildCountryGeometry,
  buildHotspotGeometry,
  rectCornersInSafeZone,
  type CountryGeometryBundle,
} from "./geometry";
import { generateHexCandidates } from "./hexGrid";
import { rankCandidates } from "./score";
import type {
  CountryPosterLayoutResult,
  DebugCandidate,
  LayoutFilmInput,
  LayoutRequest,
  PlacedPoster,
} from "./types";

function sortFilms(films: LayoutFilmInput[]): LayoutFilmInput[] {
  return [...films].sort((a, b) => {
    if (a.featuredPriority !== b.featuredPriority) {
      return a.featuredPriority - b.featuredPriority;
    }
    const ra = a.rating ?? -1;
    const rb = b.rating ?? -1;
    if (rb !== ra) return rb - ra;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}

function estimateCapacity(
  candidates: { x: number; y: number }[],
  widthM: number,
  heightM: number,
  padding: number,
  safeCheck: (x: number, y: number) => boolean
): number {
  const placed: Rect[] = [];
  let n = 0;
  for (const c of candidates) {
    if (!safeCheck(c.x, c.y)) continue;
    const rect = toRect(c, widthM, heightM);
    if (collidesAny(rect, placed, padding)) continue;
    placed.push(rect);
    n += 1;
    if (n >= 20) break;
  }
  return n;
}

function emptyResult(
  countryCode: string,
  tier: LayoutRequest["tier"],
  fallback: boolean
): CountryPosterLayoutResult {
  return {
    countryCode,
    placed: [],
    capacity: 0,
    tier,
    fallback,
    debug: {
      safeZoneRingsLocal: [],
      candidates: [],
      visualCenter: { x: 0, y: 0 },
      visualCenterLonLat: { longitude: 0, latitude: 0 },
    },
  };
}

function resolveGeometry(req: LayoutRequest): CountryGeometryBundle | null {
  const band = getAreaBand(req.countryCode);
  const bufferKm = safeBufferKmForBand(band);

  if (req.isoId) {
    const g = buildCountryGeometry(req.isoId, bufferKm);
    if (g) return g;
  }

  if (req.hotspotCenter) {
    return buildHotspotGeometry(req.hotspotCenter, band === "tiny" ? 22_000 : 35_000);
  }

  return null;
}

/**
 * In-polygon hex layout for one country. Never throws.
 */
export function computeCountryPosterLayout(
  req: LayoutRequest
): CountryPosterLayoutResult {
  const key = layoutCacheKey(req);
  const cached = getCachedLayout(key);
  if (cached) return cached;

  try {
    const geometry = resolveGeometry(req);
    if (!geometry) {
      const result = emptyResult(req.countryCode, req.tier, true);
      setCachedLayout(key, result);
      return result;
    }

    const band = getAreaBand(req.countryCode);
    const films = sortFilms(req.films);
    const { widthM, heightM } = posterSizeMeters(
      req.tier,
      req.posterScale,
      band
    );
    const padding = gapPaddingMeters(heightM);
    const hexSpacing = Math.max(widthM, heightM) * 1.15 + padding;

    const rawHex = generateHexCandidates(
      geometry.safeZoneLocalRings,
      geometry.projection,
      hexSpacing,
      geometry.aspectRatio
    );

    const ranked = rankCandidates(
      rawHex,
      geometry.visualCenterLocal,
      geometry.safeZoneLocalRings[0] ?? geometry.outerLocal
    );

    const safeCheck = (x: number, y: number) =>
      rectCornersInSafeZone(
        x,
        y,
        widthM,
        heightM,
        geometry.safeZoneLocalRings,
        geometry.projection
      );

    const geometryCapacity = estimateCapacity(
      ranked,
      widthM,
      heightM,
      padding,
      safeCheck
    );

    const cap = posterCapForCountry(
      req.countryCode,
      req.tier,
      geometryCapacity,
      req.isMobile
    );

    const statusAt = new Map<string, DebugCandidate["status"]>();
    const keyOf = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
    const mark = (x: number, y: number, status: DebugCandidate["status"]) => {
      statusAt.set(keyOf(x, y), status);
    };

    if (cap === 0 || films.length === 0) {
      const result: CountryPosterLayoutResult = {
        countryCode: req.countryCode,
        placed: [],
        capacity: 0,
        tier: req.tier,
        fallback: false,
        debug: {
          safeZoneRingsLocal: geometry.safeZoneLocalRings,
          candidates: ranked.map((c) => ({
            x: c.x,
            y: c.y,
            status: "unused",
          })),
          visualCenter: geometry.visualCenterLocal,
          visualCenterLonLat: geometry.visualCenterLonLat,
        },
      };
      setCachedLayout(key, result);
      return result;
    }

    const placedRects: Rect[] = [];
    const placed: PlacedPoster[] = [];
    let candIndex = 0;

    for (const film of films) {
      if (placed.length >= cap) break;

      let placedOne = false;
      while (candIndex < ranked.length) {
        const c = ranked[candIndex]!;
        candIndex += 1;

        if (!safeCheck(c.x, c.y)) {
          mark(c.x, c.y, "boundary");
          continue;
        }

        const rect = toRect(c, widthM, heightM);
        if (collidesAny(rect, placedRects, padding)) {
          mark(c.x, c.y, "collision");
          continue;
        }

        placedRects.push(rect);
        mark(c.x, c.y, "selected");
        const ll = geometry.projection.toLonLat(c.x, c.y);
        placed.push({
          filmId: film.id,
          titleZh: film.titleZh,
          posterColor: film.posterColor || "#3a8fb7",
          posterUrl: film.posterUrl,
          x: c.x,
          y: c.y,
          lon: ll.longitude,
          lat: ll.latitude,
          widthM,
          heightM,
          rank: placed.length,
        });
        placedOne = true;
        break;
      }

      if (!placedOne) break;
    }

    let fallback = false;
    if (
      placed.length === 0 &&
      films.length > 0 &&
      (cap > 0 || req.tier !== "world")
    ) {
      fallback = true;
      const film = films[0]!;
      const c = geometry.visualCenterLocal;
      const ll = geometry.visualCenterLonLat;
      placed.push({
        filmId: film.id,
        titleZh: film.titleZh,
        posterColor: film.posterColor || "#3a8fb7",
        posterUrl: film.posterUrl,
        x: c.x,
        y: c.y,
        lon: ll.longitude,
        lat: ll.latitude,
        widthM,
        heightM,
        rank: 0,
      });
    }

    const result: CountryPosterLayoutResult = {
      countryCode: req.countryCode,
      placed,
      capacity: cap,
      tier: req.tier,
      fallback,
      debug: {
        safeZoneRingsLocal: geometry.safeZoneLocalRings,
        candidates: ranked.map((c) => ({
          x: c.x,
          y: c.y,
          status: statusAt.get(keyOf(c.x, c.y)) ?? "unused",
        })),
        visualCenter: geometry.visualCenterLocal,
        visualCenterLonLat: geometry.visualCenterLonLat,
      },
    };
    setCachedLayout(key, result);
    return result;
  } catch {
    const result = emptyResult(req.countryCode, req.tier, true);
    setCachedLayout(key, result);
    return result;
  }
}
