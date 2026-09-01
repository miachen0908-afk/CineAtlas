"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import {
  getIsoNumericId,
  COUNTRY_HOTSPOT_CODES,
} from "@/lib/countryIso";
import { getCountryBorderLines } from "@/lib/geoBorders";
import { COUNTRY_SHELL_RADIUS } from "@/lib/countryMeshes";
import { getCountry } from "@/lib/data";
import { latLngToVector3, getEarthRadius } from "@/utils/geo";
import {
  CountryHoverLayer,
  CountryHotspots,
} from "./CountryHoverLayer";
import { AuroraCountryOutline } from "./AuroraCountryOutline";

type CountryLayerProps = {
  highlightedCode: string | null;
  isMobile?: boolean;
  reducedMotion?: boolean;
  revealing?: boolean;
  onSelectCountry: (code: string | null) => void;
  onHoverCountry: (code: string | null) => void;
};

export function CountryLayer({
  highlightedCode,
  isMobile = false,
  reducedMotion = false,
  revealing = false,
  onSelectCountry,
  onHoverCountry,
}: CountryLayerProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [auroraEntries, setAuroraEntries] = useState<string[]>([]);
  const hoveredIsoRef = useRef<string | null>(null);
  const auraTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const borderMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const borderRevealProgress = useRef(
    reducedMotion || !revealing ? 1 : -0.5
  );
  const borderBaseOpacity = isMobile ? 0.17 : 0.21;

  useEffect(() => {
    if (reducedMotion || !revealing) borderRevealProgress.current = 1;
  }, [reducedMotion, revealing]);

  useFrame((_, delta) => {
    if (!borderMaterialRef.current) return;
    if (revealing && !reducedMotion) {
      borderRevealProgress.current = Math.min(
        1,
        borderRevealProgress.current + Math.min(delta, 0.05) / 0.9
      );
    }
    const t = Math.max(0, borderRevealProgress.current);
    const eased = t * t * (3 - 2 * t);
    borderMaterialRef.current.opacity = borderBaseOpacity * eased;
  });

  const handleHover = useCallback(
    (code: string | null) => {
      const nextIso = code ? getIsoNumericId(code) ?? null : null;
      const previousIso = hoveredIsoRef.current;

      if (nextIso) {
        const existingTimer = auraTimers.current.get(nextIso);
        if (existingTimer) clearTimeout(existingTimer);
        auraTimers.current.delete(nextIso);
        setAuroraEntries((current) =>
          current.includes(nextIso) ? current : [...current, nextIso]
        );
      }

      if (previousIso && previousIso !== nextIso) {
        const existingTimer = auraTimers.current.get(previousIso);
        if (existingTimer) clearTimeout(existingTimer);
        const timer = setTimeout(() => {
          setAuroraEntries((current) =>
            current.filter((iso) => iso !== previousIso)
          );
          auraTimers.current.delete(previousIso);
        }, 460);
        auraTimers.current.set(previousIso, timer);
      }

      hoveredIsoRef.current = nextIso;
      setHoveredCode(code);
      onHoverCountry(code);
    },
    [onHoverCountry]
  );

  useEffect(
    () => () => {
      for (const timer of auraTimers.current.values()) clearTimeout(timer);
      auraTimers.current.clear();
    },
    []
  );

  const borderLines = useMemo(() => {
    return getCountryBorderLines().map((line) => ({
      ...line,
      points: line.points.map((p) =>
        p.clone().normalize().multiplyScalar(COUNTRY_SHELL_RADIUS + 0.001)
      ),
    }));
  }, []);

  const highlightedIso = highlightedCode
    ? getIsoNumericId(highlightedCode) ?? null
    : null;
  const hoveredIso = hoveredCode ? getIsoNumericId(hoveredCode) ?? null : null;

  const bordersByIso = useMemo(() => {
    const map = new Map<string, typeof borderLines>();
    for (const line of borderLines) {
      const lines = map.get(line.id) ?? [];
      lines.push(line);
      map.set(line.id, lines);
    }
    return map;
  }, [borderLines]);

  const defaultBorderGeometry = useMemo(() => {
    const segmentCount = borderLines.reduce(
      (total, line) => total + Math.max(0, line.points.length - 1),
      0
    );
    const positions = new Float32Array(segmentCount * 6);
    let offset = 0;
    for (const line of borderLines) {
      for (let index = 1; index < line.points.length; index += 1) {
        const from = line.points[index - 1]!;
        const to = line.points[index]!;
        positions[offset++] = from.x;
        positions[offset++] = from.y;
        positions[offset++] = from.z;
        positions[offset++] = to.x;
        positions[offset++] = to.y;
        positions[offset++] = to.z;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();
    return geometry;
  }, [borderLines]);

  useEffect(
    () => () => defaultBorderGeometry.dispose(),
    [defaultBorderGeometry]
  );

  const hotspots = useMemo(() => {
    const list: Array<{ code: string; position: import("three").Vector3 }> = [];
    for (const code of COUNTRY_HOTSPOT_CODES) {
      const country = getCountry(code);
      if (!country) continue;
      list.push({
        code,
        position: latLngToVector3(
          country.center.latitude,
          country.center.longitude,
          getEarthRadius() + 0.02
        ),
      });
    }
    return list;
  }, []);

  return (
    <group>
      <CountryHoverLayer
        highlightedCode={highlightedCode}
        hoveredCode={hoveredCode}
        onHoverCountry={handleHover}
        onSelectCountry={onSelectCountry}
      />

      <CountryHotspots
        hotspots={hotspots}
        highlightedCode={highlightedCode}
        hoveredCode={hoveredCode}
        onHoverCountry={handleHover}
        onSelectCountry={onSelectCountry}
      />

      <lineSegments geometry={defaultBorderGeometry} renderOrder={4}>
        <lineBasicMaterial
          ref={borderMaterialRef}
          color="#35c8b4"
          transparent
          opacity={reducedMotion || !revealing ? borderBaseOpacity : 0}
          depthWrite={false}
          depthTest
          toneMapped={false}
        />
      </lineSegments>

      {highlightedIso && highlightedIso !== hoveredIso && (
        <group name={`selected-outline-${highlightedIso}`}>
          {(bordersByIso.get(highlightedIso) ?? []).map((line, index) => (
            <Line
              key={`selected-${highlightedIso}-${index}`}
              points={line.points}
              color="#68b8c0"
              lineWidth={isMobile ? 0.75 : 0.9}
              transparent
              opacity={0.38}
              depthWrite={false}
              depthTest
              renderOrder={5}
            />
          ))}
        </group>
      )}

      {auroraEntries.map((isoId) => (
        <AuroraCountryOutline
          key={isoId}
          isoId={isoId}
          lines={bordersByIso.get(isoId) ?? []}
          active={hoveredIso === isoId}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
