import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { prisma } from "@/lib/prisma";
import peopleData from "@/data/people.json";
import type { Person, FilmCoordinates } from "@/types/cinema";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const people = peopleData as Person[];
const peopleIds = new Set(people.map((person) => person.id));

type ValidationIssue = {
  filmId: string;
  message: string;
};

function isValidCoordinates(value: unknown): value is FilmCoordinates {
  if (!value || typeof value !== "object") return false;
  const coords = value as FilmCoordinates;
  return (
    typeof coords.latitude === "number" &&
    typeof coords.longitude === "number" &&
    (coords.accuracy === "city" || coords.accuracy === "country")
  );
}

async function main(): Promise<void> {
  const films = await prisma.film.findMany({
    where: { importStatus: "confirmed" },
  });

  const issues: ValidationIssue[] = [];

  for (const film of films) {
    if (!film.id) {
      issues.push({ filmId: "(unknown)", message: "Missing id" });
      continue;
    }
    if (!film.year || !film.primaryProductionCountry) {
      issues.push({
        filmId: film.id,
        message: "Missing year or primaryProductionCountry",
      });
    }
    if (!isValidCoordinates(film.coordinates)) {
      issues.push({ filmId: film.id, message: "Invalid coordinates" });
    }
    if (!film.posterUrl && !film.posterColor) {
      issues.push({
        filmId: film.id,
        message: "Missing posterUrl and posterColor",
      });
    }

    const directorIds = Array.isArray(film.directorIds)
      ? (film.directorIds as string[])
      : [];
    for (const directorId of directorIds) {
      if (!peopleIds.has(directorId)) {
        issues.push({
          filmId: film.id,
          message: `Unknown directorId: ${directorId}`,
        });
      }
    }
  }

  console.log(`Validated ${films.length} confirmed films`);

  if (issues.length === 0) {
    console.log("✓ All checks passed");
    await prisma.$disconnect();
    return;
  }

  console.log(`✗ Found ${issues.length} issues:`);
  for (const issue of issues) {
    console.log(`  - ${issue.filmId}: ${issue.message}`);
  }

  await prisma.$disconnect();
  process.exit(1);
}

main().catch(async (error) => {
  console.error("Validation failed", error);
  await prisma.$disconnect();
  process.exit(1);
});
