import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getCountry,
  getGenre,
  getPerson,
  films as legacyFilms,
} from "@/lib/data";
import type {
  Film,
  FilmCoordinates,
  FilmWithRelations,
  FilmingLocation,
} from "@/types/cinema";

type FilmRecord = Prisma.FilmGetPayload<object>;

function parseJsonArray<T>(value: Prisma.JsonValue): T[] {
  if (!Array.isArray(value)) return [];
  return value as T[];
}

function mapFilmRecord(record: FilmRecord): Film {
  return {
    id: record.id,
    titleZh: record.titleZh,
    titleOriginal: record.titleOriginal,
    year: record.year,
    primaryProductionCountry: record.primaryProductionCountry,
    otherProductionCountries: parseJsonArray<string>(
      record.otherProductionCountries
    ),
    productionCity: record.productionCity ?? undefined,
    filmingLocations: parseJsonArray<FilmingLocation>(record.filmingLocations),
    directorIds: parseJsonArray<string>(record.directorIds),
    genreIds: parseJsonArray<string>(record.genreIds),
    posterUrl: record.posterUrl ?? undefined,
    posterColor: record.posterColor ?? undefined,
    summary: record.summary,
    rating: record.rating ?? undefined,
    likeCount: record.likeCount,
    coordinates: record.coordinates as FilmCoordinates,
  };
}

async function useDatabaseFilms(): Promise<boolean> {
  const count = await prisma.film.count({
    where: { importStatus: "confirmed" },
  });
  return count > 0;
}

export const getAllFilms = cache(async (): Promise<Film[]> => {
  const hasDb = await useDatabaseFilms();
  if (!hasDb) return legacyFilms;

  const records = await prisma.film.findMany({
    where: { importStatus: "confirmed" },
    orderBy: { year: "asc" },
  });
  return records.map(mapFilmRecord);
});

export const getFilm = cache(async (id: string): Promise<Film | undefined> => {
  const hasDb = await useDatabaseFilms();
  if (!hasDb) return legacyFilms.find((film) => film.id === id);

  const record = await prisma.film.findFirst({
    where: { id, importStatus: "confirmed" },
  });
  return record ? mapFilmRecord(record) : undefined;
});

export const getFilmWithRelations = cache(
  async (id: string): Promise<FilmWithRelations | undefined> => {
    const film = await getFilm(id);
    if (!film) return undefined;

    const country = getCountry(film.primaryProductionCountry);
    if (!country) return undefined;

    return {
      ...film,
      country,
      directors: film.directorIds
        .map((directorId) => getPerson(directorId))
        .filter((person) => person !== undefined),
      genres: film.genreIds
        .map((genreId) => getGenre(genreId))
        .filter((genre) => genre !== undefined),
    };
  }
);

export const getFilmsByCountry = cache(
  async (countryCode: string): Promise<Film[]> => {
    const hasDb = await useDatabaseFilms();
    if (!hasDb) {
      return legacyFilms.filter(
        (film) => film.primaryProductionCountry === countryCode
      );
    }

    const records = await prisma.film.findMany({
      where: {
        importStatus: "confirmed",
        primaryProductionCountry: countryCode,
      },
      orderBy: { year: "asc" },
    });
    return records.map(mapFilmRecord);
  }
);

export async function hasConfirmedFilms(): Promise<boolean> {
  const count = await prisma.film.count({
    where: { importStatus: "confirmed" },
  });
  return count > 0;
}
