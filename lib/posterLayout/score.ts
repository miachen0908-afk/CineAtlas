import {
  signedDistanceToSafeBoundary,
} from "./geometry";
import type { PosterCandidate, Vec2 } from "./types";

const W_CENTER = 1;
const W_BORDER = 0.55;

export function scoreCandidate(
  point: Vec2,
  center: Vec2,
  safeOuter: Vec2[]
): number {
  const distCenter = Math.hypot(point.x - center.x, point.y - center.y);
  const distBorder = signedDistanceToSafeBoundary(
    point.x,
    point.y,
    safeOuter
  );
  // Prefer near center (low dist) and far from border (high distBorder)
  return W_CENTER * distCenter - W_BORDER * distBorder;
}

export function rankCandidates(
  points: Vec2[],
  center: Vec2,
  safeOuter: Vec2[]
): PosterCandidate[] {
  return points
    .map((p) => ({
      x: p.x,
      y: p.y,
      score: scoreCandidate(p, center, safeOuter),
    }))
    .sort((a, b) => a.score - b.score);
}
