"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Film } from "@/types/cinema";
import { GlobeControls } from "./GlobeControls";
import { CountryLayer } from "./CountryLayer";
import { CountryFocusAnimator } from "./CountryFocusAnimator";
import { IllustratedEarth } from "./IllustratedEarth";
import { DenseStarfield } from "./DenseStarfield";
import { CountryPosters } from "./CountryPosters";

type CinemaGlobeProps = {
  films: Film[];
  selectedFilmId: string | null;
  highlightedCountryCode: string | null;
  posterScale?: number;
  yearStart?: number;
  yearEnd?: number;
  genreId?: string | null;
  onSelectFilm: (id: string) => void;
  onSelectCountry: (code: string | null) => void;
  onHoverCountry: (code: string | null) => void;
  onBackgroundClick: () => void;
};

function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function GlobeScene({
  films,
  selectedFilmId,
  highlightedCountryCode,
  posterScale = 1,
  onSelectFilm,
  onSelectCountry,
  onHoverCountry,
  onBackgroundClick,
  controlsRef,
  isMobile,
  reducedMotion,
}: CinemaGlobeProps & {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isMobile: boolean;
  reducedMotion: boolean;
}) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 40, 95]} />

      <ambientLight intensity={0.72} color="#f4f8ff" />
      <directionalLight
        position={[5, 3, 4]}
        intensity={0.85}
        color="#ffffff"
      />
      <directionalLight
        position={[-4, -1, -3]}
        intensity={0.25}
        color="#a8d4e8"
      />
      <hemisphereLight args={["#e8eef5", "#e8dfd0", 0.3]} />

      <DenseStarfield isMobile={isMobile} reducedMotion={reducedMotion} />

      <Suspense fallback={null}>
        <IllustratedEarth isMobile={isMobile} />
        <CountryLayer
          highlightedCode={highlightedCountryCode}
          onSelectCountry={onSelectCountry}
          onHoverCountry={onHoverCountry}
        />
      </Suspense>

      <Suspense fallback={null}>
        <CountryPosters
          films={films}
          selectedFilmId={selectedFilmId}
          posterScale={posterScale}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
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
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

export function CinemaGlobe(props: CinemaGlobeProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: [0, isMobile ? -0.1 : -0.15, isMobile ? 5.6 : 6.1],
          fov: isMobile ? 42 : 38,
          near: 0.1,
          far: 140,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={isMobile ? [1, 2] : [1, 2.5]}
        onPointerMissed={props.onBackgroundClick}
        style={{ touchAction: "none" }}
      >
        <GlobeScene
          {...props}
          controlsRef={controlsRef}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}
