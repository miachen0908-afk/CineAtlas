import { getAreaBand, safeBufferKmForBand } from "@/lib/countryArea";
import { gapPaddingMeters, posterSizeMeters } from "./collision";
import { getCachedLayout, layoutCacheKey, setCachedLayout } from "./cache";
import {
  posterDisplayFootprintMeters,
  posterDisplayHeightOnGlobe,
} from "./display";
import {
  buildCountryGeometry,
  buildHotspotGeometry,
  type CountryGeometryBundle,
} from "./geometry";
import { generateHorizontalRowCandidates } from "./rowGrid";
import type {
  CountryPosterLayoutResult,
  LayoutFilmInput,
  LayoutRequest,
  Vec2,
} from "./types";

type LayoutTrial = {
  scale: number;
  widthM: number;
  heightM: number;
  displayHeightGlobe: number;
  candidates: Vec2[];
};

const geometryCache = new Map<string, CountryGeometryBundle | null>();

function sortFilms(films: LayoutFilmInput[]): LayoutFilmInput[] {
  return [...films].sort((a, b) => {
    const yearDiff = (a.year ?? 0) - (b.year ?? 0);
    if (yearDiff !== 0) return yearDiff;
    const titleDiff = a.titleZh.localeCompare(b.titleZh, "zh-CN");
    return titleDiff !== 0 ? titleDiff : a.id.localeCompare(b.id);
  });
}

function emptyResult(
  countryCode: string,
  tier: LayoutRequest["tier"],
  fallback: boolean
): CountryPosterLayoutResult {
  return {
    countryCode,
    placed: [],
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
  const geometryKey = [
    req.countryCode,
    req.isoId ?? "hotspot",
    req.hotspotCenter?.longitude ?? "",
    req.hotspotCenter?.latitude ?? "",
    bufferKm,
  ].join("|");
  if (geometryCache.has(geometryKey)) {
    return geometryCache.get(geometryKey) ?? null;
  }

  let resolved: CountryGeometryBundle | null = null;

  if (req.isoId) {
    const geometry = buildCountryGeometry(req.isoId, bufferKm);
    if (geometry) resolved = geometry;
  }

  if (!resolved && req.hotspotCenter) {
    resolved = buildHotspotGeometry(
      req.hotspotCenter,
      band === "tiny" ? 22_000 : 35_000
    );
  }

  geometryCache.set(geometryKey, resolved);
  return resolved;
}

function runLayoutTrial(
  req: LayoutRequest,
  geometry: CountryGeometryBundle,
  filmCount: number,
  scale: number
): LayoutTrial {
  const band = getAreaBand(req.countryCode);
  const { widthM, heightM } = posterSizeMeters(req.tier, scale, band);
  const displayHeightGlobe = posterDisplayHeightOnGlobe(
    heightM,
    req.tier,
    scale
  );
  const footprint = posterDisplayFootprintMeters(heightM, req.tier, scale);
  const padding = gapPaddingMeters(footprint.heightM);
  const candidates = generateHorizontalRowCandidates(
    geometry.safeZoneLocalRings,
    footprint.widthM,
    footprint.heightM,
    padding,
    filmCount,
    geometry.visualCenterLocal
  );

  return { scale, widthM, heightM, displayHeightGlobe, candidates };
}

function findLargestFittingTrial(
  req: LayoutRequest,
  geometry: CountryGeometryBundle,
  filmCount: number
): LayoutTrial {
  const desired = runLayoutTrial(
    req,
    geometry,
    filmCount,
    req.posterScale
  );
  if (desired.candidates.length >= filmCount) return desired;

  let low = 0;
  let high = req.posterScale;
  let best: LayoutTrial | null = null;

  for (let iteration = 0; iteration < 14; iteration += 1) {
    const scale = (low + high) / 2;
    const trial = runLayoutTrial(req, geometry, filmCount, scale);
    if (trial.candidates.length >= filmCount) {
      low = scale;
      best = trial;
    } else {
      high = scale;
    }
  }

  return (
    best ??
    runLayoutTrial(req, geometry, filmCount, Math.max(high, 0.0001))
  );
}

/**
 * Places every filtered film for one country. The slider value is the desired
 * upper bound; countries independently shrink until the complete set fits.
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

    const films = sortFilms(req.films);
    if (films.length === 0) {
      const result: CountryPosterLayoutResult = {
        countryCode: req.countryCode,
        placed: [],
        tier: req.tier,
        fallback: false,
        debug: {
          safeZoneRingsLocal: geometry.safeZoneLocalRings,
          candidates: [],
          visualCenter: geometry.visualCenterLocal,
          visualCenterLonLat: geometry.visualCenterLonLat,
        },
      };
      setCachedLayout(key, result);
      return result;
    }

    const trial = findLargestFittingTrial(
      req,
      geometry,
      films.length
    );
    const usableCount = Math.min(films.length, trial.candidates.length);
    const placed = films.slice(0, usableCount).map((film, index) => {
      const candidate = trial.candidates[index]!;
      const location = geometry.projection.toLonLat(
        candidate.x,
        candidate.y
      );
      return {
        filmId: film.id,
        titleZh: film.titleZh,
        posterColor: film.posterColor || "#3a8fb7",
        posterUrl: film.posterUrl,
        x: candidate.x,
        y: candidate.y,
        lon: location.longitude,
        lat: location.latitude,
        widthM: trial.widthM,
        heightM: trial.heightM,
        displayHeightGlobe: trial.displayHeightGlobe,
        rank: index,
      };
    });

    const result: CountryPosterLayoutResult = {
      countryCode: req.countryCode,
      placed,
      tier: req.tier,
      fallback: placed.length !== films.length,
      debug: {
        safeZoneRingsLocal: geometry.safeZoneLocalRings,
        candidates: trial.candidates.map((candidate, index) => ({
          x: candidate.x,
          y: candidate.y,
          status: index < usableCount ? "selected" : "unused",
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
