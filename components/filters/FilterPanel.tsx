"use client";

import { countries, genres } from "@/lib/data";
import {
  MAX_POSTER_SCALE,
  MIN_POSTER_SCALE,
  useMapStore,
} from "@/store/useMapStore";
import { getActiveFilterLabels } from "@/utils/filmFilters";

type FilterPanelProps = {
  onClose?: () => void;
};

export function FilterPanel({ onClose }: FilterPanelProps) {
  const selectedCountryCode = useMapStore((s) => s.selectedCountryCode);
  const selectedGenreId = useMapStore((s) => s.selectedGenreId);
  const posterScale = useMapStore((s) => s.posterScale);
  const setCountry = useMapStore((s) => s.setCountry);
  const setGenre = useMapStore((s) => s.setGenre);
  const setPosterScale = useMapStore((s) => s.setPosterScale);
  const clearFilters = useMapStore((s) => s.clearFilters);

  const activeLabels = getActiveFilterLabels({
    countryCode: selectedCountryCode,
    genreId: selectedGenreId,
    countries,
    genres,
  });

  return (
    <div className="flex flex-col gap-5 text-[var(--ink)]">
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
          海报大小
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--ink-muted)]">小</span>
          <input
            type="range"
            min={MIN_POSTER_SCALE}
            max={MAX_POSTER_SCALE}
            step={0.05}
            value={posterScale}
            onChange={(e) => setPosterScale(parseFloat(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[rgba(58,143,183,0.2)] accent-[var(--ocean)]"
            aria-label="海报缩略图大小"
          />
          <span className="text-[10px] text-[var(--ink-muted)]">大</span>
          <span className="w-8 text-right font-mono text-[10px] tabular-nums text-[var(--ocean-deep)]">
            {posterScale.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
          国家筛选
        </h3>
        <div className="flex flex-wrap gap-2">
          {countries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                setCountry(
                  selectedCountryCode === country.code ? null : country.code
                );
                onClose?.();
              }}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                selectedCountryCode === country.code
                  ? "chip-active"
                  : "chip-idle"
              }`}
            >
              {country.nameZh}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--ink-muted)]">
          类型筛选
        </h3>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => {
                setGenre(selectedGenreId === genre.id ? null : genre.id);
                onClose?.();
              }}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                selectedGenreId === genre.id ? "chip-active" : "chip-idle"
              }`}
            >
              {genre.nameZh}
            </button>
          ))}
        </div>
      </div>

      {activeLabels.length > 0 && (
        <div className="rounded-lg border border-[var(--border-soft)] bg-white/60 px-3 py-2">
          <p className="mb-1 text-xs text-[var(--ink-muted)]">当前筛选</p>
          <p className="text-xs text-[var(--ink)]">{activeLabels.join(" · ")}</p>
        </div>
      )}

      {(selectedCountryCode || selectedGenreId) && (
        <button
          type="button"
          onClick={() => {
            clearFilters();
            onClose?.();
          }}
          className="rounded-lg border border-[var(--border-soft)] py-2 text-xs text-[var(--ink-muted)] transition-colors hover:bg-white/50"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
