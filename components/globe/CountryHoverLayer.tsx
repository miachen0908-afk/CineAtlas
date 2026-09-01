"use client";

import * as THREE from "three";
import { getCountryCodeFromIso, getIsoNumericId } from "@/lib/countryIso";
import { findVisualCountryIsoAt } from "@/lib/geoBorders";
import { getEarthRadius, vector3ToLatLng } from "@/utils/geo";

type CountryHoverLayerProps = {
  highlightedCode: string | null;
  hoveredCode: string | null;
  onHoverCountry: (code: string | null) => void;
  onSelectCountry: (code: string | null) => void;
};

export function CountryHoverLayer({
  hoveredCode,
  onHoverCountry,
  onSelectCountry,
}: CountryHoverLayerProps) {
  const resolveCodeFromPoint = (point: THREE.Vector3): string | null => {
    const { latitude, longitude } = vector3ToLatLng(point);
    const iso = findVisualCountryIsoAt(latitude, longitude);
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
          onSelectCountry(code);
        }}
      >
        <sphereGeometry args={[getEarthRadius() + 0.009, 64, 64]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Extra hit targets for tiny regions that are difficult to acquire on the globe. */
export function CountryHotspots({
  hotspots,
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
              onSelectCountry(code);
            }}
          >
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial
              color="#000000"
              transparent
              opacity={0}
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
