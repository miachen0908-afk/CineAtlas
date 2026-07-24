import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MapState } from "@/types/cinema";

export const MIN_YEAR = 1895;
export const MAX_YEAR = 2025;

function clampYear(year: number): number {
  return Math.min(MAX_YEAR, Math.max(MIN_YEAR, year));
}

function normalizeRange(start: number, end: number): { yearStart: number; yearEnd: number } {
  const a = clampYear(start);
  const b = clampYear(end);
  return a <= b ? { yearStart: a, yearEnd: b } : { yearStart: b, yearEnd: a };
}

export const useMapStore = create<MapState>()(
  persist(
    (set, get) => ({
      yearStart: MIN_YEAR,
      yearEnd: MAX_YEAR,
      selectedCountryCode: null,
      selectedGenreId: null,
      selectedFilmId: null,
      likedFilmIds: [],

      setYearRange: (start, end) => {
        const range = normalizeRange(start, end);
        set({ ...range, selectedFilmId: null });
      },
      setCountry: (code) =>
        set({ selectedCountryCode: code, selectedFilmId: null }),
      setGenre: (id) => set({ selectedGenreId: id, selectedFilmId: null }),
      selectFilm: (id) => set({ selectedFilmId: id }),
      clearFilters: () =>
        set({
          selectedCountryCode: null,
          selectedGenreId: null,
          selectedFilmId: null,
        }),
      toggleLike: (filmId) => {
        const { likedFilmIds } = get();
        const isLiked = likedFilmIds.includes(filmId);
        set({
          likedFilmIds: isLiked
            ? likedFilmIds.filter((id) => id !== filmId)
            : [...likedFilmIds, filmId],
        });
      },
      isLiked: (filmId) => get().likedFilmIds.includes(filmId),
    }),
    {
      name: "world-cinema-map-storage",
      partialize: (state) => ({ likedFilmIds: state.likedFilmIds }),
    }
  )
);

export function buildMapQueryParams(state: {
  yearStart: number;
  yearEnd: number;
  selectedCountryCode: string | null;
  selectedGenreId: string | null;
}): string {
  const params = new URLSearchParams();
  params.set("yearStart", String(state.yearStart));
  params.set("yearEnd", String(state.yearEnd));
  if (state.selectedCountryCode) {
    params.set("country", state.selectedCountryCode);
  }
  if (state.selectedGenreId) {
    params.set("genre", state.selectedGenreId);
  }
  return params.toString();
}

export function formatYearRange(start: number, end: number): string {
  return start === end ? String(start) : `${start}–${end}`;
}

export function applyMapQueryParams(searchParams: URLSearchParams): Partial<{
  yearStart: number;
  yearEnd: number;
  selectedCountryCode: string | null;
  selectedGenreId: string | null;
}> {
  const result: Partial<{
    yearStart: number;
    yearEnd: number;
    selectedCountryCode: string | null;
    selectedGenreId: string | null;
  }> = {};

  const yearStart = searchParams.get("yearStart");
  const yearEnd = searchParams.get("yearEnd");
  const legacyYear = searchParams.get("year");

  if (yearStart && yearEnd) {
    const start = parseInt(yearStart, 10);
    const end = parseInt(yearEnd, 10);
    if (!Number.isNaN(start) && !Number.isNaN(end)) {
      Object.assign(result, normalizeRange(start, end));
    }
  } else if (legacyYear) {
    const parsed = parseInt(legacyYear, 10);
    if (!Number.isNaN(parsed)) {
      const y = clampYear(parsed);
      result.yearStart = y;
      result.yearEnd = y;
    }
  }

  const country = searchParams.get("country");
  if (country) result.selectedCountryCode = country;

  const genre = searchParams.get("genre");
  if (genre) result.selectedGenreId = genre;

  return result;
}
