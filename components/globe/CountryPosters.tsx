"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { FilmPreviewAnchor } from "@/components/film/AnchoredFilmPreviewCard";
import type { Film } from "@/types/cinema";
import { countries } from "@/lib/data";
import { COUNTRY_ISO_NUMERIC, isCountryHotspot } from "@/lib/countryIso";
import {
  computeCountryPosterLayout,
  distanceToTier,
  type CountryPosterLayoutResult,
  type LayoutFilmInput,
  type LayoutRequest,
  type PlacedPoster,
  type ZoomTier,
} from "@/lib/posterLayout";
import { getEarthRadius, getNorthTiltedPosterTransform, latLngToVector3 } from "@/utils/geo";

type CountryPostersProps = {
  films: Film[];
  selectedFilmId: string | null;
  posterScale: number;
  isMobile: boolean;
  reducedMotion: boolean;
  introHidden?: boolean;
  revealDelayMs?: number;
  revealDurationMs?: number;
  onSelectFilm: (id: string, anchor: FilmPreviewAnchor) => void;
};
type AtlasSlot = { page: number; uv: [number, number, number, number] };
type AtlasManifest = {
  version: number;
  variants: Record<"desktop" | "mobile", { pages: string[] }>;
  entries: Record<string, Partial<Record<"desktop" | "mobile", AtlasSlot>>>;
};
type PosterItem = {
  placed: PlacedPoster;
  filmId: string;
  matrix: THREE.Matrix4;
  inverseMatrix: THREE.Matrix4;
  normal: THREE.Vector3;
  color: THREE.Color;
  reveal: number;
  atlas?: AtlasSlot;
};
type WorkerResponse = { requestId: number; layout: CountryPosterLayoutResult; complete: boolean };

const GLOBE_R = getEarthRadius() + 0.032;
const POSTER_TILT_DEGREES = 27;
const SELECTED_RADIAL_LIFT = 0.018;
const WHITE_TEXTURE = (() => {
  const texture = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
})();

const vertexShader = /* glsl */ `
  attribute vec4 instanceUvRect;
  attribute vec3 instanceTint;
  attribute float instanceReveal;
  varying vec2 vAtlasUv;
  varying vec3 vTint;
  varying float vFacing;
  varying float vReveal;
  void main() {
    vec4 worldCenter = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vFacing = dot(normalize(worldCenter.xyz), normalize(cameraPosition));
    vAtlasUv = instanceUvRect.xy + uv * instanceUvRect.zw;
    vTint = instanceTint;
    vReveal = instanceReveal;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uProgress;
  varying vec2 vAtlasUv;
  varying vec3 vTint;
  varying float vFacing;
  varying float vReveal;
  void main() {
    float alpha = smoothstep(0.02, 0.4, vFacing) * smoothstep(vReveal, vReveal + 0.12, uProgress);
    if (alpha < 0.01) discard;
    vec4 sampled = texture2D(uMap, vAtlasUv);
    vec3 color = mix(vTint, sampled.rgb, uHasMap);
    gl_FragColor = vec4(color, alpha * mix(1.0, sampled.a, uHasMap));
  }
`;

function toLayoutFilm(film: Film): LayoutFilmInput {
  return {
    id: film.id, titleZh: film.titleZh, featuredPriority: 100,
    posterColor: film.posterColor ?? "#3a8fb7", posterUrl: film.posterUrl,
    year: film.year, rating: film.rating, genreIds: film.genreIds,
  };
}

function getPosterScreenAnchor(matrix: THREE.Matrix4, camera: THREE.Camera, canvas: HTMLCanvasElement): FilmPreviewAnchor {
  camera.updateMatrixWorld();
  const rect = canvas.getBoundingClientRect();
  const corners = [
    new THREE.Vector3(-0.5, -0.5, 0), new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(-0.5, 0.5, 0),
  ].map((corner) => {
    const p = corner.applyMatrix4(matrix).project(camera);
    return { x: rect.left + ((p.x + 1) / 2) * rect.width, y: rect.top + ((1 - p.y) / 2) * rect.height };
  });
  const xs = corners.map((p) => p.x), ys = corners.map((p) => p.y);
  const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
  return { top, right, bottom, left, width: right - left, height: bottom - top };
}

function makeItem(placed: PlacedPoster, index: number, total: number, atlas?: AtlasSlot, selected = false): PosterItem {
  const height = placed.displayHeightGlobe;
  const width = height * (2 / 3);
  const transform = getNorthTiltedPosterTransform(
    placed.lat, placed.lon, width, height, GLOBE_R, POSTER_TILT_DEGREES, 0.006,
    selected ? SELECTED_RADIAL_LIFT : 0
  );
  return {
    placed,
    filmId: placed.filmId,
    matrix: new THREE.Matrix4().compose(transform.position, transform.quaternion, new THREE.Vector3(width, height, 1)),
    inverseMatrix: new THREE.Matrix4().compose(transform.position, transform.quaternion, new THREE.Vector3(width, height, 1)).invert(),
    normal: transform.surfaceNormal,
    color: new THREE.Color(placed.posterColor),
    reveal: Math.min(0.86, (index / Math.max(1, total)) * 0.82),
    atlas,
  };
}

function useProgressiveLayouts(requests: LayoutRequest[]) {
  const [layouts, setLayouts] = useState<CountryPosterLayoutResult[]>([]);
  const requestId = useRef(0);
  useEffect(() => {
    const currentId = ++requestId.current;
    const clearTimer = window.setTimeout(() => setLayouts([]), 0);
    if (requests.length === 0) return () => window.clearTimeout(clearTimer);
    let disposed = false;
    let worker: Worker | null = null;
    const runFallback = () => {
      let index = 0;
      const step = () => {
        if (disposed || currentId !== requestId.current) return;
        const deadline = Date.now() + 10;
        const next: CountryPosterLayoutResult[] = [];
        while (index < requests.length && Date.now() < deadline) next.push(computeCountryPosterLayout(requests[index++]!));
        if (next.length) setLayouts((current) => [...current, ...next]);
        if (index < requests.length) window.setTimeout(step, 0);
      };
      step();
    };
    try {
      worker = new Worker(new URL("./posterLayout.worker.ts", import.meta.url));
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (!disposed && event.data.requestId === currentId) setLayouts((current) => [...current, event.data.layout]);
      };
      worker.onerror = () => { worker?.terminate(); worker = null; if (!disposed) runFallback(); };
      worker.postMessage({ requestId: currentId, requests });
    } catch { runFallback(); }
    return () => { window.clearTimeout(clearTimer); disposed = true; worker?.terminate(); };
  }, [requests]);
  return layouts;
}

function useAtlasManifest() {
  const [manifest, setManifest] = useState<AtlasManifest | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/poster-atlas/manifest.json", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((value: AtlasManifest) => setManifest(value)).catch(() => undefined);
    return () => controller.abort();
  }, []);
  return manifest;
}

function useProgressiveAtlasTextures(manifest: AtlasManifest | null, variant: "desktop" | "mobile", neededPages: number[]) {
  const [textures, setTextures] = useState<Map<number, THREE.Texture>>(new Map());
  const loading = useRef(new Set<number>());
  const texturesRef = useRef(new Map<number, THREE.Texture>());
  const mounted = useRef(true);
  const pagesKey = neededPages.join(",");
  useEffect(() => {
    if (!manifest) return;
    const loader = new THREE.TextureLoader();
    const queue = neededPages.filter((page) => !texturesRef.current.has(page) && !loading.current.has(page));
    queue.forEach((page, index) => {
      loading.current.add(page);
      window.setTimeout(async () => {
        try {
          const texture = await loader.loadAsync(manifest.variants[variant].pages[page]!);
          if (!mounted.current) { texture.dispose(); return; }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texturesRef.current.set(page, texture);
          setTextures(new Map(texturesRef.current));
        } catch { /* Keep the color fallback for a failed page. */ }
        finally { loading.current.delete(page); }
      }, index * 90);
    });
    // pagesKey is the stable primitive representation of neededPages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, pagesKey, variant]);
  useEffect(() => () => {
    mounted.current = false;
    for (const texture of texturesRef.current.values()) texture.dispose();
    texturesRef.current.clear();
  }, []);
  return textures;
}

function PosterBatch({ items, texture, introHidden, reducedMotion, revealDelayMs, revealDurationMs }: {
  items: PosterItem[]; texture?: THREE.Texture; introHidden: boolean; reducedMotion: boolean;
  revealDelayMs: number; revealDurationMs: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const initialProgress = introHidden ? 0 : reducedMotion ? 2 : -revealDelayMs / revealDurationMs;
  const progress = useRef(initialProgress);
  const wasIntroHidden = useRef(introHidden);
  const geometry = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1);
    const result = new THREE.InstancedBufferGeometry();
    result.index = base.index;
    for (const name of ["position", "normal", "uv"] as const) result.setAttribute(name, base.getAttribute(name).clone());
    result.setAttribute("instanceUvRect", new THREE.InstancedBufferAttribute(new Float32Array(items.flatMap((item) => item.atlas?.uv ?? [0, 0, 1, 1])), 4));
    result.setAttribute("instanceTint", new THREE.InstancedBufferAttribute(new Float32Array(items.flatMap((item) => item.color.toArray())), 3));
    result.setAttribute("instanceReveal", new THREE.InstancedBufferAttribute(new Float32Array(items.map((item) => item.reveal)), 1));
    base.dispose();
    return result;
  }, [items]);
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    items.forEach((item, index) => meshRef.current!.setMatrixAt(index, item.matrix));
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [items]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => {
    if (introHidden) {
      progress.current = 0;
    } else if (reducedMotion) {
      progress.current = 2;
    } else if (wasIntroHidden.current) {
      progress.current = -revealDelayMs / revealDurationMs;
    }
    wasIntroHidden.current = introHidden;
  }, [introHidden, reducedMotion, revealDelayMs, revealDurationMs]);
  useFrame((_, delta) => {
    if (!materialRef.current) return;
    if (!introHidden && !reducedMotion) progress.current += Math.min(delta, 0.05) / (revealDurationMs / 1000);
    materialRef.current.uniforms.uProgress.value = introHidden ? 0 : progress.current;
  });
  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, items.length]} renderOrder={12}>
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
        uniforms={{ uMap: { value: texture ?? WHITE_TEXTURE }, uHasMap: { value: texture ? 1 : 0 }, uProgress: { value: initialProgress } }}
        transparent depthWrite={false} depthTest side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  );
}

function SelectedPosterOutline({ item }: { item: PosterItem }) {
  return (
    <mesh matrix={item.matrix} matrixAutoUpdate={false} renderOrder={11}>
      <planeGeometry args={[1.08, 1.055]} />
      <meshBasicMaterial color="#72c6eb" transparent opacity={0.58} depthWrite={false} depthTest side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

export function CountryPosters({ films, selectedFilmId, posterScale, isMobile, reducedMotion, introHidden = false, revealDelayMs = 0, revealDurationMs = 900, onSelectFilm }: CountryPostersProps) {
  const { camera, gl } = useThree();
  const [tier, setTier] = useState<ZoomTier>(() => distanceToTier(camera.position.length()));
  const lastTier = useRef(tier);
  const manifest = useAtlasManifest();
  const variant = isMobile ? "mobile" : "desktop";
  useFrame(() => {
    const next = distanceToTier(camera.position.length());
    if (next !== lastTier.current) { lastTier.current = next; setTier(next); }
  });
  const countryMeta = useMemo(() => new Map(countries.map((country) => [country.code, country])), []);
  const requests = useMemo(() => {
    const grouped = new Map<string, Film[]>();
    for (const film of films) {
      const list = grouped.get(film.primaryProductionCountry) ?? [];
      list.push(film); grouped.set(film.primaryProductionCountry, list);
    }
    const cameraDirection = camera.position.clone().normalize();
    return [...grouped.entries()].map(([countryCode, countryFilms]) => {
      const meta = countryMeta.get(countryCode);
      const isoId = COUNTRY_ISO_NUMERIC[countryCode] ?? null;
      const hotspotCenter = meta && (isCountryHotspot(countryCode) || !isoId)
        ? { longitude: meta.center.longitude, latitude: meta.center.latitude } : undefined;
      const center = meta ? latLngToVector3(meta.center.latitude, meta.center.longitude, 1) : new THREE.Vector3();
      return { request: { countryCode, isoId, films: countryFilms.map(toLayoutFilm), tier, posterScale, isMobile, hotspotCenter }, priority: center.dot(cameraDirection) };
    }).sort((a, b) => b.priority - a.priority).map(({ request }) => request);
  }, [camera, countryMeta, films, isMobile, posterScale, tier]);
  const layouts = useProgressiveLayouts(requests);
  const items = useMemo(() => {
    const placed = layouts.flatMap((layout) => layout.placed);
    return placed.map((poster, index) => makeItem(poster, index, placed.length, manifest?.entries[poster.filmId]?.[variant], poster.filmId === selectedFilmId));
  }, [layouts, manifest, selectedFilmId, variant]);
  const neededPages = useMemo(() => {
    const priorities = new Map<number, number>();
    const direction = camera.position.clone().normalize();
    for (const item of items) if (item.atlas) priorities.set(item.atlas.page, Math.max(priorities.get(item.atlas.page) ?? -1, item.normal.dot(direction)));
    return [...priorities.entries()].sort((a, b) => b[1] - a[1]).map(([page]) => page);
  }, [camera, items]);
  const textures = useProgressiveAtlasTextures(manifest, variant, neededPages);
  useEffect(() => {
    document.documentElement.dataset.posterAtlasPages = String(textures.size);
    document.documentElement.dataset.globePosterCount = String(items.length);
    return () => {
      delete document.documentElement.dataset.posterAtlasPages;
      delete document.documentElement.dataset.globePosterCount;
    };
  }, [items.length, textures.size]);
  const batches = useMemo(() => {
    const byPage = new Map<number, PosterItem[]>(), fallback: PosterItem[] = [];
    for (const item of items) {
      if (!item.atlas || !textures.has(item.atlas.page)) fallback.push(item);
      else { const list = byPage.get(item.atlas.page) ?? []; list.push(item); byPage.set(item.atlas.page, list); }
    }
    return { byPage, fallback };
  }, [items, textures]);
  useEffect(() => {
    if (introHidden) return;
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const localPoint = new THREE.Vector3();
    const worldPoint = new THREE.Vector3();
    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      const cameraDirection = camera.position.clone().normalize();
      let hit: { item: PosterItem; distance: number } | null = null;
      for (const item of items) {
        if (item.normal.dot(cameraDirection) <= 0.02) continue;
        const localRay = raycaster.ray.clone().applyMatrix4(item.inverseMatrix);
        if (Math.abs(localRay.direction.z) < 0.000001) continue;
        const distance = -localRay.origin.z / localRay.direction.z;
        if (distance < 0) continue;
        localRay.at(distance, localPoint);
        if (Math.abs(localPoint.x) > 0.5 || Math.abs(localPoint.y) > 0.5) continue;
        worldPoint.copy(localPoint).applyMatrix4(item.matrix);
        const worldDistance = worldPoint.distanceTo(camera.position);
        if (!hit || worldDistance < hit.distance) hit = { item, distance: worldDistance };
      }
      if (!hit) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onSelectFilm(
        hit.item.filmId,
        getPosterScreenAnchor(hit.item.matrix, camera, canvas)
      );
    };
    canvas.addEventListener("click", handleCanvasClick, true);
    return () => canvas.removeEventListener("click", handleCanvasClick, true);
  }, [camera, gl.domElement, introHidden, items, onSelectFilm]);
  const selectedItem = items.find((item) => item.filmId === selectedFilmId);
  return (
    <group>
      {[...batches.byPage.entries()].map(([page, pageItems]) => (
        <PosterBatch key={`${variant}-${page}`} items={pageItems} texture={textures.get(page)} introHidden={introHidden} reducedMotion={reducedMotion} revealDelayMs={revealDelayMs} revealDurationMs={revealDurationMs} />
      ))}
      {batches.fallback.length > 0 && <PosterBatch key="poster-fallbacks" items={batches.fallback} introHidden={introHidden} reducedMotion={reducedMotion} revealDelayMs={revealDelayMs} revealDurationMs={revealDurationMs} />}
      {selectedItem && !introHidden && <SelectedPosterOutline item={selectedItem} />}
    </group>
  );
}
