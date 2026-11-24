import { countries } from "@/lib/data";
import { isPublicStaticBuild } from "@/lib/buildMode";
import { historyEventAnchor, historyFilmAnchor, normalizeHistoryFilmTitle } from "@/lib/historyAnchors";
import { getSiteCountryHistories, getSiteFilms } from "@/lib/siteData";
import type { SearchEntry } from "@/lib/siteSearch";

export const dynamic = "force-static";

export async function GET() {
  const [films, histories] = await Promise.all([getSiteFilms(), getSiteCountryHistories()]);
  const entries: SearchEntry[] = countries.map((country) => ({
    kind: "country",
    title: country.nameZh,
    countryCode: country.code,
    aliases: [country.nameEn, country.code, `${country.nameZh}电影史`],
    href: `/country/${country.code}`,
  }));
  for (const film of films) {
    entries.push({
      kind: "film",
      title: film.titleZh,
      countryCode: film.primaryProductionCountry,
      aliases: film.titleOriginal && film.titleOriginal !== film.titleZh ? [film.titleOriginal] : undefined,
      year: String(film.year),
      href: `/film/${encodeURIComponent(film.id)}`,
    });
  }
  for (const history of histories) {
    const countryPath = `/country/${history.countryCode}${isPublicStaticBuild ? "/" : ""}`;
    for (const stage of history.stages) {
      const events = [...stage.events, ...(stage.subStages ?? []).flatMap((subStage) => subStage.events ?? [])];
      for (const event of events) {
        const year = event.endYear && event.endYear !== event.year ? `${event.year}—${event.endYear}` : String(event.year);
        entries.push({
          kind: "event",
          title: event.title,
          countryCode: history.countryCode,
          year,
          context: stage.title,
          href: `${countryPath}#${encodeURIComponent(historyEventAnchor(event.id))}`,
        });
        const seenTitles = new Set<string>();
        for (const film of event.archiveFilms ?? []) {
          const title = normalizeHistoryFilmTitle(film.title);
          if (seenTitles.has(title)) continue;
          seenTitles.add(title);
          entries.push({
            kind: "film",
            title: film.title,
            countryCode: history.countryCode,
            year,
            context: event.title,
            href: `${countryPath}#${encodeURIComponent(historyFilmAnchor(event.id, film.id))}`,
          });
        }
      }
    }
  }
  return Response.json(entries);
}
