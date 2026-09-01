"use client";

import { useMapStore } from "@/store/useMapStore";

type LikeButtonProps = {
  filmId: string;
  baseCount: number;
  size?: "sm" | "md";
};

export function LikeButton({ filmId, baseCount, size = "md" }: LikeButtonProps) {
  const isLiked = useMapStore((s) => s.isLiked(filmId));
  const toggleLike = useMapStore((s) => s.toggleLike);

  const displayCount = baseCount + (isLiked ? 1 : 0);

  return (
    <button
      type="button"
      onClick={() => toggleLike(filmId)}
      className={`like-button flex items-center gap-1.5 rounded-full border transition-colors ${
        isLiked
          ? "is-liked border-[rgba(232,197,71,0.65)] bg-[rgba(232,197,71,0.18)] text-[var(--ink)]"
          : "border-[var(--border-soft)] bg-white/50 text-[var(--ink-muted)] hover:border-[rgba(58,143,183,0.4)]"
      } ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"}`}
      aria-pressed={isLiked}
      aria-label={isLiked ? "取消喜欢" : "喜欢"}
    >
      <span aria-hidden>{isLiked ? "♥" : "♡"}</span>
      <span>{displayCount.toLocaleString()}</span>
    </button>
  );
}
