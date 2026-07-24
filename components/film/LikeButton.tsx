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
      className={`flex items-center gap-1.5 rounded-full border transition-colors ${
        isLiked
          ? "border-[#c9a962]/60 bg-[#c9a962]/15 text-[#e8d5a3]"
          : "border-white/15 bg-white/5 text-white/60 hover:border-white/30"
      } ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-4 py-2 text-sm"}`}
      aria-pressed={isLiked}
      aria-label={isLiked ? "取消喜欢" : "喜欢"}
    >
      <span aria-hidden>{isLiked ? "♥" : "♡"}</span>
      <span>{displayCount.toLocaleString()}</span>
    </button>
  );
}
