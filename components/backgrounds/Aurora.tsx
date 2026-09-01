"use client";

import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, Triangle } from "ogl";

type AuroraProps = {
  colorStops?: [string, string, string];
  amplitude?: number;
  blend?: number;
  className?: string;
};

const vertexShader = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBlend;
  uniform vec2 uResolution;
  uniform vec3 uColorStops[3];

  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 space = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    float time = uTime * 0.18;

    float broadWave = sin(space.x * 2.05 + time) * 0.14;
    broadWave += sin(space.x * 4.1 - time * 0.72) * 0.055;
    broadWave += (noise(vec2(space.x * 1.35 + time * 0.28, time * 0.16)) - 0.5) * 0.22;

    float center = 0.08 + broadWave * uAmplitude;
    float distanceToBand = abs(space.y - center);
    float core = exp(-distanceToBand * mix(6.0, 3.2, clamp(uBlend, 0.0, 1.0)));
    float haze = exp(-distanceToBand * 1.35) * 0.54;

    float colorPosition = fract(uv.x * 0.72 + time * 0.035 + broadWave * 0.6);
    vec3 ribbonColor = colorPosition < 0.5
      ? mix(uColorStops[0], uColorStops[1], colorPosition * 2.0)
      : mix(uColorStops[1], uColorStops[2], (colorPosition - 0.5) * 2.0);

    float verticalFade = smoothstep(-0.68, -0.14, space.y) * (1.0 - smoothstep(0.48, 0.86, space.y));
    float edgeFade = smoothstep(0.0, 0.045, uv.x) * smoothstep(0.0, 0.045, 1.0 - uv.x);
    float alpha = (core * 0.72 + haze * 0.42) * verticalFade * edgeFade;

    vec3 color = ribbonColor * (core * 0.82 + haze * 0.36);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function Aurora({
  colorStops = ["#75e680", "#9d55e0", "#2668e9"],
  amplitude = 0.4,
  blend = 1,
  className,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    let pageVisible = !document.hidden;
    let animationFrame = 0;
    let disposed = false;
    let renderer: Renderer | null = null;
    let gl: Renderer["gl"] | null = null;

    try {
      renderer = new Renderer({
        alpha: true,
        depth: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio, 1.5),
      });
      gl = renderer.gl;
    } catch {
      container.dataset.auroraFallback = "true";
      return;
    }

    const activeRenderer = renderer;
    const activeGl = gl;
    activeGl.clearColor(0, 0, 0, 0);
    activeGl.canvas.setAttribute("aria-hidden", "true");
    container.appendChild(activeGl.canvas);

    const geometry = new Triangle(activeGl);
    const program = new Program(activeGl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uBlend: { value: blend },
        uResolution: { value: [1, 1] },
        uColorStops: { value: colorStops.map((color) => new Color(color)) },
      },
    });
    const mesh = new Mesh(activeGl, { geometry, program });

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      activeRenderer.setSize(width, height);
      program.uniforms.uResolution.value = [activeGl.canvas.width, activeGl.canvas.height];
      activeRenderer.render({ scene: mesh });
    };

    const startedAt = performance.now();
    const render = (now: number) => {
      if (disposed) return;
      if (pageVisible) {
        if (!reducedMotion) {
          program.uniforms.uTime.value = (now - startedAt) * 0.001;
        }
        activeRenderer.render({ scene: mesh });
      }
      if (!reducedMotion && pageVisible) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    const startRendering = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      if (pageVisible && !reducedMotion) {
        animationFrame = requestAnimationFrame(render);
      } else if (pageVisible) {
        render(performance.now());
      }
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      startRendering();
    };

    const handleVisibility = () => {
      pageVisible = !document.hidden;
      startRendering();
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      cancelAnimationFrame(animationFrame);
      container.dataset.auroraFallback = "true";
    };

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotionQuery.addEventListener("change", handleMotionPreference);
    activeGl.canvas.addEventListener("webglcontextlost", handleContextLost);
    resize();
    startRendering();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", handleMotionPreference);
      activeGl.canvas.removeEventListener("webglcontextlost", handleContextLost);
      geometry.remove();
      program.remove();
      activeRenderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
      activeGl.canvas.remove();
    };
  }, [amplitude, blend, colorStops]);

  return (
    <div
      ref={containerRef}
      className={["aurora-background", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  );
}
