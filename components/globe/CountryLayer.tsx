"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import { countries } from "@/lib/data";
import { getIsoNumericId } from "@/lib/countryIso";
import { getCountryBorderLines } from "@/lib/geoBorders";
import { latLngToVector3, getEarthRadius } from "@/utils/geo";

const RADIUS = getEarthRadius() + 0.01;

type CountryLayerProps = {
  highlightedCode: string | null;
  onSelectCountry: (code: string | null) => void;
};

export function CountryLayer({
  highlightedCode,
  onSelectCountry,
}: CountryLayerProps) {
  const borderLines = useMemo(() => getCountryBorderLines(), []);
  const highlightedIso = highlightedCode
    ? getIsoNumericId(highlightedCode)
    : null;

  const countryCenters = useMemo(
    () =>
      countries.map((country) => ({
        code: country.code,
        center: latLngToVector3(
          country.center.latitude,
          country.center.longitude,
          RADIUS
        ),
      })),
    []
  );

  return (
    <group>
      {borderLines.map((line, index) => {
        const isHighlighted = highlightedIso === line.id;
        return (
          <Line
            key={`${line.id}-${index}`}
            points={line.points}
            color={isHighlighted ? "#c9a962" : "#5a7090"}
            lineWidth={isHighlighted ? 1.5 : 0.8}
            transparent
            opacity={isHighlighted ? 0.95 : 0.55}
          />
        );
      })}

      {countryCenters.map(({ code, center }) => {
        const isHighlighted = highlightedCode === code;
        return (
          <mesh
            key={code}
            position={center}
            onClick={(e) => {
              e.stopPropagation();
              onSelectCountry(isHighlighted ? null : code);
            }}
          >
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        );
      })}
    </group>
  );
}
