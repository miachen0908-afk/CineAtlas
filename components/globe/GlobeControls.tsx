"use client";

import { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getEarthRadius } from "@/utils/geo";
import { GLOBE_VISUAL_RADIUS } from "@/utils/globeView";

const MIN_DISTANCE = getEarthRadius() * 1.35;
const MAX_DISTANCE = GLOBE_VISUAL_RADIUS * 10;
const NINETY_SECONDS_PER_ORBIT_SPEED = 2 / 3;

type GlobeControlsProps = {
  enabled?: boolean;
  autoRotate?: boolean;
  onInteractionStart?: () => void;
};

export const GlobeControls = forwardRef<OrbitControlsImpl, GlobeControlsProps>(
  function GlobeControls(
    { enabled = true, autoRotate = false, onInteractionStart },
    ref
  ) {
    return (
      <OrbitControls
        ref={ref}
        enabled={enabled}
        autoRotate={autoRotate}
        autoRotateSpeed={NINETY_SECONDS_PER_ORBIT_SPEED}
        enableRotate
        enableZoom
        enablePan={false}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
        onStart={onInteractionStart}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    );
  }
);
