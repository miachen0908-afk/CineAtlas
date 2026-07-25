"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import "cesium/Build/Cesium/Widgets/widgets.css";
import citiesData from "@/data/cesium-test-cities.json";
import filmsData from "@/data/films.json";
import type { CesiumDayNightMode, CesiumTestCity } from "@/types/cesium-prototype";
import type { Film } from "@/types/cinema";
import {
  CesiumGlobeView,
  type CesiumGlobeApi,
  type ScreenAnchor,
} from "./CesiumGlobeView";
import { CityInfoOverlay } from "./CityInfoOverlay";

const cities = citiesData as CesiumTestCity[];
const films = filmsData as Film[];

function haversineKm(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function CesiumPrototypeClient() {
  const [mode, setMode] = useState<CesiumDayNightMode>("day");
  const [showCities, setShowCities] = useState(true);
  const [showDebugCoords, setShowDebugCoords] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<ScreenAnchor | null>(null);
  const apiRef = useRef<CesiumGlobeApi | null>(null);

  const selectedCity =
    cities.find((c) => c.id === selectedCityId) ?? null;

  const nearbyFilms = useMemo(() => {
    if (!selectedCity) return [];
    return films
      .filter((f) => {
        const lon = f.coordinates?.longitude;
        const lat = f.coordinates?.latitude;
        if (typeof lon !== "number" || typeof lat !== "number") return false;
        return (
          haversineKm(
            selectedCity.longitude,
            selectedCity.latitude,
            lon,
            lat
          ) < 350
        );
      })
      .map((f) => ({
        id: f.id,
        titleZh: f.titleZh,
        year: f.year,
        posterColor: f.posterColor,
      }));
  }, [selectedCity]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-black">
      <div className="relative min-h-0 flex-1">
        <CesiumGlobeView
          cities={cities}
          mode={mode}
          showCities={showCities}
          showDebugCoords={showDebugCoords}
          selectedCityId={selectedCityId}
          onSelectCity={setSelectedCityId}
          onAnchorChange={setAnchor}
          onReady={(api) => {
            apiRef.current = api;
          }}
        />

        <CityInfoOverlay
          city={selectedCity}
          anchor={anchor}
          films={nearbyFilms}
          onClose={() => setSelectedCityId(null)}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-start justify-between gap-2 p-3 md:p-4">
          <div className="pointer-events-auto flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              ← 返回首页
            </Link>
            <span className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink-muted)] backdrop-blur-md">
              Cesium 原型 · WGS84
            </span>
          </div>

          <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setMode((m) => (m === "day" ? "night" : "day"))}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              {mode === "day" ? "切换星光" : "切换日光"}
            </button>
            <button
              type="button"
              onClick={() => setShowCities((v) => !v)}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              城市调试：{showCities ? "开" : "关"}
            </button>
            <button
              type="button"
              onClick={() => setShowDebugCoords((v) => !v)}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              经纬度：{showDebugCoords ? "显" : "隐"}
            </button>
            <button
              type="button"
              onClick={() => apiRef.current?.flyHome()}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              东亚视角
            </button>
            <button
              type="button"
              onClick={() => apiRef.current?.saveCamera()}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              保存镜头
            </button>
            <button
              type="button"
              onClick={() => apiRef.current?.restoreCamera()}
              className="rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink)] backdrop-blur-md"
            >
              恢复镜头
            </button>
          </div>
        </div>

        <div className="pointer-events-auto absolute bottom-3 left-3 z-30 flex flex-wrap gap-1.5 md:bottom-4 md:left-4">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => {
                setSelectedCityId(city.id);
                apiRef.current?.flyToCityId(city.id);
              }}
              className={`rounded-full px-2.5 py-1 text-[10px] backdrop-blur-md ${
                selectedCityId === city.id
                  ? "bg-[rgba(16,191,155,0.25)] text-[var(--ink)] ring-1 ring-[#10BF9B]"
                  : "border border-[var(--border-soft)] bg-[var(--paper-translucent)] text-[var(--ink-muted)]"
              }`}
            >
              {city.nameZh}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
