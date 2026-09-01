"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { getCountry } from "@/lib/data";
import type { Film } from "@/types/cinema";
import type { FilmPreviewAnchor } from "@/components/film/AnchoredFilmPreviewCard";
import { EmptyState } from "@/components/layout/EmptyState";

type CountryFilmDrawerProps = {
  countryCode: string | null;
  films: Film[];
  yearRangeLabel: string;
  genreLabel: string | null;
  mapQuery: string;
  selectedFilmId: string | null;
  onSelectFilm: (filmId: string, anchor: FilmPreviewAnchor) => void;
  onAnchorChange: (anchor: FilmPreviewAnchor) => void;
  onClose: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

function readAnchor(element: HTMLElement): FilmPreviewAnchor {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

export function CountryFilmDrawer({
  countryCode,
  films,
  yearRangeLabel,
  genreLabel,
  mapQuery,
  selectedFilmId,
  onSelectFilm,
  onAnchorChange,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: CountryFilmDrawerProps) {
  const selectedPosterRef = useRef<HTMLButtonElement | null>(null);
  const country = countryCode ? getCountry(countryCode) : null;

  const sortedFilms = useMemo(
    () =>
      [...films].sort(
        (a, b) => a.year - b.year || a.titleZh.localeCompare(b.titleZh, "zh-CN")
      ),
    [films]
  );

  const updateAnchor = useCallback(() => {
    if (selectedPosterRef.current) {
      onAnchorChange(readAnchor(selectedPosterRef.current));
    }
  }, [onAnchorChange]);

  useEffect(() => {
    if (!selectedFilmId) {
      selectedPosterRef.current = null;
      return;
    }

    window.addEventListener("resize", updateAnchor);
    window.addEventListener("scroll", updateAnchor, true);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      window.removeEventListener("scroll", updateAnchor, true);
    };
  }, [selectedFilmId, updateAnchor]);

  return (
    <AnimatePresence mode="wait">
      {countryCode && country && (
        <motion.aside
          key={countryCode}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 36 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          className="glass-panel motion-reduce:transition-none panel-surface fixed inset-x-3 bottom-3 top-20 z-40 flex flex-col overflow-hidden rounded-2xl md:absolute md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[364px] md:rounded-none md:rounded-l-2xl"
          aria-label={`${country.nameZh}影片列表`}
          onMouseEnter={onPointerEnter}
          onMouseLeave={onPointerLeave}
        >
          <header className="px-5 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-lg font-medium text-[var(--ink)]">
                  {country.nameZh}
                </h2>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {yearRangeLabel}
                  {genreLabel ? ` · ${genreLabel}` : " · 全部类型"}
                  {` · ${sortedFilms.length} 部`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="glass-icon-button rounded-full px-2.5 py-1.5 text-xs transition-colors"
                aria-label={`关闭${country.nameZh}影片列表`}
              >
                ✕
              </button>
            </div>

            <Link
              href={`/country/${country.code}?${mapQuery}`}
              className="glass-primary-action mt-3 inline-flex max-w-full whitespace-normal rounded-full px-3 py-1.5 text-[11px] leading-snug transition-colors"
            >
              进入国家电影史页面 →
            </Link>
          </header>

          <div
            className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
            onScroll={updateAnchor}
          >
            {sortedFilms.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  title={`${yearRangeLabel} 暂无${country.nameZh}影片`}
                  description="可调整时间范围或影片类型"
                />
              </div>
            ) : (
              <div className="mx-auto grid w-full max-w-[308px] grid-cols-2 gap-x-4 gap-y-[26px]">
                {sortedFilms.map((film) => {
                  const isSelected = selectedFilmId === film.id;
                  return (
                    <button
                      key={film.id}
                      type="button"
                      ref={isSelected ? selectedPosterRef : undefined}
                      onClick={(event) => {
                        selectedPosterRef.current = event.currentTarget;
                        onSelectFilm(film.id, readAnchor(event.currentTarget));
                      }}
                      className="group min-w-0 w-full text-left"
                      aria-pressed={isSelected}
                      aria-label={`预览${film.titleZh}，${film.year}年`}
                    >
                      <div
                        className={`aspect-[2/3] w-full overflow-hidden rounded-lg bg-cover bg-center shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                          isSelected
                            ? "ring-2 ring-[var(--ocean)] ring-offset-2 ring-offset-transparent"
                            : "ring-1 ring-black/5"
                        }`}
                        style={{
                          backgroundColor: film.posterColor ?? "#3a8fb7",
                          backgroundImage: film.posterUrl
                            ? `url(${JSON.stringify(film.posterUrl)})`
                            : undefined,
                        }}
                        role="img"
                        aria-label={`${film.titleZh}海报`}
                      >
                        {!film.posterUrl && (
                          <div className="flex h-full items-end bg-gradient-to-t from-black/55 to-transparent p-2">
                            <span className="line-clamp-3 text-[10px] leading-tight text-white">
                              {film.titleZh}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight text-[var(--ink)]">
                        {film.titleZh}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[var(--ink-muted)]">
                        {film.year}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
