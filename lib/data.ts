import countriesData from "@/data/countries.json";
import filmsData from "@/data/films.json";
import genresData from "@/data/genres.json";
import peopleData from "@/data/people.json";
import type {
  Country,
  Film,
  FilmWithRelations,
  Genre,
  Person,
  PersonWithRelations,
} from "@/types/cinema";

export const countries = countriesData as Country[];
export const films = filmsData as Film[];
export const genres = genresData as Genre[];
export const people = peopleData as Person[];

const countryMap = new Map(countries.map((c) => [c.code, c]));
const genreMap = new Map(genres.map((g) => [g.id, g]));
const personMap = new Map(people.map((p) => [p.id, p]));
const filmMap = new Map(films.map((f) => [f.id, f]));

export function getCountry(code: string): Country | undefined {
  return countryMap.get(code);
}

export function getGenre(id: string): Genre | undefined {
  return genreMap.get(id);
}

export function getPerson(id: string): Person | undefined {
  return personMap.get(id);
}

export function getFilm(id: string): Film | undefined {
  return filmMap.get(id);
}

export function getFilmWithRelations(id: string): FilmWithRelations | undefined {
  const film = getFilm(id);
  if (!film) return undefined;

  const country = getCountry(film.primaryProductionCountry);
  if (!country) return undefined;

  return {
    ...film,
    country,
    directors: film.directorIds
      .map((did) => getPerson(did))
      .filter((p): p is Person => p !== undefined),
    genres: film.genreIds
      .map((gid) => getGenre(gid))
      .filter((g): g is Genre => g !== undefined),
  };
}

export function getPersonWithRelations(
  id: string
): PersonWithRelations | undefined {
  const person = getPerson(id);
  if (!person) return undefined;

  return {
    ...person,
    countries: person.countryCodes
      .map((code) => getCountry(code))
      .filter((c): c is Country => c !== undefined),
    representativeFilms: person.representativeFilmIds
      .map((fid) => getFilm(fid))
      .filter((f): f is Film => f !== undefined),
  };
}

export function getFilmsByCountry(countryCode: string): Film[] {
  return films.filter((f) => f.primaryProductionCountry === countryCode);
}

export function getPeopleByCountry(countryCode: string): Person[] {
  return people.filter((p) => p.countryCodes.includes(countryCode));
}

export function getAvailableYears(): number[] {
  const years = new Set(films.map((f) => f.year));
  return Array.from(years).sort((a, b) => a - b);
}

export function validateDataIntegrity(): string[] {
  const errors: string[] = [];

  for (const film of films) {
    if (!countryMap.has(film.primaryProductionCountry)) {
      errors.push(`Film ${film.id}: unknown country ${film.primaryProductionCountry}`);
    }
    for (const did of film.directorIds) {
      if (!personMap.has(did)) errors.push(`Film ${film.id}: unknown director ${did}`);
    }
    for (const gid of film.genreIds) {
      if (!genreMap.has(gid)) errors.push(`Film ${film.id}: unknown genre ${gid}`);
    }
  }

  for (const person of people) {
    for (const fid of person.representativeFilmIds) {
      if (!filmMap.has(fid)) {
        errors.push(`Person ${person.id}: unknown film ${fid}`);
      }
    }
  }

  return errors;
}
