"use client";

import { useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CountryBorderLine } from "@/utils/geo";

type AuroraCountryOutlineProps = {
  isoId: string;
  lines: CountryBorderLine[];
  active: boolean;
  reducedMotion: boolean;
};

function setOpacity(group: THREE.Group | null, opacity: number): void {
  if (!group) return;
  group.traverse((object) => {
    const material = (
      object as THREE.Object3D & {
        material?: THREE.Material | THREE.Material[];
      }
    ).material;
    if (Array.isArray(material)) {
      for (const item of material) item.opacity = opacity;
    } else if (material) {
      material.opacity = opacity;
    }
  });
}

export function AuroraCountryOutline({
  isoId,
  lines,
  active,
  reducedMotion,
}: AuroraCountryOutlineProps) {
  const outerRef = useRef<THREE.Group>(null);
  const middleRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const fade = useRef(active ? 1 : 0);

  useFrame(({ clock }, delta) => {
    const target = active ? 1 : 0;
    fade.current = reducedMotion
      ? target
      : THREE.MathUtils.damp(fade.current, target, active ? 17 : 7.2, delta);
    const breathing =
      active && !reducedMotion
        ? 1 + Math.sin((clock.elapsedTime * Math.PI * 2) / 3.8) * 0.08
        : 1;

    setOpacity(outerRef.current, fade.current * 0.15 * breathing);
    setOpacity(middleRef.current, fade.current * 0.28 * breathing);
    setOpacity(innerRef.current, fade.current * 0.82 * breathing);
  });

  return (
    <group name={`aurora-outline-${isoId}`}>
      <group ref={outerRef}>
        {lines.map((line, index) => (
          <Line
            key={`outer-${index}`}
            points={line.points}
            color="#a34c89"
            lineWidth={5.5}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest
            renderOrder={6}
          />
        ))}
      </group>
      <group ref={middleRef}>
        {lines.map((line, index) => (
          <Line
            key={`middle-${index}`}
            points={line.points}
            color="#32c9ae"
            lineWidth={3.2}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest
            renderOrder={7}
          />
        ))}
      </group>
      <group ref={innerRef}>
        {lines.map((line, index) => (
          <Line
            key={`inner-${index}`}
            points={line.points}
            color="#d8e1e3"
            lineWidth={1.1}
            transparent
            opacity={0}
            depthWrite={false}
            depthTest
            renderOrder={8}
          />
        ))}
      </group>
    </group>
  );
}
