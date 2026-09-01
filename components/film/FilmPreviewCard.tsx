"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FilmWithRelations } from "@/types/cinema";
import type { FilmPreviewAnchor } from "./AnchoredFilmPreviewCard";
import { LikeButton } from "./LikeButton";

type FilmPreviewCardProps = {
  film: FilmWithRelations | null;
  anchor: FilmPreviewAnchor | null;
  query: string;
  drawerVisible: boolean;
  onClose: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

const CARD_WIDTH = 304;
const ESTIMATED_CARD_HEIGHT = 360;
const DRAWER_WIDTH = 364;
const EDGE_GAP = 12;
const POSTER_GAP = 12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function FilmPreviewCard({
  film,
  anchor,
  query,
  drawerVisible,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: FilmPreviewCardProps) {
  const [measuredHeight, setMeasuredHeight] = useState(
    ESTIMATED_CARD_HEIGHT
  );
  const measureCard = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    const nextHeight = node.getBoundingClientRect().height;
    setMeasuredHeight((current) =>
      Math.abs(current - nextHeight) > 1 ? nextHeight : current
    );
  }, []);

  if (!film || !anchor || typeof window === "undefined") {
    return <AnimatePresence mode="wait" />;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const avoidDrawer = drawerVisible && viewportWidth >= 768;
  const rightBoundary = Math.max(
    EDGE_GAP * 2,
    viewportWidth - (avoidDrawer ? DRAWER_WIDTH : 0)
  );
  const maxHeight = Math.max(1, viewportHeight - EDGE_GAP * 2);
  const effectiveHeight = Math.min(measuredHeight, maxHeight);
  const leftSpace = Math.max(
    0,
    anchor.left - POSTER_GAP - EDGE_GAP
  );
  const rightSpace = Math.max(
    0,
    rightBoundary - EDGE_GAP - anchor.right - POSTER_GAP
  );
  const placement =
    leftSpace >= CARD_WIDTH || leftSpace >= rightSpace ? "left" : "right";
  const availableWidth = placement === "left" ? leftSpace : rightSpace;
  const width = Math.min(CARD_WIDTH, Math.max(1, availableWidth));
  const rawLeft =
    placement === "left"
      ? anchor.left - POSTER_GAP - width
      : anchor.right + POSTER_GAP;
  const left = clamp(
    rawLeft,
    EDGE_GAP,
    Math.max(EDGE_GAP, rightBoundary - width - EDGE_GAP)
  );
  const anchorCenterY = (anchor.top + anchor.bottom) / 2;
  const top = clamp(
    anchorCenterY - effectiveHeight / 2,
    EDGE_GAP,
    Math.max(EDGE_GAP, viewportHeight - effectiveHeight - EDGE_GAP)
  );

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={film.id}
        ref={measureCard}
        initial={{
          opacity: 0,
          x: placement === "left" ? 8 : -8,
          scale: 0.98,
        }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{
          opacity: 0,
          x: placement === "left" ? 6 : -6,
          scale: 0.98,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="glass-panel motion-reduce:transition-none panel-surface fixed z-[60] overflow-y-auto rounded-2xl p-4"
        style={{ left, top, width, maxHeight }}
        data-placement={placement}
        aria-label={`${film.titleZh}影片预览`}
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
      >
        <FilmCardContent film={film} query={query} onClose={onClose} />
      </motion.aside>
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
          <h2 className="text-base font-medium leading-tight text-[var(--ink)]">
            {film.titleZh}
          </h2>
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
