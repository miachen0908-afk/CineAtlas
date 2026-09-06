import publicSnapshotJson from "@/data/public-snapshot.json";
import {
  countries,
  getCountry,
  getGenre,
  getPerson,
} from "@/lib/data";
import { isPublicStaticBuild } from "@/lib/buildMode";
import type {
  CountryCinemaHistory,
  CountryCinemaHistoryEditorState,
  Film,
  FilmWithRelations,
} from "@/types/cinema";

type PublicSnapshot = {
  schemaVersion: number;
  generatedAt: string;
  films: Film[];
  histories: Record<string, CountryCinemaHistory>;
};

const publicSnapshot = publicSnapshotJson as PublicSnapshot;

export function getPublicSnapshotMetadata() {
  return {
    schemaVersion: publicSnapshot.schemaVersion,
    generatedAt: publicSnapshot.generatedAt,
    filmCount: publicSnapshot.films.length,
  };
}

export async function getSiteFilms(): Promise<Film[]> {
  if (isPublicStaticBuild) return publicSnapshot.films;
  const { getAllFilms } = await import("@/lib/repositories/films");
  return getAllFilms();
}

function addFilmRelations(film: Film): FilmWithRelations | undefined {
  const country = getCountry(film.primaryProductionCountry);
  if (!country) return undefined;
  return {
    ...film,
    country,
    directors: film.directorIds
      .map((id) => getPerson(id))
      .filter((person) => person !== undefined),
    genres: film.genreIds
      .map((id) => getGenre(id))
      .filter((genre) => genre !== undefined),
  };
}

export async function getSiteFilmWithRelations(
  filmId: string,
): Promise<FilmWithRelations | undefined> {
  if (isPublicStaticBuild) {
    const film = publicSnapshot.films.find((item) => item.id === filmId);
    return film ? addFilmRelations(film) : undefined;
  }
  const { getFilmWithRelations } = await import("@/lib/repositories/films");
  return getFilmWithRelations(filmId);
}

export async function getSiteCountryHistoryPageData(
  countryCode: string,
): Promise<{
  history: CountryCinemaHistory | null;
  editorState: CountryCinemaHistoryEditorState | null;
}> {
  if (isPublicStaticBuild) {
    return {
      history: publicSnapshot.histories[countryCode.toLowerCase()] ?? null,
      editorState: null,
    };
  }
  const { getCountryCinemaHistoryPageData } = await import(
    "@/lib/repositories/countryCinemaHistory"
  );
  return getCountryCinemaHistoryPageData(countryCode);
}

export function getStaticCountryParams() {
  return countries.map((country) => ({ countryCode: country.code }));
}

export function getStaticFilmParams() {
  return publicSnapshot.films.map((film) => ({ filmId: film.id }));
}
