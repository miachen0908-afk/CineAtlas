import catalog from "@/data/country-history-videos.json";
import type {
  CinemaHistoryEvent,
  CountryCinemaHistory,
  CountryHistoryVideo,
  Film,
} from "@/types/cinema";

const videosByCountry = catalog as Record<string, CountryHistoryVideo[]>;

export function getCountryHistoryVideos(
  countryCode: string,
  history: CountryCinemaHistory | null,
  films: Film[],
): CountryHistoryVideo[] {
  const videos = videosByCountry[countryCode];
  if (!videos || !history) return [];

  const events = new Map<string, CinemaHistoryEvent>();
  for (const stage of history.stages) {
    const subStageEvents = (stage.subStages ?? []).flatMap((subStage) => subStage.events ?? []);
    for (const event of [...stage.events, ...subStageEvents]) {
      events.set(`${stage.id}/${event.id}`, event);
    }
  }

  const filmsById = new Map(films.map((film) => [film.id, film]));
  const countryPostersByTitleAndYear = new Map(
    films
      .filter((film) => film.primaryProductionCountry === countryCode && film.posterUrl)
      .map((film) => [`${film.year}/${film.titleZh}`, film.posterUrl]),
  );

  return videos.flatMap((video) => {
    const event = events.get(`${video.stageId}/${video.eventId}`);
    if (!event) return [];
    if (!video.filmId) return [video];

    const archive = event.archiveFilms?.find((film) => film.id === video.filmId);
    const official = event.filmIds?.includes(video.filmId) && filmsById.get(video.filmId);
    if (!archive && !official) return [];

    // Historical archives can have separate IDs from the main film catalog.
    const posterUrl = archive?.posterUrl
      || (official ? official.posterUrl : undefined)
      || countryPostersByTitleAndYear.get(`${video.year}/${video.filmTitle}`);
    return [posterUrl ? { ...video, posterUrl } : video];
  });
}
