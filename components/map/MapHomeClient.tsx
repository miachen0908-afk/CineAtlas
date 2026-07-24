"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getCountry, getGenre, getPerson } from "@/lib/data";
import type { Film, FilmWithRelations } from "@/types/cinema";
import {
  formatYearRange,
  useMapStore,
} from "@/store/useMapStore";
import { filterFilms, countFilmsByCountry } from "@/utils/filmFilters";
import { EdgeFilterPanel } from "@/components/filters/EdgeFilterPanel";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { YearRangeSlider } from "@/components/timeline/YearRangeSlider";
import { FilmPreviewCard } from "@/components/film/FilmPreviewCard";
import { EmptyState } from "@/components/layout/EmptyState";

const CinemaGlobe = dynamic(
  () =>
    import("@/components/globe/CinemaGlobe").then((m) => m.CinemaGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-white/30">
        载入地球…
      </div>
    ),
  }
);

function buildFilmWithRelations(film: Film): FilmWithRelations | undefined {
  const country = getCountry(film.primaryProductionCountry);
  if (!country) return undefined;
  return {
    ...film,
    country,
    directors: film.directorIds
      .map((id) => getPerson(id))
      .filter((person) => person !== undefined),
    genres: film.genreIds
      .map((id) => getGenre(id))
      .filter((genre) => genre !== undefined),
  };
}

type MapHomeClientProps = {
  films: Film[];
};

export function MapHomeClient({ films }: MapHomeClientProps) {
  const yearStart = useMapStore((s) => s.yearStart);
  const yearEnd = useMapStore((s) => s.yearEnd);
  const selectedCountryCode = useMapStore((s) => s.selectedCountryCode);
  const selectedGenreId = useMapStore((s) => s.selectedGenreId);
  const selectedFilmId = useMapStore((s) => s.selectedFilmId);
  const setYearRange = useMapStore((s) => s.setYearRange);
  const setCountry = useMapStore((s) => s.setCountry);
  const selectFilm = useMapStore((s) => s.selectFilm);

  const [filterOpen, setFilterOpen] = useState(false);

  const yearRangeLabel = formatYearRange(yearStart, yearEnd);

  const filteredFilms = useMemo(
    () =>
      filterFilms(films, {
        yearStart,
        yearEnd,
        countryCode: selectedCountryCode,
        genreId: selectedGenreId,
      }),
    [films, yearStart, yearEnd, selectedCountryCode, selectedGenreId]
  );

  const selectedFilm = useMemo(() => {
    if (!selectedFilmId) return null;
    const film = films.find((item) => item.id === selectedFilmId);
    return film ? buildFilmWithRelations(film) ?? null : null;
  }, [films, selectedFilmId]);

  const handleCountrySelect = useCallback(
    (code: string | null) => {
      setCountry(code);
    },
    [setCountry]
  );

  const handleBackgroundClick = useCallback(() => {
    selectFilm(null);
    setCountry(null);
  }, [selectFilm, setCountry]);

  const highlightedCountry = selectedCountryCode;
  const countryInfo = highlightedCountry
    ? getCountry(highlightedCountry)
    : null;
  const countryFilmCount = highlightedCountry
    ? countFilmsByCountry(films, yearStart, yearEnd, highlightedCountry)
    : 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Main map area — full width; filters via edge panel */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <EdgeFilterPanel />

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="absolute left-3 top-3 z-20 rounded-full border border-white/15 bg-[#0a0a12]/80 px-3 py-1.5 text-xs text-white/70 backdrop-blur-md md:hidden"
          >
            筛选
          </button>

          {/* Country info overlay */}
          {countryInfo && (
            <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0a0a12]/85 px-4 py-3 text-center backdrop-blur-md">
              <p className="text-sm font-medium text-[#e8d5a3]">
                {countryInfo.nameZh}
              </p>
              <p className="text-xs text-white/50">
                {countryFilmCount} 部影片
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <Link
                  href={`/country/${countryInfo.code}`}
                  className="rounded-full bg-[#c9a962]/20 px-3 py-1 text-xs text-[#e8d5a3]"
                >
                  进入国家页
                </Link>
                <button
                  type="button"
                  onClick={() => setCountry(null)}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/50"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="relative flex-1">
            {filteredFilms.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8">
                <EmptyState
                  title={`${yearRangeLabel} 暂无符合条件的影片`}
                  description="试试调整时间段或清除筛选条件"
                />
              </div>
            )}
            <CinemaGlobe
              films={filteredFilms}
              selectedFilmId={selectedFilmId}
              highlightedCountryCode={highlightedCountry}
              onSelectFilm={selectFilm}
              onSelectCountry={handleCountrySelect}
              onBackgroundClick={handleBackgroundClick}
            />
          </div>
        </div>

        {/* Desktop preview card — right side */}
        <FilmPreviewCard
          film={selectedFilm ?? null}
          onClose={() => selectFilm(null)}
        />
      </div>

      {/* Year range slider */}
      <footer className="shrink-0 border-t border-white/10 bg-[#0a0a12]/80 backdrop-blur-md">
        <YearRangeSlider
          yearStart={yearStart}
          yearEnd={yearEnd}
          onChange={setYearRange}
          filmCount={filteredFilms.length}
        />
      </footer>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setFilterOpen(false)}
            aria-label="关闭筛选"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0a0a12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-white/80">筛选</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-white/40"
              >
                ✕
              </button>
            </div>
            <FilterPanel onClose={() => setFilterOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
