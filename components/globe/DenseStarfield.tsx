"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type DenseStarfieldProps = {
  isMobile?: boolean;
  reducedMotion?: boolean;
};

/** Quiet hand-drawn stars on black — no heavy additive glow. */
export function DenseStarfield({
  isMobile = false,
  reducedMotion = false,
}: DenseStarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = isMobile ? 900 : 1800;

  const geometry = useMemo(() => {
    const rand = mulberry32(0x4e617468);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#f5e6a3"),
      new THREE.Color("#dce9f5"),
    ];

    for (let i = 0; i < count; i += 1) {
      const u = rand();
      const v = rand();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const radius = 34 + rand() * 26;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const c = palette[Math.floor(rand() * palette.length)]!;
      const dim = 0.25 + rand() * 0.45;
      colors[i * 3] = c.r * dim;
      colors[i * 3 + 1] = c.g * dim;
      colors[i * 3 + 2] = c.b * dim;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count]);

  const skyDome = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(256, 280, 40, 256, 256, 320);
    g.addColorStop(0, "#0a0a0a");
    g.addColorStop(0.55, "#050505");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const rand = mulberry32(0x73746172);
    for (let i = 0; i < 120; i += 1) {
      const x = rand() * 512;
      const y = rand() * 512;
      const a = 0.04 + rand() * 0.08;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.6 + rand() * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = 0.45 + Math.sin(clock.elapsedTime * 0.05) * 0.04;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[90, 24, 24]} />
        <meshBasicMaterial
          map={skyDome}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={isMobile ? 0.04 : 0.055}
          vertexColors
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  );
}
