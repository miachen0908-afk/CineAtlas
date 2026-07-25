"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { Film } from "@/types/cinema";
import { countries } from "@/lib/data";
import { COUNTRY_ISO_NUMERIC, isCountryHotspot } from "@/lib/countryIso";
import {
  computeCountryPosterLayout,
  distanceToTier,
  type LayoutFilmInput,
  type PlacedPoster,
  type ZoomTier,
} from "@/lib/posterLayout";
import { getEarthRadius, latLngToVector3 } from "@/utils/geo";

type CountryPostersProps = {
  films: Film[];
  selectedFilmId: string | null;
  posterScale: number;
  isMobile: boolean;
  reducedMotion: boolean;
  onSelectFilm: (id: string) => void;
};

const GLOBE_R = getEarthRadius() + 0.032;
const METERS_EARTH = 6_371_000;
const DISPLAY_BOOST = 4.2;

function metersToGlobeSize(meters: number): number {
  return (meters / METERS_EARTH) * getEarthRadius() * DISPLAY_BOOST;
}

function tierMinHeight(tier: ZoomTier, posterScale: number): number {
  const base =
    tier === "world" ? 0.09 : tier === "continent" ? 0.065 : 0.048;
  return base * posterScale;
}

function toLayoutFilm(film: Film): LayoutFilmInput {
  return {
    id: film.id,
    titleZh: film.titleZh,
    featuredPriority: 100,
    posterColor: film.posterColor ?? "#3a8fb7",
    posterUrl: film.posterUrl,
    year: film.year,
    rating: film.rating,
    genreIds: film.genreIds,
  };
}

function PosterTexture({
  url,
  width,
  height,
  opacity,
  visible,
  entered,
  onClick,
}: {
  url: string;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  entered: boolean;
  onClick?: () => void;
}) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!matRef.current) return;
    const target = visible && entered ? Math.max(0.25, opacity) : 0;
    matRef.current.opacity += (target - matRef.current.opacity) * 0.2;
  });

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      renderOrder={12}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function PosterColorFallback({
  color,
  width,
  height,
  opacity,
  visible,
  entered,
  onClick,
}: {
  color: string;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
  entered: boolean;
  onClick?: () => void;
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    if (!matRef.current) return;
    const target = visible && entered ? Math.max(0.25, opacity) : 0;
    matRef.current.opacity += (target - matRef.current.opacity) * 0.2;
  });

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      renderOrder={12}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function PosterBillboard({
  placed,
  tier,
  posterScale,
  isSelected,
  opacity,
  visible,
  delay,
  reducedMotion,
  animKey,
  onSelect,
}: {
  placed: PlacedPoster;
  tier: ZoomTier;
  posterScale: number;
  isSelected: boolean;
  opacity: number;
  visible: boolean;
  delay: number;
  reducedMotion: boolean;
  animKey: number;
  onSelect: () => void;
}) {
  const [entered, setEntered] = useState(reducedMotion);
  const position = useMemo(
    () => latLngToVector3(placed.lat, placed.lon, GLOBE_R),
    [placed.lat, placed.lon]
  );

  const minH = tierMinHeight(tier, posterScale);
  const height = Math.max(
    metersToGlobeSize(placed.heightM),
    minH
  ) * (isSelected ? 1.25 : 1);
  const width = height * (2 / 3);

  useEffect(() => {
    if (reducedMotion) {
      setEntered(true);
      return;
    }
    setEntered(false);
    const t = window.setTimeout(() => setEntered(true), delay);
    return () => window.clearTimeout(t);
  }, [delay, reducedMotion, animKey]);

  return (
    <Billboard position={position} follow renderOrder={12}>
      {placed.posterUrl ? (
        <Suspense
          fallback={
            <PosterColorFallback
              color={placed.posterColor}
              width={width}
              height={height}
              opacity={opacity}
              visible={visible}
              entered={entered}
              onClick={onSelect}
            />
          }
        >
          <PosterTexture
            url={placed.posterUrl}
            width={width}
            height={height}
            opacity={opacity}
            visible={visible}
            entered={entered}
            onClick={onSelect}
          />
        </Suspense>
      ) : (
        <PosterColorFallback
          color={placed.posterColor}
          width={width}
          height={height}
          opacity={opacity}
          visible={visible}
          entered={entered}
          onClick={onSelect}
        />
      )}
    </Billboard>
  );
}

export function CountryPosters({
  films,
  selectedFilmId,
  posterScale,
  isMobile,
  reducedMotion,
  onSelectFilm,
}: CountryPostersProps) {
  const { camera } = useThree();
  const [tier, setTier] = useState<ZoomTier>(() =>
    distanceToTier(camera.position.length())
  );
  const [animKey, setAnimKey] = useState(0);
  const lastTier = useRef(tier);
  const lastFilmSig = useRef("");

  useFrame(() => {
    const next = distanceToTier(camera.position.length());
    if (next !== lastTier.current) {
      lastTier.current = next;
      setTier(next);
    }
  });

  const filmsByCountry = useMemo(() => {
    const map = new Map<string, Film[]>();
    for (const film of films) {
      const code = film.primaryProductionCountry;
      const list = map.get(code) ?? [];
      list.push(film);
      map.set(code, list);
    }
    return map;
  }, [films]);

  const countryMeta = useMemo(() => {
    const map = new Map(countries.map((c) => [c.code, c]));
    return map;
  }, []);

  const layouts = useMemo(() => {
    const results = [];
    for (const [code, countryFilms] of filmsByCountry) {
      const meta = countryMeta.get(code);
      const isoId = COUNTRY_ISO_NUMERIC[code] ?? null;
      const hotspotCenter =
        isCountryHotspot(code) && meta
          ? {
              longitude: meta.center.longitude,
              latitude: meta.center.latitude,
            }
          : meta && !isoId
            ? {
                longitude: meta.center.longitude,
                latitude: meta.center.latitude,
              }
            : undefined;

      results.push(
        computeCountryPosterLayout({
          countryCode: code,
          isoId,
          films: countryFilms.map(toLayoutFilm),
          tier,
          posterScale,
          isMobile,
          hotspotCenter:
            hotspotCenter ??
            (isCountryHotspot(code) && meta
              ? {
                  longitude: meta.center.longitude,
                  latitude: meta.center.latitude,
                }
              : undefined),
        })
      );
    }
    return results;
  }, [filmsByCountry, countryMeta, tier, posterScale, isMobile]);

  useEffect(() => {
    const sig = `${tier}|${films.map((f) => f.id).join(",")}`;
    if (sig !== lastFilmSig.current) {
      lastFilmSig.current = sig;
      setAnimKey((n) => n + 1);
    }
  }, [films, tier]);

  const items = useMemo(() => {
    const all: Array<{
      placed: PlacedPoster;
      normal: THREE.Vector3;
      delay: number;
    }> = [];

    let index = 0;
    const total = layouts.reduce((s, l) => s + l.placed.length, 0) || 1;

    for (const layout of layouts) {
      for (const placed of layout.placed) {
        const position = latLngToVector3(placed.lat, placed.lon, GLOBE_R);
        all.push({
          placed,
          normal: position.clone().normalize(),
          delay: reducedMotion
            ? 0
            : Math.min(520, (index / total) * 560),
        });
        index += 1;
      }
    }
    return all;
  }, [layouts, reducedMotion]);

  const visibilityRef = useRef<
    Map<string, { visible: boolean; opacity: number }>
  >(new Map());
  const [, bump] = useState(0);

  useFrame(({ camera: cam }) => {
    const camDir = cam.position.clone().normalize();
    let changed = false;
    const map = visibilityRef.current;

    for (const item of items) {
      const facing = item.normal.dot(camDir);
      const visible = facing > 0.02;
      const opacity = THREE.MathUtils.clamp(
        THREE.MathUtils.smoothstep(facing, 0.02, 0.4),
        0,
        1
      );
      const prev = map.get(item.placed.filmId);
      if (
        !prev ||
        prev.visible !== visible ||
        Math.abs(prev.opacity - opacity) > 0.03
      ) {
        map.set(item.placed.filmId, { visible, opacity });
        changed = true;
      }
    }
    if (changed) bump((n) => n + 1);
  });

  return (
    <group>
      {items.map((item) => {
        const vis = visibilityRef.current.get(item.placed.filmId) ?? {
          visible: true,
          opacity: 1,
        };
        return (
          <PosterBillboard
            key={`${item.placed.filmId}-${animKey}`}
            placed={item.placed}
            tier={tier}
            posterScale={posterScale}
            isSelected={selectedFilmId === item.placed.filmId}
            opacity={vis.opacity}
            visible={vis.visible}
            delay={item.delay}
            reducedMotion={reducedMotion}
            animKey={animKey}
            onSelect={() => onSelectFilm(item.placed.filmId)}
          />
        );
      })}
    </group>
  );
}
