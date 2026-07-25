"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { Position } from "geojson";
import { getCountryFeatures } from "@/lib/countryLookup";

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise2(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function fbm(x: number, y: number): number {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i += 1) {
    v += a * noise2(x * f, y * f);
    a *= 0.5;
    f *= 2;
  }
  return v;
}

function lonLatToPixel(
  lon: number,
  lat: number,
  width: number,
  height: number
): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * width,
    y: ((90 - lat) / 180) * height,
  };
}

/** Split a ring into continuous segments that do not cross the antimeridian. */
function splitRingAtAntimeridian(ring: Position[]): Position[][] {
  if (ring.length < 2) return [];
  const segments: Position[][] = [];
  let current: Position[] = [ring[0]!];

  for (let i = 1; i < ring.length; i += 1) {
    const prev = ring[i - 1]!;
    const next = ring[i]!;
    const dLon = next[0]! - prev[0]!;
    if (Math.abs(dLon) > 180) {
      if (current.length >= 2) segments.push(current);
      current = [next];
    } else {
      current.push(next);
    }
  }

  if (current.length >= 2) segments.push(current);
  return segments;
}

function strokeRingSegments(
  ctx: CanvasRenderingContext2D,
  ring: Position[],
  width: number,
  height: number
): void {
  for (const segment of splitRingAtAntimeridian(ring)) {
    if (segment.length < 2) continue;
    const first = lonLatToPixel(segment[0]![0]!, segment[0]![1]!, width, height);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < segment.length; i += 1) {
      const p = lonLatToPixel(segment[i]![0]!, segment[i]![1]!, width, height);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
}

/**
 * Fill a polygon without drawing across the antimeridian.
 * If the outer ring wraps, fill each continuous segment as its own path
 * (holes only applied when the outer ring does not wrap).
 */
function fillPolygonSafe(
  ctx: CanvasRenderingContext2D,
  rings: Position[][],
  width: number,
  height: number
): void {
  const outer = rings[0];
  if (!outer || outer.length < 3) return;

  const outerSegments = splitRingAtAntimeridian(outer);
  const wraps = outerSegments.length > 1;

  if (!wraps) {
    ctx.beginPath();
    const first = lonLatToPixel(outer[0]![0]!, outer[0]![1]!, width, height);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < outer.length; i += 1) {
      const p = lonLatToPixel(outer[i]![0]!, outer[i]![1]!, width, height);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    for (let h = 1; h < rings.length; h += 1) {
      const hole = rings[h]!;
      const holeSegs = splitRingAtAntimeridian(hole);
      // Skip holes that wrap — safer than painting a meridian strip
      if (holeSegs.length !== 1) continue;
      const seg = holeSegs[0]!;
      const hf = lonLatToPixel(seg[0]![0]!, seg[0]![1]!, width, height);
      ctx.moveTo(hf.x, hf.y);
      for (let i = 1; i < seg.length; i += 1) {
        const p = lonLatToPixel(seg[i]![0]!, seg[i]![1]!, width, height);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
    }
    ctx.fill("evenodd");
    return;
  }

  // Wrapping outer: fill each non-wrapping segment closed on itself
  for (const segment of outerSegments) {
    if (segment.length < 3) continue;
    ctx.beginPath();
    const first = lonLatToPixel(segment[0]![0]!, segment[0]![1]!, width, height);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < segment.length; i += 1) {
      const p = lonLatToPixel(segment[i]![0]!, segment[i]![1]!, width, height);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function forEachPolygon(
  geometry: { type: string; coordinates: Position[][] | Position[][][] },
  fn: (rings: Position[][]) => void
): void {
  if (geometry.type === "Polygon") {
    fn(geometry.coordinates as Position[][]);
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates as Position[][][]) {
      fn(polygon);
    }
  }
}

type RGB = { r: number; g: number; b: number };

/** Coast → abyss; pale band kept narrow, mid/deep blues dominate. */
const OCEAN_STOPS: Array<{ t: number; c: RGB }> = [
  { t: 0, c: { r: 148, g: 192, b: 222 } },
  { t: 0.05, c: { r: 98, g: 162, b: 208 } },
  { t: 0.16, c: { r: 52, g: 118, b: 182 } },
  { t: 0.36, c: { r: 28, g: 72, b: 148 } },
  { t: 0.58, c: { r: 14, g: 42, b: 102 } },
  { t: 0.8, c: { r: 8, g: 24, b: 62 } },
  { t: 1, c: { r: 4, g: 12, b: 34 } },
];

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function sampleOceanDepthColor(t: number): RGB {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < OCEAN_STOPS.length - 1; i += 1) {
    const a = OCEAN_STOPS[i]!;
    const b = OCEAN_STOPS[i + 1]!;
    if (x <= b.t) {
      const u = smoothstep((x - a.t) / (b.t - a.t || 1));
      return lerpRGB(a.c, b.c, u);
    }
  }
  return OCEAN_STOPS[OCEAN_STOPS.length - 1]!.c;
}

/** Approximate Euclidean distance to land; X wraps for antimeridian. */
function distanceToLand(
  isLand: Uint8Array,
  width: number,
  height: number
): Float32Array {
  const INF = 1e8;
  const dist = new Float32Array(width * height);
  for (let i = 0; i < dist.length; i += 1) {
    dist[i] = isLand[i] ? 0 : INF;
  }

  const at = (x: number, y: number) => y * width + ((x % width) + width) % width;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      if (dist[i] === 0) continue;
      let d = dist[i]!;
      d = Math.min(d, dist[at(x - 1, y)]! + 1);
      if (y > 0) {
        d = Math.min(d, dist[(y - 1) * width + x]! + 1);
        d = Math.min(d, dist[at(x - 1, y - 1)]! + 1.414);
        d = Math.min(d, dist[at(x + 1, y - 1)]! + 1.414);
      }
      dist[i] = d;
    }
  }

  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = width - 1; x >= 0; x -= 1) {
      const i = y * width + x;
      if (dist[i] === 0) continue;
      let d = dist[i]!;
      d = Math.min(d, dist[at(x + 1, y)]! + 1);
      if (y < height - 1) {
        d = Math.min(d, dist[(y + 1) * width + x]! + 1);
        d = Math.min(d, dist[at(x - 1, y + 1)]! + 1.414);
        d = Math.min(d, dist[at(x + 1, y + 1)]! + 1.414);
      }
      dist[i] = d;
    }
  }

  return dist;
}

export type IllustratedTextures = {
  earthMap: THREE.CanvasTexture;
  cloudsMap: THREE.CanvasTexture;
};

/** Flat illustration earth: depth-graded ocean, pale-yellow land, green borders, white clouds. */
export function createIllustratedEarthTextures(size = 2048): IllustratedTextures {
  const width = size;
  const height = size / 2;
  const countries = getCountryFeatures();

  const earthCanvas = document.createElement("canvas");
  earthCanvas.width = width;
  earthCanvas.height = height;
  const earthCtx = earthCanvas.getContext("2d")!;

  const cloudsCanvas = document.createElement("canvas");
  cloudsCanvas.width = width;
  cloudsCanvas.height = height;
  const cloudsCtx = cloudsCanvas.getContext("2d")!;

  // Clear then paint land (PANTONE 9224 C ≈ #F2E9DB) + binary mask for distance field
  earthCtx.fillStyle = "#000000";
  earthCtx.fillRect(0, 0, width, height);

  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const maskCtx = maskCanvas.getContext("2d")!;
  maskCtx.fillStyle = "#000000";
  maskCtx.fillRect(0, 0, width, height);
  maskCtx.fillStyle = "#ffffff";

  earthCtx.fillStyle = "#F2E9DB";
  for (const country of countries) {
    forEachPolygon(country.geometry, (rings) => {
      fillPolygonSafe(earthCtx, rings, width, height);
      fillPolygonSafe(maskCtx, rings, width, height);
    });
  }

  const pixels = earthCtx.getImageData(0, 0, width, height);
  const maskPixels = maskCtx.getImageData(0, 0, width, height);
  const landMask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i += 1) {
    landMask[i] = maskPixels.data[i * 4]! > 127 ? 1 : 0;
  }

  const distField = distanceToLand(landMask, width, height);
  // Slightly shorter reach → mid/deep blues arrive sooner (less pale shelf)
  const depthReach = Math.max(64, width * 0.085);

  // PANTONE 9224 C base RGB
  const landR = 242;
  const landG = 233;
  const landB = 219;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const o = i * 4;
      if (landMask[i]) {
        const grain = hash2(x * 0.2, y * 0.33) * 10 - 5;
        pixels.data[o] = Math.min(255, Math.max(0, landR + grain));
        pixels.data[o + 1] = Math.min(255, Math.max(0, landG + grain));
        pixels.data[o + 2] = Math.min(255, Math.max(0, landB + grain * 0.5));
        pixels.data[o + 3] = 255;
        continue;
      }

      // Soft coast→abyss (cheap noise — avoid multi-octave fbm per pixel)
      const raw = Math.min(1, distField[i]! / depthReach);
      const wave = (hash2(x * 0.07, y * 0.09) - 0.5) * 0.06;
      const depth = smoothstep(
        Math.min(1, Math.max(0, Math.pow(raw, 0.62) + wave))
      );
      const color = sampleOceanDepthColor(depth);
      const grain = hash2(x * 0.41, y * 0.37) * 5 - 2.5;

      pixels.data[o] = Math.min(255, Math.max(0, color.r + grain));
      pixels.data[o + 1] = Math.min(255, Math.max(0, color.g + grain));
      pixels.data[o + 2] = Math.min(255, Math.max(0, color.b + grain * 0.4));
      pixels.data[o + 3] = 255;
    }
  }
  earthCtx.putImageData(pixels, 0, 0);

  // NCS S 1055-B90G ≈ #10BF9B borders — skip antimeridian jumps
  earthCtx.strokeStyle = "rgba(16, 191, 155, 0.88)";
  earthCtx.lineWidth = Math.max(1.5, size / 900);
  earthCtx.lineJoin = "round";
  earthCtx.lineCap = "round";
  for (const country of countries) {
    forEachPolygon(country.geometry, (rings) => {
      strokeRingSegments(earthCtx, rings[0]!, width, height);
    });
  }

  // Clouds — irregular white blobs (sample every 2px then upsample via fill)
  const cloudsImg = cloudsCtx.createImageData(width, height);
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const u = x / width;
      const v = y / height;
      const shape = fbm(u * 8 + 3.1, v * 4.2 + 1.7);
      const cloud = Math.pow(Math.max(0, shape - 0.52), 1.35);
      const grain = hash2(x * 0.5, y * 0.5);
      const whiteness = 235 + grain * 20;
      const a = Math.floor(cloud * 160);
      for (let oy = 0; oy < 2; oy += 1) {
        for (let ox = 0; ox < 2; ox += 1) {
          const xx = Math.min(width - 1, x + ox);
          const yy = Math.min(height - 1, y + oy);
          const i = (yy * width + xx) * 4;
          cloudsImg.data[i] = whiteness;
          cloudsImg.data[i + 1] = whiteness;
          cloudsImg.data[i + 2] = Math.min(255, whiteness + 5);
          cloudsImg.data[i + 3] = a;
        }
      }
    }
  }
  cloudsCtx.putImageData(cloudsImg, 0, 0);

  const earthMap = new THREE.CanvasTexture(earthCanvas);
  earthMap.colorSpace = THREE.SRGBColorSpace;
  earthMap.anisotropy = 16;
  earthMap.generateMipmaps = true;
  earthMap.minFilter = THREE.LinearMipmapLinearFilter;
  earthMap.magFilter = THREE.LinearFilter;
  earthMap.needsUpdate = true;

  const cloudsMap = new THREE.CanvasTexture(cloudsCanvas);
  cloudsMap.colorSpace = THREE.SRGBColorSpace;
  cloudsMap.anisotropy = 8;
  cloudsMap.generateMipmaps = true;
  cloudsMap.minFilter = THREE.LinearMipmapLinearFilter;
  cloudsMap.magFilter = THREE.LinearFilter;
  cloudsMap.needsUpdate = true;

  return { earthMap, cloudsMap };
}

export function useIllustratedEarthTextures(size = 2048): IllustratedTextures {
  return useMemo(() => createIllustratedEarthTextures(size), [size]);
}
