import type { FilmSeed, ImportCandidate } from "@/types/film-seed";
import type { TmdbSearchResult } from "./tmdb-client";

const COUNTRY_TO_ISO: Record<string, string> = {
  cn: "CN",
  jp: "JP",
  fr: "FR",
  it: "IT",
  us: "US",
  in: "IN",
};

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, " ")
    .trim();
}

function similarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const aTokens = new Set(na.split(/\s+/));
  const bTokens = new Set(nb.split(/\s+/));
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(aTokens.size, bTokens.size, 1);
}

function releaseYear(releaseDate: string): number | null {
  const year = parseInt(releaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function countryScore(
  seed: FilmSeed,
  candidate: TmdbSearchResult
): number {
  const expected = COUNTRY_TO_ISO[seed.primaryProductionCountry];
  if (!expected) return 0;
  const countries = candidate.origin_country ?? [];
  // TMDB search results often omit origin_country; treat as neutral.
  if (countries.length === 0) return 0.5;
  return countries.includes(expected) ? 1 : 0;
}

export function scoreCandidate(
  seed: FilmSeed,
  candidate: TmdbSearchResult
): number {
  let score = 0;

  const candidateYear = releaseYear(candidate.release_date);
  if (candidateYear === seed.year) score += 30;

  score += similarity(seed.titleOriginal, candidate.original_title) * 25;
  score += similarity(seed.titleZh, candidate.title) * 20;
  score += countryScore(seed, candidate) * 25;

  return Math.round(score);
}

export type MatchDecision =
  | { status: "confirmed"; candidate: ImportCandidate }
  | { status: "review"; candidates: ImportCandidate[] }
  | { status: "missing" };

export function decideMatch(
  seed: FilmSeed,
  results: TmdbSearchResult[]
): MatchDecision {
  if (results.length === 0) {
    return { status: "missing" };
  }

  const ranked = results
    .map((result) => ({
      tmdbId: result.id,
      title: result.title,
      originalTitle: result.original_title,
      releaseDate: result.release_date,
      score: scoreCandidate(seed, result),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];
  const lead = top.score - (second?.score ?? 0);

  if (top.score >= 85 && lead >= 10) {
    return { status: "confirmed", candidate: top };
  }

  if (top.score >= 60) {
    return { status: "review", candidates: ranked.slice(0, 5) };
  }

  return { status: "missing" };
}

export { COUNTRY_TO_ISO };
