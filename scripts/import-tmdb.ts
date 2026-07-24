import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFile, mkdir } from "fs/promises";
import { Prisma } from "@prisma/client";
import seedData from "@/data/film-seed.json";
import filmsData from "@/data/films.json";
import type { Film } from "@/types/cinema";
import type { FilmSeed } from "@/types/film-seed";
import { prisma } from "@/lib/prisma";
import { searchMovie, getMovieDetail, downloadPoster, checkTmdbConnectivity } from "./lib/tmdb-client";
import { decideMatch } from "./lib/matcher";
import {
  mapDirectorIds,
  mapGenreIds,
  mapOtherProductionCountries,
  pickRating,
  pickSummary,
} from "./lib/mapper";
import { logError, logInfo, logWarn } from "./lib/logger";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const seeds = seedData as FilmSeed[];
const legacyFilms = filmsData as Film[];

type ImportStats = {
  confirmed: number;
  review: number;
  missing: number;
  failed: number;
  skipped: number;
};

const stats: ImportStats = {
  confirmed: 0,
  review: 0,
  missing: 0,
  failed: 0,
  skipped: 0,
};

const reviewQueue: Array<{
  seedId: string;
  titleZh: string;
  titleOriginal: string;
  year: number;
  candidates: unknown;
}> = [];

function legacyFallback(seed: FilmSeed): Film | undefined {
  return legacyFilms.find((film) => film.id === seed.id);
}

async function upsertFromDetail(
  seed: FilmSeed,
  tmdbId: number
): Promise<void> {
  const detail = await getMovieDetail(tmdbId);
  const legacy = legacyFallback(seed);

  const posterLocalPath = `/posters/tmdb/${seed.id}.jpg`;
  try {
    if (detail.poster_path) {
      await downloadPoster(
        detail.poster_path,
        resolve(process.cwd(), "public", "posters", "tmdb", `${seed.id}.jpg`)
      );
    }
  } catch (error) {
    logWarn("Poster download failed", { seedId: seed.id, error: String(error) });
  }

  const posterUrl = detail.poster_path ? posterLocalPath : legacy?.posterUrl ?? null;

  await prisma.film.upsert({
    where: { id: seed.id },
    create: {
      id: seed.id,
      tmdbId,
      titleZh: seed.titleZh,
      titleOriginal: seed.titleOriginal,
      year: seed.year,
      primaryProductionCountry: seed.primaryProductionCountry,
      otherProductionCountries: mapOtherProductionCountries(
        detail,
        seed.primaryProductionCountry
      ),
      productionCity: seed.productionCity ?? legacy?.productionCity ?? null,
      filmingLocations: legacy?.filmingLocations ?? [],
      coordinates: seed.coordinates,
      genreIds: mapGenreIds(detail.genres),
      directorIds: mapDirectorIds(detail),
      posterUrl,
      posterColor: legacy?.posterColor ?? null,
      summary: pickSummary(detail) || legacy?.summary || "",
      rating: pickRating(detail) ?? legacy?.rating ?? null,
      likeCount: legacy?.likeCount ?? 0,
      importStatus: "confirmed",
      importCandidates: Prisma.JsonNull,
      importError: null,
      dataSource: "tmdb",
      importedAt: new Date(),
    },
    update: {
      tmdbId,
      titleZh: seed.titleZh,
      titleOriginal: seed.titleOriginal,
      year: seed.year,
      primaryProductionCountry: seed.primaryProductionCountry,
      otherProductionCountries: mapOtherProductionCountries(
        detail,
        seed.primaryProductionCountry
      ),
      productionCity: seed.productionCity ?? legacy?.productionCity ?? null,
      filmingLocations: legacy?.filmingLocations ?? [],
      coordinates: seed.coordinates,
      genreIds: mapGenreIds(detail.genres),
      directorIds: mapDirectorIds(detail),
      posterUrl,
      posterColor: legacy?.posterColor ?? null,
      summary: pickSummary(detail) || legacy?.summary || "",
      rating: pickRating(detail) ?? legacy?.rating ?? null,
      importStatus: "confirmed",
      importCandidates: Prisma.JsonNull,
      importError: null,
      dataSource: "tmdb",
      importedAt: new Date(),
    },
  });
}

async function upsertReviewOrMissing(
  seed: FilmSeed,
  status: "review" | "missing" | "failed",
  candidates?: unknown,
  errorMessage?: string
): Promise<void> {
  const legacy = legacyFallback(seed);
  const existing = await prisma.film.findUnique({ where: { id: seed.id } });

  if (existing?.importStatus === "confirmed" && !seed.preferredTmdbId) {
    stats.skipped += 1;
    logInfo("Skip existing confirmed record", { seedId: seed.id });
    return;
  }

  await prisma.film.upsert({
    where: { id: seed.id },
    create: {
      id: seed.id,
      titleZh: seed.titleZh,
      titleOriginal: seed.titleOriginal,
      year: seed.year,
      primaryProductionCountry: seed.primaryProductionCountry,
      otherProductionCountries: legacy?.otherProductionCountries ?? [],
      productionCity: seed.productionCity ?? legacy?.productionCity ?? null,
      filmingLocations: legacy?.filmingLocations ?? [],
      coordinates: seed.coordinates,
      genreIds: legacy?.genreIds ?? [],
      directorIds: legacy?.directorIds ?? [],
      posterUrl: legacy?.posterUrl ?? null,
      posterColor: legacy?.posterColor ?? null,
      summary: legacy?.summary ?? "",
      rating: legacy?.rating ?? null,
      likeCount: legacy?.likeCount ?? 0,
      importStatus: status,
      importCandidates: candidates ?? Prisma.JsonNull,
      importError: errorMessage ?? null,
      dataSource: status === "missing" ? null : "tmdb",
      importedAt: new Date(),
    },
    update: {
      importStatus: status,
      importCandidates: candidates ?? Prisma.JsonNull,
      importError: errorMessage ?? null,
      coordinates: seed.coordinates,
      primaryProductionCountry: seed.primaryProductionCountry,
      importedAt: new Date(),
    },
  });
}

async function processSeed(seed: FilmSeed): Promise<void> {
  try {
    if (seed.preferredTmdbId) {
      logInfo("Using preferred TMDB id", {
        seedId: seed.id,
        tmdbId: seed.preferredTmdbId,
      });
      await upsertFromDetail(seed, seed.preferredTmdbId);
      stats.confirmed += 1;
      return;
    }

    const existing = await prisma.film.findUnique({ where: { id: seed.id } });
    if (existing?.importStatus === "confirmed" && existing.tmdbId) {
      logInfo("Updating confirmed record", {
        seedId: seed.id,
        tmdbId: existing.tmdbId,
      });
      await upsertFromDetail(seed, existing.tmdbId);
      stats.confirmed += 1;
      return;
    }

    const queries = [seed.titleOriginal, seed.titleZh].filter(Boolean);
    const seen = new Set<number>();
    const mergedResults: Awaited<ReturnType<typeof searchMovie>> = [];

    async function mergeResults(results: typeof mergedResults) {
      for (const result of results) {
        if (!seen.has(result.id)) {
          seen.add(result.id);
          mergedResults.push(result);
        }
      }
    }

    for (const query of queries) {
      await mergeResults(await searchMovie(query, seed.year));
    }

    if (mergedResults.length === 0) {
      for (const query of queries) {
        await mergeResults(await searchMovie(query, seed.year, "en-US"));
      }
    }

    if (mergedResults.length === 0) {
      for (const query of queries) {
        await mergeResults(await searchMovie(query, undefined));
      }
    }

    const decision = decideMatch(seed, mergedResults);

    if (decision.status === "confirmed") {
      await upsertFromDetail(seed, decision.candidate.tmdbId);
      stats.confirmed += 1;
      logInfo("Confirmed", {
        seedId: seed.id,
        tmdbId: decision.candidate.tmdbId,
        score: decision.candidate.score,
      });
      return;
    }

    if (decision.status === "review") {
      await upsertReviewOrMissing(seed, "review", decision.candidates);
      reviewQueue.push({
        seedId: seed.id,
        titleZh: seed.titleZh,
        titleOriginal: seed.titleOriginal,
        year: seed.year,
        candidates: decision.candidates,
      });
      stats.review += 1;
      logWarn("Needs review", { seedId: seed.id });
      return;
    }

    await upsertReviewOrMissing(seed, "missing");
    stats.missing += 1;
    logWarn("Missing", { seedId: seed.id });
  } catch (error) {
    stats.failed += 1;
    const message = error instanceof Error ? error.message : String(error);
    logError(`Import failed for ${seed.id}`, error);
    await upsertReviewOrMissing(seed, "failed", undefined, message);
  }
}

async function main(): Promise<void> {
  if (!process.env.TMDB_API_READ_TOKEN?.trim()) {
    console.error(
      "TMDB_API_READ_TOKEN is not set. Add it to .env.local before running import."
    );
    process.exit(1);
  }

  try {
    await checkTmdbConnectivity();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  logInfo("Starting TMDB import", { total: seeds.length });

  for (const seed of seeds) {
    await processSeed(seed);
  }

  await mkdir(resolve(process.cwd(), "reports"), { recursive: true });
  await writeFile(
    resolve(process.cwd(), "reports/review-queue.json"),
    JSON.stringify(reviewQueue, null, 2),
    "utf-8"
  );

  console.log("\nImport summary");
  console.log(`✓ confirmed: ${stats.confirmed}`);
  console.log(`? review:    ${stats.review}`);
  console.log(`✗ missing:   ${stats.missing}`);
  console.log(`! failed:    ${stats.failed}`);
  console.log(`- skipped:   ${stats.skipped}`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  logError("Import crashed", error);
  await prisma.$disconnect();
  process.exit(1);
});
