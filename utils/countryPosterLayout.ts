import type { Country, Film } from "@/types/cinema";
import { getEarthRadius, latLngToVector3, type FilmPosition } from "@/utils/geo";

const INNER_RING_CAPACITY = 12;
const INNER_RADIUS_DEG = 2.4;
const OUTER_RADIUS_DEG = 4.2;

function hash01(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function sortFilmsStable(films: Film[]): Film[] {
  return [...films].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.id.localeCompare(b.id);
  });
}

function ringOffsets(
  index: number,
  count: number,
  radiusDeg: number,
  filmId: string
): { latOffset: number; lngOffset: number } {
  const angle = (index / Math.max(count, 1)) * Math.PI * 2;
  const jitter = (hash01(filmId) - 0.5) * 0.35;
  const r = radiusDeg * (1 + jitter * 0.12);
  return {
    latOffset: Math.sin(angle) * r,
    lngOffset: Math.cos(angle) * r,
  };
}

/**
 * Place films in 1–2 rings around each country's map center.
 * Ignores per-film coordinates for display placement.
 */
export function layoutPostersByCountry(
  films: Film[],
  countriesByCode: Map<string, Country>,
  radius: number = getEarthRadius() + 0.028
): FilmPosition[] {
  const byCountry = new Map<string, Film[]>();

  for (const film of films) {
    const code = film.primaryProductionCountry;
    const group = byCountry.get(code) ?? [];
    group.push(film);
    byCountry.set(code, group);
  }

  const result: FilmPosition[] = [];

  for (const [code, group] of byCountry) {
    const country = countriesByCode.get(code);
    const center = country?.center ?? {
      latitude: group[0].coordinates.latitude,
      longitude: group[0].coordinates.longitude,
    };

    const sorted = sortFilmsStable(group);
    const innerCount = Math.min(INNER_RING_CAPACITY, sorted.length);
    const outerCount = sorted.length - innerCount;

    sorted.forEach((film, index) => {
      const inOuter = index >= innerCount;
      const ringIndex = inOuter ? index - innerCount : index;
      const ringSize = inOuter ? outerCount : innerCount;
      const radiusDeg = inOuter ? OUTER_RADIUS_DEG : INNER_RADIUS_DEG;
      const { latOffset, lngOffset } = ringOffsets(
        ringIndex,
        ringSize,
        radiusDeg,
        film.id
      );

      // Reduce longitude distortion near poles
      const lat = center.latitude + latOffset;
      const cosLat = Math.cos((center.latitude * Math.PI) / 180);
      const lng =
        center.longitude + lngOffset / Math.max(0.35, Math.abs(cosLat));

      result.push({
        film,
        position: latLngToVector3(lat, lng, radius),
      });
    });
  }

  return result;
}
