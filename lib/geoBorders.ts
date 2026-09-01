import type {
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
  Position,
} from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import topologyData from "@/public/geo/countries-50m.json";
import { geoJsonRingToGlobePoints, type CountryBorderLine } from "@/utils/geo";

const topology = topologyData as unknown as Topology;

function extractLines(geometry: Geometry, id: string): CountryBorderLine[] {
  const lines: CountryBorderLine[] = [];

  if (geometry.type === "Polygon") {
    for (const ring of (geometry as Polygon).coordinates) {
      if (ring.length >= 2) {
        lines.push({ id, points: geoJsonRingToGlobePoints(ring) });
      }
    }
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of (geometry as MultiPolygon).coordinates) {
      for (const ring of polygon) {
        if (ring.length >= 2) {
          lines.push({ id, points: geoJsonRingToGlobePoints(ring) });
        }
      }
    }
  }

  return lines;
}

let cachedBorderLines: CountryBorderLine[] | null = null;
let cachedCollection: FeatureCollection | null = null;

function getVisualCountryCollection(): FeatureCollection {
  if (cachedCollection) return cachedCollection;
  cachedCollection = feature(
    topology,
    topology.objects.countries
  ) as FeatureCollection;
  return cachedCollection;
}

export function getCountryBorderLines(): CountryBorderLine[] {
  if (cachedBorderLines) return cachedBorderLines;

  const collection = getVisualCountryCollection();

  const lines: CountryBorderLine[] = [];

  for (const f of collection.features) {
    if (!f.geometry || f.id === undefined) continue;
    lines.push(...extractLines(f.geometry, String(f.id)));
  }

  cachedBorderLines = lines;
  return lines;
}

function pointInRing(lon: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    const intersects =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(
  lon: number,
  lat: number,
  coordinates: Position[][]
): boolean {
  if (!coordinates[0] || !pointInRing(lon, lat, coordinates[0])) return false;
  return !coordinates.slice(1).some((ring) => pointInRing(lon, lat, ring));
}

/** Resolve hover targets against the detailed visual geometry, not poster-layout geometry. */
export function findVisualCountryIsoAt(
  latitude: number,
  longitude: number
): string | null {
  for (const country of getVisualCountryCollection().features) {
    if (!country.geometry || country.id === undefined) continue;
    const geometry = country.geometry;
    const contains =
      geometry.type === "Polygon"
        ? pointInPolygon(longitude, latitude, geometry.coordinates)
        : geometry.type === "MultiPolygon"
          ? geometry.coordinates.some((polygon) =>
              pointInPolygon(longitude, latitude, polygon)
            )
          : false;
    if (contains) return String(country.id);
  }
  return null;
}
