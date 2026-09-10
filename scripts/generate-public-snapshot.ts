import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { countries, films as curatedFilms } from "../lib/data";
import { getCountryCinemaHistoryPageData } from "../lib/repositories/countryCinemaHistory";
import { getAllFilms } from "../lib/repositories/films";
import type { CountryCinemaHistory } from "../types/cinema";

async function main() {
  const databaseFilms = await getAllFilms();
  const filmsById = new Map(databaseFilms.map((film) => [film.id, film]));
  for (const film of curatedFilms) {
    if (!filmsById.has(film.id)) filmsById.set(film.id, film);
  }
  const films = [...filmsById.values()].sort(
    (a, b) => a.year - b.year || a.id.localeCompare(b.id),
  );
  const histories: Record<string, CountryCinemaHistory> = {};

  for (const country of countries) {
    const { history } = await getCountryCinemaHistoryPageData(country.code);
    if (history) histories[country.code] = history;
  }

  const outputPath = resolve(process.cwd(), "data/public-snapshot.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(
      {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        films,
        histories,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log(
    `Public snapshot written: ${films.length} films, ${Object.keys(histories).length} country histories`,
  );
}

main().catch((error) => {
  console.error("Failed to generate public snapshot", error);
  process.exitCode = 1;
});
