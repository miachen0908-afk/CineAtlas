"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getCountry, getGenre, getPerson } from "@/lib/data";
import type { Film, FilmWithRelations } from "@/types/cinema";
import {
  buildMapQueryParams,
  formatYearRange,
  useMapStore,
} from "@/store/useMapStore";
import { filterFilms } from "@/utils/filmFilters";
import { EdgeFilterPanel } from "@/components/filters/EdgeFilterPanel";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { YearRangeSlider } from "@/components/timeline/YearRangeSlider";
import { FilmPreviewCard } from "@/components/film/FilmPreviewCard";
import {
  AnchoredFilmPreviewCard,
  type FilmPreviewAnchor,
} from "@/components/film/AnchoredFilmPreviewCard";
import { CountryFilmDrawer } from "@/components/country/CountryFilmDrawer";
import { EmptyState } from "@/components/layout/EmptyState";
import { useHomeExperience } from "@/components/home/HomeExperienceContext";
import { IntroBrandTitle } from "@/components/home/IntroBrandTitle";

const CinemaGlobe = dynamic(
  () =>
    import("@/components/globe/CinemaGlobe").then((m) => m.CinemaGlobe),
  {
    ssr: false,
    loading: () => <div className="h-full w-full" aria-hidden />,
  }
);

const TIMELINE_CLOSE_DELAY_MS = 300;
const COUNTRY_DRAWER_CLOSE_DELAY_MS = 300;
const GLOBE_AUTO_ROTATE_IDLE_MS = 5000;

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
  initialFilters?: {
    yearStart?: number;
    yearEnd?: number;
    countryCode?: string | null;
    genreId?: string | null;
  };
};

type FilmPreviewSource = "globe" | "country-list" | null;

export function MapHomeClient({ films, initialFilters }: MapHomeClientProps) {
  const { phase, startExit, completeExit } = useHomeExperience();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const uiReady = phase === "ready";
  const yearStart = useMapStore((s) => s.yearStart);
  const yearEnd = useMapStore((s) => s.yearEnd);
  const selectedCountryCode = useMapStore((s) => s.selectedCountryCode);
  const selectedGenreId = useMapStore((s) => s.selectedGenreId);
  const selectedFilmId = useMapStore((s) => s.selectedFilmId);
  const setYearRange = useMapStore((s) => s.setYearRange);
  const setCountry = useMapStore((s) => s.setCountry);
  const setGenre = useMapStore((s) => s.setGenre);
  const selectFilm = useMapStore((s) => s.selectFilm);
  const clearFilters = useMapStore((s) => s.clearFilters);
  const posterScale = useMapStore((s) => s.posterScale);

  const [filterOpen, setFilterOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [hoveredDrawerCode, setHoveredDrawerCode] = useState<string | null>(
    null
  );
  const [pinnedDrawerCode, setPinnedDrawerCode] = useState<string | null>(null);
  const [previewSource, setPreviewSource] =
    useState<FilmPreviewSource>(null);
  const [listPreviewAnchor, setListPreviewAnchor] =
    useState<FilmPreviewAnchor | null>(null);
  const [globePreviewAnchor, setGlobePreviewAnchor] =
    useState<FilmPreviewAnchor | null>(null);
  const [autoRotateGlobe, setAutoRotateGlobe] = useState(false);
  const timelineCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countryDrawerCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const initialFiltersApplied = useRef(false);
  const autoRotateIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const visibleDrawerCode = pinnedDrawerCode ?? hoveredDrawerCode;
  const autoRotationBlocked =
    !uiReady ||
    prefersReducedMotion ||
    visibleDrawerCode !== null ||
    previewSource !== null;

  const resetAutoRotationIdle = useCallback(() => {
    if (autoRotateIdleTimer.current) {
      clearTimeout(autoRotateIdleTimer.current);
      autoRotateIdleTimer.current = null;
    }

    setAutoRotateGlobe(false);
    if (autoRotationBlocked || document.hidden) return;

    autoRotateIdleTimer.current = setTimeout(() => {
      if (!document.hidden) setAutoRotateGlobe(true);
      autoRotateIdleTimer.current = null;
    }, GLOBE_AUTO_ROTATE_IDLE_MS);
  }, [autoRotationBlocked]);

  useEffect(() => {
    const setupTimer = window.setTimeout(resetAutoRotationIdle, 0);

    const handleActivity = () => resetAutoRotationIdle();
    const handleVisibilityChange = () => resetAutoRotationIdle();

    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("touchstart", handleActivity, { passive: true });
    window.addEventListener("wheel", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(setupTimer);
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("wheel", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (autoRotateIdleTimer.current) {
        clearTimeout(autoRotateIdleTimer.current);
        autoRotateIdleTimer.current = null;
      }
    };
  }, [resetAutoRotationIdle]);

  useEffect(() => {
    if (phase !== "intro") return;

    const handleIntroKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || (event.key !== "Enter" && event.key !== " ")) {
        return;
      }
      event.preventDefault();
      startExit();
    };

    window.addEventListener("keydown", handleIntroKeyDown);
    return () => window.removeEventListener("keydown", handleIntroKeyDown);
  }, [phase, startExit]);

  useEffect(() => {
    if (initialFiltersApplied.current) return;
    initialFiltersApplied.current = true;

    if (
      initialFilters?.yearStart !== undefined &&
      initialFilters.yearEnd !== undefined
    ) {
      setYearRange(initialFilters.yearStart, initialFilters.yearEnd);
    }
    if (initialFilters?.countryCode !== undefined) {
      setCountry(initialFilters.countryCode);
    }
    if (initialFilters?.genreId !== undefined) {
      setGenre(initialFilters.genreId);
    }
  }, [initialFilters, setCountry, setGenre, setYearRange]);

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

  const drawerFilms = useMemo(
    () =>
      filterFilms(films, {
        yearStart,
        yearEnd,
        countryCode: visibleDrawerCode,
        genreId: selectedGenreId,
      }),
    [films, yearStart, yearEnd, visibleDrawerCode, selectedGenreId]
  );

  const countryFilmStats = useMemo(() => {
    if (!visibleDrawerCode) return { yearRangeLabel: null, count: 0 };
    const validFilms = films.filter(
      (film) =>
        film.primaryProductionCountry === visibleDrawerCode &&
        Number.isInteger(film.year) &&
        film.year >= 1895 &&
        film.year <= new Date().getFullYear() + 1
    );
    if (validFilms.length === 0) return { yearRangeLabel: null, count: 0 };
    const years = validFilms.map((film) => film.year);
    return {
      yearRangeLabel: `${Math.min(...years)}—${Math.max(...years)}`,
      count: validFilms.length,
    };
  }, [films, visibleDrawerCode]);

  const selectedFilm = useMemo(() => {
    if (!selectedFilmId) return null;
    const film = films.find((item) => item.id === selectedFilmId);
    return film ? buildFilmWithRelations(film) ?? null : null;
  }, [films, selectedFilmId]);

  const mapQuery = buildMapQueryParams({
    yearStart,
    yearEnd,
    selectedCountryCode,
    selectedGenreId,
  });
  const selectedGenreLabel = selectedGenreId
    ? getGenre(selectedGenreId)?.nameZh ?? null
    : null;

  const clearFilmPreview = useCallback(() => {
    selectFilm(null);
    setPreviewSource(null);
    setListPreviewAnchor(null);
    setGlobePreviewAnchor(null);
  }, [selectFilm]);

  const cancelCountryDrawerClose = useCallback(() => {
    if (countryDrawerCloseTimer.current) {
      clearTimeout(countryDrawerCloseTimer.current);
      countryDrawerCloseTimer.current = null;
    }
  }, []);

  const scheduleCountryDrawerClose = useCallback(() => {
    if (pinnedDrawerCode) return;
    cancelCountryDrawerClose();
    countryDrawerCloseTimer.current = setTimeout(() => {
      setHoveredDrawerCode(null);
      if (previewSource === "country-list") clearFilmPreview();
    }, COUNTRY_DRAWER_CLOSE_DELAY_MS);
  }, [cancelCountryDrawerClose, clearFilmPreview, pinnedDrawerCode, previewSource]);

  useEffect(
    () => () => {
      if (countryDrawerCloseTimer.current) {
        clearTimeout(countryDrawerCloseTimer.current);
      }
    },
    []
  );

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
      cancelCountryDrawerClose();
      setCountry(code);
      setPinnedDrawerCode(code);
      setHoveredDrawerCode(null);
      clearFilmPreview();
    },
    [cancelCountryDrawerClose, clearFilmPreview, setCountry]
  );

  const handleCountryHover = useCallback(
    (code: string | null) => {
      if (pinnedDrawerCode) return;
      if (!code) {
        scheduleCountryDrawerClose();
        return;
      }

      cancelCountryDrawerClose();
      if (code !== hoveredDrawerCode) clearFilmPreview();
      setHoveredDrawerCode(code);
    },
    [
      cancelCountryDrawerClose,
      clearFilmPreview,
      hoveredDrawerCode,
      pinnedDrawerCode,
      scheduleCountryDrawerClose,
    ]
  );

  const handleGenreSelect = useCallback(
    (genreId: string | null) => {
      setGenre(genreId);
      clearFilmPreview();
    },
    [clearFilmPreview, setGenre]
  );

  const handleYearRangeChange = useCallback(
    (start: number, end: number) => {
      setYearRange(start, end);
      clearFilmPreview();
    },
    [clearFilmPreview, setYearRange]
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
    cancelCountryDrawerClose();
    setPinnedDrawerCode(null);
    setHoveredDrawerCode(null);
    clearFilmPreview();
  }, [cancelCountryDrawerClose, clearFilmPreview, clearFilters]);

  const handleGlobeFilmSelect = useCallback(
    (filmId: string, anchor: FilmPreviewAnchor) => {
      selectFilm(filmId);
      setPreviewSource("globe");
      setGlobePreviewAnchor(anchor);
      setListPreviewAnchor(null);
    },
    [selectFilm]
  );

  const handleDrawerFilmSelect = useCallback(
    (filmId: string, anchor: FilmPreviewAnchor) => {
      selectFilm(filmId);
      setPreviewSource("country-list");
      setListPreviewAnchor(anchor);
      setGlobePreviewAnchor(null);
    },
    [selectFilm]
  );

  const handleGlobeInteractionStart = useCallback(() => {
    resetAutoRotationIdle();
    if (previewSource === "globe") clearFilmPreview();
  }, [clearFilmPreview, previewSource, resetAutoRotationIdle]);

  useEffect(() => {
    const handleResize = () => {
      if (previewSource === "globe") clearFilmPreview();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clearFilmPreview, previewSource]);

  const handleCloseDrawer = useCallback(() => {
    cancelCountryDrawerClose();
    setPinnedDrawerCode(null);
    setHoveredDrawerCode(null);
    if (previewSource === "country-list") {
      clearFilmPreview();
    }
  }, [cancelCountryDrawerClose, clearFilmPreview, previewSource]);

  const handleBackgroundClick = useCallback(() => {
    cancelCountryDrawerClose();
    setCountry(null);
    setPinnedDrawerCode(null);
    setHoveredDrawerCode(null);
    clearFilmPreview();
  }, [cancelCountryDrawerClose, clearFilmPreview, setCountry]);

  return (
    <div
      className="flex flex-1 flex-col overflow-hidden text-[var(--ink)]"
      data-globe-auto-rotate={autoRotateGlobe ? "true" : "false"}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Main map area — full width; filters via edge panel */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <motion.div
            initial={false}
            animate={{ opacity: uiReady ? 1 : 0, y: uiReady ? 0 : 8 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.4 }}
            className={uiReady ? "" : "pointer-events-none"}
            aria-hidden={!uiReady}
          >
            <EdgeFilterPanel
              onCountrySelect={handleCountrySelect}
              onGenreSelect={handleGenreSelect}
              onClearFilters={handleClearFilters}
            />
          </motion.div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className={`glass-control absolute left-3 top-3 z-20 rounded-full border px-3 py-1.5 text-xs transition-opacity duration-300 md:hidden ${
              uiReady ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!uiReady}
          >
            筛选
          </button>

          <div className="relative flex-1">
            {uiReady && filteredFilms.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8">
                <EmptyState
                  title={`${yearRangeLabel} 暂无符合条件的影片`}
                  description="试试调整时间段或清除筛选条件"
                />
              </div>
            )}
            <AnimatePresence>
              {phase !== "ready" && (
                <IntroBrandTitle
                  phase={phase}
                  reducedMotion={prefersReducedMotion}
                />
              )}
            </AnimatePresence>

            <div className="absolute inset-0 z-10">
              <CinemaGlobe
                films={filteredFilms}
                selectedFilmId={selectedFilmId}
                highlightedCountryCode={selectedCountryCode}
                posterScale={posterScale}
                yearStart={yearStart}
                yearEnd={yearEnd}
                genreId={selectedGenreId}
                experiencePhase={phase}
                autoRotate={autoRotateGlobe}
                onSelectFilm={handleGlobeFilmSelect}
                onSelectCountry={handleCountrySelect}
                onHoverCountry={handleCountryHover}
                onBackgroundClick={handleBackgroundClick}
                onInteractionStart={handleGlobeInteractionStart}
                onExperienceReady={completeExit}
              />
            </div>

            {phase !== "ready" && (
              <button
                type="button"
                onClick={startExit}
                className={`fixed inset-0 z-[70] bg-transparent focus-visible:outline-none ${
                  phase === "intro" ? "cursor-pointer" : "cursor-wait"
                }`}
                aria-label={
                  phase === "intro" ? "点击进入影迹" : "正在进入影迹"
                }
              />
            )}

            {/* Bottom timeline: collapsed trigger + hover/tap expand */}
            <div
              className={`absolute bottom-[max(32px,env(safe-area-inset-bottom))] left-1/2 z-30 w-[calc(100%-1.5rem)] -translate-x-1/2 transition-all duration-300 md:w-3/5 lg:w-1/3 ${
                uiReady
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              }`}
              aria-hidden={!uiReady}
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
                  className="mb-1 h-px w-16 rounded-full bg-white/40"
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
                    className="timeline-glass glass-bar overflow-hidden rounded-t-2xl motion-reduce:transition-none"
                    onMouseEnter={cancelTimelineClose}
                  >
                    <YearRangeSlider
                      yearStart={yearStart}
                      yearEnd={yearEnd}
                      onChange={handleYearRangeChange}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <CountryFilmDrawer
              countryCode={uiReady ? visibleDrawerCode : null}
              films={drawerFilms}
              countryYearRangeLabel={countryFilmStats.yearRangeLabel}
              countryFilmCount={countryFilmStats.count}
              yearRangeLabel={yearRangeLabel}
              genreLabel={selectedGenreLabel}
              mapQuery={mapQuery}
              selectedFilmId={
                previewSource === "country-list" ? selectedFilmId : null
              }
              onSelectFilm={handleDrawerFilmSelect}
              onAnchorChange={setListPreviewAnchor}
              onClose={handleCloseDrawer}
              onPointerEnter={cancelCountryDrawerClose}
              onPointerLeave={scheduleCountryDrawerClose}
            />
          </div>
        </div>

      </div>

      {/* Mobile filter drawer */}
      {uiReady && filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(0,7,20,0.56)] backdrop-blur-[2px]"
            onClick={() => setFilterOpen(false)}
            aria-label="关闭筛选"
          />
          <div className="glass-panel absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl p-5 text-[var(--ink)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--ink)]">筛选</h2>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="glass-icon-button rounded-full px-2 py-1"
              >
                ✕
              </button>
            </div>
            <FilterPanel
              onClose={() => setFilterOpen(false)}
              onCountrySelect={handleCountrySelect}
              onGenreSelect={handleGenreSelect}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
      )}

      <AnchoredFilmPreviewCard
        film={
          uiReady && previewSource === "country-list" ? selectedFilm : null
        }
        anchor={uiReady ? listPreviewAnchor : null}
        query={mapQuery}
        onClose={clearFilmPreview}
        onPointerEnter={cancelCountryDrawerClose}
        onPointerLeave={scheduleCountryDrawerClose}
      />

      <FilmPreviewCard
        film={uiReady && previewSource === "globe" ? selectedFilm : null}
        anchor={uiReady ? globePreviewAnchor : null}
        query={mapQuery}
        drawerVisible={visibleDrawerCode !== null}
        onClose={clearFilmPreview}
        onPointerEnter={cancelCountryDrawerClose}
        onPointerLeave={scheduleCountryDrawerClose}
      />
    </div>
  );
}
