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
            className="motion-reduce:transition-none hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-[#0a0a12]/90 p-5 backdrop-blur-md lg:flex xl:w-96"
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
            className="motion-reduce:transition-none fixed inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[#0a0a12]/95 p-5 backdrop-blur-md lg:hidden"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
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
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className="h-28 w-20 shrink-0 rounded-lg"
          style={{ backgroundColor: film.posterColor ?? "#2d3748" }}
          role="img"
          aria-label={`${film.titleZh} 占位海报`}
        />
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white/70"
          aria-label="关闭预览"
        >
          ✕
        </button>
      </div>

      <div>
        <h2 className="text-lg font-medium text-white">{film.titleZh}</h2>
        <p className="text-sm text-white/50">{film.titleOriginal}</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-white/50">
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
        <p className="text-xs text-white/60">
          导演：{film.directors.map((d) => d.nameZh).join("、")}
        </p>
      )}

      {film.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {film.genres.map((g) => (
            <span
              key={g.id}
              className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50"
            >
              {g.nameZh}
            </span>
          ))}
        </div>
      )}

      <p className="line-clamp-4 text-sm leading-relaxed text-white/65">
        {film.summary}
      </p>

      <div className="flex items-center gap-3 pt-1">
        <LikeButton filmId={film.id} baseCount={film.likeCount} />
        <Link
          href={`/film/${film.id}?${query}`}
          className="flex-1 rounded-full bg-[#c9a962]/20 py-2 text-center text-sm text-[#e8d5a3] ring-1 ring-[#c9a962]/40 transition-colors hover:bg-[#c9a962]/30"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}
