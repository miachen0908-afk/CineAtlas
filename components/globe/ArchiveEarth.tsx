"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getEarthRadius } from "@/utils/geo";
import { GLOBE_VISUAL_RADIUS } from "@/utils/globeView";

const RADIUS = getEarthRadius();
const AURORA_RADIUS = GLOBE_VISUAL_RADIUS;

const STRANDS_CONFIG = {
  speed: 0.5,
  amplitude: 1,
  waviness: 1,
  thickness: 0.7,
  glow: 2.6,
  taper: 2.4,
  spread: 1,
  intensity: 0.6,
  saturation: 1.5,
  opacity: 1,
  scale: 1.5,
} as const;

const surfaceVertexShader = `
  varying vec3 vViewNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewNormal = normalize(normalMatrix * normal);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const auroraFragmentShader = `
  uniform vec3 uGreen;
  uniform vec3 uViolet;
  uniform vec3 uCyan;
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uSpeed;
  uniform float uAmplitude;
  uniform float uWaviness;
  uniform float uThickness;
  uniform float uGlow;
  uniform float uTaper;
  uniform float uSpread;
  uniform float uIntensity;
  uniform float uSaturation;
  uniform float uOpacity;
  uniform float uScale;

  varying vec3 vViewNormal;
  varying vec3 vWorldPosition;

  vec3 samplePalette(float t) {
    t = fract(t) * 3.0;
    if (t < 1.0) return mix(uGreen, uViolet, t);
    if (t < 2.0) return mix(uViolet, uCyan, t - 1.0);
    return mix(uCyan, uGreen, t - 2.0);
  }

  void main() {
    vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
    float rayRadius = length(cross(cameraPosition, rayDirection));
    float radialPosition = (rayRadius - uInnerRadius)
      / max(uOuterRadius - uInnerRadius, 0.0001);
    float radialAa = max(fwidth(radialPosition) * 1.5, 0.002);
    float annulusMask = smoothstep(-radialAa, radialAa, radialPosition)
      * (1.0 - smoothstep(1.0 - radialAa, 1.0 + radialAa, radialPosition));

    if (annulusMask <= 0.001) discard;

    vec3 viewNormal = normalize(vViewNormal);
    float angle = atan(viewNormal.y, viewNormal.x);
    float scaledRadial = (radialPosition - 0.25) / max(uScale, 0.0001);
    float e = 0.06 + uIntensity * 0.94;
    float time = uTime * uSpeed;

    float broadEnvelope = 0.5 + 0.5 * cos(angle * 2.0 - time * 0.22);
    float fineEnvelope = 0.5 + 0.5 * cos(angle * 5.0 + time * 0.13);
    float envelopeShape = mix(0.3, 1.0, broadEnvelope * 0.72 + fineEnvelope * 0.28);
    float envelope = pow(envelopeShape, uTaper);

    vec3 color = vec3(0.0);

    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      float phase = fi * 1.7 * uSpread;
      float primaryHarmonic = 2.0 + fi;
      float secondaryHarmonic = 5.0 + fi * 2.0;
      float strandSpeed = 1.4 + fi * 1.2;
      float wave = sin(
        angle * primaryHarmonic * uWaviness + time * strandSpeed + phase
      ) * 0.60 + sin(
        angle * secondaryHarmonic * uWaviness
          - time * strandSpeed * 0.7
          + phase * 1.7
      ) * 0.40;

      float amplitude = (0.1 + 0.02 * e) * envelope * uAmplitude;
      float strandCenter = wave * amplitude;
      float distanceToStrand = abs(scaledRadial - strandCenter);
      float strandThickness = (0.001 + 0.05 * e)
        * (0.35 + envelope)
        * uThickness;
      strandThickness = max(strandThickness, fwidth(scaledRadial) * 0.8);
      float strand = strandThickness
        / (distanceToStrand + strandThickness * 0.45);
      strand *= strand;

      float hue = fi / 2.0
        + sin(angle + uTime * 0.06) * 0.15
        + uTime * 0.04;
      color += samplePalette(hue) * strand * envelope;
    }

    color *= 0.45 + 0.7 * e;
    color = 1.0 - exp(-color * uGlow);

    float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = max(mix(vec3(gray), color, uSaturation), 0.0);
    float luminance = max(max(color.r, color.g), color.b);
    float alpha = clamp(luminance, 0.0, 1.0)
      * uOpacity
      * annulusMask;
    color *= uOpacity * annulusMask;

    if (alpha < 0.003) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function ArchiveEarth({
  isMobile = false,
  introActive = false,
  reducedMotion = false,
}: {
  isMobile?: boolean;
  introActive?: boolean;
  reducedMotion?: boolean;
}) {
  const coreMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const auroraMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const auroraUniforms = useMemo(
    () => ({
      uGreen: { value: new THREE.Color("#43b564") },
      uViolet: { value: new THREE.Color("#7c3aed") },
      uCyan: { value: new THREE.Color("#06b6d4") },
      uTime: { value: 0 },
      uInnerRadius: { value: RADIUS },
      uOuterRadius: { value: AURORA_RADIUS },
      uSpeed: { value: STRANDS_CONFIG.speed },
      uAmplitude: { value: STRANDS_CONFIG.amplitude },
      uWaviness: { value: STRANDS_CONFIG.waviness },
      uThickness: { value: STRANDS_CONFIG.thickness },
      uGlow: { value: STRANDS_CONFIG.glow },
      uTaper: { value: STRANDS_CONFIG.taper },
      uSpread: { value: STRANDS_CONFIG.spread },
      uIntensity: { value: STRANDS_CONFIG.intensity },
      uSaturation: { value: STRANDS_CONFIG.saturation },
      uOpacity: { value: STRANDS_CONFIG.opacity },
      uScale: { value: STRANDS_CONFIG.scale },
    }),
    []
  );
  const segments = isMobile ? 64 : 96;

  useFrame((_, delta) => {
    if (coreMaterialRef.current) {
      coreMaterialRef.current.opacity = THREE.MathUtils.damp(
        coreMaterialRef.current.opacity,
        introActive ? 0.94 : 0.62,
        4.8,
        delta
      );
    }
    if (auroraMaterialRef.current) {
      const uniforms = auroraMaterialRef.current.uniforms;
      if (!reducedMotion) {
        uniforms.uTime.value += Math.min(delta, 0.05);
      }
    }
  });

  return (
    <group>
      <mesh renderOrder={1}>
        <sphereGeometry args={[RADIUS, segments, segments]} />
        <meshBasicMaterial
          ref={coreMaterialRef}
          color="#020508"
          transparent
          opacity={0.62}
          depthWrite
          depthTest
          toneMapped={false}
        />
      </mesh>

      <mesh renderOrder={3}>
        <sphereGeometry args={[AURORA_RADIUS, segments, segments]} />
        <shaderMaterial
          ref={auroraMaterialRef}
          vertexShader={surfaceVertexShader}
          fragmentShader={auroraFragmentShader}
          uniforms={auroraUniforms}
          transparent
          depthWrite={false}
          depthTest
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
