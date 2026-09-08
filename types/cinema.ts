export type FilmingLocation = {
  name: string;
  latitude?: number;
  longitude?: number;
};

export type FilmCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: "city" | "country";
};

export type Film = {
  id: string;
  titleZh: string;
  titleOriginal: string;
  year: number;
  primaryProductionCountry: string;
  otherProductionCountries: string[];
  productionCity?: string;
  filmingLocations: FilmingLocation[];
  directorIds: string[];
  genreIds: string[];
  posterUrl?: string;
  posterColor?: string;
  summary: string;
  rating?: number;
  likeCount: number;
  coordinates: FilmCoordinates;
};

export type Person = {
  id: string;
  nameZh: string;
  nameOriginal: string;
  birthYear: number;
  deathYear?: number;
  countryCodes: string[];
  profession: string[];
  timelineYear: number;
  summary: string;
  representativeFilmIds: string[];
  portraitUrl?: string;
  portraitSourceName?: string;
  portraitSourceUrl?: string;
  likeCount: number;
};

export type Country = {
  code: string;
  nameZh: string;
  nameEn: string;
  center: {
    latitude: number;
    longitude: number;
  };
  summary: string;
};

export type Genre = {
  id: string;
  nameZh: string;
  nameEn: string;
};

export type MapState = {
  yearStart: number;
  yearEnd: number;
  selectedCountryCode: string | null;
  selectedGenreId: string | null;
  selectedFilmId: string | null;
  likedFilmIds: string[];
  posterScale: number;
  setYearRange: (start: number, end: number) => void;
  setCountry: (code: string | null) => void;
  setGenre: (id: string | null) => void;
  selectFilm: (id: string | null) => void;
  clearFilters: () => void;
  setPosterScale: (scale: number) => void;
  toggleLike: (filmId: string) => void;
  isLiked: (filmId: string) => boolean;
};

export type FilmWithRelations = Film & {
  directors: Person[];
  genres: Genre[];
  country: Country;
};

export type PersonWithRelations = Person & {
  representativeFilms: Film[];
  countries: Country[];
};

export type CinemaHistoryEventType =
  | "movement"
  | "industry"
  | "technology"
  | "institution"
  | "film"
  | "person"
  | "historical";

export type CinemaHistorySource = {
  label: string;
  url?: string;
};

export type CinemaHistoryCredit = {
  role: string;
  name: string;
};

export type CinemaHistoryArchiveFilm = {
  id: string;
  title: string;
  genre?: string;
  credits: CinemaHistoryCredit[];
  synopsis: string;
  significance: string;
  brief?: string;
  posterUrl?: string;
};

export type CinemaHistoryEvent = {
  id: string;
  year: number;
  endYear?: number;
  title: string;
  description: string;
  brief?: string;
  type?: CinemaHistoryEventType;
  filmIds?: string[];
  personIds?: string[];
  archiveFilms?: CinemaHistoryArchiveFilm[];
  sources?: CinemaHistorySource[];
};

export type CinemaHistoryEditableStage = {
  stageId: string;
  summary?: string;
  brief?: string;
  events: CinemaHistoryEvent[];
  subStages?: CinemaHistoryEditableSubStage[];
};

export type CinemaHistoryEditableSubStage = {
  subStageId: string;
  summary?: string;
  brief?: string;
  events: CinemaHistoryEvent[];
};

export type CountryCinemaHistoryEditableContent = {
  stages: CinemaHistoryEditableStage[];
};

export type CountryCinemaHistoryRevisionSummary = {
  id: number;
  version: number;
  createdAt: string;
};

export type CountryCinemaHistoryEditorState = {
  content: CountryCinemaHistoryEditableContent;
  version: number;
  updatedAt: string | null;
  revisions: CountryCinemaHistoryRevisionSummary[];
};

export type CinemaHistoryStage = {
  id: string;
  title: string;
  shortTitle: string;
  yearStart: number;
  yearEnd: number | null;
  yearLabel?: string;
  summary?: string;
  brief?: string;
  subStages?: CinemaHistorySubStage[];
  events: CinemaHistoryEvent[];
  representativeFilmIds: string[];
  representativePersonIds: string[];
};

export type CinemaHistorySubStage = {
  id: string;
  title: string;
  shortTitle: string;
  yearStart: number;
  yearEnd: number | null;
  yearLabel?: string;
  summary?: string;
  brief?: string;
  events?: CinemaHistoryEvent[];
  representativeFilmIds?: string[];
  representativePersonIds?: string[];
};

export type CountryCinemaHistory = {
  countryCode: string;
  introduction: string;
  contentStatus: "demo" | "curated";
  contentNotice?: string;
  stages: CinemaHistoryStage[];
};
