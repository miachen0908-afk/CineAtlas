"use client";

import { forwardRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getEarthRadius } from "@/utils/geo";

const MIN_DISTANCE = getEarthRadius() * 1.35;
const MAX_DISTANCE = getEarthRadius() * 4.5;

export const GlobeControls = forwardRef<OrbitControlsImpl>(
  function GlobeControls(_, ref) {
    return (
      <OrbitControls
        ref={ref}
        enableRotate
        enableZoom
        enablePan={false}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        rotateSpeed={0.6}
        zoomSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    );
  }
);
