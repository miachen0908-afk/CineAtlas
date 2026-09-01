"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { CinemaHistoryStage } from "@/types/cinema";

type Props = {
  stages: CinemaHistoryStage[];
  activeStageId: string;
  onSelectStage: (stageId: string) => void;
};

const EDGE_EPSILON = 2;

export function CountryStageNavigation({
  stages,
  activeStageId,
  onSelectStage,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragState = useRef({ active: false, pointerId: -1, startX: 0, scrollLeft: 0 });
  const reducedMotion = useReducedMotion() ?? false;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollLeft(track.scrollLeft > EDGE_EPSILON);
    setCanScrollRight(
      track.scrollLeft + track.clientWidth < track.scrollWidth - EDGE_EPSILON
    );
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => observer.disconnect();
  }, [stages, updateEdges]);

  useEffect(() => {
    const track = trackRef.current;
    const button = buttonRefs.current.get(activeStageId);
    if (!track || !button) return;
    const target = button.offsetLeft + button.offsetWidth / 2 - track.clientWidth / 2;
    track.scrollTo({
      left: Math.max(0, target),
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeStageId, reducedMotion]);

  const scrollPage = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.7,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  const selectByIndex = (index: number) => {
    const stage = stages[Math.max(0, Math.min(stages.length - 1, index))];
    if (!stage) return;
    buttonRefs.current.get(stage.id)?.focus();
    onSelectStage(stage.id);
  };

  return (
    <nav
      className="sticky top-0 z-30 mx-auto w-full max-w-[1520px] bg-black/80 py-3 backdrop-blur-xl"
      aria-label="电影史阶段导航"
    >
      <div className="relative w-full">
        <div
          ref={trackRef}
          className="stage-navigation-track flex cursor-grab snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain px-9 active:cursor-grabbing md:px-11"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          onScroll={updateEdges}
          onWheel={(event) => {
            const track = trackRef.current;
            if (!track || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            event.preventDefault();
            track.scrollLeft += event.deltaY;
          }}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse") return;
            // Keep stage labels as reliable click/keyboard targets. The gaps and
            // padded rail remain available as a generous desktop drag surface.
            if ((event.target as HTMLElement).closest("button")) return;
            const track = trackRef.current;
            if (!track) return;
            dragState.current = {
              active: true,
              pointerId: event.pointerId,
              startX: event.clientX,
              scrollLeft: track.scrollLeft,
            };
            track.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const track = trackRef.current;
            const drag = dragState.current;
            if (!track || !drag.active || drag.pointerId !== event.pointerId) return;
            const distance = event.clientX - drag.startX;
            track.scrollLeft = drag.scrollLeft - distance;
          }}
          onPointerUp={(event) => {
            const track = trackRef.current;
            if (dragState.current.pointerId === event.pointerId) {
              dragState.current.active = false;
              if (track?.hasPointerCapture(event.pointerId)) {
                track.releasePointerCapture(event.pointerId);
              }
            }
          }}
          onPointerCancel={() => {
            dragState.current.active = false;
          }}
        >
          {stages.map((stage, index) => {
            const active = activeStageId === stage.id;
            const year = stage.yearLabel ?? `${stage.yearStart}—${stage.yearEnd ?? "至今"}`;
            return (
              <button
                key={stage.id}
                ref={(node) => {
                  if (node) buttonRefs.current.set(stage.id, node);
                  else buttonRefs.current.delete(stage.id);
                }}
                type="button"
                tabIndex={active ? 0 : -1}
                onClick={() => onSelectStage(stage.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") {
                    event.preventDefault();
                    selectByIndex(index + 1);
                  } else if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    selectByIndex(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    selectByIndex(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    selectByIndex(stages.length - 1);
                  }
                }}
                className={`relative shrink-0 snap-center whitespace-nowrap rounded-full px-5 py-3 text-[1.05rem] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#8be2d5]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none ${
                  active
                    ? "bg-[#35c8b4]/12 text-[#8be2d5]"
                    : "bg-white/[0.035] text-white/55 hover:text-white/80"
                }`}
                aria-current={active ? "true" : undefined}
                aria-label={`${stage.shortTitle}，${stage.title}，${year}`}
              >
                {stage.shortTitle}
                <span
                  className={`absolute inset-x-4 bottom-0 h-px origin-center bg-[#8be2d5] transition-transform duration-300 motion-reduce:transition-none ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <div className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black via-black/80 to-transparent transition-opacity ${canScrollLeft ? "opacity-100" : "opacity-0"}`} aria-hidden />
        <div className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black via-black/80 to-transparent transition-opacity ${canScrollRight ? "opacity-100" : "opacity-0"}`} aria-hidden />
        {canScrollLeft && <button type="button" onClick={() => scrollPage(-1)} className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-[1.05rem] text-white/65 outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-[#8be2d5]/70" aria-label="向左浏览更多电影史阶段">‹</button>}
        {canScrollRight && <button type="button" onClick={() => scrollPage(1)} className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-[1.05rem] text-white/65 outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-[#8be2d5]/70" aria-label="向右浏览更多电影史阶段">›</button>}
      </div>
    </nav>
  );
}
