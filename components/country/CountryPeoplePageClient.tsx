"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCountry, getFilm, getPeopleByCountry } from "@/lib/data";
import { buildMapQueryParams, useMapStore } from "@/store/useMapStore";
import { markMapReturnPending } from "@/components/home/mapReturnNavigation";
import { EmptyState } from "@/components/layout/EmptyState";
import type { Person } from "@/types/cinema";
import { CountrySectionNav } from "./CountryPageClient";
import { DriftWall, type DriftWallItem } from "./DriftWall";

type AnchorRect = { left: number; right: number; top: number; width: number; height: number };

export function CountryPeoplePageClient({ countryCode, selectedPersonId }: { countryCode: string; selectedPersonId: string | null }) {
  const country = getCountry(countryCode);
  const people = useMemo(() => getPeopleByCountry(countryCode), [countryCode]);
  const yearStart = useMapStore((state) => state.yearStart);
  const yearEnd = useMapStore((state) => state.yearEnd);
  const selectedGenreId = useMapStore((state) => state.selectedGenreId);
  const setCountry = useMapStore((state) => state.setCountry);
  const router = useRouter();
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const mapQuery = buildMapQueryParams({ yearStart, yearEnd, selectedCountryCode: countryCode, selectedGenreId });
  const selectedPerson = people.find((person) => person.id === selectedPersonId) ?? null;
  const wallItems = useMemo<DriftWallItem[]>(() => people.map((person) => ({ id: person.id, image: person.portraitUrl ?? "/people/portrait-placeholder.svg", title: person.nameZh, subtitle: person.nameOriginal })), [people]);

  useEffect(() => setCountry(countryCode), [countryCode, setCountry]);
  useEffect(() => {
    if (!selectedPersonId || selectedPerson) return;
    router.replace(`/country/${countryCode}/people?${mapQuery}`, { scroll: false });
  }, [countryCode, mapQuery, router, selectedPerson, selectedPersonId]);

  const selectPerson = useCallback((item: DriftWallItem, rect: DOMRect) => {
    const params = new URLSearchParams(mapQuery);
    params.set("person", item.id);
    setAnchor({ left: rect.left, right: rect.right, top: rect.top, width: rect.width, height: rect.height });
    router.replace(`/country/${countryCode}/people?${params.toString()}`, { scroll: false });
  }, [countryCode, mapQuery, router]);

  const closePerson = useCallback(() => {
    setAnchor(null);
    router.replace(`/country/${countryCode}/people?${mapQuery}`, { scroll: false });
  }, [countryCode, mapQuery, router]);

  useEffect(() => {
    if (!selectedPerson) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closePerson(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePerson, selectedPerson]);

  if (!country) return <div className="mx-auto max-w-5xl px-4 py-12"><EmptyState title="未找到该国家" description="请返回世界地图重新选择" /></div>;

  return <main className="mx-auto w-[calc(100%-24px)] max-w-none overflow-x-clip pb-20 pt-8 md:w-[92vw]">
    <Link href={`/?${mapQuery}`} onClick={markMapReturnPending} className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white">← 返回世界地图</Link>
    <header className="pb-8 pt-7 md:pb-10"><div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><p className="text-xs uppercase tracking-[0.24em] text-[#d6b25e]/75">国家电影档案</p><h1 className="mt-3 text-4xl font-light text-white md:text-6xl">{country.nameZh}影人墙</h1><p className="mt-2 text-sm tracking-[0.12em] text-white/40">{country.nameEn} · Filmmakers</p><p className="mt-5 max-w-[78ch] text-sm leading-7 text-white/55">在持续漂移的电影档案中浏览该国创作者。选择照片可查看创作经历与代表影片。</p></div><CountrySectionNav countryCode={countryCode} mapQuery={mapQuery} active="people" /></div></header>

    {people.length ? <section className="relative overflow-hidden rounded-[28px] bg-black/65 shadow-[0_34px_100px_rgba(0,0,0,0.46)]" aria-label={`${country.nameZh}电影创作者`}>
      <DriftWall items={wallItems} columns={5} tileWidth={184} tileHeight={144} gap={16} tilt={1} turn={1} perspective={1200} depth={150} speed={32} direction="down" variance={0.4} parallax={1.2} lift={64} fade={0.2} dim={0.6} overlayColor="#0f0f0f" radius={16} paused={Boolean(selectedPerson)} selectedId={selectedPerson?.id} onSelect={selectPerson} />
      <div className="pointer-events-none absolute bottom-5 left-5 z-10 text-[10px] uppercase tracking-[0.22em] text-white/30">Hover or select to pause</div>
    </section> : <section className="rounded-3xl bg-white/[0.035] px-5 py-16"><EmptyState title="该国影人档案正在整理" description="目前尚未收录可展示的创作者资料。" /></section>}

    {selectedPerson && <PersonFloatingCard person={selectedPerson} mapQuery={mapQuery} anchor={anchor} onClose={closePerson} />}
    <Link href={`/country/${countryCode}?${mapQuery}`} className="mt-10 inline-flex text-sm text-[#8be2d5]/75 hover:text-[#8be2d5]">← 返回该国电影史</Link>
  </main>;
}

function PersonFloatingCard({ person, mapQuery, anchor, onClose }: { person: Person; mapQuery: string; anchor: AnchorRect | null; onClose: () => void }) {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const films = person.representativeFilmIds.map((id) => getFilm(id)).filter((film) => film !== undefined);

  useEffect(() => {
    const update = () => {
      if (!anchor || window.innerWidth < 768) { setPosition(null); return; }
      const width = 360;
      const estimatedHeight = 460;
      const gap = 16;
      const left = window.innerWidth - anchor.right >= width + gap ? anchor.right + gap : Math.max(12, anchor.left - width - gap);
      const top = Math.max(12, Math.min(window.innerHeight - estimatedHeight - 12, anchor.top + anchor.height / 2 - estimatedHeight / 2));
      setPosition({ left, top });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [anchor]);

  return <aside role="dialog" aria-modal="false" aria-label={`${person.nameZh}人物档案`} className={`fixed z-50 max-h-[calc(100vh-24px)] w-[min(360px,calc(100vw-24px))] overflow-y-auto rounded-3xl bg-black/88 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.72)] backdrop-blur-2xl md:p-6 ${position ? "" : "bottom-3 left-1/2 -translate-x-1/2 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-y-1/2"}`} style={position ?? undefined}>
    <button type="button" onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] text-white/55 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-[#8be2d5]" aria-label="关闭人物档案">×</button>
    <div className="flex items-center gap-4 pr-9"><div className="h-20 w-20 shrink-0 rounded-2xl bg-[#111319] bg-cover bg-[center_22%]" style={{ backgroundImage: `url("${person.portraitUrl ?? "/people/portrait-placeholder.svg"}")` }} /><div className="min-w-0"><h2 className="text-xl font-light">{person.nameZh}</h2><p className="mt-1 truncate text-xs text-white/40">{person.nameOriginal}</p><p className="mt-2 font-mono text-xs text-[#d6b25e]/75">{person.birthYear}{person.deathYear ? ` — ${person.deathYear}` : " — 至今"}</p></div></div>
    <p className="mt-5 text-xs text-[#8be2d5]/70">{person.profession.join(" · ")}</p><p className="mt-3 text-sm leading-7 text-white/62">{person.summary}</p>
    {films.length > 0 && <div className="mt-6"><p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/30">代表影片</p><div className="flex flex-wrap gap-2">{films.map((film) => <Link key={film.id} href={`/film/${film.id}?${mapQuery}`} className="rounded-full bg-white/[0.06] px-3 py-2 text-xs text-white/65 transition-colors hover:bg-white/[0.1] hover:text-white">{film.titleZh} · {film.year}</Link>)}</div></div>}
    {person.portraitSourceName && <p className="mt-6 text-[10px] text-white/25">头像来源：{person.portraitSourceUrl ? <a href={person.portraitSourceUrl} target="_blank" rel="noreferrer" className="hover:text-white/50">{person.portraitSourceName} ↗</a> : person.portraitSourceName}</p>}
  </aside>;
}
