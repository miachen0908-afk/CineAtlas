"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { FilmWithRelations } from "@/types/cinema";
import { LikeButton } from "./LikeButton";

export type FilmPreviewAnchor = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

type AnchoredFilmPreviewCardProps = {
  film: FilmWithRelations | null;
  anchor: FilmPreviewAnchor | null;
  query: string;
  onClose: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

export function AnchoredFilmPreviewCard({
  film,
  anchor,
  query,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: AnchoredFilmPreviewCardProps) {
  const desktopLeft = anchor ? Math.max(12, anchor.left - 324) : 12;
  const desktopTop = anchor
    ? `max(12px, min(${anchor.top}px, calc(100vh - 430px)))`
    : "12px";

  return (
    <AnimatePresence mode="wait">
      {film && anchor && (
        <>
          <motion.aside
            key={`desktop-${film.id}`}
            initial={{ opacity: 0, x: 12, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass-panel motion-reduce:transition-none panel-surface fixed z-50 hidden max-h-[calc(100vh-24px)] w-[304px] overflow-y-auto rounded-2xl p-4 md:block"
            style={{ left: desktopLeft, top: desktopTop }}
            aria-label={`${film.titleZh}影片预览`}
            onMouseEnter={onPointerEnter}
            onMouseLeave={onPointerLeave}
          >
            <PreviewContent film={film} query={query} onClose={onClose} />
          </motion.aside>

          <motion.aside
            key={`mobile-${film.id}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass-panel motion-reduce:transition-none panel-surface fixed inset-x-3 bottom-3 z-[60] max-h-[62vh] overflow-y-auto rounded-2xl p-4 md:hidden"
            aria-label={`${film.titleZh}影片预览`}
            onMouseEnter={onPointerEnter}
            onMouseLeave={onPointerLeave}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgba(58,143,183,0.35)]" />
            <PreviewContent film={film} query={query} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PreviewContent({
  film,
  query,
  onClose,
}: {
  film: FilmWithRelations;
  query: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 text-[var(--ink)]">
      <div className="flex items-start gap-3">
        <div
          className="h-24 w-16 shrink-0 rounded-lg bg-cover bg-center shadow-sm ring-1 ring-black/5"
          style={{
            backgroundColor: film.posterColor ?? "#3a8fb7",
            backgroundImage: film.posterUrl
              ? `url(${JSON.stringify(film.posterUrl)})`
              : undefined,
          }}
          role="img"
          aria-label={`${film.titleZh}海报`}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium leading-tight text-[var(--ink)]">
            {film.titleZh}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--ink-muted)]">
            {film.titleOriginal}
          </p>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            {film.year} · {film.country.nameZh}
            {film.rating ? ` · ★ ${film.rating.toFixed(1)}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="glass-icon-button rounded-full p-1 transition-colors"
          aria-label="关闭影片预览"
        >
          ✕
        </button>
      </div>

      {film.directors.length > 0 && (
        <p className="text-xs text-[var(--ink-muted)]">
          导演：{film.directors.map((director) => director.nameZh).join("、")}
        </p>
      )}

      {film.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {film.genres.map((genre) => (
            <span
              key={genre.id}
              className="glass-chip rounded-full border px-2 py-0.5 text-[10px]"
            >
              {genre.nameZh}
            </span>
          ))}
        </div>
      )}

      <p className="line-clamp-4 text-xs leading-relaxed text-[var(--ink)]/75">
        {film.summary || "暂无影片简介。"}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <LikeButton filmId={film.id} baseCount={film.likeCount} />
        <Link
          href={`/film/${film.id}?${query}`}
          className="glass-primary-action flex-1 rounded-full py-2 text-center text-xs transition-colors"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
}
