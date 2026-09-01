import type { ZoomTier } from "./types";

const METERS_EARTH = 6_371_000;
const GLOBE_RADIUS = 2;
export const POSTER_DISPLAY_BOOST = 4.2;

function minimumDisplayHeight(
  tier: ZoomTier,
  posterScale: number
): number {
  const base =
    tier === "world" ? 0.09 : tier === "continent" ? 0.065 : 0.048;
  return base * posterScale;
}

export function posterDisplayHeightOnGlobe(
  heightM: number,
  tier: ZoomTier,
  posterScale: number
): number {
  const geographicHeight =
    (heightM / METERS_EARTH) * GLOBE_RADIUS * POSTER_DISPLAY_BOOST;
  return Math.max(geographicHeight, minimumDisplayHeight(tier, posterScale));
}

/** Geographic footprint matching the plane's actual rendered dimensions. */
export function posterDisplayFootprintMeters(
  heightM: number,
  tier: ZoomTier,
  posterScale: number
): { widthM: number; heightM: number } {
  const displayHeight = posterDisplayHeightOnGlobe(
    heightM,
    tier,
    posterScale
  );
  const footprintHeightM = (displayHeight / GLOBE_RADIUS) * METERS_EARTH;
  return {
    widthM: footprintHeightM * (2 / 3),
    heightM: footprintHeightM,
  };
}
