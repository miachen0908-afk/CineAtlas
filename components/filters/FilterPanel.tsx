"use client";

import { countries, genres } from "@/lib/data";
import { useMapStore } from "@/store/useMapStore";
import { getActiveFilterLabels } from "@/utils/filmFilters";

type FilterPanelProps = {
  onClose?: () => void;
};

export function FilterPanel({ onClose }: FilterPanelProps) {
  const selectedCountryCode = useMapStore((s) => s.selectedCountryCode);
  const selectedGenreId = useMapStore((s) => s.selectedGenreId);
  const setCountry = useMapStore((s) => s.setCountry);
  const setGenre = useMapStore((s) => s.setGenre);
  const clearFilters = useMapStore((s) => s.clearFilters);

  const activeLabels = getActiveFilterLabels({
    countryCode: selectedCountryCode,
    genreId: selectedGenreId,
    countries,
    genres,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
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
                  ? "bg-[#c9a962]/20 text-[#e8d5a3] ring-1 ring-[#c9a962]/50"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {country.nameZh}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
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
                selectedGenreId === genre.id
                  ? "bg-[#c9a962]/20 text-[#e8d5a3] ring-1 ring-[#c9a962]/50"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {genre.nameZh}
            </button>
          ))}
        </div>
      </div>

      {activeLabels.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          <p className="mb-1 text-xs text-white/40">当前筛选</p>
          <p className="text-xs text-white/70">{activeLabels.join(" · ")}</p>
        </div>
      )}

      {(selectedCountryCode || selectedGenreId) && (
        <button
          type="button"
          onClick={() => {
            clearFilters();
            onClose?.();
          }}
          className="rounded-lg border border-white/15 py-2 text-xs text-white/60 transition-colors hover:bg-white/5"
        >
          清除筛选
        </button>
      )}
    </div>
  );
}
