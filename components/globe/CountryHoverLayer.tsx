"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCountryMeshes } from "@/lib/countryMeshes";
import { getCountryCodeFromIso, getIsoNumericId } from "@/lib/countryIso";
import { findCountryIsoAt } from "@/lib/countryLookup";
import { getEarthRadius, vector3ToLatLng } from "@/utils/geo";

type CountryHoverLayerProps = {
  highlightedCode: string | null;
  hoveredCode: string | null;
  onHoverCountry: (code: string | null) => void;
  onSelectCountry: (code: string | null) => void;
};

type CountryFillProps = {
  isoId: string;
  geometries: THREE.BufferGeometry[];
  highlightedCode: string | null;
  hoveredCode: string | null;
};

function CountryFill({
  isoId,
  geometries,
  highlightedCode,
  hoveredCode,
}: CountryFillProps) {
  const groupRef = useRef<THREE.Group>(null);
  const countryCode = getCountryCodeFromIso(isoId);
  const isSelected = countryCode !== undefined && highlightedCode === countryCode;
  const isHovered = countryCode !== undefined && hoveredCode === countryCode;
  const active = isSelected || isHovered;

  const targetScale = isSelected ? 1.018 : isHovered ? 1.012 : 1;
  const targetEmissive = isSelected ? 0.35 : isHovered ? 0.22 : 0;
  const targetOpacity = isSelected ? 0.32 : isHovered ? 0.2 : 0;

  useFrame(() => {
    if (!groupRef.current) return;
    const s = groupRef.current.scale.x;
    groupRef.current.scale.setScalar(s + (targetScale - s) * 0.16);

    groupRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.16;
        mat.opacity += (targetOpacity - mat.opacity) * 0.16;
        mat.visible = mat.opacity > 0.01;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {geometries.map((geometry, index) => (
        <mesh key={`${isoId}-${index}`} geometry={geometry}>
          <meshStandardMaterial
            color={active ? "#F2E9DB" : "#3a8fb7"}
            emissive={active ? "#F2E9DB" : "#000000"}
            emissiveIntensity={0}
            transparent
            opacity={0}
            depthWrite={false}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}

export function CountryHoverLayer({
  highlightedCode,
  hoveredCode,
  onHoverCountry,
  onSelectCountry,
}: CountryHoverLayerProps) {
  const meshes = useMemo(() => getCountryMeshes(), []);

  const byIso = useMemo(() => {
    const map = new Map<string, THREE.BufferGeometry[]>();
    for (const mesh of meshes) {
      const list = map.get(mesh.isoId) ?? [];
      list.push(mesh.geometry);
      map.set(mesh.isoId, list);
    }
    return map;
  }, [meshes]);

  const resolveCodeFromPoint = (point: THREE.Vector3): string | null => {
    const { latitude, longitude } = vector3ToLatLng(point);
    const iso = findCountryIsoAt(latitude, longitude);
    if (!iso) return null;
    return getCountryCodeFromIso(iso) ?? null;
  };

  return (
    <group>
      <mesh
        onPointerMove={(e) => {
          e.stopPropagation();
          const code = resolveCodeFromPoint(e.point);
          if (code !== hoveredCode) {
            onHoverCountry(code);
            document.body.style.cursor = code ? "pointer" : "auto";
          }
        }}
        onPointerOut={() => {
          onHoverCountry(null);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          const code = resolveCodeFromPoint(e.point);
          if (!code) return;
          const isSelected = highlightedCode === code;
          onSelectCountry(isSelected ? null : code);
        }}
      >
        <sphereGeometry args={[getEarthRadius() + 0.009, 64, 64]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {Array.from(byIso.entries()).map(([isoId, geometries]) => (
        <CountryFill
          key={isoId}
          isoId={isoId}
          geometries={geometries}
          highlightedCode={highlightedCode}
          hoveredCode={hoveredCode}
        />
      ))}
    </group>
  );
}

/** Tiny hit targets for regions missing from countries-110m (Singapore, Hong Kong). */
export function CountryHotspots({
  hotspots,
  highlightedCode,
  hoveredCode,
  onHoverCountry,
  onSelectCountry,
}: {
  hotspots: Array<{ code: string; position: THREE.Vector3 }>;
  highlightedCode: string | null;
  hoveredCode: string | null;
  onHoverCountry: (code: string | null) => void;
  onSelectCountry: (code: string | null) => void;
}) {
  return (
    <group>
      {hotspots.map(({ code, position }) => {
        const active = highlightedCode === code || hoveredCode === code;
        return (
          <mesh
            key={code}
            position={position}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHoverCountry(code);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              onHoverCountry(null);
              document.body.style.cursor = "auto";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCountry(highlightedCode === code ? null : code);
            }}
          >
            <sphereGeometry args={[active ? 0.07 : 0.05, 12, 12]} />
            <meshBasicMaterial
              color={active ? "#e8c547" : "#3a8fb7"}
              transparent
              opacity={active ? 0.65 : 0.35}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function hoveredIsoFromCode(code: string | null): string | null {
  if (!code) return null;
  return getIsoNumericId(code) ?? null;
}
