"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

const TIMELINE_CLOSE_DELAY_MS = 300;

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
  const posterScale = useMapStore((s) => s.posterScale);

  const [filterOpen, setFilterOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [hoveredCountryCode, setHoveredCountryCode] = useState<string | null>(
    null
  );
  const timelineCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const cancelTimelineClose = useCallback(() => {
    if (timelineCloseTimer.current) {
      clearTimeout(timelineCloseTimer.current);
      timelineCloseTimer.current = null;
    }
  }, []);

  const scheduleTimelineClose = useCallback(() => {
    cancelTimelineClose();
    timelineCloseTimer.current = setTimeout(
      () => setTimelineOpen(false),
      TIMELINE_CLOSE_DELAY_MS
    );
  }, [cancelTimelineClose]);

  const openTimeline = useCallback(() => {
    cancelTimelineClose();
    setTimelineOpen(true);
  }, [cancelTimelineClose]);

  const toggleTimelineMobile = useCallback(() => {
    setTimelineOpen((prev) => !prev);
  }, []);

  const handleCountrySelect = useCallback(
    (code: string | null) => {
      setCountry(code);
    },
    [setCountry]
  );

  const handleCountryHover = useCallback(
    (code: string | null) => {
      if (code && selectedCountryCode && code !== selectedCountryCode) {
        setCountry(null);
      }
      setHoveredCountryCode(code);
    },
    [selectedCountryCode, setCountry]
  );

  const handleBackgroundClick = useCallback(() => {
    selectFilm(null);
    setCountry(null);
  }, [selectFilm, setCountry]);

  // Hover takes priority for overlay; fall back to click-selected country
  const overlayCountryCode = hoveredCountryCode ?? selectedCountryCode;
  const countryInfo = overlayCountryCode
    ? getCountry(overlayCountryCode)
    : null;
  const countryFilmCount = overlayCountryCode
    ? countFilmsByCountry(films, yearStart, yearEnd, overlayCountryCode)
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
            className="absolute left-3 top-3 z-20 rounded-full border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-3 py-1.5 text-xs text-[var(--ink-muted)] backdrop-blur-md md:hidden"
          >
            筛选
          </button>

          {/* Country info overlay */}
          {countryInfo && (
            <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-xl border border-[var(--border-soft)] bg-[var(--paper-translucent)] px-4 py-3 text-center shadow-[var(--panel-shadow)] backdrop-blur-md">
              <p className="text-sm font-medium text-[var(--ink)]">
                {countryInfo.nameZh}
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                {countryFilmCount} 部影片
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <Link
                  href={`/country/${countryInfo.code}`}
                  className="rounded-full bg-[rgba(58,143,183,0.16)] px-3 py-1 text-xs text-[var(--ocean-deep)] ring-1 ring-[rgba(47,111,158,0.4)]"
                >
                  进入国家页
                </Link>
                {selectedCountryCode && (
                  <button
                    type="button"
                    onClick={() => setCountry(null)}
                    className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs text-[var(--ink-muted)]"
                  >
                    取消选中
                  </button>
                )}
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
              highlightedCountryCode={selectedCountryCode}
              posterScale={posterScale}
              yearStart={yearStart}
              yearEnd={yearEnd}
              genreId={selectedGenreId}
              onSelectFilm={selectFilm}
              onSelectCountry={handleCountrySelect}
              onHoverCountry={handleCountryHover}
              onBackgroundClick={handleBackgroundClick}
            />

            {/* Bottom timeline: collapsed trigger + hover/tap expand */}
            <div
              className="absolute inset-x-0 bottom-0 z-30"
              onMouseEnter={openTimeline}
              onMouseLeave={scheduleTimelineClose}
            >
              {/* Collapsed hit strip */}
              <button
                type="button"
                className="flex h-3.5 w-full items-end justify-center md:h-4"
                onClick={toggleTimelineMobile}
                aria-expanded={timelineOpen}
                aria-label="展开时间轴"
              >
                <span
                  className="mb-1 h-px w-16 rounded-full bg-[rgba(58,143,183,0.45)]"
                  aria-hidden
                />
              </button>

              <AnimatePresence>
                {timelineOpen && (
                  <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 24, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="motion-reduce:transition-none border-t border-[var(--border-soft)] bg-[var(--paper-translucent)] backdrop-blur-md"
                    onMouseEnter={cancelTimelineClose}
                  >
                    <YearRangeSlider
                      yearStart={yearStart}
                      yearEnd={yearEnd}
                      onChange={setYearRange}
                      filmCount={filteredFilms.length}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Desktop preview card — right side */}
        <FilmPreviewCard
          film={selectedFilm ?? null}
          onClose={() => selectFilm(null)}
        />
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setFilterOpen(false)}
            aria-label="关闭筛选"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-[var(--border-soft)] bg-[var(--paper)] p-5 text-[var(--ink)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--ink)]">筛选</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="text-[var(--ink-muted)]"
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
