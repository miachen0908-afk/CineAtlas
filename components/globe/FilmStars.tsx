"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useLoader } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import type { Film } from "@/types/cinema";
import { countries } from "@/lib/data";
import { layoutPostersByCountry } from "@/utils/countryPosterLayout";

type FilmStarsProps = {
  films: Film[];
  selectedFilmId: string | null;
  onSelectFilm: (id: string) => void;
  posterScale?: number;
};

const BASE_WIDTH = 0.06;
const BASE_HEIGHT = 0.09;

function PosterFallback({
  position,
  color,
  scale,
  isSelected,
  onSelect,
}: {
  position: THREE.Vector3;
  color: string;
  scale: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const r = 0.016 * scale * (isSelected ? 1.4 : 1);
  return (
    <mesh
      position={position}
      renderOrder={6}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <sphereGeometry args={[r, 12, 12]} />
      <meshStandardMaterial
        color={isSelected ? "#fff6dc" : color}
        emissive={isSelected ? "#e8c878" : "#a89060"}
        emissiveIntensity={isSelected ? 0.7 : 0.35}
        roughness={0.55}
      />
    </mesh>
  );
}

function PosterBillboard({
  film,
  position,
  isSelected,
  posterScale,
  onSelect,
}: {
  film: Film;
  position: THREE.Vector3;
  isSelected: boolean;
  posterScale: number;
  onSelect: () => void;
}) {
  const sourceTexture = useLoader(THREE.TextureLoader, film.posterUrl!);
  const texture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [sourceTexture]);

  useEffect(() => () => texture.dispose(), [texture]);

  const scale = posterScale * (isSelected ? 1.35 : 1);
  const w = BASE_WIDTH * scale;
  const h = BASE_HEIGHT * scale;

  return (
    <Billboard position={position} follow lockZ={false} renderOrder={6}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        renderOrder={6}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {isSelected && (
        <mesh position={[0, 0, -0.001]} renderOrder={5}>
          <planeGeometry args={[w * 1.08, h * 1.08]} />
          <meshBasicMaterial
            color="#3a8fb7"
            transparent
            opacity={0.55}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </Billboard>
  );
}

function PosterItem({
  film,
  position,
  isSelected,
  posterScale,
  onSelect,
}: {
  film: Film;
  position: THREE.Vector3;
  isSelected: boolean;
  posterScale: number;
  onSelect: () => void;
}) {
  if (!film.posterUrl) {
    return (
      <PosterFallback
        position={position}
        color={film.posterColor ?? "#3a8fb7"}
        scale={posterScale}
        isSelected={isSelected}
        onSelect={onSelect}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <PosterFallback
          position={position}
          color={film.posterColor ?? "#3a8fb7"}
          scale={posterScale}
          isSelected={isSelected}
          onSelect={onSelect}
        />
      }
    >
      <PosterBillboard
        film={film}
        position={position}
        isSelected={isSelected}
        posterScale={posterScale}
        onSelect={onSelect}
      />
    </Suspense>
  );
}

export function FilmStars({
  films,
  selectedFilmId,
  onSelectFilm,
  posterScale = 1,
}: FilmStarsProps) {
  const countriesByCode = useMemo(() => {
    const map = new Map(countries.map((c) => [c.code, c]));
    return map;
  }, []);

  const positions = useMemo(
    () => layoutPostersByCountry(films, countriesByCode),
    [films, countriesByCode]
  );

  return (
    <group>
      {positions.map(({ film, position }) => (
        <PosterItem
          key={film.id}
          film={film}
          position={position}
          isSelected={selectedFilmId === film.id}
          posterScale={posterScale}
          onSelect={() => onSelectFilm(film.id)}
        />
      ))}
    </group>
  );
}
