"use client";

import { MIN_YEAR, MAX_YEAR } from "@/store/useMapStore";
import { CarriageThumb, LocomotiveThumb } from "./TrainThumb";

type YearRangeSliderProps = {
  yearStart: number;
  yearEnd: number;
  onChange: (start: number, end: number) => void;
};

export function YearRangeSlider({
  yearStart,
  yearEnd,
  onChange,
}: YearRangeSliderProps) {
  const rangeSpan = MAX_YEAR - MIN_YEAR;
  const startPct = ((yearStart - MIN_YEAR) / rangeSpan) * 100;
  const endPct = ((yearEnd - MIN_YEAR) / rangeSpan) * 100;

  const handleStartChange = (value: number) => {
    onChange(Math.min(value, yearEnd), yearEnd);
  };

  const handleEndChange = (value: number) => {
    onChange(yearStart, Math.max(value, yearStart));
  };

  return (
    <div className="timeline-content flex flex-col gap-1 px-3 py-2 md:px-5">
      <div className="relative flex min-h-5 items-center justify-center">
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-sm font-medium tabular-nums text-[var(--timeline-gold)] md:text-base">
          {yearStart === yearEnd ? yearStart : `${yearStart} — ${yearEnd}`}
        </span>
      </div>

      <div className="train-timeline relative h-9 touch-none md:h-10">
        {/* Station buffers */}
        <div
          className="timeline-buffer pointer-events-none absolute left-0 top-1/2 z-[1] h-5 w-1 -translate-y-1/2 rounded-sm"
          aria-hidden
        />
        <div
          className="timeline-buffer pointer-events-none absolute right-0 top-1/2 z-[1] h-5 w-1 -translate-y-1/2 rounded-sm"
          aria-hidden
        />

        {/* Sleepers + rails */}
        <div className="train-track pointer-events-none absolute inset-x-2 top-1/2 h-3.5 -translate-y-1/2 md:inset-x-3">
          <div className="train-track-ties absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2" />
          <div className="train-rail train-rail-top absolute inset-x-0 top-[calc(50%-4px)]" />
          <div className="train-rail train-rail-bottom absolute inset-x-0 top-[calc(50%+2px)]" />
          <div
            className="train-track-active absolute top-1/2 h-2.5 -translate-y-1/2"
            style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
          />
        </div>

        {/* Visual thumbs */}
        <div className="pointer-events-none absolute inset-x-2 top-0 bottom-0 md:inset-x-3">
          <div
            className="train-thumb absolute top-1/2 z-[4] -translate-x-1/2 -translate-y-[58%] scale-[0.65] md:scale-75"
            style={{ left: `${startPct}%` }}
          >
            <LocomotiveThumb />
          </div>
          <div
            className="train-thumb absolute top-1/2 z-[5] -translate-x-1/2 -translate-y-[55%] scale-[0.65] md:scale-75"
            style={{ left: `${endPct}%` }}
          >
            <CarriageThumb />
          </div>
        </div>

        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={yearStart}
          onChange={(e) => handleStartChange(parseInt(e.target.value, 10))}
          className="year-range-input year-range-input-start absolute inset-x-2 top-0 h-full w-[calc(100%-1rem)] md:inset-x-3 md:w-[calc(100%-1.5rem)]"
          aria-label={`起始年份 ${yearStart}`}
        />
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={yearEnd}
          onChange={(e) => handleEndChange(parseInt(e.target.value, 10))}
          className="year-range-input year-range-input-end absolute inset-x-2 top-0 h-full w-[calc(100%-1rem)] md:inset-x-3 md:w-[calc(100%-1.5rem)]"
          aria-label={`结束年份 ${yearEnd}`}
        />
      </div>

    </div>
  );
}

export { MIN_YEAR, MAX_YEAR };
