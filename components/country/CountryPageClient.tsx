"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  genres,
  getCountry,
  getPeopleByCountry,
  getPersonWithRelations,
} from "@/lib/data";
import type { Film } from "@/types/cinema";
import {
  buildMapQueryParams,
  formatYearRange,
  useMapStore,
} from "@/store/useMapStore";
import {
  countFilmsByCountry,
  getGenreDistribution,
  getProductionCities,
} from "@/utils/filmFilters";
import { EmptyState } from "@/components/layout/EmptyState";

type CountryPageClientProps = {
  countryCode: string;
  allFilms: Film[];
};

export function CountryPageClient({
  countryCode,
  allFilms,
}: CountryPageClientProps) {
  const country = getCountry(countryCode);
  const yearStart = useMapStore((s) => s.yearStart);
  const yearEnd = useMapStore((s) => s.yearEnd);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const yearRangeLabel = formatYearRange(yearStart, yearEnd);

  const countryFilms = useMemo(
    () =>
      allFilms.filter(
        (f) =>
          f.primaryProductionCountry === countryCode &&
          f.year >= yearStart &&
          f.year <= yearEnd
      ),
    [allFilms, countryCode, yearStart, yearEnd]
  );

  const allCountryFilms = useMemo(
    () => allFilms.filter((f) => f.primaryProductionCountry === countryCode),
    [allFilms, countryCode]
  );

  const representatives = useMemo(
    () =>
      [...allCountryFilms]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 3),
    [allCountryFilms]
  );

  const countryPeople = useMemo(
    () => getPeopleByCountry(countryCode),
    [countryCode]
  );

  const genreDist = useMemo(
    () => getGenreDistribution(allFilms, yearStart, yearEnd, countryCode),
    [allFilms, yearStart, yearEnd, countryCode]
  );

  const cities = useMemo(
    () => getProductionCities(allFilms, countryCode),
    [allFilms, countryCode]
  );

  const selectedPerson = selectedPersonId
    ? getPersonWithRelations(selectedPersonId)
    : null;

  const mapQuery = buildMapQueryParams({
    yearStart,
    yearEnd,
    selectedCountryCode: countryCode,
    selectedGenreId: null,
  });

  if (!country) {
    return (
      <EmptyState title="未找到该国家" description="请返回世界地图重新选择" />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <Link
        href={`/?${mapQuery}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-[#e8d5a3]"
      >
        ← 返回世界地图
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-light text-[#e8d5a3]">{country.nameZh}</h1>
        <p className="mt-1 text-sm text-white/40">{country.nameEn}</p>
        <p className="mt-4 leading-relaxed text-white/65">{country.summary}</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="当前时间段" value={yearRangeLabel} />
        <StatCard
          label={`${yearRangeLabel} 影片`}
          value={String(
            countFilmsByCountry(allFilms, yearStart, yearEnd, countryCode)
          )}
        />
        <StatCard label="历史影片总数" value={String(allCountryFilms.length)} />
      </div>

      {representatives.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            代表影片
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {representatives.map((film) => (
              <Link
                key={film.id}
                href={`/film/${film.id}?${mapQuery}`}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/8"
              >
                <div
                  className="h-16 w-12 shrink-0 rounded"
                  style={{ backgroundColor: film.posterColor ?? "#2d3748" }}
                />
                <div>
                  <p className="text-sm text-white">{film.titleZh}</p>
                  <p className="text-xs text-white/40">{film.year}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
          {yearRangeLabel} 影片列表
        </h2>
        {countryFilms.length === 0 ? (
          <EmptyState
            title={`${yearRangeLabel} 暂无 ${country.nameZh} 影片`}
            description="可在地图首页调整时间段"
          />
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
            {countryFilms.map((film) => (
              <li key={film.id}>
                <Link
                  href={`/film/${film.id}?${mapQuery}`}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/5"
                >
                  <div
                    className="h-12 w-9 shrink-0 rounded"
                    style={{ backgroundColor: film.posterColor ?? "#2d3748" }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-white">{film.titleZh}</p>
                    <p className="text-xs text-white/40">{film.titleOriginal}</p>
                  </div>
                  {film.rating && (
                    <span className="text-xs text-white/50">
                      ★ {film.rating.toFixed(1)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {countryPeople.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            代表人物
          </h2>
          <div className="flex flex-wrap gap-3">
            {countryPeople.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() =>
                  setSelectedPersonId(
                    selectedPersonId === person.id ? null : person.id
                  )
                }
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedPersonId === person.id
                    ? "border-[#c9a962]/50 bg-[#c9a962]/10"
                    : "border-white/10 bg-white/5 hover:bg-white/8"
                }`}
              >
                <p className="text-sm text-white">{person.nameZh}</p>
                <p className="text-xs text-white/40">
                  {person.profession.join("、")}
                </p>
              </button>
            ))}
          </div>
          {selectedPerson && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-relaxed text-white/70">
                {selectedPerson.summary}
              </p>
            </div>
          )}
        </section>
      )}

      {cities.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            主要电影城市
          </h2>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <span
                key={city}
                className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60"
              >
                {city}
              </span>
            ))}
          </div>
        </section>
      )}

      {Object.keys(genreDist).length > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-white/40">
            {yearRangeLabel} 类型分布
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(genreDist).map(([genreId, count]) => {
              const genre = genres.find((g) => g.id === genreId);
              return (
                <span
                  key={genreId}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"
                >
                  {genre?.nameZh ?? genreId} · {count}
                </span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-mono text-xl text-[#e8d5a3]">{value}</p>
    </div>
  );
}
