"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, CalendarDays, Film, Globe2, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { isPublicDisplayMode } from "@/lib/buildMode";
import {
  prepareSearchIndex,
  SEARCH_INDEX_PATH,
  searchSite,
  type SearchEntry,
  type SearchKind,
} from "@/lib/siteSearch";

const resultTypes = {
  country: { label: "国家", Icon: Globe2 },
  film: { label: "影片", Icon: Film },
  event: { label: "事件", Icon: CalendarDays },
} as const;

export function SiteSearch({ countryCode }: { countryCode: string | null }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | null>(null);
  const [index, setIndex] = useState<ReturnType<typeof prepareSearchIndex> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const loading = useRef(false);
  const navigating = useRef(false);

  const results = useMemo(() => index ? searchSite(index, query, kind, countryCode) : [], [index, query, kind, countryCode]);
  const countryNames = useMemo(() => new Map((index ?? [])
    .filter(({ entry }) => entry.kind === "country")
    .map(({ entry }) => [entry.countryCode, entry.title])), [index]);
  const hasQuery = query.trim().length > 0;

  async function loadIndex() {
    if (loading.current) return;
    loading.current = true;
    setLoadError(false);
    try {
      const response = await fetch(SEARCH_INDEX_PATH, { cache: isPublicDisplayMode ? "default" : "no-cache" });
      if (!response.ok) throw new Error("Search index unavailable");
      const entries: SearchEntry[] = await response.json();
      setIndex(prepareSearchIndex(entries));
    } catch {
      setLoadError(true);
    } finally {
      loading.current = false;
    }
  }

  function changeOpen(next: boolean) {
    setOpen(next);
    if (!next) return;
    navigating.current = false;
    setQuery("");
    setKind(null);
    if (!index || !isPublicDisplayMode) void loadIndex();
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    const links = [...(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    if (!links.length) return;
    const fromInput = event.target === input.current;
    const current = links.findIndex((link) => link === event.target);
    if (fromInput && event.key === "Enter") {
      event.preventDefault();
      links[0].click();
    } else if ((fromInput || current !== -1) && event.key === "ArrowDown") {
      event.preventDefault();
      links[Math.min(current + 1, links.length - 1)].focus();
    } else if (current !== -1 && event.key === "ArrowUp") {
      event.preventDefault();
      (current === 0 ? input.current : links[current - 1])?.focus();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 text-sm text-white/80 transition-colors hover:border-[#35c8b4]/45 hover:text-[#b9f4eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8be2d5] sm:px-4">
        <Search size={17} aria-hidden="true" />
        <span className="max-[359px]:sr-only">搜索</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={input}
          finalFocus={() => !navigating.current}
          onKeyDown={handleKeys}
          className="fixed left-1/2 top-[max(12px,env(safe-area-inset-top))] z-[91] flex max-h-[calc(100dvh-24px)] w-[calc(100%-24px)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-[#35c8b4]/25 bg-[#0c1215] text-white shadow-[0_24px_90px_rgba(0,0,0,0.65)] outline-none sm:top-[12vh] sm:max-h-[min(76vh,38rem)]"
        >
          <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-3 sm:px-5">
            <Dialog.Title className="text-base font-medium">搜索影迹</Dialog.Title>
            <Dialog.Close aria-label="关闭搜索" className="grid size-10 place-items-center rounded-full text-white/60 hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-[#8be2d5]">
              <X size={19} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="px-4 pb-3 sm:px-5">
            <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/30 px-3 text-[#8be2d5] focus-within:border-[#35c8b4]">
              <Search size={18} aria-hidden="true" className="shrink-0" />
              <span className="sr-only">搜索国家、片名或事件</span>
              <input
                ref={input}
                type="search"
                autoComplete="off"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  list.current?.parentElement?.scrollTo({ top: 0 });
                }}
                placeholder="输入国家、片名或事件"
                className="h-12 w-full min-w-0 bg-transparent text-base text-white outline-none placeholder:text-white/45"
              />
            </label>
            {hasQuery && <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="结果类型">
              {([null, "country", "film", "event"] as const).map((category) => (
                <button
                  key={category ?? "all"}
                  type="button"
                  aria-pressed={kind === category}
                  onClick={() => {
                    setKind(category);
                    list.current?.parentElement?.scrollTo({ top: 0 });
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-[#8be2d5] ${kind === category ? "bg-[#35c8b4]/16 text-[#b9f4eb]" : "bg-white/5 text-white/65 hover:bg-white/10"}`}
                >
                  {category ? resultTypes[category].label : "全部"}
                </button>
              ))}
            </div>}
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3 sm:px-4">
            {loadError ? (
              <p role="status" className="px-2 py-4 text-sm text-white/70">
                搜索暂时无法加载。<button type="button" onClick={() => void loadIndex()} className="ml-2 text-[#a5eee3] underline underline-offset-4">重试</button>
              </p>
            ) : !index ? (
              <p role="status" className="px-2 py-4 text-sm text-white/55">正在加载搜索…</p>
            ) : hasQuery && !results.length ? (
              <p role="status" className="px-2 py-4 text-sm text-white/65">没有找到相关结果，试试更短的关键词。</p>
            ) : null}
            {index && results.length > 0 && <ul ref={list} aria-label="搜索结果" className="space-y-0.5">
              {results.map((entry) => {
                const { Icon, label } = resultTypes[entry.kind];
                const country = countryNames.get(entry.countryCode) ?? entry.countryCode.toUpperCase();
                const isArchive = entry.kind === "film" && Boolean(entry.context);
                const resultLabel = isArchive ? "影史影片" : label;
                const year = isArchive && entry.year ? `节点 ${entry.year}` : entry.year;
                return <li key={entry.href}>
                  <Link
                    href={entry.href}
                    prefetch={false}
                    scroll={!entry.href.includes("#")}
                    onNavigate={(event) => {
                      navigating.current = true;
                      setOpen(false);
                      const target = new URL(entry.href, window.location.href);
                      const path = (value: string) => value.replace(/\/$/, "");
                      if (target.hash && path(target.pathname) === path(window.location.pathname)) {
                        event.preventDefault();
                        if (window.location.hash === target.hash) {
                          window.dispatchEvent(new Event("hashchange"));
                        } else {
                          window.location.hash = target.hash;
                        }
                      }
                    }}
                    className="group flex min-h-14 items-center gap-3 rounded-xl px-2.5 py-2 outline-none hover:bg-[#35c8b4]/9 focus-visible:bg-[#35c8b4]/12 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#35c8b4]/60"
                  >
                    <Icon size={17} aria-hidden="true" className="shrink-0 text-[#8be2d5]/70" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white/95">{entry.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/55">
                        {[resultLabel, entry.kind === "country" ? entry.aliases?.[0] : country, year, entry.context].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-white/35 group-hover:text-[#8be2d5]" />
                  </Link>
                </li>;
              })}
            </ul>}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
