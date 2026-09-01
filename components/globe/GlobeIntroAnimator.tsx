"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { HomeExperiencePhase } from "@/components/home/HomeExperienceContext";
import { getEarthRadius } from "@/utils/geo";
import {
  chinaCenteredCameraPosition,
  fittedGlobeCameraDistance,
} from "@/utils/globeView";

const EXIT_DURATION_MS = 2600;
const REDUCED_EXIT_DURATION_MS = 150;
const INTRO_SILHOUETTE_RADIUS = getEarthRadius() * 1.02;
const MIN_VERTICAL_RADIUS_NDC = 1.18;
const HORIZONTAL_OVERSCAN = 1.06;
const ARC_APEX_ALIGNMENT = 0.98;

export function getIntroCameraView(
  verticalFovDegrees: number,
  aspect: number
): { position: THREE.Vector3; target: THREE.Vector3 } {
  const verticalRadiusNdc = Math.max(
    MIN_VERTICAL_RADIUS_NDC,
    Math.max(aspect, 0.1) * HORIZONTAL_OVERSCAN
  );
  const halfFovRadians = THREE.MathUtils.degToRad(verticalFovDegrees / 2);
  const silhouetteAngle = Math.atan(
    verticalRadiusNdc * Math.tan(halfFovRadians)
  );
  const introRadius = INTRO_SILHOUETTE_RADIUS / Math.sin(silhouetteAngle);
  const introTargetY =
    introRadius * Math.tan(silhouetteAngle) * ARC_APEX_ALIGNMENT;

  return {
    position: chinaCenteredCameraPosition(introRadius),
    target: new THREE.Vector3(0, introTargetY, 0),
  };
}

function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

type GlobeIntroAnimatorProps = {
  phase: HomeExperiencePhase;
  isMobile: boolean;
  reducedMotion: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onComplete: () => void;
};

export function GlobeIntroAnimator({
  phase,
  reducedMotion,
  controlsRef,
  onComplete,
}: GlobeIntroAnimatorProps) {
  const { camera, size } = useThree();
  const exitStartedRef = useRef(false);
  const exitStartTimeRef = useRef(0);
  const exitStartPositionRef = useRef(new THREE.Vector3());
  const exitStartTargetRef = useRef(new THREE.Vector3());
  const completionSentRef = useRef(false);

  const finalTarget = new THREE.Vector3(0, 0, 0);
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const aspect = Math.max(size.width / Math.max(size.height, 1), 0.1);
  const finalDistance = fittedGlobeCameraDistance({
    verticalFovDegrees: perspectiveCamera.fov,
    aspect,
  });
  const finalPosition = chinaCenteredCameraPosition(finalDistance);
  const introView = getIntroCameraView(perspectiveCamera.fov, aspect);
  const introTargetY = introView.target.y;
  const introPosition = introView.position;

  useEffect(() => {
    if (phase === "intro") {
      exitStartedRef.current = false;
      completionSentRef.current = false;
    }
  }, [phase]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (phase === "intro") {
      controls.enabled = false;
      camera.position.copy(introPosition);
      controls.target.set(0, introTargetY, 0);
      camera.lookAt(controls.target);
      controls.update();
      return;
    }

    if (phase === "exiting") {
      controls.enabled = false;
      if (!exitStartedRef.current) {
        exitStartedRef.current = true;
        exitStartTimeRef.current = performance.now();
        exitStartPositionRef.current.copy(camera.position);
        exitStartTargetRef.current.copy(controls.target);
      }

      const duration = reducedMotion
        ? REDUCED_EXIT_DURATION_MS
        : EXIT_DURATION_MS;
      const elapsed = performance.now() - exitStartTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuint(progress);

      camera.position.lerpVectors(
        exitStartPositionRef.current,
        finalPosition,
        eased
      );
      controls.target.lerpVectors(
        exitStartTargetRef.current,
        finalTarget,
        eased
      );
      camera.lookAt(controls.target);
      controls.update();

      if (progress >= 1 && !completionSentRef.current) {
        completionSentRef.current = true;
        camera.position.copy(finalPosition);
        controls.target.copy(finalTarget);
        camera.lookAt(finalTarget);
        controls.update();
        onComplete();
      }
      return;
    }

    controls.enabled = true;
  });

  return null;
}
