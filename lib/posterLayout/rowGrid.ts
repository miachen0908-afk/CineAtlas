import { rectCornersInLocalSafeZone } from "./geometry";
import type { Vec2 } from "./types";

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function getBounds(ring: Vec2[]): Bounds | null {
  if (ring.length < 3) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const point of ring) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, maxX, minY, maxY };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function centeredOffsets(maxNegative: number, maxPositive: number): number[] {
  const offsets = [0];
  const maximum = Math.max(maxNegative, maxPositive);
  for (let distance = 1; distance <= maximum; distance += 1) {
    if (distance <= maxNegative) offsets.push(-distance);
    if (distance <= maxPositive) offsets.push(distance);
  }
  return offsets;
}

function findValidOrigin(
  safeZoneLocalRings: Vec2[][],
  widthM: number,
  heightM: number,
  bounds: Bounds,
  visualCenter: Vec2,
  shiftX: number,
  shiftY: number
): Vec2 | null {
  const west = bounds.minX + widthM / 2;
  const east = bounds.maxX - widthM / 2;
  const south = bounds.minY + heightM / 2;
  const north = bounds.maxY - heightM / 2;
  if (west > east || south > north) return null;

  const desired = {
    x: clamp(visualCenter.x + shiftX, west, east),
    y: clamp(visualCenter.y + shiftY, south, north),
  };
  if (
    rectCornersInLocalSafeZone(
      desired.x,
      desired.y,
      widthM,
      heightM,
      safeZoneLocalRings
    )
  ) {
    return desired;
  }

  let best: Vec2 | null = null;
  let bestDistance = Infinity;
  const divisions = 28;
  for (let row = 0; row <= divisions; row += 1) {
    const y = south + ((north - south) * row) / divisions;
    for (let column = 0; column <= divisions; column += 1) {
      const x = west + ((east - west) * column) / divisions;
      if (
        !rectCornersInLocalSafeZone(
          x,
          y,
          widthM,
          heightM,
          safeZoneLocalRings
        )
      ) {
        continue;
      }
      const distance = Math.hypot(x - desired.x, y - desired.y);
      if (distance < bestDistance) {
        best = { x, y };
        bestDistance = distance;
      }
    }
  }
  return best;
}

function buildCandidateSet(
  safeZoneLocalRings: Vec2[][],
  widthM: number,
  heightM: number,
  paddingM: number,
  targetCount: number,
  visualCenter: Vec2,
  shiftX: number,
  shiftY: number
): Vec2[] {
  const outer = safeZoneLocalRings[0];
  if (!outer || targetCount <= 0) return [];

  const bounds = getBounds(outer);
  if (!bounds) return [];

  const stepX = Math.max(1, widthM + paddingM);
  const stepY = Math.max(1, heightM + paddingM);
  const west = bounds.minX + widthM / 2;
  const east = bounds.maxX - widthM / 2;
  const south = bounds.minY + heightM / 2;
  const north = bounds.maxY - heightM / 2;
  if (west > east || south > north) return [];

  const origin = findValidOrigin(
    safeZoneLocalRings,
    widthM,
    heightM,
    bounds,
    visualCenter,
    shiftX,
    shiftY
  );
  if (!origin) return [];
  const originX = origin.x;
  const originY = origin.y;
  const negativeRows = Math.floor((originY - south) / stepY);
  const positiveRows = Math.floor((north - originY) / stepY);
  const rowOffsets = centeredOffsets(negativeRows, positiveRows);
  const candidates: Vec2[] = [];
  const maximumProbes = Math.max(5_000, targetCount * 400);
  let probes = 0;

  for (const rowOffset of rowOffsets) {
    const y = originY + rowOffset * stepY;
    const negativeColumns = Math.floor((originX - west) / stepX);
    const positiveColumns = Math.floor((east - originX) / stepX);
    const columnOffsets = centeredOffsets(negativeColumns, positiveColumns);

    for (const columnOffset of columnOffsets) {
      probes += 1;
      if (probes > maximumProbes) return candidates;
      const x = originX + columnOffset * stepX;
      if (
        rectCornersInLocalSafeZone(
          x,
          y,
          widthM,
          heightM,
          safeZoneLocalRings
        )
      ) {
        candidates.push({ x, y });
        if (candidates.length >= targetCount) return candidates;
      }
    }
  }

  return candidates;
}

/**
 * Generate only as many deterministic portrait-poster positions as requested.
 * Search expands from the visual center, then the result is read north-to-south
 * and west-to-east for chronological assignment.
 */
export function generateHorizontalRowCandidates(
  safeZoneLocalRings: Vec2[][],
  widthM: number,
  heightM: number,
  paddingM: number,
  targetCount: number,
  visualCenter: Vec2
): Vec2[] {
  const stepX = Math.max(1, widthM + paddingM);
  const stepY = Math.max(1, heightM + paddingM);
  const variants = [
    { x: 0, y: 0 },
    { x: stepX / 2, y: 0 },
    { x: 0, y: stepY / 2 },
    { x: stepX / 2, y: stepY / 2 },
  ];

  let best: Vec2[] = [];
  for (const variant of variants) {
    const current = buildCandidateSet(
      safeZoneLocalRings,
      widthM,
      heightM,
      paddingM,
      targetCount,
      visualCenter,
      variant.x,
      variant.y
    );
    if (current.length > best.length) best = current;
    if (current.length >= targetCount) {
      best = current;
      break;
    }
  }

  return best.sort((a, b) => b.y - a.y || a.x - b.x);
}
