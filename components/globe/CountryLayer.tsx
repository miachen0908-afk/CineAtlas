"use client";

import { useMemo, useState, useCallback } from "react";
import { Line } from "@react-three/drei";
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

type CountryLayerProps = {
  highlightedCode: string | null;
  onSelectCountry: (code: string | null) => void;
  onHoverCountry: (code: string | null) => void;
};

export function CountryLayer({
  highlightedCode,
  onSelectCountry,
  onHoverCountry,
}: CountryLayerProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const handleHover = useCallback(
    (code: string | null) => {
      setHoveredCode(code);
      onHoverCountry(code);
    },
    [onHoverCountry]
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
    ? getIsoNumericId(highlightedCode)
    : null;
  const hoveredIso = hoveredCode ? getIsoNumericId(hoveredCode) : null;

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

      {borderLines.map((line, index) => {
        const isSelected = highlightedIso === line.id;
        const isHovered = hoveredIso === line.id;
        const active = isSelected || isHovered;
        return (
          <Line
            key={`${line.id}-${index}`}
            points={line.points}
            color={isSelected ? "#3dd4b0" : isHovered ? "#22c9a3" : "#10BF9B"}
            lineWidth={isSelected ? 2.2 : isHovered ? 1.6 : 1.1}
            transparent
            opacity={active ? 0.95 : 0.45}
          />
        );
      })}
    </group>
  );
}
