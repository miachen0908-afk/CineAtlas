"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { Film } from "@/types/cinema";
import type { FilmPreviewAnchor } from "@/components/film/AnchoredFilmPreviewCard";
import type { HomeExperiencePhase } from "@/components/home/HomeExperienceContext";
import {
  chinaCenteredCameraPosition,
  fittedGlobeCameraDistance,
} from "@/utils/globeView";
import { GlobeControls } from "./GlobeControls";
import { CountryLayer } from "./CountryLayer";
import { CountryFocusAnimator } from "./CountryFocusAnimator";
import { ArchiveEarth } from "./ArchiveEarth";
import { CountryPosters } from "./CountryPosters";
import {
  getIntroCameraView,
  GlobeIntroAnimator,
} from "./GlobeIntroAnimator";
import { GlobeParticles } from "./GlobeParticles";

const ignoreCountryHover = () => undefined;

type CinemaGlobeProps = {
  films: Film[];
  selectedFilmId: string | null;
  highlightedCountryCode: string | null;
  posterScale?: number;
  yearStart?: number;
  yearEnd?: number;
  genreId?: string | null;
  experiencePhase: HomeExperiencePhase;
  autoRotate: boolean;
  onSelectFilm: (id: string, anchor: FilmPreviewAnchor) => void;
  onSelectCountry: (code: string | null) => void;
  onHoverCountry: (code: string | null) => void;
  onBackgroundClick: () => void;
  onInteractionStart: () => void;
  onExperienceReady: () => void;
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
  onInteractionStart,
  onExperienceReady,
  experiencePhase,
  autoRotate,
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
      <GlobeParticles
        introActive={experiencePhase === "intro"}
        reducedMotion={reducedMotion}
      />
      <Suspense fallback={null}>
        <ArchiveEarth
          isMobile={isMobile}
          introActive={experiencePhase === "intro"}
          reducedMotion={reducedMotion}
        />
        {experiencePhase !== "intro" && (
          <CountryLayer
            highlightedCode={highlightedCountryCode}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            revealing={experiencePhase === "exiting"}
            onSelectCountry={onSelectCountry}
            onHoverCountry={isMobile ? ignoreCountryHover : onHoverCountry}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <CountryPosters
          key={isMobile ? "mobile-posters" : "desktop-posters"}
          films={films}
          selectedFilmId={selectedFilmId}
          posterScale={posterScale}
          isMobile={isMobile}
          reducedMotion={reducedMotion}
          introHidden={experiencePhase === "intro"}
          revealDelayMs={1100}
          revealDurationMs={1200}
          onSelectFilm={onSelectFilm}
        />
      </Suspense>

      <GlobeControls
        ref={controlsRef}
        enabled={experiencePhase === "ready"}
        autoRotate={
          autoRotate && experiencePhase === "ready" && !reducedMotion
        }
        onInteractionStart={onInteractionStart}
      />
      <GlobeIntroAnimator
        phase={experiencePhase}
        isMobile={isMobile}
        reducedMotion={reducedMotion}
        controlsRef={controlsRef}
        onComplete={onExperienceReady}
      />
      {experiencePhase === "ready" && (
        <CountryFocusAnimator
          countryCode={highlightedCountryCode}
          controlsRef={controlsRef}
        />
      )}

      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          if (experiencePhase === "ready") onBackgroundClick();
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
  const [dpr, setDpr] = useState(1.25);
  const [pageVisible, setPageVisible] = useState(true);
  const fov = isMobile ? 42 : 38;
  const initialAspect = isMobile ? 0.5 : 16 / 9;
  const initialCameraPosition = chinaCenteredCameraPosition(
    fittedGlobeCameraDistance({
      verticalFovDegrees: fov,
      aspect: initialAspect,
    })
  );
  const initialIntroView = getIntroCameraView(fov, initialAspect);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: (props.experiencePhase === "intro"
            ? initialIntroView.position
            : initialCameraPosition
          ).toArray(),
          fov,
          near: 0.1,
          far: 140,
        }}
        gl={{ antialias: true, alpha: true }}
        dpr={dpr}
        frameloop={pageVisible ? "always" : "never"}
        onPointerMissed={
          props.experiencePhase === "ready"
            ? props.onBackgroundClick
            : undefined
        }
        style={{ touchAction: "none" }}
        onCreated={({ camera }) => {
          if (props.experiencePhase === "intro") {
            camera.position.copy(initialIntroView.position);
            camera.lookAt(initialIntroView.target);
            camera.updateMatrixWorld();
          }
        }}
      >
        <PerformanceMonitor
          flipflops={3}
          onChange={({ factor }) => {
            const maximum = isMobile ? 1.25 : 1.5;
            setDpr(THREE.MathUtils.lerp(1, maximum, factor));
          }}
          onFallback={() => setDpr(1)}
        />
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
