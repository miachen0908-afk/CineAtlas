"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  attribute vec4 particleRandom;
  varying vec4 vRandom;
  varying vec2 vNdc;
  void main() {
    vRandom = particleRandom;
    vec3 p = position;
    p.x += sin(uTime * particleRandom.z + 6.28 * particleRandom.w) * mix(0.1, 1.5, particleRandom.x);
    p.y += sin(uTime * particleRandom.y + 6.28 * particleRandom.x) * mix(0.1, 1.5, particleRandom.w);
    p.z += sin(uTime * particleRandom.w + 6.28 * particleRandom.y) * mix(0.1, 1.5, particleRandom.z);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vNdc = clip.xy / clip.w;
    gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (particleRandom.x - 0.5))) / max(1.0, length(mv.xyz));
    gl_Position = clip;
  }
`;
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntro;
  varying vec4 vRandom;
  varying vec2 vNdc;
  void main() {
    vec2 uv = gl_PointCoord.xy;
    if (length(uv - vec2(0.5)) > 0.5) discard;
    float titleMask = 1.0 - uIntro * smoothstep(0.9, 0.35, abs(vNdc.x)) * smoothstep(-0.05, 0.12, vNdc.y) * (1.0 - smoothstep(0.65, 0.8, vNdc.y));
    vec3 white = vec3(1.0) + 0.12 * sin(uv.yxx + uTime + vRandom.y * 6.28);
    gl_FragColor = vec4(white, titleMask);
  }
`;

function seededRandom(seed: { value: number }): number {
  seed.value += 0x6d2b79f5;
  let value = seed.value;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

const PARTICLE_COUNT = 580;
const PARTICLE_SPREAD = 8;
const PARTICLE_SPEED = 0.1;
const PARTICLE_BASE_SIZE = 60;
const PARTICLE_SIZE_RANDOMNESS = 0.4;
const PARTICLE_CAMERA_DISTANCE = 49;

export function GlobeParticles({ introActive, reducedMotion }: { introActive: boolean; reducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const count = PARTICLE_COUNT;
    const seed = { value: 0x43494e45 };
    const randomValue = () => seededRandom(seed);
    const positions = new Float32Array(count * 3);
    const random = new Float32Array(count * 4);
    for (let index = 0; index < count; index += 1) {
      let x = 0, y = 0, z = 0, length = 2;
      while (length > 1 || length === 0) {
        x = randomValue() * 2 - 1; y = randomValue() * 2 - 1; z = randomValue() * 2 - 1;
        length = x * x + y * y + z * z;
      }
      const radius = Math.cbrt(randomValue());
      positions.set(
        [
          x * radius * PARTICLE_SPREAD,
          y * radius * PARTICLE_SPREAD,
          z * radius * PARTICLE_SPREAD * 10,
        ],
        index * 3
      );
      random.set([randomValue(), randomValue(), randomValue(), randomValue()], index * 4);
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    result.setAttribute("particleRandom", new THREE.BufferAttribute(random, 4));
    return result;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }, delta) => {
    if (!pointsRef.current || !materialRef.current) return;
    if (!reducedMotion) {
      materialRef.current.uniforms.uTime.value += Math.min(delta, 0.05) * PARTICLE_SPEED;
      pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.1;
      pointsRef.current.rotation.y = Math.cos(clock.elapsedTime * 0.05) * 0.15;
      pointsRef.current.rotation.z += 0.01 * PARTICLE_SPEED;
    }
    materialRef.current.uniforms.uIntro.value = THREE.MathUtils.damp(materialRef.current.uniforms.uIntro.value, introActive ? 1 : 0, 5, delta);
  });
  return (
    <points ref={pointsRef} geometry={geometry} renderOrder={0} frustumCulled={false}>
      <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uBaseSize: {
            value: PARTICLE_BASE_SIZE * (41 / PARTICLE_CAMERA_DISTANCE),
          },
          uSizeRandomness: { value: PARTICLE_SIZE_RANDOMNESS },
          uIntro: { value: introActive ? 1 : 0 },
        }}
        transparent depthTest={false} depthWrite={false} toneMapped={false} />
    </points>
  );
}
