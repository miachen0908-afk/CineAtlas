import peopleData from "@/data/people.json";
import type { Person } from "@/types/cinema";
import type { TmdbMovieDetail } from "./tmdb-client";
import { COUNTRY_TO_ISO } from "./matcher";

const people = peopleData as Person[];

const TMDB_GENRE_TO_LOCAL: Record<number, string> = {
  18: "drama",
  35: "comedy",
  10749: "romance",
  28: "action",
  27: "horror",
  16: "animation",
  12: "action",
  14: "drama",
  36: "drama",
  80: "drama",
  99: "drama",
  878: "drama",
  9648: "drama",
  10402: "drama",
  10752: "action",
  37: "drama",
};

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function mapGenreIds(tmdbGenres: { id: number }[] | undefined): string[] {
  const ids = new Set<string>();
  for (const genre of tmdbGenres ?? []) {
    const mapped = TMDB_GENRE_TO_LOCAL[genre.id];
    if (mapped) ids.add(mapped);
  }
  return Array.from(ids);
}

export function mapGenreIdsFromNumbers(genreIds: number[] | undefined): string[] {
  return mapGenreIds((genreIds ?? []).map((id) => ({ id })));
}

export function mapDirectorIds(detail: TmdbMovieDetail): string[] {
  const directors =
    detail.credits?.crew?.filter((member) => member.job === "Director") ?? [];

  const matched: string[] = [];
  for (const director of directors) {
    const normalizedDirector = normalizeName(director.name);
    const person = people.find((p) => {
      const n = normalizeName(p.nameOriginal);
      return (
        n === normalizedDirector ||
        n.includes(normalizedDirector) ||
        normalizedDirector.includes(n)
      );
    });
    if (person && !matched.includes(person.id)) {
      matched.push(person.id);
    }
  }
  return matched;
}

export function mapOtherProductionCountries(
  detail: TmdbMovieDetail,
  primaryCountryCode: string
): string[] {
  const primaryIso = COUNTRY_TO_ISO[primaryCountryCode];
  const isoToCode = Object.fromEntries(
    Object.entries(COUNTRY_TO_ISO).map(([code, iso]) => [iso, code])
  );

  const others = new Set<string>();
  for (const country of detail.production_countries ?? []) {
    if (country.iso_3166_1 === primaryIso) continue;
    const code = isoToCode[country.iso_3166_1];
    if (code) others.add(code);
  }
  return Array.from(others);
}

export function pickSummary(detail: TmdbMovieDetail): string {
  return detail.overview?.trim() || "";
}

export function pickRating(detail: TmdbMovieDetail): number | undefined {
  if (detail.vote_average === undefined || detail.vote_average === 0) {
    return undefined;
  }
  return Math.round(detail.vote_average * 10) / 10;
}
