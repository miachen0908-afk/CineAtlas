import "dotenv/config";
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { downloadPoster, getPersonDetail, searchPerson } from "./lib/tmdb-client";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

type PersonRecord = {
  id: string;
  nameZh: string;
  nameOriginal: string;
  birthYear: number;
  portraitUrl?: string;
  portraitSourceName?: string;
  portraitSourceUrl?: string;
  [key: string]: unknown;
};

const projectRoot = process.cwd();
const dataPath = path.join(projectRoot, "data/people.json");
const outputDir = path.join(projectRoot, "public/people/portraits");

function normalize(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

async function findVerifiedMatch(person: PersonRecord) {
  const expectedName = normalize(person.nameOriginal);
  const candidates = await searchPerson(person.nameOriginal);
  for (const candidate of candidates.slice(0, 8)) {
    if (normalize(candidate.name) !== expectedName && normalize(candidate.original_name) !== expectedName) continue;
    const detail = await getPersonDetail(candidate.id);
    const birthYear = detail.birthday ? Number(detail.birthday.slice(0, 4)) : null;
    if (birthYear !== person.birthYear) continue;
    if (!detail.profile_path) return null;
    return detail;
  }
  return null;
}

async function main() {
  const people = JSON.parse(await readFile(dataPath, "utf8")) as PersonRecord[];
  let imported = 0;
  const unresolved: string[] = [];

  for (const person of people) {
    try {
      const match = await findVerifiedMatch(person);
      if (!match?.profile_path) {
        unresolved.push(`${person.nameZh} (${person.nameOriginal})`);
        continue;
      }
      const extension = path.extname(match.profile_path) || ".jpg";
      const fileName = `${person.id}${extension}`;
      await downloadPoster(match.profile_path, path.join(outputDir, fileName), "w500");
      person.portraitUrl = `/people/portraits/${fileName}`;
      person.portraitSourceName = "TMDB";
      person.portraitSourceUrl = `https://www.themoviedb.org/person/${match.id}`;
      imported += 1;
      console.log(`[portrait] ${person.nameZh} -> TMDB ${match.id}`);
    } catch (error) {
      unresolved.push(`${person.nameZh}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await writeFile(dataPath, `${JSON.stringify(people, null, 2)}\n`, "utf8");
  console.log(`[portrait] imported ${imported}/${people.length}`);
  if (unresolved.length) console.warn(`[portrait] unresolved\n- ${unresolved.join("\n- ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
