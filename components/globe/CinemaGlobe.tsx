"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { Film } from "@/types/cinema";
import { GlobeControls } from "./GlobeControls";
import { CountryLayer } from "./CountryLayer";
import { CountryFocusAnimator } from "./CountryFocusAnimator";
import { FilmStars } from "./FilmStars";
import { getEarthRadius } from "@/utils/geo";

type CinemaGlobeProps = {
  films: Film[];
  selectedFilmId: string | null;
  highlightedCountryCode: string | null;
  onSelectFilm: (id: string) => void;
  onSelectCountry: (code: string | null) => void;
  onBackgroundClick: () => void;
};

function EarthSphere() {
  return (
    <mesh>
      <sphereGeometry args={[getEarthRadius(), 64, 64]} />
      <meshStandardMaterial
        color="#0f1a2e"
        emissive="#0a1220"
        emissiveIntensity={0.3}
        roughness={0.85}
        metalness={0.1}
      />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.02}>
      <sphereGeometry args={[getEarthRadius(), 64, 64]} />
      <meshBasicMaterial
        color="#1a3a5c"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function GlobeScene({
  films,
  selectedFilmId,
  highlightedCountryCode,
  onSelectFilm,
  onSelectCountry,
  onBackgroundClick,
  controlsRef,
}: CinemaGlobeProps & {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  return (
    <>
      <color attach="background" args={["#050810"]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 3, 5]} intensity={0.6} color="#a0b4d0" />
      <Stars
        radius={80}
        depth={40}
        count={3000}
        factor={3}
        saturation={0.2}
        fade
        speed={0.3}
      />
      <Suspense fallback={null}>
        <EarthSphere />
        <Atmosphere />
        <CountryLayer
          highlightedCode={highlightedCountryCode}
          onSelectCountry={onSelectCountry}
        />
        <FilmStars
          films={films}
          selectedFilmId={selectedFilmId}
          onSelectFilm={onSelectFilm}
        />
      </Suspense>
      <GlobeControls ref={controlsRef} />
      <CountryFocusAnimator
        countryCode={highlightedCountryCode}
        controlsRef={controlsRef}
      />
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          onBackgroundClick();
        }}
      >
        <sphereGeometry args={[getEarthRadius() * 1.5, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export function CinemaGlobe(props: CinemaGlobeProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={props.onBackgroundClick}
        style={{ touchAction: "none" }}
      >
        <GlobeScene {...props} controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
