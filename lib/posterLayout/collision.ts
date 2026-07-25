import type { AreaBand } from "@/lib/countryArea";
import type { Vec2, ZoomTier } from "./types";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function rectsOverlap(a: Rect, b: Rect, padding: number): boolean {
  const p = padding / 2;
  return !(
    a.x + a.width / 2 + p <= b.x - b.width / 2 - p ||
    a.x - a.width / 2 - p >= b.x + b.width / 2 + p ||
    a.y + a.height / 2 + p <= b.y - b.height / 2 - p ||
    a.y - a.height / 2 - p >= b.y + b.height / 2 + p
  );
}

export function collidesAny(
  candidate: Rect,
  placed: Rect[],
  padding: number
): boolean {
  return placed.some((r) => rectsOverlap(candidate, r, padding));
}

/** Fixed geographic poster sizes — never shrink to force-fit all films. */
export function posterSizeMeters(
  tier: ZoomTier,
  posterScale: number,
  band: AreaBand
): { widthM: number; heightM: number } {
  const heightByBand: Record<AreaBand, Record<ZoomTier, number>> = {
    tiny: { world: 22_000, continent: 16_000, country: 12_000 },
    small: { world: 55_000, continent: 38_000, country: 28_000 },
    medium: { world: 95_000, continent: 62_000, country: 42_000 },
    large: { world: 140_000, continent: 90_000, country: 55_000 },
    huge: { world: 200_000, continent: 120_000, country: 70_000 },
  };
  const heightM = heightByBand[band][tier] * posterScale;
  const widthM = heightM * (2 / 3);
  return { widthM, heightM };
}

export function gapPaddingMeters(heightM: number): number {
  return heightM * 0.2;
}

export function toRect(center: Vec2, widthM: number, heightM: number): Rect {
  return { x: center.x, y: center.y, width: widthM, height: heightM };
}
