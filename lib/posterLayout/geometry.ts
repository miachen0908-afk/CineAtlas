import type { MultiPolygon, Polygon, Position } from "geojson";
import area from "@turf/area";
import buffer from "@turf/buffer";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { polygon as turfPolygon, point } from "@turf/helpers";
import polylabel from "polylabel";
import { getCountryFeatures } from "@/lib/countryLookup";
import { createLocalProjection, projectRing, type LocalProjection } from "./projection";
import type { LonLat, Vec2 } from "./types";

export type CountryGeometryBundle = {
  /** Largest landmass as GeoJSON Polygon (outer + holes). */
  geoPolygon: Polygon;
  projection: LocalProjection;
  visualCenterLonLat: LonLat;
  visualCenterLocal: Vec2;
  /** Safe zone rings in local meters (may be empty if inset failed). */
  safeZoneLocalRings: Vec2[][];
  /** Original outer ring in local meters (for fallback inset). */
  outerLocal: Vec2[];
  aspectRatio: number;
  areaM2: number;
};

function ringAreaAbs(ring: Position[]): number {
  try {
    return Math.abs(area(turfPolygon([ring])));
  } catch {
    return 0;
  }
}

/** Pick the polygon with the largest outer ring (main landmass). */
export function pickLargestPolygon(
  geometry: Polygon | MultiPolygon
): Polygon {
  if (geometry.type === "Polygon") return geometry;

  let best: Position[][] | null = null;
  let bestArea = -1;
  for (const coords of geometry.coordinates) {
    const a = ringAreaAbs(coords[0] ?? []);
    if (a > bestArea) {
      bestArea = a;
      best = coords;
    }
  }
  return {
    type: "Polygon",
    coordinates: best ?? geometry.coordinates[0]!,
  };
}

function scaleRingToward(
  ring: Vec2[],
  center: Vec2,
  factor: number
): Vec2[] {
  return ring.map((p) => ({
    x: center.x + (p.x - center.x) * factor,
    y: center.y + (p.y - center.y) * factor,
  }));
}

function localRingsToLonLatPolygon(
  rings: Vec2[][],
  projection: LocalProjection
): Polygon {
  return {
    type: "Polygon",
    coordinates: rings.map((ring) => {
      const coords = ring.map((p) => {
        const ll = projection.toLonLat(p.x, p.y);
        return [ll.longitude, ll.latitude] as Position;
      });
      // close ring
      if (
        coords.length > 0 &&
        (coords[0]![0] !== coords[coords.length - 1]![0] ||
          coords[0]![1] !== coords[coords.length - 1]![1])
      ) {
        coords.push([...coords[0]!]);
      }
      return coords;
    }),
  };
}

function bboxAspect(ring: Vec2[]): number {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of ring) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const w = Math.max(1, maxX - minX);
  const h = Math.max(1, maxY - minY);
  return Math.max(w / h, h / w);
}

/**
 * Build projected geometry + inward-buffered safe zone for a country ISO id.
 */
export function buildCountryGeometry(
  isoId: string,
  safeBufferKm = 35
): CountryGeometryBundle | null {
  const feature = getCountryFeatures().find((f) => f.isoId === isoId);
  if (!feature) return null;

  const geoPolygon = pickLargestPolygon(feature.geometry);
  const outer = geoPolygon.coordinates[0];
  if (!outer || outer.length < 4) return null;

  // polylabel expects [ring][point][x,y] in lon/lat
  const [cx, cy] = polylabel(
    geoPolygon.coordinates as unknown as [number, number][][],
    0.01
  );
  const visualCenterLonLat: LonLat = {
    longitude: cx!,
    latitude: cy!,
  };

  const projection = createLocalProjection(
    visualCenterLonLat.longitude,
    visualCenterLonLat.latitude
  );
  const visualCenterLocal = projection.toLocal(
    visualCenterLonLat.longitude,
    visualCenterLonLat.latitude
  );

  const outerLocal = projectRing(outer, projection);
  const holeLocals = geoPolygon.coordinates
    .slice(1)
    .map((ring) => projectRing(ring, projection));

  let safeZoneLocalRings: Vec2[][] = [];

  try {
    const buffered = buffer(geoPolygon, -safeBufferKm, { units: "kilometers" });
    if (buffered?.geometry) {
      const g = buffered.geometry;
      if (g.type === "Polygon") {
        safeZoneLocalRings = g.coordinates.map((ring) =>
          projectRing(ring, projection)
        );
      } else if (g.type === "MultiPolygon") {
        const largest = pickLargestPolygon(g);
        safeZoneLocalRings = largest.coordinates.map((ring) =>
          projectRing(ring, projection)
        );
      }
    }
  } catch {
    // fall through to scale fallback
  }

  if (safeZoneLocalRings.length === 0) {
    safeZoneLocalRings = [
      scaleRingToward(outerLocal, visualCenterLocal, 0.82),
      ...holeLocals.map((h) => scaleRingToward(h, visualCenterLocal, 1.1)),
    ];
  }

  let areaM2 = 0;
  try {
    areaM2 = area(turfPolygon(geoPolygon.coordinates));
  } catch {
    areaM2 = 0;
  }

  return {
    geoPolygon,
    projection,
    visualCenterLonLat,
    visualCenterLocal,
    safeZoneLocalRings,
    outerLocal,
    aspectRatio: bboxAspect(outerLocal),
    areaM2,
  };
}

/** Circular safe zone around a city-state center (SG/HK). */
export function buildHotspotGeometry(
  center: LonLat,
  radiusM = 28_000
): CountryGeometryBundle {
  const projection = createLocalProjection(center.longitude, center.latitude);
  const visualCenterLocal = { x: 0, y: 0 };
  const steps = 24;
  const ring: Vec2[] = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    ring.push({
      x: Math.cos(a) * radiusM,
      y: Math.sin(a) * radiusM,
    });
  }
  ring.push({ ...ring[0]! });

  const geoCoords = ring.map((p) => {
    const ll = projection.toLonLat(p.x, p.y);
    return [ll.longitude, ll.latitude] as Position;
  });

  return {
    geoPolygon: { type: "Polygon", coordinates: [geoCoords] },
    projection,
    visualCenterLonLat: center,
    visualCenterLocal,
    safeZoneLocalRings: [ring],
    outerLocal: ring,
    aspectRatio: 1,
    areaM2: Math.PI * radiusM * radiusM,
  };
}

export function pointInSafeZone(
  x: number,
  y: number,
  safeZoneLocalRings: Vec2[][],
  projection: LocalProjection
): boolean {
  if (safeZoneLocalRings.length === 0) return false;
  const poly = localRingsToLonLatPolygon(safeZoneLocalRings, projection);
  const ll = projection.toLonLat(x, y);
  return booleanPointInPolygon(point([ll.longitude, ll.latitude]), poly);
}

export function rectCornersInSafeZone(
  cx: number,
  cy: number,
  widthM: number,
  heightM: number,
  safeZoneLocalRings: Vec2[][],
  projection: LocalProjection
): boolean {
  const hw = widthM / 2;
  const hh = heightM / 2;
  const corners: Vec2[] = [
    { x: cx - hw, y: cy - hh },
    { x: cx + hw, y: cy - hh },
    { x: cx + hw, y: cy + hh },
    { x: cx - hw, y: cy + hh },
  ];
  return corners.every((c) =>
    pointInSafeZone(c.x, c.y, safeZoneLocalRings, projection)
  );
}

/** Approximate distance to safe-zone boundary (negative = outside). */
export function signedDistanceToSafeBoundary(
  x: number,
  y: number,
  safeOuter: Vec2[]
): number {
  if (safeOuter.length < 3) return 0;
  let minDist = Infinity;
  for (let i = 0; i < safeOuter.length; i += 1) {
    const a = safeOuter[i]!;
    const b = safeOuter[(i + 1) % safeOuter.length]!;
    const d = pointToSegmentDistance(x, y, a.x, a.y, b.x, b.y);
    minDist = Math.min(minDist, d);
  }
  // crude inside test via winding not available; caller uses PIP for inside
  return minDist;
}

function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-9) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
