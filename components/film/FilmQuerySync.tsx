"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { applyMapQueryParams, useMapStore } from "@/store/useMapStore";

export function FilmQuerySync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const updates = applyMapQueryParams(searchParams);
    const store = useMapStore.getState();
    if (updates.yearStart !== undefined && updates.yearEnd !== undefined) {
      store.setYearRange(updates.yearStart, updates.yearEnd);
    }
    if (updates.selectedCountryCode !== undefined) {
      store.setCountry(updates.selectedCountryCode);
    }
    if (updates.selectedGenreId !== undefined) {
      store.setGenre(updates.selectedGenreId);
    }
  }, [searchParams]);

  return null;
}
