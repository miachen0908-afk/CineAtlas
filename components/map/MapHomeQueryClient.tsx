"use client";

import { useSearchParams } from "next/navigation";
import { countries, genres } from "@/lib/data";
import { applyMapQueryParams } from "@/store/useMapStore";
import type { Film } from "@/types/cinema";
import { MapHomeClient } from "./MapHomeClient";

export function MapHomeQueryClient({ films }: { films: Film[] }) {
  const searchParams = useSearchParams();
  const parsed = applyMapQueryParams(searchParams);
  const countryCode = countries.some(
    (country) => country.code === parsed.selectedCountryCode,
  )
    ? parsed.selectedCountryCode
    : undefined;
  const genreId = genres.some((genre) => genre.id === parsed.selectedGenreId)
    ? parsed.selectedGenreId
    : undefined;

  return (
    <MapHomeClient
      key={searchParams.toString()}
      films={films}
      initialFilters={{
        yearStart: parsed.yearStart,
        yearEnd: parsed.yearEnd,
        countryCode,
        genreId,
      }}
    />
  );
}
