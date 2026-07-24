import type { FilmCoordinates } from "@/types/cinema";

export type FilmSeed = {
  id: string;
  titleZh: string;
  titleOriginal: string;
  year: number;
  primaryProductionCountry: string;
  coordinates: FilmCoordinates;
  productionCity?: string;
  preferredTmdbId?: number;
};

export type ImportStatus = "pending" | "confirmed" | "review" | "missing" | "failed";

export type ImportCandidate = {
  tmdbId: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  score: number;
};
