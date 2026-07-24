import type { Film } from "@/types/cinema";

export type FilmFilterParams = {
  yearStart: number;
  yearEnd: number;
  countryCode: string | null;
  genreId: string | null;
};

export function filterFilms(films: Film[], params: FilmFilterParams): Film[] {
  return films.filter((film) => {
    if (film.year < params.yearStart || film.year > params.yearEnd) return false;
    if (params.countryCode && film.primaryProductionCountry !== params.countryCode) {
      return false;
    }
    if (params.genreId && !film.genreIds.includes(params.genreId)) {
      return false;
    }
    return true;
  });
}

export function getActiveFilterLabels(params: {
  countryCode: string | null;
  genreId: string | null;
  countries: { code: string; nameZh: string }[];
  genres: { id: string; nameZh: string }[];
}): string[] {
  const labels: string[] = [];
  if (params.countryCode) {
    const country = params.countries.find((c) => c.code === params.countryCode);
    if (country) labels.push(`国家：${country.nameZh}`);
  }
  if (params.genreId) {
    const genre = params.genres.find((g) => g.id === params.genreId);
    if (genre) labels.push(`类型：${genre.nameZh}`);
  }
  return labels;
}

export function countFilmsByCountry(
  films: Film[],
  yearStart: number,
  yearEnd: number,
  countryCode: string
): number {
  return films.filter(
    (f) =>
      f.year >= yearStart &&
      f.year <= yearEnd &&
      f.primaryProductionCountry === countryCode
  ).length;
}

export function getGenreDistribution(
  films: Film[],
  yearStart: number,
  yearEnd: number,
  countryCode: string
): Record<string, number> {
  const countryFilms = films.filter(
    (f) =>
      f.year >= yearStart &&
      f.year <= yearEnd &&
      f.primaryProductionCountry === countryCode
  );
  const dist: Record<string, number> = {};
  for (const film of countryFilms) {
    for (const genreId of film.genreIds) {
      dist[genreId] = (dist[genreId] ?? 0) + 1;
    }
  }
  return dist;
}

export function getProductionCities(
  films: Film[],
  countryCode: string
): string[] {
  const cities = new Set<string>();
  for (const film of films) {
    if (film.primaryProductionCountry === countryCode && film.productionCity) {
      cities.add(film.productionCity);
    }
  }
  return Array.from(cities);
}
