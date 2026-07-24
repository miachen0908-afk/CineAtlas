"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Film } from "@/types/cinema";
import { spreadOverlappingStars, getEarthRadius } from "@/utils/geo";

type FilmStarsProps = {
  films: Film[];
  selectedFilmId: string | null;
  onSelectFilm: (id: string) => void;
};

type StarProps = {
  film: Film;
  position: THREE.Vector3;
  isSelected: boolean;
  onSelect: () => void;
};

function Star({ position, isSelected, onSelect }: Omit<StarProps, "film">) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetScale = isSelected ? 1.8 : 1;
  const targetOpacity = isSelected ? 1 : 0.85;

  useFrame(() => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.12
    );
    material.opacity += (targetOpacity - material.opacity) * 0.12;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          color={isSelected ? "#f5e6b8" : "#e8d5a3"}
          emissive={isSelected ? "#c9a962" : "#8b7355"}
          emissiveIntensity={isSelected ? 1.2 : 0.6}
          transparent
          opacity={0.85}
        />
      </mesh>
      {isSelected && (
        <pointLight color="#c9a962" intensity={0.8} distance={0.5} />
      )}
    </group>
  );
}

export function FilmStars({ films, selectedFilmId, onSelectFilm }: FilmStarsProps) {
  const positions = useMemo(
    () => spreadOverlappingStars(films, getEarthRadius() + 0.02),
    [films]
  );

  return (
    <group>
      {positions.map(({ film, position }) => (
        <Star
          key={film.id}
          position={position}
          isSelected={selectedFilmId === film.id}
          onSelect={() => onSelectFilm(film.id)}
        />
      ))}
    </group>
  );
}
