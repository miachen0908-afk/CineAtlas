import * as THREE from "three";
import type { Position } from "geojson";
import earcut from "earcut";
import { latLngToVector3, getEarthRadius } from "@/utils/geo";
import { getCountryFeatures } from "@/lib/countryLookup";

/** Keep fill meshes on the same shell as border lines for visual alignment. */
export const COUNTRY_SHELL_RADIUS = getEarthRadius() + 0.011;

export type CountryMeshData = {
  isoId: string;
  geometry: THREE.BufferGeometry;
};

function densifyRing(ring: Position[], maxStepDeg = 0.75): Position[] {
  if (ring.length < 2) return ring;
  const out: Position[] = [];
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [lon0, lat0] = ring[i]!;
    const [lon1, lat1] = ring[i + 1]!;
    out.push([lon0, lat0]);
    const dLon = lon1 - lon0;
    const dLat = lat1 - lat0;
    // Skip antimeridian jumps
    if (Math.abs(dLon) > 180) continue;
    const dist = Math.hypot(dLon, dLat);
    const steps = Math.floor(dist / maxStepDeg);
    for (let s = 1; s < steps; s += 1) {
      const t = s / steps;
      out.push([lon0 + dLon * t, lat0 + dLat * t]);
    }
  }
  const last = ring[ring.length - 1]!;
  out.push([last[0]!, last[1]!]);
  return out;
}

function ringToFlat(ring: Position[]): number[] {
  const flat: number[] = [];
  for (const [lng, lat] of ring) {
    flat.push(lng, lat);
  }
  return flat;
}

function triangulatePolygon(
  coordinates: Position[][],
  radius: number
): THREE.BufferGeometry | null {
  if (coordinates.length === 0) return null;
  const outer = densifyRing(coordinates[0]!);
  if (outer.length < 3) return null;

  const flat = ringToFlat(outer);
  const holeIndices: number[] = [];
  let holeOffset = outer.length;

  for (let h = 1; h < coordinates.length; h += 1) {
    const hole = densifyRing(coordinates[h]!, 1.2);
    holeIndices.push(holeOffset);
    for (const [lng, lat] of hole) {
      flat.push(lng, lat);
    }
    holeOffset += hole.length;
  }

  const indices = earcut(flat, holeIndices.length > 0 ? holeIndices : undefined, 2);
  if (indices.length === 0) return null;

  // Indexed geometry — preserve shared vertices so edges match rings
  const vertexCount = flat.length / 2;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i += 1) {
    const lng = flat[i * 2]!;
    const lat = flat[i * 2 + 1]!;
    const vertex = latLngToVector3(lat, lng, radius);
    positions[i * 3] = vertex.x;
    positions[i * 3 + 1] = vertex.y;
    positions[i * 3 + 2] = vertex.z;
    const n = vertex.clone().normalize();
    normals[i * 3] = n.x;
    normals[i * 3 + 1] = n.y;
    normals[i * 3 + 2] = n.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setIndex(Array.from(indices));
  return geometry;
}

let cached: CountryMeshData[] | null = null;

export function getCountryMeshes(): CountryMeshData[] {
  if (cached) return cached;

  const meshes: CountryMeshData[] = [];

  for (const country of getCountryFeatures()) {
    const { isoId, geometry } = country;
    if (geometry.type === "Polygon") {
      const geo = triangulatePolygon(geometry.coordinates, COUNTRY_SHELL_RADIUS);
      if (geo) meshes.push({ isoId, geometry: geo });
    } else {
      for (const polygon of geometry.coordinates) {
        const geo = triangulatePolygon(polygon, COUNTRY_SHELL_RADIUS);
        if (geo) meshes.push({ isoId, geometry: geo });
      }
    }
  }

  cached = meshes;
  return meshes;
}
