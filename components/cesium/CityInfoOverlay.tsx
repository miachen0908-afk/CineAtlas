"use client";

import Link from "next/link";
import type { CesiumTestCity } from "@/types/cesium-prototype";
import type { ScreenAnchor } from "./CesiumGlobeView";

type NearbyFilm = {
  id: string;
  titleZh: string;
  year: number;
  posterColor?: string;
};

type CityInfoOverlayProps = {
  city: CesiumTestCity | null;
  anchor: ScreenAnchor | null;
  films: NearbyFilm[];
  onClose: () => void;
};

export function CityInfoOverlay({
  city,
  anchor,
  films,
  onClose,
}: CityInfoOverlayProps) {
  if (!city || !anchor || !anchor.visible) return null;

  return (
    <>
      {/* Desktop: anchored beside city */}
      <aside
        className="pointer-events-auto absolute z-20 hidden w-64 -translate-y-1/2 rounded-xl border border-[var(--border-soft)] bg-[var(--paper-translucent)] p-4 shadow-[var(--panel-shadow)] backdrop-blur-md md:block"
        style={{
          left: Math.min(
            typeof window !== "undefined" ? window.innerWidth - 280 : anchor.x + 18,
            anchor.x + 18
          ),
          top: anchor.y,
        }}
      >
        <CityPanel city={city} films={films} onClose={onClose} />
      </aside>

      {/* Mobile: bottom drawer */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 rounded-t-2xl border-t border-[var(--border-soft)] bg-[var(--paper-translucent)] p-4 shadow-[var(--panel-shadow)] backdrop-blur-md md:hidden">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgba(58,143,183,0.35)]" />
        <CityPanel city={city} films={films} onClose={onClose} />
      </div>
    </>
  );
}

function CityPanel({
  city,
  films,
  onClose,
}: {
  city: CesiumTestCity;
  films: NearbyFilm[];
  onClose: () => void;
}) {
  return (
    <div className="text-[var(--ink)]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-medium">{city.nameZh}</h2>
          <p className="font-mono text-[10px] text-[var(--ink-muted)]">
            {city.longitude.toFixed(4)}, {city.latitude.toFixed(4)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-2 text-[var(--ink-muted)] hover:bg-white/60"
          aria-label="关闭"
        >
          ✕
        </button>
      </div>

      {films.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {films.slice(0, 4).map((film) => (
            <li key={film.id}>
              <Link
                href={`/film/${film.id}`}
                className="flex items-center gap-2 rounded-lg bg-white/60 px-2 py-1.5 text-sm hover:bg-white/90"
              >
                <span
                  className="h-10 w-7 shrink-0 rounded"
                  style={{ backgroundColor: film.posterColor ?? "#3a8fb7" }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block truncate">{film.titleZh}</span>
                  <span className="text-[10px] text-[var(--ink-muted)]">
                    {film.year}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          附近暂无示例影片（原型用坐标邻近匹配）
        </p>
      )}
    </div>
  );
}
