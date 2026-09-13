"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { markMapReturnPending } from "@/components/home/mapReturnNavigation";
import { getCountry } from "@/lib/data";
import type { FilmWithRelations } from "@/types/cinema";
import { LikeButton } from "./LikeButton";

type FilmDetailProps = {
  film: FilmWithRelations;
};

export function FilmDetail({ film }: FilmDetailProps) {
  const query = useSearchParams();
  const backParams = new URLSearchParams();
  for (const key of ["yearStart", "yearEnd", "country", "genre"]) {
    const value = query.get(key);
    if (value) backParams.set(key, value);
  }
  const legacyYear = query.get("year");
  if (legacyYear && !backParams.has("yearStart")) {
    backParams.set("yearStart", legacyYear);
    backParams.set("yearEnd", legacyYear);
  }
  const sourceCountry = getCountry(query.get("fromCountry")?.toLowerCase() ?? "");
  const sourceEvent = query.get("fromEvent");
  const safeEvent = sourceEvent && /^[a-z0-9-]+$/i.test(sourceEvent) ? sourceEvent : null;
  const backHref = sourceCountry
    ? `/country/${sourceCountry.code}${backParams.size ? `?${backParams}` : ""}${safeEvent ? `#history-event-${safeEvent}` : ""}`
    : backParams.size ? `/?${backParams}` : "/";
  const backLabel = sourceCountry ? `返回${sourceCountry.nameZh}电影史` : "返回地图";
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link
        href={backHref}
        onClick={sourceCountry ? undefined : markMapReturnPending}
        className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-[var(--cloud)]"
      >
        ← {backLabel}
      </Link>

      <div className="flex flex-col gap-8 md:flex-row">
        <div
          className="mx-auto h-64 w-44 shrink-0 rounded-xl md:mx-0 md:h-80 md:w-56"
          style={{ backgroundColor: film.posterColor ?? "#2d3748" }}
          role="img"
          aria-label={`${film.titleZh} 占位海报`}
        />

        <div className="flex flex-1 flex-col gap-4">
          <header>
            <h1 className="text-2xl font-light text-white md:text-3xl">
              {film.titleZh}
            </h1>
            <p className="mt-1 text-white/50">{film.titleOriginal}</p>
          </header>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
            <span>{film.year} 年上映</span>
            {film.rating && <span>★ {film.rating.toFixed(1)}</span>}
          </div>

          <dl className="grid gap-3 text-sm">
            <DetailRow label="第一出品国" value={film.country.nameZh} />
            {film.otherProductionCountries.length > 0 && (
              <DetailRow
                label="其他出品国"
                value={film.otherProductionCountries.join("、")}
              />
            )}
            {film.productionCity && (
              <DetailRow label="出品城市" value={film.productionCity} />
            )}
            {film.filmingLocations.length > 0 && (
              <DetailRow
                label="拍摄地点"
                value={film.filmingLocations.map((l) => l.name).join("、")}
              />
            )}
            {film.directors.length > 0 && (
              <DetailRow
                label="导演"
                value={film.directors.map((d) => d.nameZh).join("、")}
              />
            )}
            {film.genres.length > 0 && (
              <DetailRow
                label="类型"
                value={film.genres.map((g) => g.nameZh).join("、")}
              />
            )}
          </dl>

          <LikeButton filmId={film.id} baseCount={film.likeCount} />

          <section>
            <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
              简介
            </h2>
            <p className="leading-relaxed text-white/70">{film.summary}</p>
          </section>
        </div>
      </div>
    </article>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-white/40">{label}</dt>
      <dd className="text-white/75">{value}</dd>
    </div>
  );
}
