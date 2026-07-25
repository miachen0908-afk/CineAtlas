"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { FilmWithRelations } from "@/types/cinema";
import { LikeButton } from "./LikeButton";
import { buildMapQueryParams, useMapStore } from "@/store/useMapStore";

type FilmPreviewCardProps = {
  film: FilmWithRelations | null;
  onClose: () => void;
};

export function FilmPreviewCard({ film, onClose }: FilmPreviewCardProps) {
  const yearStart = useMapStore((s) => s.yearStart);
  const yearEnd = useMapStore((s) => s.yearEnd);
  const selectedCountryCode = useMapStore((s) => s.selectedCountryCode);
  const selectedGenreId = useMapStore((s) => s.selectedGenreId);

  const query = buildMapQueryParams({
    yearStart,
    yearEnd,
    selectedCountryCode,
    selectedGenreId,
  });

  return (
    <AnimatePresence mode="wait">
      {film && (
        <>
          {/* Desktop: right panel */}
          <motion.aside
            key={film.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="motion-reduce:transition-none panel-surface hidden w-80 shrink-0 flex-col overflow-y-auto border-l p-5 lg:flex xl:w-96"
          >
            <FilmCardContent film={film} query={query} onClose={onClose} />
          </motion.aside>

          {/* Mobile: bottom sheet */}
          <motion.div
            key={`mobile-${film.id}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="motion-reduce:transition-none panel-surface fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t p-5 lg:hidden"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgba(58,143,183,0.35)]" />
            <FilmCardContent film={film} query={query} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FilmCardContent({
  film,
  query,
  onClose,
}: {
  film: FilmWithRelations;
  query: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 text-[var(--ink)]">
      <div className="flex items-start justify-between gap-2">
        <div
          className="h-28 w-20 shrink-0 rounded-lg"
          style={{ backgroundColor: film.posterColor ?? "#3a8fb7" }}
          role="img"
          aria-label={`${film.titleZh} 占位海报`}
        />
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--ink-muted)] hover:bg-white/60 hover:text-[var(--ink)]"
          aria-label="关闭预览"
        >
          ✕
        </button>
      </div>

      <div>
        <h2 className="text-lg font-medium text-[var(--ink)]">{film.titleZh}</h2>
        <p className="text-sm text-[var(--ink-muted)]">{film.titleOriginal}</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--ink-muted)]">
        <span>{film.year}</span>
        <span>·</span>
        <span>{film.country.nameZh}</span>
        {film.rating && (
          <>
            <span>·</span>
            <span>★ {film.rating.toFixed(1)}</span>
          </>
        )}
      </div>

      {film.directors.length > 0 && (
        <p className="text-xs text-[var(--ink-muted)]">
          导演：{film.directors.map((d) => d.nameZh).join("、")}
        </p>
      )}

      {film.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {film.genres.map((g) => (
            <span
              key={g.id}
              className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-[var(--ink-muted)]"
            >
              {g.nameZh}
            </span>
          ))}
        </div>
      )}

      <p className="line-clamp-4 text-sm leading-relaxed text-[var(--ink)]/80">
        {film.summary}
      </p>

      <div className="flex items-center gap-3 pt-1">
        <LikeButton filmId={film.id} baseCount={film.likeCount} />
        <Link
          href={`/film/${film.id}?${query}`}
          className="flex-1 rounded-full bg-[rgba(58,143,183,0.16)] py-2 text-center text-sm text-[var(--ocean-deep)] ring-1 ring-[rgba(47,111,158,0.4)] transition-colors hover:bg-[rgba(58,143,183,0.26)]"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}
