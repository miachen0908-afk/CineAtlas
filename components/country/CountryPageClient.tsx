"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { genres, getCountry, getPeopleByCountry, getPerson } from "@/lib/data";
import type { CinemaHistoryArchiveFilm, CinemaHistoryEvent, CinemaHistoryEventType, CinemaHistoryStage, CinemaHistorySubStage, CountryCinemaHistory, CountryCinemaHistoryEditorState, Film, Person } from "@/types/cinema";
import { buildMapQueryParams, formatYearRange, useMapStore } from "@/store/useMapStore";
import { getGenreDistribution, getProductionCities } from "@/utils/filmFilters";
import { EmptyState } from "@/components/layout/EmptyState";
import { markMapReturnPending } from "@/components/home/mapReturnNavigation";
import { validateCountryCinemaHistory } from "@/lib/countryCinemaHistory";
import { CountryStageNavigation } from "./CountryStageNavigation";
import { CountryHistoryEditor } from "./CountryHistoryEditor";
import { verifyCountryHistoryEditorAction } from "@/app/country/[countryCode]/history-actions";

type Props = { countryCode: string; allFilms: Film[]; history: CountryCinemaHistory | null; editorState: CountryCinemaHistoryEditorState | null };
const EVENT_TYPE_LABELS: Record<CinemaHistoryEventType, string> = { movement: "电影运动", industry: "产业", technology: "技术", institution: "机构", film: "影片", person: "人物", historical: "历史背景" };
const ACT_LABELS = ["第一幕", "第二幕", "第三幕", "第四幕", "第五幕", "第六幕", "第七幕", "第八幕", "第九幕", "第十幕"];

function periodLabel(period: { yearStart: number; yearEnd: number | null; yearLabel?: string }) {
  return period.yearLabel ?? `${period.yearStart}—${period.yearEnd ?? "至今"}`;
}

function personHref(countryCode: string, mapQuery: string, personId?: string) {
  const params = new URLSearchParams(mapQuery);
  if (personId) params.set("person", personId);
  return `/country/${countryCode}/people?${params.toString()}`;
}

export function CountryPageClient({ countryCode, allFilms, history, editorState }: Props) {
  const country = getCountry(countryCode);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const yearStart = useMapStore((s) => s.yearStart);
  const yearEnd = useMapStore((s) => s.yearEnd);
  const selectedGenreId = useMapStore((s) => s.selectedGenreId);
  const setCountry = useMapStore((s) => s.setCountry);
  const [activeStageId, setActiveStageId] = useState(history?.stages[0]?.id ?? "");
  const [editing, setEditing] = useState(false);
  const [editorSecret, setEditorSecret] = useState("");
  const [editorMessage, setEditorMessage] = useState<string | null>(null);
  const [unlockingEditor, setUnlockingEditor] = useState(false);

  useEffect(() => setCountry(countryCode), [countryCode, setCountry]);
  useEffect(() => {
    if (!history || process.env.NODE_ENV === "production") return;
    const errors = validateCountryCinemaHistory(history, allFilms.map((film) => film.id));
    if (errors.length) console.warn(`[country-history:${countryCode}]`, errors);
  }, [allFilms, countryCode, history]);
  useEffect(() => {
    if (!history?.stages.length) return;
    const elements = history.stages.map((s) => document.getElementById(`history-stage-${s.id}`)).filter((e): e is HTMLElement => e !== null);
    let frame = 0;
    const updateActiveStage = () => {
      frame = 0;
      const readingLine = Math.min(180, window.innerHeight * 0.28);
      let current = elements[0];
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= readingLine) current = element;
        else break;
      }
      const id = current?.dataset.stageId;
      if (id) setActiveStageId((previous) => previous === id ? previous : id);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveStage);
    };
    updateActiveStage();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [history]);

  const allCountryFilms = useMemo(() => allFilms.filter((f) => f.primaryProductionCountry === countryCode).sort((a, b) => a.year - b.year || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)), [allFilms, countryCode]);
  const filteredCountryFilms = useMemo(() => allCountryFilms.filter((f) => f.year >= yearStart && f.year <= yearEnd && (!selectedGenreId || f.genreIds.includes(selectedGenreId))), [allCountryFilms, selectedGenreId, yearEnd, yearStart]);
  const filmMap = useMemo(() => new Map(allFilms.map((film) => [film.id, film])), [allFilms]);
  const countryPeople = useMemo(() => getPeopleByCountry(countryCode), [countryCode]);
  const peopleMap = useMemo(() => new Map(countryPeople.map((person) => [person.id, person])), [countryPeople]);
  const cities = useMemo(() => getProductionCities(allFilms, countryCode), [allFilms, countryCode]);
  const genreDistribution = useMemo(() => getGenreDistribution(allFilms, yearStart, yearEnd, countryCode), [allFilms, countryCode, yearEnd, yearStart]);
  const mapQuery = buildMapQueryParams({ yearStart, yearEnd, selectedCountryCode: countryCode, selectedGenreId });
  const yearRangeLabel = formatYearRange(yearStart, yearEnd);

  if (!country) return <div className="mx-auto max-w-5xl px-4 py-12 md:px-6"><EmptyState title="未找到该国家" description="请返回世界地图重新选择" /></div>;
  const scrollToStage = (id: string) => {
    setActiveStageId(id);
    document.getElementById(`history-stage-${id}`)?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  };
  const toggleEditor = async () => {
    if (editing) {
      setEditing(false);
      setEditorSecret("");
      setEditorMessage(null);
      return;
    }
    const secret = window.prompt("请输入电影史编辑口令");
    if (!secret) return;
    setUnlockingEditor(true);
    setEditorMessage(null);
    const result = await verifyCountryHistoryEditorAction(secret);
    setUnlockingEditor(false);
    if (!result.ok) {
      setEditorMessage(result.message ?? "无法进入编辑模式");
      return;
    }
    setEditorSecret(secret);
    setEditing(true);
  };

  return (
    <main className="country-history-page mx-auto w-[calc(100%-16px)] max-w-none pb-16 pt-8 sm:w-[94vw] md:pb-24">
      <div className="mx-auto w-full max-w-[1520px]"><Link href={`/?${mapQuery}`} onClick={markMapReturnPending} className="inline-flex items-center gap-2 text-[1.05rem] text-white/50 transition-colors hover:text-white">← 返回世界地图</Link></div>
      <header className="pb-8 pt-7 md:pb-10">
        <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div className="w-full max-w-[80ch] sm:min-w-0 sm:flex-1">
            <p className="text-[0.9rem] uppercase tracking-[0.24em] text-[#d6b25e]/75">国家电影档案</p>
            <h1 className="mt-3 text-4xl font-light tracking-tight text-white md:text-6xl">{country.nameZh}</h1>
            <p className="mt-2 text-[1.05rem] tracking-[0.12em] text-white/40">{country.nameEn}</p>
            <p className="mt-6 text-[1.05rem] leading-8 text-white/65 md:text-[1.2rem] md:leading-9">{history?.introduction ?? country.summary}</p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:ml-auto sm:w-auto sm:shrink-0"><CountrySectionNav countryCode={countryCode} mapQuery={mapQuery} active="history" />{history && editorState && <button type="button" onClick={toggleEditor} disabled={unlockingEditor} className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-2 text-[0.9rem] text-white/35 outline-none transition-colors hover:text-white/75 focus-visible:ring-2 focus-visible:ring-[#8be2d5]/70 disabled:opacity-40"><span aria-hidden="true">✎</span>{unlockingEditor ? "验证中…" : editing ? "退出编辑" : "编辑"}</button>}{editorMessage && <p className="w-full text-right text-[0.8rem] text-red-200/65">{editorMessage}</p>}</div>
        </div>
      </header>

      {history?.contentNotice && <div className="mx-auto mb-8 w-full max-w-[1520px] rounded-2xl bg-[#d6b25e]/[0.07] px-5 py-4 text-[0.9rem] leading-7 text-[#ead59b]/80"><span className="mr-2 font-medium text-[#ead59b]">{history.contentStatus === "demo" ? "模板演示" : "分期说明"}</span>{history.contentNotice}</div>}

      {editing && history && editorState && <div className="mx-auto w-full max-w-[1520px]"><CountryHistoryEditor countryCode={countryCode} history={history} editorState={editorState} editorSecret={editorSecret} onClose={() => { setEditing(false); setEditorSecret(""); }} /></div>}

      {history?.stages.length ? <>
        <CountryStageNavigation stages={history.stages} activeStageId={activeStageId} onSelectStage={scrollToStage} />
        <div className="relative mx-auto mt-8 w-full max-w-[1520px] md:mt-12">
          {history.stages.map((stage, index) => <HistoryStageSection key={stage.id} stage={stage} index={index} countryCode={countryCode} mapQuery={mapQuery} filmMap={filmMap} peopleMap={peopleMap} showPeopleEntry={index === Math.floor(history.stages.length / 2)} />)}
        </div>
      </> : <section className="mx-auto w-full max-w-[1520px] rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent px-5 py-14 text-center [&_.glass-panel>p]:text-[0.9rem] [&_.glass-panel>p.font-medium]:text-[1.05rem] md:px-8 md:py-16"><EmptyState title="该国电影史内容正在整理" description="正式阶段和历史事件将在课程团队完成校订后发布，现有影片档案仍可在下方查看。" /><Link href={personHref(countryCode, mapQuery)} className="mt-6 inline-flex text-[1.05rem] text-[#8be2d5]/80 hover:text-[#8be2d5]">探索该国电影创作者 →</Link></section>}

      <div className="mx-auto mt-12 w-full max-w-[1520px] space-y-3 md:mt-16">
        <details className="group rounded-2xl bg-black/45 px-4 py-1 backdrop-blur-md md:px-5">
          <summary className="cursor-pointer list-none py-4 text-[1.05rem] text-white/70 marker:hidden"><span className="flex items-center justify-between gap-4"><span>影片档案 · {yearRangeLabel}</span><span className="text-[0.9rem] text-white/35 group-open:rotate-45">＋</span></span></summary>
          <div className="pb-6">{filteredCountryFilms.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">{filteredCountryFilms.map((film) => <FilmArchiveCard key={film.id} film={film} mapQuery={mapQuery} />)}</div> : <p className="py-8 text-center text-[1.05rem] text-white/40">当前筛选范围暂无影片档案</p>}</div>
        </details>
        <details className="group rounded-2xl bg-black/45 px-4 py-1 backdrop-blur-md md:px-5">
          <summary className="cursor-pointer list-none py-4 text-[1.05rem] text-white/70 marker:hidden"><span className="flex items-center justify-between gap-4"><span>国家电影概览</span><span className="text-[0.9rem] text-white/35 group-open:rotate-45">＋</span></span></summary>
          <div className="grid gap-8 pb-6 md:grid-cols-2"><OverviewList title="主要电影城市" items={cities} /><OverviewList title={`${yearRangeLabel} 类型分布`} items={Object.entries(genreDistribution).map(([id, count]) => `${genres.find((g) => g.id === id)?.nameZh ?? id} · ${count}`)} /></div>
        </details>
      </div>
    </main>
  );
}

export function CountrySectionNav({ countryCode, mapQuery, active }: { countryCode: string; mapQuery: string; active: "history" | "people" }) {
  const links = [{ id: "history", label: "电影史", href: `/country/${countryCode}?${mapQuery}` }, { id: "people", label: "影人墙", href: personHref(countryCode, mapQuery) }] as const;
  return <nav className="flex shrink-0 rounded-full bg-black/55 p-1" aria-label="国家档案栏目">{links.map((link) => <Link key={link.id} href={link.href} className={`rounded-full px-5 py-2.5 text-[1.05rem] transition-colors ${active === link.id ? "bg-white/10 text-white" : "text-white/45 hover:text-white/75"}`} aria-current={active === link.id ? "page" : undefined}>{link.label}</Link>)}</nav>;
}

function HistoryStageSection({ stage, index, countryCode, mapQuery, filmMap, peopleMap, showPeopleEntry }: { stage: CinemaHistoryStage; index: number; countryCode: string; mapQuery: string; filmMap: Map<string, Film>; peopleMap: Map<string, Person>; showPeopleEntry: boolean }) {
  const films = stage.representativeFilmIds.map((id) => filmMap.get(id)).filter((f): f is Film => !!f);
  const people = stage.representativePersonIds.map((id) => peopleMap.get(id) ?? getPerson(id)).filter((p): p is Person => !!p);
  const summaryLines = stage.summary?.split("\n") ?? [];
  const summaryHeading = summaryLines[0]?.trim();
  const summaryParagraphs = summaryLines
    .slice(1)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return <section id={`history-stage-${stage.id}`} data-stage-id={stage.id} className="scroll-mt-20 pb-10 md:pb-14">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.065] via-black/45 to-[#35c8b4]/[0.025] px-5 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.24)] md:px-6 md:py-9"><span className="absolute right-5 top-4 font-mono text-[0.9rem] text-white/15">{ACT_LABELS[index] ?? `第${index + 1}幕`}</span><div className="mx-auto max-w-[88ch]"><p className="font-mono text-[1.05rem] text-[#d6b25e]">{periodLabel(stage)}</p><h2 className="mt-2 text-[1.8rem] font-light leading-tight text-white md:text-[2.25rem]">{stage.title}</h2>{stage.summary && <div className="mt-4 space-y-3 text-[1.05rem] leading-8 text-white/55 md:text-[1.2rem] md:leading-9">{summaryHeading && <p className="font-medium text-white/75">{summaryHeading}</p>}{summaryParagraphs.map((paragraph, paragraphIndex) => <p key={`${stage.id}-summary-${paragraphIndex}`}>{paragraph}</p>)}</div>}</div></div>
    {stage.events.length > 0 ? <div className="mt-6 space-y-6 md:mt-8">{stage.events.map((event) => <HistoryEventRow key={event.id} event={event} countryCode={countryCode} mapQuery={mapQuery} filmMap={filmMap} peopleMap={peopleMap} />)}</div> : !stage.subStages?.length ? <div className="mt-6 space-y-6 md:mt-8"><HistoryContentPending label="本阶段内容正在整理" /></div> : null}
    {stage.subStages?.length ? <div className="mx-auto mt-7 max-w-[1360px] space-y-5 md:pl-[161px]">{stage.subStages.map((subStage) => <HistorySubStageSection key={subStage.id} subStage={subStage} countryCode={countryCode} mapQuery={mapQuery} filmMap={filmMap} peopleMap={peopleMap} />)}</div> : null}
    {(films.length > 0 || people.length > 0) && <div className="mx-auto mt-7 max-w-[1360px] rounded-2xl bg-white/[0.025] p-5 md:pl-[161px] md:pr-5"><p className="mb-4 text-[0.825rem] uppercase tracking-[0.2em] text-white/30">本幕代表档案</p><AssociatedArchives films={films} people={people} countryCode={countryCode} mapQuery={mapQuery} /></div>}
    {showPeopleEntry && <div className="mx-auto mt-8 max-w-[1360px] md:pl-[161px]"><Link href={personHref(countryCode, mapQuery)} className="inline-flex items-center gap-2 text-[1.05rem] text-[#8be2d5]/75 hover:text-[#8be2d5]">探索该国电影创作者 →</Link></div>}
  </section>;
}

function HistorySubStageSection({ subStage, countryCode, mapQuery, filmMap, peopleMap }: { subStage: CinemaHistorySubStage; countryCode: string; mapQuery: string; filmMap: Map<string, Film>; peopleMap: Map<string, Person> }) {
  const films = (subStage.representativeFilmIds ?? []).map((id) => filmMap.get(id)).filter((film): film is Film => !!film);
  const people = (subStage.representativePersonIds ?? []).map((id) => peopleMap.get(id) ?? getPerson(id)).filter((person): person is Person => !!person);
  return <section className="rounded-2xl bg-gradient-to-r from-white/[0.045] to-transparent p-5 md:p-6" aria-labelledby={`sub-stage-${subStage.id}`}>
    <p className="font-mono text-[0.9rem] text-[#d6b25e]/80">{periodLabel(subStage)}</p>
    <h3 id={`sub-stage-${subStage.id}`} className="mt-2 text-[1.35rem] font-light text-white/85 md:text-[1.5rem]">{subStage.title}</h3>
    {subStage.summary && <p className="mt-3 text-[1.05rem] leading-8 text-white/50">{subStage.summary}</p>}
    <div className="mt-5 space-y-4">{subStage.events?.length ? subStage.events.map((event) => <HistoryEventRow key={event.id} event={event} countryCode={countryCode} mapQuery={mapQuery} filmMap={filmMap} peopleMap={peopleMap} />) : <p className="rounded-xl bg-black/25 px-4 py-5 text-[1.05rem] text-white/35">本子阶段内容正在整理</p>}</div>
    {(films.length > 0 || people.length > 0) && <div className="mt-5"><AssociatedArchives films={films} people={people} countryCode={countryCode} mapQuery={mapQuery} /></div>}
  </section>;
}

function HistoryContentPending({ label }: { label: string }) {
  return <div className="mx-auto max-w-[1360px] rounded-2xl bg-black/25 px-5 py-8 text-center text-[1.05rem] text-white/35 md:pl-[161px]">{label}</div>;
}

function HistoryEventRow({ event, countryCode, mapQuery, filmMap, peopleMap }: { event: CinemaHistoryEvent; countryCode: string; mapQuery: string; filmMap: Map<string, Film>; peopleMap: Map<string, Person> }) {
  const films = (event.filmIds ?? []).map((id) => filmMap.get(id)).filter((f): f is Film => !!f);
  const people = (event.personIds ?? []).map((id) => peopleMap.get(id) ?? getPerson(id)).filter((p): p is Person => !!p);
  const year = event.endYear && event.endYear !== event.year ? `${event.year} — ${event.endYear}` : String(event.year);
  const [archiveFilm, setArchiveFilm] = useState<CinemaHistoryArchiveFilm | null>(null);
  const [anchor, setAnchor] = useState<{ left: number; right: number; top: number; height: number } | null>(null);
  useEffect(() => {
    if (!archiveFilm) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setArchiveFilm(null); setAnchor(null); } };
    const closeOnResize = () => { setArchiveFilm(null); setAnchor(null); };
    window.addEventListener("keydown", close);
    window.addEventListener("resize", closeOnResize);
    return () => { window.removeEventListener("keydown", close); window.removeEventListener("resize", closeOnResize); };
  }, [archiveFilm]);
  return <article className="relative mx-auto grid w-full max-w-[1360px] gap-3 md:grid-cols-[112px_1px_minmax(0,1199px)] md:justify-center md:gap-x-6"><div className="font-mono text-[1.05rem] text-[#d6b25e] md:pt-1 md:text-right">{year}</div><div className="relative hidden bg-gradient-to-b from-[#35c8b4]/75 via-[#35c8b4]/45 to-[#35c8b4]/15 md:block"><span className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#35c8b4] shadow-[0_0_14px_rgba(53,200,180,0.6)]" /></div><div className="min-w-0 rounded-2xl bg-black/35 p-5 backdrop-blur-sm md:p-6"><div className="flex flex-wrap items-center gap-3"><h3 className="text-[1.35rem] font-medium leading-snug text-white">{event.title}</h3>{event.type && <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[0.9rem] text-white/40">{EVENT_TYPE_LABELS[event.type]}</span>}</div><p className="mt-4 text-[1.05rem] leading-8 text-white/60 md:text-[1.2rem] md:leading-9">{event.description}</p>{event.archiveFilms?.length ? <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[1.05rem]"><span className="text-white/28">影片档案</span>{event.archiveFilms.map((film) => <button key={film.id} type="button" onClick={(click) => { const rect = click.currentTarget.getBoundingClientRect(); setArchiveFilm(film); setAnchor({ left: rect.left, right: rect.right, top: rect.top, height: rect.height }); }} className="text-[#8be2d5]/75 underline decoration-[#35c8b4]/25 underline-offset-4 transition-colors hover:text-[#b9f4eb] focus-visible:outline-2 focus-visible:outline-[#8be2d5]">《{film.title}》</button>)}</div> : null}{(films.length > 0 || people.length > 0) && <div className="mt-5"><AssociatedArchives films={films} people={people} countryCode={countryCode} mapQuery={mapQuery} /></div>}{event.sources?.length ? <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[0.825rem] text-white/30"><span>来源</span>{event.sources.map((source) => source.url ? <a key={`${source.label}-${source.url}`} href={source.url} target="_blank" rel="noreferrer" className="hover:text-white/60">{source.label} ↗</a> : <span key={source.label}>{source.label}</span>)}</div> : null}</div>{archiveFilm && <ArchiveFilmFloatingCard film={archiveFilm} anchor={anchor} onClose={() => { setArchiveFilm(null); setAnchor(null); }} />}</article>;
}

function ArchiveFilmFloatingCard({ film, anchor, onClose }: { film: CinemaHistoryArchiveFilm; anchor: { left: number; right: number; top: number; height: number } | null; onClose: () => void }) {
  let position: React.CSSProperties | undefined;
  if (anchor && typeof window !== "undefined" && window.innerWidth >= 768) {
    const width = 390;
    const left = window.innerWidth - anchor.right >= width + 14 ? anchor.right + 14 : Math.max(12, anchor.left - width - 14);
    position = { left, top: Math.max(12, Math.min(window.innerHeight - 430, anchor.top + anchor.height / 2 - 190)) };
  }
  return <aside role="dialog" aria-modal="false" aria-label={`《${film.title}》影片档案`} style={position} className={`fixed z-50 max-h-[calc(100vh-24px)] w-[min(390px,calc(100vw-24px))] overflow-y-auto rounded-3xl bg-black/92 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.72)] backdrop-blur-2xl ${position ? "" : "bottom-3 left-1/2 -translate-x-1/2"}`}><button type="button" onClick={onClose} aria-label="关闭影片档案" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-[1.2rem] text-white/50 hover:text-white">×</button><p className="pr-10 text-[0.9rem] uppercase tracking-[0.2em] text-[#d6b25e]/65">历史影片档案</p><h4 className="mt-2 pr-10 text-[1.5rem] font-light text-white">《{film.title}》</h4>{film.genre && <p className="mt-2 text-[0.9rem] text-[#8be2d5]/65">{film.genre}</p>}{film.credits.length > 0 && <dl className="mt-5 grid grid-cols-[65px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[0.9rem]">{film.credits.map((credit, index) => <div key={`${credit.role}-${index}`} className="contents"><dt className="text-white/30">{credit.role}</dt><dd className="text-white/65">{credit.name}</dd></div>)}</dl>}<div className="mt-5 space-y-5"><section><h5 className="text-[0.9rem] text-white/35">剧情简介</h5><p className="mt-2 text-[1.05rem] leading-7 text-white/65">{film.synopsis}</p></section><section><h5 className="text-[0.9rem] text-white/35">价值意义</h5><p className="mt-2 text-[1.05rem] leading-7 text-white/65">{film.significance}</p></section></div></aside>;
}

function AssociatedArchives({ films, people, countryCode, mapQuery }: { films: Film[]; people: Person[]; countryCode: string; mapQuery: string }) {
  return <div className="grid gap-4 lg:grid-cols-2">{films.length > 0 && <div className="flex min-w-0 gap-3 overflow-x-auto pb-1">{films.map((film) => <FilmArchiveCard key={film.id} film={film} mapQuery={mapQuery} compact />)}</div>}{people.length > 0 && <div className="flex min-w-0 gap-3 overflow-x-auto pb-1">{people.map((person) => <PersonArchiveCard key={person.id} person={person} href={personHref(countryCode, mapQuery, person.id)} />)}</div>}</div>;
}

function FilmArchiveCard({ film, mapQuery, compact = false }: { film: Film; mapQuery: string; compact?: boolean }) {
  return <Link href={`/film/${film.id}?${mapQuery}`} className={`${compact ? "w-24 shrink-0" : "min-w-0"} group block`}><div className="aspect-[2/3] overflow-hidden rounded-lg bg-[#15191f] bg-cover bg-center shadow-lg transition-transform duration-300 group-hover:-translate-y-1" style={{ backgroundColor: film.posterColor ?? "#15191f", backgroundImage: film.posterUrl ? `url(${JSON.stringify(film.posterUrl)})` : undefined }}>{!film.posterUrl && <div className="flex h-full items-end bg-gradient-to-t from-black/80 to-transparent p-2 text-[0.9rem] text-white/70">{film.titleZh}</div>}</div><p className="mt-2 line-clamp-2 text-[0.9rem] leading-6 text-white/70">{film.titleZh}</p><p className="font-mono text-[0.9rem] text-white/30">{film.year}</p></Link>;
}

function PersonArchiveCard({ person, href }: { person: Person; href: string }) {
  return <Link href={href} className="flex w-48 shrink-0 items-center gap-3 rounded-xl bg-white/[0.035] p-3 transition-colors hover:bg-white/[0.07]"><div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#15252a] to-[#15121f] text-[1.05rem] text-[#8be2d5]/65" style={person.portraitUrl ? { backgroundImage: `url(${JSON.stringify(person.portraitUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{!person.portraitUrl && person.nameZh.slice(0, 1)}</div><div className="min-w-0"><p className="truncate text-[1.05rem] text-white/75">{person.nameZh}</p><p className="mt-1 truncate text-[0.9rem] text-white/35">{person.profession.join("、")}</p></div></Link>;
}

function OverviewList({ title, items }: { title: string; items: string[] }) {
  return <section><h3 className="mb-3 text-[0.9rem] text-white/35">{title}</h3>{items.length ? <div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[0.9rem] text-white/55">{item}</span>)}</div> : <p className="text-[1.05rem] text-white/30">暂无数据</p>}</section>;
}
