import { MapHomeClient } from "@/components/map/MapHomeClient";
import { countries, genres } from "@/lib/data";
import { getAllFilms } from "@/lib/repositories/films";
import { applyMapQueryParams } from "@/store/useMapStore";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const films = await getAllFilms();
  const rawSearchParams = await searchParams;
  const params = new URLSearchParams();

  for (const key of ["yearStart", "yearEnd", "year", "country", "genre"]) {
    const value = firstValue(rawSearchParams[key]);
    if (value) params.set(key, value);
  }

  const parsed = applyMapQueryParams(params);
  const countryCode = countries.some(
    (country) => country.code === parsed.selectedCountryCode
  )
    ? parsed.selectedCountryCode
    : undefined;
  const genreId = genres.some((genre) => genre.id === parsed.selectedGenreId)
    ? parsed.selectedGenreId
    : undefined;

  return (
    <div className="glass-home relative isolate flex flex-1 flex-col overflow-hidden">
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <MapHomeClient
          key={params.toString()}
          films={films}
          initialFilters={{
            yearStart: parsed.yearStart,
            yearEnd: parsed.yearEnd,
            countryCode,
            genreId,
          }}
        />
      </div>
    </div>
  );
}
