import type { ZoomTier } from "./types";

export function distanceToTier(distance: number): ZoomTier {
  if (distance > 6.2) return "world";
  if (distance >= 4.2) return "continent";
  return "country";
}
