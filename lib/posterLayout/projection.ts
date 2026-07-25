import type { LonLat, Vec2 } from "./types";

const METERS_PER_DEG_LAT = 111_320;

export type LocalProjection = {
  originLon: number;
  originLat: number;
  cosLat: number;
  toLocal(lon: number, lat: number): Vec2;
  toLonLat(x: number, y: number): LonLat;
};

/** Equirectangular local tangent plane around an origin (suitable for country-scale). */
export function createLocalProjection(
  originLon: number,
  originLat: number
): LocalProjection {
  const cosLat = Math.max(0.2, Math.cos((originLat * Math.PI) / 180));

  return {
    originLon,
    originLat,
    cosLat,
    toLocal(lon: number, lat: number): Vec2 {
      return {
        x: (lon - originLon) * METERS_PER_DEG_LAT * cosLat,
        y: (lat - originLat) * METERS_PER_DEG_LAT,
      };
    },
    toLonLat(x: number, y: number): LonLat {
      return {
        longitude: originLon + x / (METERS_PER_DEG_LAT * cosLat),
        latitude: originLat + y / METERS_PER_DEG_LAT,
      };
    },
  };
}

export function projectRing(
  ring: number[][],
  projection: LocalProjection
): Vec2[] {
  return ring.map(([lon, lat]) => projection.toLocal(lon!, lat!));
}
