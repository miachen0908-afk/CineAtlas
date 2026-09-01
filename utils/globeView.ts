import { countryFocusPosition, getEarthRadius } from "@/utils/geo";

const CHINA_CENTER = {
  latitude: 35,
  longitude: 105,
} as const;

export const GLOBE_VISUAL_RADIUS = getEarthRadius() * 1.25;
export const FINAL_GLOBE_DIAMETER_FRACTION = 0.72;

export function chinaCenteredCameraPosition(distance: number) {
  return countryFocusPosition(
    CHINA_CENTER.latitude,
    CHINA_CENTER.longitude,
    distance
  );
}

export function fittedGlobeCameraDistance({
  verticalFovDegrees,
  aspect,
  diameterFraction = FINAL_GLOBE_DIAMETER_FRACTION,
  visualRadius = GLOBE_VISUAL_RADIUS,
}: {
  verticalFovDegrees: number;
  aspect: number;
  diameterFraction?: number;
  visualRadius?: number;
}): number {
  const safeAspect = Math.max(aspect, 0.1);
  const safeFraction = Math.min(0.95, Math.max(0.1, diameterFraction));
  const verticalHalfFov = (verticalFovDegrees * Math.PI) / 360;
  const horizontalHalfFov = Math.atan(
    Math.tan(verticalHalfFov) * safeAspect
  );
  const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);
  const targetAngularRadius = Math.atan(
    Math.tan(limitingHalfFov) * safeFraction
  );

  return visualRadius / Math.sin(targetAngularRadius);
}
