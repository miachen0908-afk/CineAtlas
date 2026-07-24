"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { getCountry } from "@/lib/data";
import { countryFocusPosition } from "@/utils/geo";

const ANIMATION_DURATION_MS = 800;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

type CountryFocusAnimatorProps = {
  countryCode: string | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
};

export function CountryFocusAnimator({
  countryCode,
  controlsRef,
}: CountryFocusAnimatorProps) {
  const { camera } = useThree();
  const animatingRef = useRef(false);
  const startTimeRef = useRef(0);
  const startPosRef = useRef(new THREE.Vector3());
  const endPosRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!countryCode) return;

    const country = getCountry(countryCode);
    if (!country) return;

    const controls = controlsRef.current;
    if (!controls) return;

    startPosRef.current.copy(camera.position);
    endPosRef.current = countryFocusPosition(
      country.center.latitude,
      country.center.longitude
    );

    controls.enabled = false;
    animatingRef.current = true;
    startTimeRef.current = performance.now();
  }, [countryCode, camera, controlsRef]);

  useFrame(() => {
    if (!animatingRef.current) return;

    const controls = controlsRef.current;
    if (!controls) return;

    const elapsed = performance.now() - startTimeRef.current;
    const t = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
    const eased = easeOutCubic(t);

    camera.position.lerpVectors(startPosRef.current, endPosRef.current, eased);
    controls.target.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    controls.update();

    if (t >= 1) {
      animatingRef.current = false;
      controls.enabled = true;
    }
  });

  return null;
}
