import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { mkdir, writeFile } from "fs/promises";
import { Prisma } from "@prisma/client";
import countriesData from "@/data/countries.json";
import type { Country } from "@/types/cinema";
import { prisma } from "@/lib/prisma";
import {
  checkTmdbConnectivity,
  discoverMovies,
  downloadPoster,
  searchMovie,
  type TmdbSearchResult,
} from "./lib/tmdb-client";
import { COUNTRY_TO_ISO } from "./lib/matcher";
import { mapGenreIdsFromNumbers, pickRating } from "./lib/mapper";
import { logError, logInfo, logWarn } from "./lib/logger";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { getCountryCinemaHistory } from "@/lib/countryCinemaHistory";

const DEFAULT_TARGET = 80;
const DEFAULT_COUNTRIES = ["cn", "jp", "us", "fr", "it"];
const VOTE_THRESHOLDS = [80, 40, 20, 5, 1];
const MAX_PAGES = 15;

const countryArg = process.argv.find((arg) => arg.startsWith("--countries="));
const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const selectedCodes = new Set((countryArg?.split("=")[1]?.split(",") ?? DEFAULT_COUNTRIES).map((code) => code.trim().toLowerCase()).filter(Boolean));
const targetPerCountry = Math.max(1, Number(targetArg?.split("=")[1] ?? DEFAULT_TARGET));
const dryRun = process.argv.includes("--dry-run");
const reviewRows: Array<Record<string, unknown>> = [];

const countries = countriesData as Country[];

function releaseYear(releaseDate: string | undefined): number | null {
  if (!releaseDate || releaseDate.length < 4) return null;
  const year = parseInt(releaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function posterFileId(tmdbId: number): string {
  return `tmdb-${tmdbId}`;
}

async function collectDiscoverResults(
  iso: string,
  needed: number,
  skipTmdbIds: Set<number>
): Promise<TmdbSearchResult[]> {
  const collected: TmdbSearchResult[] = [];
  const seen = new Set<number>(skipTmdbIds);

  for (const voteCountGte of VOTE_THRESHOLDS) {
    if (collected.length >= needed) break;

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      if (collected.length >= needed) break;

      const { results, totalPages } = await discoverMovies({
        originCountry: iso,
        page,
        voteCountGte,
        sortBy: "vote_average.desc",
      });

      for (const movie of results) {
        if (collected.length >= needed) break;
        if (!movie.poster_path) continue;
        if (seen.has(movie.id)) continue;
        const year = releaseYear(movie.release_date);
        if (!year || year < 1895 || year > 2025) continue;

        seen.add(movie.id);
        collected.push(movie);
      }

      if (page >= totalPages) break;
    }
  }

  return collected;
}

async function upsertDiscoverFilm(
  movie: TmdbSearchResult,
  countryCode: string,
  center: Country["center"]
): Promise<"created" | "updated" | "skipped"> {
  const year = releaseYear(movie.release_date);
  if (!year || !movie.poster_path || !movie.overview?.trim()) return "skipped";

  const filmKey = posterFileId(movie.id);
  const existingByTmdb = await prisma.film.findUnique({
    where: { tmdbId: movie.id },
  });

  // Already confirmed under any id — count toward quota, do not duplicate
  if (existingByTmdb?.importStatus === "confirmed") {
    return "skipped";
  }

  const localPosterPath = `/posters/tmdb/${filmKey}.jpg`;
  const destPath = resolve(
    process.cwd(),
    "public",
    "posters",
    "tmdb",
    `${filmKey}.jpg`
  );

  if (dryRun) return existingByTmdb ? "updated" : "created";

  try {
    await downloadPoster(movie.poster_path, destPath, "w500");
  } catch (error) {
    logWarn("Poster download failed", {
      tmdbId: movie.id,
      error: String(error),
    });
    return "skipped";
  }

  const titleZh = movie.title?.trim() || movie.original_title;
  const titleOriginal = movie.original_title || movie.title;
  const coordinates = {
    latitude: center.latitude,
    longitude: center.longitude,
    accuracy: "country" as const,
  };
  const genreIds = mapGenreIdsFromNumbers(movie.genre_ids);
  const summary = movie.overview?.trim() || "";
  const rating = pickRating(movie);

  const id = existingByTmdb?.id ?? filmKey;

  await prisma.film.upsert({
    where: { id },
    create: {
      id,
      tmdbId: movie.id,
      titleZh,
      titleOriginal,
      year,
      primaryProductionCountry: countryCode,
      otherProductionCountries: [],
      productionCity: null,
      filmingLocations: [],
      coordinates,
      genreIds,
      directorIds: [],
      posterUrl: localPosterPath,
      posterColor: null,
      summary,
      rating: rating ?? null,
      likeCount: 0,
      importStatus: "confirmed",
      importCandidates: Prisma.JsonNull,
      importError: null,
      dataSource: "tmdb-discover",
      importedAt: new Date(),
    },
    update: {
      tmdbId: movie.id,
      titleZh,
      titleOriginal,
      year,
      primaryProductionCountry: countryCode,
      coordinates,
      genreIds,
      posterUrl: localPosterPath,
      summary,
      rating: rating ?? null,
      importStatus: "confirmed",
      importCandidates: Prisma.JsonNull,
      importError: null,
      dataSource: "tmdb-discover",
      importedAt: new Date(),
    },
  });

  return existingByTmdb ? "updated" : "created";
}

function normalizeTitle(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[\s《》〈〉「」『』·:：!！?？,，.。'“”"\-—–_]/g, "");
}

function historyCandidates(countryCode: string): Array<{ title: string; year: number }> {
  const history = getCountryCinemaHistory(countryCode);
  if (!history) return [];
  const rows: Array<{ title: string; year: number }> = [];
  const seen = new Set<string>();
  const addEvents = (events: typeof history.stages[number]["events"]) => {
    for (const event of events) {
      for (const film of event.archiveFilms ?? []) {
        const key = `${normalizeTitle(film.title)}-${event.year}`;
        if (!seen.has(key)) { seen.add(key); rows.push({ title: film.title, year: event.year }); }
      }
    }
  };
  for (const stage of history.stages) {
    addEvents(stage.events);
    for (const subStage of stage.subStages ?? []) addEvents(subStage.events ?? []);
  }
  return rows;
}

async function importHistoryCandidates(country: Country, needed: number): Promise<number> {
  const iso = COUNTRY_TO_ISO[country.code];
  if (!iso || needed <= 0) return 0;
  let accepted = 0;
  for (const candidate of historyCandidates(country.code)) {
    if (accepted >= needed) break;
    const existing = await prisma.film.findFirst({ where: { primaryProductionCountry: country.code, year: candidate.year, OR: [{ titleZh: candidate.title }, { titleOriginal: candidate.title }], importStatus: "confirmed" } });
    if (existing) continue;
    const results = await searchMovie(candidate.title, candidate.year);
    const normalized = normalizeTitle(candidate.title);
    const match = results.find((movie) => {
      const year = releaseYear(movie.release_date);
      const titleMatches = normalizeTitle(movie.title) === normalized || normalizeTitle(movie.original_title) === normalized;
      const countryMatches = !movie.origin_country?.length || movie.origin_country.includes(iso);
      return year === candidate.year && titleMatches && countryMatches && movie.poster_path && movie.overview?.trim();
    });
    if (!match) {
      reviewRows.push({ countryCode: country.code, title: candidate.title, year: candidate.year, reason: "no-exact-tmdb-match" });
      continue;
    }
    const result = await upsertDiscoverFilm(match, country.code, country.center);
    if (result === "created" || result === "updated") accepted += 1;
  }
  return accepted;
}

async function importCountry(country: Country): Promise<void> {
  const iso = COUNTRY_TO_ISO[country.code];
  if (!iso) {
    logWarn("No ISO mapping for country", { code: country.code });
    return;
  }

  const existing = await prisma.film.findMany({
    where: {
      primaryProductionCountry: country.code,
      importStatus: "confirmed",
    },
    select: { tmdbId: true },
  });

  const have = existing.length;
  const need = Math.max(0, targetPerCountry - have);
  logInfo("Country quota", {
    code: country.code,
    iso,
    have,
    need,
  });

  if (need === 0) {
    logInfo("Already at quota, skip", { code: country.code });
    return;
  }

  const importedFromHistory = await importHistoryCandidates(country, need);
  const remainingNeed = Math.max(0, need - importedFromHistory);
  const knownTmdb = await prisma.film.findMany({
    where: { tmdbId: { not: null } },
    select: { tmdbId: true },
  });
  const skipIds = new Set(
    knownTmdb
      .map((row) => row.tmdbId)
      .filter((id): id is number => typeof id === "number")
  );

  const candidates = await collectDiscoverResults(iso, remainingNeed, skipIds);
  logInfo("Discover candidates", {
    code: country.code,
    count: candidates.length,
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const movie of candidates) {
    try {
      const result = await upsertDiscoverFilm(movie, country.code, country.center);
      if (result === "created") created += 1;
      else if (result === "updated") updated += 1;
      else skipped += 1;
    } catch (error) {
      skipped += 1;
      logError("Failed to upsert discover film", {
        code: country.code,
        tmdbId: movie.id,
        error: String(error),
      });
    }
  }

  logInfo("Country import done", {
    code: country.code,
    created,
    updated,
    skipped,
  });
}

async function main(): Promise<void> {
  await checkTmdbConnectivity();
  logInfo("Starting country discover import", {
    countries: [...selectedCodes],
    perCountry: targetPerCountry,
    dryRun,
  });

  for (const country of countries.filter((country) => selectedCodes.has(country.code))) {
    try {
      await importCountry(country);
    } catch (error) {
      logError("Country import failed", {
        code: country.code,
        error: String(error),
      });
    }
  }

  const confirmed = await prisma.film.count({
    where: { importStatus: "confirmed" },
  });
  logInfo("Import finished", { confirmedTotal: confirmed });
  const reportPath = resolve(process.cwd(), "data", "tmdb-country-import-review.json");
  await mkdir(resolve(process.cwd(), "data"), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), dryRun, targetPerCountry, countries: [...selectedCodes], rows: reviewRows }, null, 2)}\n`);
  logInfo("Review report written", { reportPath, count: reviewRows.length });
}

main()
  .catch((error) => {
    logError("Fatal import error", { error: String(error) });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
