/**
 * Bake original equirectangular day/night globe textures for Cesium SingleTileImageryProvider.
 * Colors match the illustrated map language (PANTONE 9224 C land, depth ocean, NCS border).
 * No third-party artist assets.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import type { FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import type { Topology } from "topojson-specification";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "textures", "cesium");

const LAND = { r: 242, g: 233, b: 219 }; // PANTONE 9224 C
const BORDER = { r: 16, g: 191, b: 155 }; // NCS S 1055-B90G
const NIGHT_LAND = { r: 28, g: 36, b: 52 };
const CITY_LIGHT = { r: 255, g: 196, b: 96 };

type RGB = { r: number; g: number; b: number };

const OCEAN_STOPS: Array<{ t: number; c: RGB }> = [
  { t: 0, c: { r: 148, g: 192, b: 222 } },
  { t: 0.05, c: { r: 98, g: 162, b: 208 } },
  { t: 0.16, c: { r: 52, g: 118, b: 182 } },
  { t: 0.36, c: { r: 28, g: 72, b: 148 } },
  { t: 0.58, c: { r: 14, g: 42, b: 102 } },
  { t: 0.8, c: { r: 8, g: 24, b: 62 } },
  { t: 1, c: { r: 4, g: 12, b: 34 } },
];

const NIGHT_OCEAN_STOPS: Array<{ t: number; c: RGB }> = [
  { t: 0, c: { r: 18, g: 32, b: 58 } },
  { t: 0.35, c: { r: 8, g: 16, b: 36 } },
  { t: 1, c: { r: 2, g: 6, b: 18 } },
];

function lerp(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function sampleStops(stops: Array<{ t: number; c: RGB }>, t: number): RGB {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    if (x <= b.t) {
      const u = (x - a.t) / (b.t - a.t || 1);
      return lerp(a.c, b.c, u);
    }
  }
  return stops[stops.length - 1]!.c;
}

function pointInRing(lon: number, lat: number, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!;
    const yi = ring[i]![1]!;
    const xj = ring[j]![0]!;
    const yj = ring[j]![1]!;
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lon: number, lat: number, geometry: Polygon | MultiPolygon): boolean {
  const polys =
    geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.coordinates;
  for (const poly of polys) {
    const outer = poly[0];
    if (!outer || !pointInRing(lon, lat, outer)) continue;
    let inHole = false;
    for (let h = 1; h < poly.length; h += 1) {
      if (pointInRing(lon, lat, poly[h]!)) {
        inHole = true;
        break;
      }
    }
    if (!inHole) return true;
  }
  return false;
}

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

async function writePng(
  filePath: string,
  width: number,
  height: number,
  rgb: Buffer
): Promise<void> {
  await sharp(rgb, { raw: { width, height, channels: 3 } })
    .png({ compressionLevel: 6 })
    .toFile(filePath);
}

function bake(width: number, height: number, countries: FeatureCollection) {
  const landMask = new Uint8Array(width * height);
  const features = countries.features
    .filter(
      (f) =>
        f.geometry &&
        (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
    )
    .map((f) => {
      const geometry = f.geometry as Polygon | MultiPolygon;
      let minLon = 180;
      let maxLon = -180;
      let minLat = 90;
      let maxLat = -90;
      const polys =
        geometry.type === "Polygon"
          ? [geometry.coordinates]
          : geometry.coordinates;
      for (const poly of polys) {
        for (const [lon, lat] of poly[0] ?? []) {
          minLon = Math.min(minLon, lon!);
          maxLon = Math.max(maxLon, lon!);
          minLat = Math.min(minLat, lat!);
          maxLat = Math.max(maxLat, lat!);
        }
      }
      return { geometry, minLon, maxLon, minLat, maxLat };
    });

  // Coarse sampling for land mask
  for (let y = 0; y < height; y += 1) {
    const lat = 90 - ((y + 0.5) / height) * 180;
    for (let x = 0; x < width; x += 1) {
      const lon = ((x + 0.5) / width) * 360 - 180;
      let land = false;
      for (const f of features) {
        if (
          lon < f.minLon ||
          lon > f.maxLon ||
          lat < f.minLat ||
          lat > f.maxLat
        ) {
          continue;
        }
        if (pointInPolygon(lon, lat, f.geometry)) {
          land = true;
          break;
        }
      }
      landMask[y * width + x] = land ? 1 : 0;
    }
  }

  // Distance field (chamfer)
  const INF = 1e8;
  const dist = new Float32Array(width * height);
  for (let i = 0; i < dist.length; i += 1) dist[i] = landMask[i] ? 0 : INF;
  const at = (x: number, y: number) =>
    y * width + ((((x % width) + width) % width));

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

  const depthReach = Math.max(40, width * 0.085);
  const day = Buffer.alloc(width * height * 3);
  const night = Buffer.alloc(width * height * 3);

  const citySeeds = [
    [116.4, 39.9],
    [139.65, 35.68],
    [2.35, 48.86],
    [-74.0, 40.71],
    [121.5, 31.2],
    [126.98, 37.57],
    [-0.13, 51.5],
    [151.2, -33.87],
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const o = i * 3;
      const lon = ((x + 0.5) / width) * 360 - 180;
      const lat = 90 - ((y + 0.5) / height) * 180;

      if (landMask[i]) {
        const grain = hash2(x * 0.2, y * 0.33) * 8 - 4;
        day[o] = Math.min(255, Math.max(0, LAND.r + grain));
        day[o + 1] = Math.min(255, Math.max(0, LAND.g + grain));
        day[o + 2] = Math.min(255, Math.max(0, LAND.b + grain * 0.5));

        // Soft border near coast
        let nearOcean = false;
        for (let oy = -1; oy <= 1 && !nearOcean; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            const nx = (x + ox + width) % width;
            const ny = Math.min(height - 1, Math.max(0, y + oy));
            if (!landMask[ny * width + nx]) nearOcean = true;
          }
        }
        if (nearOcean) {
          day[o] = Math.round(day[o]! * 0.55 + BORDER.r * 0.45);
          day[o + 1] = Math.round(day[o + 1]! * 0.55 + BORDER.g * 0.45);
          day[o + 2] = Math.round(day[o + 2]! * 0.55 + BORDER.b * 0.45);
        }

        night[o] = NIGHT_LAND.r;
        night[o + 1] = NIGHT_LAND.g;
        night[o + 2] = NIGHT_LAND.b;

        for (const [clon, clat] of citySeeds) {
          const dLon = Math.abs(lon - clon!);
          const dLat = Math.abs(lat - clat!);
          const d = Math.hypot(dLon, dLat);
          if (d < 1.2) {
            const w = Math.max(0, 1 - d / 1.2);
            const glow = w * w * (0.5 + hash2(x, y) * 0.5);
            night[o] = Math.min(
              255,
              night[o]! * (1 - glow) + CITY_LIGHT.r * glow
            );
            night[o + 1] = Math.min(
              255,
              night[o + 1]! * (1 - glow) + CITY_LIGHT.g * glow
            );
            night[o + 2] = Math.min(
              255,
              night[o + 2]! * (1 - glow) + CITY_LIGHT.b * glow
            );
          }
        }
        continue;
      }

      const raw = Math.min(1, dist[i]! / depthReach);
      const depth = Math.pow(raw, 0.62);
      const dayC = sampleStops(OCEAN_STOPS, depth);
      const nightC = sampleStops(NIGHT_OCEAN_STOPS, depth);
      const grain = hash2(x * 0.41, y * 0.37) * 4 - 2;
      day[o] = Math.min(255, Math.max(0, dayC.r + grain));
      day[o + 1] = Math.min(255, Math.max(0, dayC.g + grain));
      day[o + 2] = Math.min(255, Math.max(0, dayC.b + grain * 0.4));
      night[o] = nightC.r;
      night[o + 1] = nightC.g;
      night[o + 2] = nightC.b;
    }
  }

  return { day, night };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const topology = require(
    path.join(root, "public/geo/countries-110m.json")
  ) as Topology;
  const countries = feature(
    topology,
    topology.objects.countries
  ) as FeatureCollection;

  console.log("Baking full textures 1024×512…");
  const full = bake(1024, 512, countries);
  await writePng(path.join(outDir, "earth-day.png"), 1024, 512, full.day);
  await writePng(path.join(outDir, "earth-night.png"), 1024, 512, full.night);

  console.log("Baking fallback textures 256×128…");
  const fallback = bake(256, 128, countries);
  await writePng(
    path.join(outDir, "earth-day-fallback.png"),
    256,
    128,
    fallback.day
  );
  await writePng(
    path.join(outDir, "earth-night-fallback.png"),
    256,
    128,
    fallback.night
  );

  console.log("Wrote textures to", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
