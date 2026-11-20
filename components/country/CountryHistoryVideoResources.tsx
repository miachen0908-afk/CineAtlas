"use client";

import Image from "next/image";
import { ArrowUpRight, Film, Play } from "lucide-react";
import { useState } from "react";
import type { CinemaHistoryStage, CountryHistoryVideo } from "@/types/cinema";

const VIDEO_LABELS: Record<CountryHistoryVideo["kind"], string> = {
  "full-film": "正片",
  clip: "片段",
  analysis: "解说",
  trailer: "预告",
  interview: "访谈",
  historical: "历史回顾",
};

function VideoCover({ video }: { video: CountryHistoryVideo }) {
  const [source, setSource] = useState(video.coverUrl || video.posterUrl);
  const [loadedSource, setLoadedSource] = useState<string>();
  const isPoster = source === video.posterUrl;
  const isLoaded = Boolean(source && source === loadedSource);

  return (
    <div className="relative isolate aspect-video overflow-hidden bg-[#111917]">
      {!isLoaded && (
        <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#243229] to-[#101916] px-6 text-center">
          <Film size={22} className="text-[#dfbd69]/65" />
          <span className="line-clamp-2 text-sm font-medium text-white/75 md:text-base">{video.filmTitle}</span>
        </div>
      )}
      {source && (
        <Image
          key={source}
          src={source}
          alt=""
          fill
          unoptimized
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedSource(source)}
          onError={() => setSource(isPoster ? undefined : video.posterUrl)}
          className={`${isPoster ? "object-contain" : "object-cover"}${isLoaded ? "" : " opacity-0"}`}
        />
      )}
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <span aria-hidden className="absolute bottom-2.5 right-2.5 grid size-9 place-items-center rounded-full border border-white/25 bg-black/65 text-white transition-colors group-hover:bg-[#1d655b] md:bottom-3 md:right-3">
        <Play size={15} fill="currentColor" />
      </span>
    </div>
  );
}

export function CountryHistoryVideoStage({
  stage,
  videos,
}: {
  stage: CinemaHistoryStage;
  videos: CountryHistoryVideo[];
}) {
  const period = stage.yearLabel ?? `${stage.yearStart}—${stage.yearEnd ?? "至今"}`;
  return (
    <section
      id={`history-video-stage-${stage.id}`}
      data-stage-id={stage.id}
      aria-labelledby={`video-heading-${stage.id}`}
      className="scroll-mt-36 pb-14 md:pb-20"
    >
      <header className="mb-5 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-white/10 pb-4">
        <p className="font-mono text-base text-[#dfbd69] md:text-lg">{period}</p>
        <h2 id={`video-heading-${stage.id}`} className="text-xl font-light text-white md:text-3xl">{stage.title}</h2>
      </header>
      <div className="grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {videos.map((video) => (
          <a
            key={video.url}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#0c1211] transition-colors hover:border-[#8be2d5]/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8be2d5] md:rounded-2xl"
          >
            <VideoCover video={video} />
            <div className="p-2.5 md:p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs text-[#dfbd69]">
                <span className="font-mono">{video.year}</span>
                <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-white/75">{VIDEO_LABELS[video.kind]}</span>
              </div>
              <h3 className="break-words text-sm font-medium leading-snug text-white/90 group-hover:text-[#b9f4eb] md:text-base">{video.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function HistoryVideoLinks({ videos }: { videos: CountryHistoryVideo[] }) {
  if (!videos.length) return null;

  return (
    <ul aria-label="视频入口" className="mt-2 flex min-w-0 flex-col gap-1.5">
      {videos.map((video) => (
        <li key={video.url}>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-start gap-1.5 rounded-lg border border-[#8be2d5]/15 bg-[#35c8b4]/[0.065] px-2 py-1.5 text-xs leading-5 text-[#b3ddd6] transition-colors hover:border-[#8be2d5]/40 hover:text-[#d5fbf5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8be2d5]"
          >
            <span className="shrink-0 font-medium text-[#dfbd69]">{VIDEO_LABELS[video.kind]}</span>
            <span className="min-w-0 break-words">{video.title}</span>
            <ArrowUpRight aria-hidden size={12} className="mt-1 shrink-0 opacity-70" />
          </a>
        </li>
      ))}
    </ul>
  );
}
