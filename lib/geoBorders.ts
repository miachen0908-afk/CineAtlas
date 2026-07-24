import type { FeatureCollection, Geometry, Polygon, MultiPolygon } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import topologyData from "@/public/geo/countries-110m.json";
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

export function getCountryBorderLines(): CountryBorderLine[] {
  if (cachedBorderLines) return cachedBorderLines;

  const collection = feature(
    topology,
    topology.objects.countries
  ) as FeatureCollection;

  const lines: CountryBorderLine[] = [];

  for (const f of collection.features) {
    if (!f.geometry || f.id === undefined) continue;
    lines.push(...extractLines(f.geometry, String(f.id)));
  }

  cachedBorderLines = lines;
  return lines;
}
