"use client";

import { MIN_YEAR, MAX_YEAR } from "@/store/useMapStore";

type YearRangeSliderProps = {
  yearStart: number;
  yearEnd: number;
  onChange: (start: number, end: number) => void;
  filmCount: number;
};

export function YearRangeSlider({
  yearStart,
  yearEnd,
  onChange,
  filmCount,
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
    <div className="flex flex-col gap-2 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-white/40">时间段</span>
        <span className="font-mono text-lg font-light tabular-nums text-[#e8d5a3] md:text-2xl">
          {yearStart === yearEnd ? yearStart : `${yearStart} — ${yearEnd}`}
        </span>
        <span className="text-xs text-white/40">
          {filmCount > 0 ? `${filmCount} 部影片` : "暂无影片"}
        </span>
      </div>

      <div className="relative h-8">
        <div className="year-range-track absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="year-range-fill absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#c9a962] to-[#8b7355]"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={yearStart}
          onChange={(e) => handleStartChange(parseInt(e.target.value, 10))}
          className="year-range-input year-range-input-start absolute inset-0 w-full"
          aria-label={`起始年份 ${yearStart}`}
        />
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={yearEnd}
          onChange={(e) => handleEndChange(parseInt(e.target.value, 10))}
          className="year-range-input year-range-input-end absolute inset-0 w-full"
          aria-label={`结束年份 ${yearEnd}`}
        />
      </div>

      <div className="flex justify-between text-[10px] text-white/30">
        <span>{MIN_YEAR}</span>
        <span>{MAX_YEAR}</span>
      </div>
    </div>
  );
}

export { MIN_YEAR, MAX_YEAR };
