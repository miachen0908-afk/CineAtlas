import type {
  Feature,
  FeatureCollection,
  Geometry,
  Polygon,
  MultiPolygon,
  Position,
} from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import topologyData from "@/public/geo/countries-110m.json";

const topology = topologyData as unknown as Topology;

export type CountryFeature = {
  isoId: string;
  geometry: Polygon | MultiPolygon;
};

let cachedFeatures: CountryFeature[] | null = null;
let cachedCollection: FeatureCollection | null = null;

export function getCountryFeatureCollection(): FeatureCollection {
  if (cachedCollection) return cachedCollection;
  cachedCollection = feature(
    topology,
    topology.objects.countries
  ) as FeatureCollection;
  return cachedCollection;
}

export function getCountryFeatures(): CountryFeature[] {
  if (cachedFeatures) return cachedFeatures;

  const collection = getCountryFeatureCollection();
  const list: CountryFeature[] = [];

  for (const f of collection.features) {
    if (!f.geometry || f.id === undefined) continue;
    if (f.geometry.type !== "Polygon" && f.geometry.type !== "MultiPolygon") {
      continue;
    }
    list.push({
      isoId: String(f.id),
      geometry: f.geometry as Polygon | MultiPolygon,
    });
  }

  cachedFeatures = list;
  return list;
}

/** Ray-cast point-in-ring in lon/lat space. */
function pointInRing(lon: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!;
    const yi = ring[i]![1]!;
    const xj = ring[j]![0]!;
    const yj = ring[j]![1]!;
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygonCoords(
  lon: number,
  lat: number,
  coordinates: Position[][]
): boolean {
  if (coordinates.length === 0) return false;
  if (!pointInRing(lon, lat, coordinates[0]!)) return false;
  for (let h = 1; h < coordinates.length; h += 1) {
    if (pointInRing(lon, lat, coordinates[h]!)) return false;
  }
  return true;
}

function pointInGeometry(
  lon: number,
  lat: number,
  geometry: Polygon | MultiPolygon
): boolean {
  if (geometry.type === "Polygon") {
    return pointInPolygonCoords(lon, lat, geometry.coordinates);
  }
  for (const polygon of geometry.coordinates) {
    if (pointInPolygonCoords(lon, lat, polygon)) return true;
  }
  return false;
}

/** Find Natural Earth country id under a lat/lng. */
export function findCountryIsoAt(
  latitude: number,
  longitude: number
): string | null {
  for (const country of getCountryFeatures()) {
    if (pointInGeometry(longitude, latitude, country.geometry)) {
      return country.isoId;
    }
  }
  return null;
}

export function getFeatureByIso(isoId: string): Feature | undefined {
  return getCountryFeatureCollection().features.find(
    (f) => f.id !== undefined && String(f.id) === isoId
  );
}

export function isGeometry(
  geometry: Geometry | null | undefined
): geometry is Polygon | MultiPolygon {
  return (
    !!geometry &&
    (geometry.type === "Polygon" || geometry.type === "MultiPolygon")
  );
}
