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
