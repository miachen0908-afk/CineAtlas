import * as THREE from "three";
import type { Film } from "@/types/cinema";

const EARTH_RADIUS = 2;

export function getEarthRadius(): number {
  return EARTH_RADIUS;
}

/** Convert latitude/longitude to a position on a sphere. */
export function latLngToVector3(
  latitude: number,
  longitude: number,
  radius: number = EARTH_RADIUS
): THREE.Vector3 {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/** Inverse of latLngToVector3 — for raycast hit → geographic lookup. */
export function vector3ToLatLng(position: THREE.Vector3): {
  latitude: number;
  longitude: number;
} {
  const p = position.clone().normalize();
  const latitude = 90 - (Math.acos(Math.max(-1, Math.min(1, p.y))) * 180) / Math.PI;
  const longitude =
    ((Math.atan2(p.z, -p.x) * 180) / Math.PI + 360) % 360 - 180;
  return { latitude, longitude };
}

export type FilmPosition = {
  film: Film;
  position: THREE.Vector3;
};

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

/** Spread films at the same location so stars don't fully overlap. */
export function spreadOverlappingStars(
  films: Film[],
  radius: number = EARTH_RADIUS,
  spreadAngle: number = 0.015
): FilmPosition[] {
  const groups = new Map<string, Film[]>();

  for (const film of films) {
    const key = coordKey(film.coordinates.latitude, film.coordinates.longitude);
    const group = groups.get(key) ?? [];
    group.push(film);
    groups.set(key, group);
  }

  const result: FilmPosition[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      const film = group[0];
      result.push({
        film,
        position: latLngToVector3(
          film.coordinates.latitude,
          film.coordinates.longitude,
          radius
        ),
      });
      continue;
    }

    group.forEach((film, index) => {
      const angle = (index / group.length) * Math.PI * 2;
      const latOffset = Math.sin(angle) * spreadAngle * 180 / Math.PI;
      const lngOffset = Math.cos(angle) * spreadAngle * 180 / Math.PI;
      result.push({
        film,
        position: latLngToVector3(
          film.coordinates.latitude + latOffset,
          film.coordinates.longitude + lngOffset,
          radius
        ),
      });
    });
  }

  return result;
}

/** Compute camera target position when focusing on a country center. */
export function countryFocusPosition(
  latitude: number,
  longitude: number,
  distance: number = 4.5
): THREE.Vector3 {
  const surface = latLngToVector3(latitude, longitude, EARTH_RADIUS);
  return surface.clone().normalize().multiplyScalar(distance);
}

export function latLngToSpherical(
  latitude: number,
  longitude: number
): { phi: number; theta: number } {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  return { phi, theta };
}

/** Convert a GeoJSON ring [lng, lat][] to globe surface points. */
export function geoJsonRingToGlobePoints(
  ring: number[][],
  radius: number = EARTH_RADIUS + 0.011
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  // Keep more samples so borders align tightly with fill meshes
  const step = ring.length > 240 ? Math.ceil(ring.length / 240) : 1;

  for (let i = 0; i < ring.length; i += step) {
    const [lng, lat] = ring[i];
    points.push(latLngToVector3(lat, lng, radius));
  }

  if (ring.length > 0) {
    const [lng, lat] = ring[0];
    points.push(latLngToVector3(lat, lng, radius));
  }

  return points;
}

export type CountryBorderLine = {
  id: string;
  points: THREE.Vector3[];
};

