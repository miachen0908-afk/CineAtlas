"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { countries, people } from "@/lib/data";
import type { Person } from "@/types/cinema";
import { getPersonWithRelations } from "@/lib/data";

const MIN_TIMELINE_YEAR = 1895;
const MAX_TIMELINE_YEAR = 2025;

export function PeopleTimeline() {
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [professionFilter, setProfessionFilter] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const professions = useMemo(() => {
    const set = new Set<string>();
    people.forEach((p) => p.profession.forEach((pr) => set.add(pr)));
    return Array.from(set);
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      if (countryFilter && !p.countryCodes.includes(countryFilter)) return false;
      if (professionFilter && !p.profession.includes(professionFilter)) {
        return false;
      }
      return true;
    });
  }, [countryFilter, professionFilter]);

  const selectedPerson = selectedPersonId
    ? getPersonWithRelations(selectedPersonId)
    : null;

  const yearMarks = useMemo(() => {
    const marks: number[] = [];
    for (let y = MIN_TIMELINE_YEAR; y <= MAX_TIMELINE_YEAR; y += 20) marks.push(y);
    return marks;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <FilterGroup
          label="国家"
          options={countries.map((c) => ({ id: c.code, label: c.nameZh }))}
          value={countryFilter}
          onChange={setCountryFilter}
        />
        <FilterGroup
          label="职业"
          options={professions.map((p) => ({ id: p, label: p }))}
          value={professionFilter}
          onChange={setProfessionFilter}
        />
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] pb-8 pt-12">
        <div
          className="relative min-w-[900px] px-8"
          style={{ height: 280 }}
        >
          {/* Year axis */}
          <div className="absolute bottom-8 left-8 right-8 h-px bg-white/20" />
          {yearMarks.map((year) => {
            const pct =
              ((year - MIN_TIMELINE_YEAR) /
                (MAX_TIMELINE_YEAR - MIN_TIMELINE_YEAR)) *
              100;
            return (
              <div
                key={year}
                className="absolute bottom-4 -translate-x-1/2 text-[10px] text-white/35"
                style={{ left: `calc(8px + ${pct}% * (100% - 64px) / 100)` }}
              >
                {year}
              </div>
            );
          })}

          {filteredPeople.map((person) => (
            <PersonMarker
              key={person.id}
              person={person}
              isSelected={selectedPersonId === person.id}
              onSelect={() =>
                setSelectedPersonId(
                  selectedPersonId === person.id ? null : person.id
                )
              }
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="motion-reduce:transition-none rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <PersonDetailPanel person={selectedPerson} />
          </motion.div>
        )}
      </AnimatePresence>

      {filteredPeople.length === 0 && (
        <p className="text-center text-sm text-white/40">没有符合筛选条件的人物</p>
      )}
    </div>
  );
}

function PersonMarker({
  person,
  isSelected,
  onSelect,
}: {
  person: Person;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const pct =
    ((person.timelineYear - MIN_TIMELINE_YEAR) /
      (MAX_TIMELINE_YEAR - MIN_TIMELINE_YEAR)) *
    100;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="absolute bottom-12 -translate-x-1/2 flex flex-col items-center gap-2 transition-transform hover:scale-105"
      style={{ left: `calc(32px + ${pct}% * (100% - 64px) / 100)` }}
      aria-pressed={isSelected}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg ${
          isSelected
            ? "border-[#3a8fb7] bg-[rgba(58,143,183,0.2)]"
            : "border-white/20 bg-white/5"
        }`}
        aria-hidden
      >
        🎬
      </div>
      <span
        className={`max-w-[80px] truncate text-[10px] ${
          isSelected ? "text-[var(--cloud)]" : "text-white/50"
        }`}
      >
        {person.nameZh}
      </span>
      <span className="font-mono text-[9px] text-white/30">
        {person.timelineYear}
      </span>
    </button>
  );
}

function PersonDetailPanel({
  person,
}: {
  person: NonNullable<ReturnType<typeof getPersonWithRelations>>;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-8">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl">
        🎬
      </div>
      <div className="flex-1">
        <h2 className="text-xl text-white">{person.nameZh}</h2>
        <p className="text-sm text-white/50">{person.nameOriginal}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/50">
          <span>
            {person.birthYear}
            {person.deathYear ? `–${person.deathYear}` : "–至今"}
          </span>
          <span>·</span>
          <span>{person.countries.map((c) => c.nameZh).join("、")}</span>
          <span>·</span>
          <span>{person.profession.join("、")}</span>
          <span>·</span>
          <span>♥ {person.likeCount.toLocaleString()}</span>
        </div>
        <p className="mt-4 leading-relaxed text-white/70">{person.summary}</p>
        {person.representativeFilms.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-xs text-white/40">代表作品</h3>
            <ul className="flex flex-wrap gap-2">
              {person.representativeFilms.map((f) => (
                <li key={f.id}>
                  <a
                    href={`/film/${f.id}`}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-[var(--cloud)] hover:bg-white/10"
                  >
                    {f.titleZh}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-white/40">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full px-3 py-1 text-xs ${
            !value
              ? "bg-[rgba(58,143,183,0.2)] text-[var(--cloud)]"
              : "bg-white/5 text-white/50"
          }`}
        >
          全部
        </button>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(value === opt.id ? null : opt.id)}
            className={`rounded-full px-3 py-1 text-xs ${
              value === opt.id
                ? "bg-[rgba(58,143,183,0.2)] text-[var(--cloud)]"
                : "bg-white/5 text-white/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
