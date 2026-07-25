"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getEarthRadius } from "@/utils/geo";
import { useIllustratedEarthTextures } from "./createIllustratedTextures";

const RADIUS = getEarthRadius();

/** Flat-illustration Earth: depth-graded ocean, Pantone 9224 C land, white clouds. */
export function IllustratedEarth({ isMobile = false }: { isMobile?: boolean }) {
  // Keep texture size moderate — large canvases freeze the main thread during bake.
  const textures = useIllustratedEarthTextures(isMobile ? 512 : 1024);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <group>
      <mesh>
        <sphereGeometry
          args={[RADIUS, isMobile ? 64 : 96, isMobile ? 64 : 96]}
        />
        <meshStandardMaterial
          map={textures.earthMap}
          roughness={0.92}
          metalness={0}
          color="#ffffff"
        />
      </mesh>

      <mesh ref={cloudsRef} scale={1.008}>
        <sphereGeometry
          args={[RADIUS, isMobile ? 48 : 64, isMobile ? 48 : 64]}
        />
        <meshStandardMaterial
          map={textures.cloudsMap}
          transparent
          opacity={0.55}
          depthWrite={false}
          roughness={1}
          metalness={0}
          color="#ffffff"
        />
      </mesh>
    </group>
  );
}
