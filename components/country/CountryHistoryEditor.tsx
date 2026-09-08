"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreCountryHistoryRevisionAction, saveCountryHistoryAction } from "@/app/country/[countryCode]/history-actions";
import type {
  CinemaHistoryArchiveFilm,
  CinemaHistoryEvent,
  CinemaHistoryEventType,
  CountryCinemaHistory,
  CountryCinemaHistoryEditableContent,
  CountryCinemaHistoryEditorState,
} from "@/types/cinema";

const EVENT_TYPES: Array<{ id: CinemaHistoryEventType; label: string }> = [
  { id: "historical", label: "历史背景" }, { id: "film", label: "影片" },
  { id: "industry", label: "产业" }, { id: "movement", label: "电影运动" },
  { id: "technology", label: "技术" }, { id: "institution", label: "机构" },
  { id: "person", label: "人物" },
];

const inputClass = "w-full rounded-xl bg-white/[0.055] px-3.5 py-3 text-[1.05rem] text-white outline-none placeholder:text-white/25 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#35c8b4]/55";
const labelClass = "grid gap-2 text-[0.9rem] text-white/45";

function copyContent(content: CountryCinemaHistoryEditableContent): CountryCinemaHistoryEditableContent {
  return JSON.parse(JSON.stringify(content)) as CountryCinemaHistoryEditableContent;
}

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function CountryHistoryEditor({ countryCode, history, editorState, editorSecret, onClose }: { countryCode: string; history: CountryCinemaHistory; editorState: CountryCinemaHistoryEditorState; editorSecret: string; onClose: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => copyContent(editorState.content));
  const [selectedStageId, setSelectedStageId] = useState(history.stages[0]?.id ?? "");
  const [selectedSubStageId, setSelectedSubStageId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const frameworkStage = history.stages.find((stage) => stage.id === selectedStageId) ?? history.stages[0];
  const stageIndex = draft.stages.findIndex((stage) => stage.stageId === frameworkStage?.id);
  const stageContent = stageIndex >= 0 ? draft.stages[stageIndex] : null;
  const frameworkSubStage = frameworkStage?.subStages?.find((subStage) => subStage.id === selectedSubStageId) ?? frameworkStage?.subStages?.[0];
  const subStageIndex = stageContent?.subStages?.findIndex((subStage) => subStage.subStageId === frameworkSubStage?.id) ?? -1;
  const subStageContent = subStageIndex >= 0 ? stageContent?.subStages?.[subStageIndex] : null;

  const updateStage = (updater: (stage: NonNullable<typeof stageContent>) => NonNullable<typeof stageContent>) => {
    if (stageIndex < 0) return;
    setDraft((current) => ({ ...current, stages: current.stages.map((stage, index) => index === stageIndex ? updater(stage) : stage) }));
  };

  const updateSubStage = (updater: (subStage: NonNullable<typeof subStageContent>) => NonNullable<typeof subStageContent>) => {
    if (subStageIndex < 0) return;
    updateStage((stage) => ({ ...stage, subStages: stage.subStages?.map((subStage, index) => index === subStageIndex ? updater(subStage) : subStage) }));
  };
  const activeEvents = frameworkSubStage ? subStageContent?.events ?? [] : stageContent?.events ?? [];
  const updateActiveEvents = (events: CinemaHistoryEvent[]) => {
    if (frameworkSubStage) updateSubStage((subStage) => ({ ...subStage, events }));
    else updateStage((stage) => ({ ...stage, events }));
  };
  const save = () => startTransition(async () => {
    setMessage(null);
    const result = await saveCountryHistoryAction(countryCode, editorState.version, draft, editorSecret);
    if (!result.ok) { setMessage(result.errors?.join("；") ?? result.message); return; }
    router.refresh();
    onClose();
  });
  const restore = (revisionId: number, version: number) => {
    if (!window.confirm(`确认恢复版本 ${version}？当前内容会先自动保存到版本记录。`)) return;
    startTransition(async () => {
      const result = await restoreCountryHistoryRevisionAction(countryCode, revisionId, editorState.version, editorSecret);
      if (!result.ok) { setMessage(result.message); return; }
      router.refresh();
      onClose();
    });
  };

  if (!frameworkStage || !stageContent) return null;

  return <section className="mb-10 rounded-3xl bg-black/78 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.52)] backdrop-blur-2xl md:p-6" aria-label="电影史内容编辑器">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[0.9rem] uppercase tracking-[0.2em] text-[#d6b25e]/70">内容校对模式</p><h2 className="mt-2 text-[1.5rem] font-light text-white">编辑国家电影史</h2><p className="mt-1 text-[0.9rem] text-white/30">当前版本 {editorState.version}{editorState.updatedAt ? ` · ${new Date(editorState.updatedAt).toLocaleString("zh-CN")}` : " · 尚未写入数据库"}</p></div><div className="flex gap-2"><button type="button" onClick={onClose} disabled={isPending} className="rounded-full bg-white/[0.06] px-5 py-2.5 text-[1.05rem] text-white/55 hover:text-white">取消</button><button type="button" onClick={save} disabled={isPending} className="rounded-full bg-[#35c8b4]/18 px-6 py-2.5 text-[1.05rem] text-[#8be2d5] disabled:opacity-40">{isPending ? "保存中…" : "保存修改"}</button></div></div>
    {message && <p className="mt-4 rounded-xl bg-red-400/10 px-4 py-3 text-[1.05rem] text-red-200/80">{message}</p>}

    <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{history.stages.map((stage) => <button key={stage.id} type="button" onClick={() => { setSelectedStageId(stage.id); setSelectedSubStageId(stage.subStages?.[0]?.id ?? ""); }} className={`shrink-0 rounded-full px-4 py-2.5 text-[0.9rem] ${stage.id === frameworkStage.id ? "bg-white/12 text-white" : "bg-white/[0.04] text-white/40"}`}>{stage.shortTitle}</button>)}</div>

    <div className="mt-5 rounded-2xl bg-white/[0.025] p-4"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-[1.35rem] text-white/80">{frameworkStage.title}</h3><span className="font-mono text-[0.9rem] text-[#d6b25e]/70">{frameworkStage.yearLabel}</span></div><label className={`${labelClass} mt-4`}>阶段导语（快速浏览）<textarea value={stageContent.brief ?? ""} onChange={(event) => updateStage((stage) => ({ ...stage, brief: event.target.value }))} rows={2} className={inputClass} placeholder="建议 45—90 字；留空时自动取时代背景首句。" /></label><label className={`${labelClass} mt-4`}>时代背景<textarea value={stageContent.summary ?? ""} onChange={(event) => updateStage((stage) => ({ ...stage, summary: event.target.value }))} rows={6} className={inputClass} placeholder="填写本阶段时代背景；清空后阅读页不显示。" /></label></div>

    {frameworkStage.subStages?.length ? <div className="mt-6 rounded-2xl bg-white/[0.02] p-4"><div className="flex gap-2 overflow-x-auto pb-2" aria-label="子阶段选择">{frameworkStage.subStages.map((subStage) => <button key={subStage.id} type="button" onClick={() => setSelectedSubStageId(subStage.id)} className={`shrink-0 rounded-xl px-4 py-3 text-left transition-colors ${subStage.id === frameworkSubStage?.id ? "bg-[#35c8b4]/12 text-white" : "bg-white/[0.035] text-white/40"}`}><span className="block text-[0.9rem]">{subStage.shortTitle}</span><span className="mt-1 block font-mono text-xs text-[#d6b25e]/55">{subStage.yearLabel ?? `${subStage.yearStart}—${subStage.yearEnd ?? "至今"}`}</span></button>)}</div>{frameworkSubStage && subStageContent ? <><label className={`${labelClass} mt-4`}>{frameworkSubStage.title} · 阶段导语<textarea value={subStageContent.brief ?? ""} onChange={(event) => updateSubStage((subStage) => ({ ...subStage, brief: event.target.value }))} rows={2} className={inputClass} placeholder="留空时自动取时代背景首句。" /></label><label className={`${labelClass} mt-4`}>{frameworkSubStage.title} · 时代背景<textarea value={subStageContent.summary ?? ""} onChange={(event) => updateSubStage((subStage) => ({ ...subStage, summary: event.target.value }))} rows={5} className={inputClass} placeholder="填写本子阶段时代背景；清空后阅读页不显示。" /></label></> : <p className="mt-4 text-[0.9rem] text-red-200/60">子阶段内容尚未初始化，请重新载入页面。</p>}</div> : null}

    {(!frameworkStage.subStages?.length || subStageContent) && <><div className="mt-6 flex items-center justify-between"><div><h3 className="text-[1.05rem] text-white/65">历史事件 · {activeEvents.length}</h3>{frameworkSubStage && <p className="mt-1 font-mono text-xs text-white/30">允许年份：{frameworkSubStage.yearLabel ?? `${frameworkSubStage.yearStart}—${frameworkSubStage.yearEnd ?? "至今"}`}</p>}</div><button type="button" onClick={() => updateActiveEvents([...activeEvents, { id: makeId("event"), year: frameworkSubStage?.yearStart ?? frameworkStage.yearStart, title: "", description: "", type: "historical", archiveFilms: [] }])} className="rounded-full bg-white/[0.07] px-5 py-2.5 text-[0.9rem] text-white/65 hover:text-white">＋ 新增事件</button></div>
    <div className="mt-3 space-y-4">{activeEvents.map((event, eventIndex) => <EventEditor key={event.id} event={event} onChange={(next) => updateActiveEvents(activeEvents.map((item, index) => index === eventIndex ? next : item))} onDelete={() => { if (window.confirm(`确认删除事件“${event.title || "未命名事件"}”及其全部影片卡？`)) updateActiveEvents(activeEvents.filter((_, index) => index !== eventIndex)); }} />)}</div></>}

    <details className="mt-6 rounded-2xl bg-white/[0.025] px-4 py-1"><summary className="cursor-pointer py-4 text-[1.05rem] text-white/50">版本历史 · {editorState.revisions.length}</summary><div className="space-y-2 pb-4">{editorState.revisions.length ? editorState.revisions.map((revision) => <div key={revision.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/30 px-3 py-3"><div><p className="text-[0.9rem] text-white/60">版本 {revision.version}</p><p className="mt-1 text-xs text-white/25">{new Date(revision.createdAt).toLocaleString("zh-CN")}</p></div><button type="button" disabled={isPending} onClick={() => restore(revision.id, revision.version)} className="rounded-full bg-white/[0.06] px-4 py-2 text-[0.9rem] text-white/50 hover:text-white">恢复</button></div>) : <p className="pb-4 text-[0.9rem] text-white/30">首次保存后将开始记录历史版本。</p>}</div></details>
  </section>;
}

function EventEditor({ event, onChange, onDelete }: { event: CinemaHistoryEvent; onChange: (event: CinemaHistoryEvent) => void; onDelete: () => void }) {
  const films = event.archiveFilms ?? [];
  const updateFilm = (index: number, next: CinemaHistoryArchiveFilm) => onChange({ ...event, archiveFilms: films.map((film, filmIndex) => filmIndex === index ? next : film) });
  return <article className="rounded-2xl bg-white/[0.035] p-4"><div className="grid gap-3 md:grid-cols-[120px_120px_minmax(0,1fr)_150px]"><label className={labelClass}>开始年份<input type="number" className={inputClass} value={event.year} onChange={(e) => onChange({ ...event, year: Number(e.target.value) })} /></label><label className={labelClass}>结束年份<input type="number" className={inputClass} value={event.endYear ?? ""} onChange={(e) => onChange({ ...event, endYear: e.target.value ? Number(e.target.value) : undefined })} placeholder="可选" /></label><label className={labelClass}>事件标题<input className={inputClass} value={event.title} onChange={(e) => onChange({ ...event, title: e.target.value })} /></label><label className={labelClass}>事件类型<select className={inputClass} value={event.type ?? "historical"} onChange={(e) => onChange({ ...event, type: e.target.value as CinemaHistoryEventType })}>{EVENT_TYPES.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label></div><label className={`${labelClass} mt-3`}>事件摘要（快速浏览）<textarea className={inputClass} rows={2} value={event.brief ?? ""} onChange={(e) => onChange({ ...event, brief: e.target.value })} placeholder="留空时自动显示历史说明的第一句。" /></label><label className={`${labelClass} mt-3`}>历史说明<textarea className={inputClass} rows={3} value={event.description} onChange={(e) => onChange({ ...event, description: e.target.value })} /></label>
    <div className="mt-4 flex items-center justify-between"><p className="text-[0.9rem] text-white/40">史料影片卡 · {films.length}</p><div className="flex gap-2"><button type="button" onClick={() => onChange({ ...event, archiveFilms: [...films, { id: makeId("archive-film"), title: "", genre: "", credits: [], synopsis: "", significance: "" }] })} className="rounded-full bg-white/[0.06] px-4 py-2 text-[0.9rem] text-white/55">＋ 添加影片</button><button type="button" onClick={onDelete} className="rounded-full bg-red-400/[0.08] px-4 py-2 text-[0.9rem] text-red-200/55">删除事件</button></div></div>
    <div className="mt-3 space-y-3">{films.map((film, index) => <ArchiveFilmEditor key={film.id} film={film} onChange={(next) => updateFilm(index, next)} onDelete={() => { if (window.confirm(`确认删除影片卡《${film.title || "未命名影片"}》？`)) onChange({ ...event, archiveFilms: films.filter((_, filmIndex) => filmIndex !== index) }); }} />)}</div>
  </article>;
}

function ArchiveFilmEditor({ film, onChange, onDelete }: { film: CinemaHistoryArchiveFilm; onChange: (film: CinemaHistoryArchiveFilm) => void; onDelete: () => void }) {
  return <div className="rounded-xl bg-black/28 p-4"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"><label className={labelClass}>片名<input className={inputClass} value={film.title} onChange={(e) => onChange({ ...film, title: e.target.value })} /></label><label className={labelClass}>类型<input className={inputClass} value={film.genre ?? ""} onChange={(e) => onChange({ ...film, genre: e.target.value })} /></label><button type="button" onClick={onDelete} className="self-end rounded-full bg-red-400/[0.08] px-4 py-3 text-[0.9rem] text-red-200/55">删除影片卡</button></div>
    <div className="mt-3 space-y-2"><div className="flex items-center justify-between"><p className="text-[0.9rem] text-white/40">主创信息</p><button type="button" onClick={() => onChange({ ...film, credits: [...film.credits, { role: "", name: "" }] })} className="text-[0.9rem] text-[#8be2d5]/60">＋ 添加主创</button></div>{film.credits.map((credit, index) => <div key={index} className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)_auto]"><input aria-label="主创职务" className={inputClass} placeholder="导演/主演" value={credit.role} onChange={(e) => onChange({ ...film, credits: film.credits.map((item, itemIndex) => itemIndex === index ? { ...item, role: e.target.value } : item) })} /><input aria-label="主创姓名" className={inputClass} placeholder="姓名" value={credit.name} onChange={(e) => onChange({ ...film, credits: film.credits.map((item, itemIndex) => itemIndex === index ? { ...item, name: e.target.value } : item) })} /><button type="button" onClick={() => onChange({ ...film, credits: film.credits.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 text-[1.05rem] text-white/30" aria-label="删除主创字段">×</button></div>)}</div>
    <label className={`${labelClass} mt-3`}>一句话意义（快速浏览）<textarea className={inputClass} rows={2} value={film.brief ?? ""} onChange={(e) => onChange({ ...film, brief: e.target.value })} placeholder="留空时自动取价值意义第一句。" /></label><label className={`${labelClass} mt-3`}>剧情简介<textarea className={inputClass} rows={2} value={film.synopsis} onChange={(e) => onChange({ ...film, synopsis: e.target.value })} /></label><label className={`${labelClass} mt-3`}>价值意义<textarea className={inputClass} rows={2} value={film.significance} onChange={(e) => onChange({ ...film, significance: e.target.value })} /></label>
  </div>;
}
