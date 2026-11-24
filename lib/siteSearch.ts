export const SEARCH_INDEX_PATH = "/search-index.json";

export type SearchKind = "country" | "film" | "event";

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  countryCode: string;
  href: string;
  aliases?: string[];
  year?: string;
  context?: string;
};

function normalize(text: string) {
  return text.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

export function prepareSearchIndex(entries: SearchEntry[]) {
  const countryNames = new Map(
    entries.filter((entry) => entry.kind === "country").map((entry) => [entry.countryCode, entry]),
  );
  return entries.map((entry) => {
    const country = countryNames.get(entry.countryCode);
    const titles = [entry.title, ...(entry.aliases ?? [])].map(normalize);
    const year = entry.year ? normalize(entry.year) : "";
    const regions = [country?.title ?? "", country?.aliases?.[0] ?? ""].map(normalize);
    return {
      entry,
      titles,
      terms: [
        ...titles,
        ...regions,
        year,
        normalize(entry.context ?? ""),
        ...titles.flatMap((title) => [...regions.map((region) => region + title), title + year]),
      ],
    };
  });
}

export function searchSite(
  index: ReturnType<typeof prepareSearchIndex>,
  query: string,
  kind: SearchKind | null,
  countryCode: string | null,
) {
  const keyword = normalize(query);
  if (!keyword) return [];
  const tokens = query.split(/\s+/).map(normalize).filter(Boolean);
  const matches: { entry: SearchEntry; rank: number }[] = [];
  for (const { entry, titles, terms } of index) {
    if (kind && entry.kind !== kind) continue;
    let rank = 0;
    if (titles[0] === keyword) rank = 500;
    else if (titles.includes(keyword)) rank = 450;
    else if (titles.some((title) => title.startsWith(keyword))) rank = 300;
    else if (titles.some((title) => title.includes(keyword))) rank = 200;
    else if (terms.some((term) => term.includes(keyword))) rank = 120;
    else if (tokens.length > 1 && tokens.every((token) => terms.some((term) => term.includes(token)))) rank = 90;
    if (rank) {
      const local = entry.countryCode === countryCode;
      matches.push({
        entry,
        rank: rank + (local ? 15 : 0) + (entry.kind === "country" ? 4 : 0)
          + (local && entry.kind === "film" && entry.context ? 2 : 0),
      });
    }
  }
  return matches.sort((a, b) => b.rank - a.rank).slice(0, 20).map(({ entry }) => entry);
}
