import { pointInSafeZone } from "./geometry";
import type { LocalProjection } from "./projection";
import type { Vec2 } from "./types";

/**
 * Generate hex-lattice candidate centers inside the safe zone.
 * For elongated countries (aspect > 3), squeeze to 1–2 columns.
 */
export function generateHexCandidates(
  safeZoneLocalRings: Vec2[][],
  projection: LocalProjection,
  hexSpacingM: number,
  aspectRatio: number
): Vec2[] {
  const outer = safeZoneLocalRings[0];
  if (!outer || outer.length < 3) return [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of outer) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const spacing = Math.max(8_000, hexSpacingM);
  const rowH = spacing * 0.866_025; // √3/2
  const elongated = aspectRatio > 3;
  const cx = (minX + maxX) / 2;

  const points: Vec2[] = [];
  let row = 0;
  for (let y = minY; y <= maxY; y += rowH, row += 1) {
    const xOffset = row % 2 === 0 ? 0 : spacing / 2;
    for (let x = minX + xOffset; x <= maxX; x += spacing) {
      if (elongated) {
        // Keep at most two columns near centerline
        const colDist = Math.abs(x - cx);
        if (colDist > spacing * 0.75) continue;
      }
      if (pointInSafeZone(x, y, safeZoneLocalRings, projection)) {
        points.push({ x, y });
      }
    }
  }
  return points;
}
