import { chinaCinemaHistory } from "@/data/countryCinemaHistory/cn";
import type {
  CinemaHistoryEvent,
  CinemaHistoryStage,
  CinemaHistorySubStage,
  CountryCinemaHistoryEditableContent,
  CountryCinemaHistory,
} from "@/types/cinema";
import { getPerson } from "@/lib/data";

const histories = new Map<string, CountryCinemaHistory>([
  [chinaCinemaHistory.countryCode, chinaCinemaHistory],
]);

function sortEvents(events: CinemaHistoryEvent[]): CinemaHistoryEvent[] {
  return [...events].sort(
    (a, b) =>
      a.year - b.year ||
      (a.endYear ?? a.year) - (b.endYear ?? b.year) ||
      a.id.localeCompare(b.id)
  );
}

function cloneEvent(event: CinemaHistoryEvent): CinemaHistoryEvent {
  return {
    ...event,
    filmIds: event.filmIds ? [...event.filmIds] : undefined,
    personIds: event.personIds ? [...event.personIds] : undefined,
    sources: event.sources?.map((source) => ({ ...source })),
    archiveFilms: event.archiveFilms?.map((film) => ({
      ...film,
      credits: film.credits.map((credit) => ({ ...credit })),
    })),
  };
}

function normalizeStage(stage: CinemaHistoryStage): CinemaHistoryStage {
  return {
    ...stage,
    events: sortEvents(stage.events),
    subStages: stage.subStages
      ?.map(normalizeSubStage)
      .sort(comparePeriod),
    representativeFilmIds: [...stage.representativeFilmIds],
    representativePersonIds: [...stage.representativePersonIds],
  };
}

export function extractCountryCinemaHistoryEditableContent(
  history: CountryCinemaHistory
): CountryCinemaHistoryEditableContent {
  return {
    stages: history.stages.map((stage) => ({
      stageId: stage.id,
      summary: stage.summary,
      brief: stage.brief,
      events: sortEvents(stage.events).map(cloneEvent),
      subStages: stage.subStages?.map((subStage) => ({
        subStageId: subStage.id,
        summary: subStage.summary,
        brief: subStage.brief,
        events: sortEvents(subStage.events ?? []).map(cloneEvent),
      })),
    })),
  };
}

function mergeEditableSubStages(
  stage: CinemaHistoryStage,
  content: CountryCinemaHistoryEditableContent["stages"][number]
): CinemaHistorySubStage[] | undefined {
  if (!stage.subStages) return undefined;
  if (!content.subStages) return stage.subStages.map(normalizeSubStage);
  const contentBySubStage = new Map(
    content.subStages.map((subStage) => [subStage.subStageId, subStage])
  );
  return stage.subStages.map((subStage) => {
    const editableSubStage = contentBySubStage.get(subStage.id);
    if (!editableSubStage) return normalizeSubStage(subStage);
    const hasPersistedSummary = Object.prototype.hasOwnProperty.call(
      editableSubStage,
      "summary"
    );
    return normalizeSubStage({
      ...subStage,
      summary: hasPersistedSummary
        ? editableSubStage.summary?.trim() || undefined
        : subStage.summary,
      brief: Object.prototype.hasOwnProperty.call(editableSubStage, "brief")
        ? editableSubStage.brief?.trim() || undefined
        : subStage.brief,
      events: editableSubStage.events.map(cloneEvent),
    });
  });
}

export function mergeCountryCinemaHistoryEditableContent(
  history: CountryCinemaHistory,
  editable: CountryCinemaHistoryEditableContent
): CountryCinemaHistory {
  const contentByStage = new Map(editable.stages.map((stage) => [stage.stageId, stage]));
  return {
    ...history,
    stages: history.stages.map((stage) => {
      const content = contentByStage.get(stage.id);
      if (!content) return normalizeStage(stage);
      const hasPersistedSummary = Object.prototype.hasOwnProperty.call(
        content,
        "summary"
      );
      return normalizeStage({
        ...stage,
        summary: hasPersistedSummary
          ? content.summary?.trim() || undefined
          : stage.summary,
        brief: Object.prototype.hasOwnProperty.call(content, "brief")
          ? content.brief?.trim() || undefined
          : stage.brief,
        events: content.events.map(cloneEvent),
        subStages: mergeEditableSubStages(stage, content),
      });
    }),
  };
}

export function normalizeCountryCinemaHistoryEditableContent(
  history: CountryCinemaHistory,
  editable: CountryCinemaHistoryEditableContent
): CountryCinemaHistoryEditableContent {
  const normalized = extractCountryCinemaHistoryEditableContent(
    mergeCountryCinemaHistoryEditableContent(history, editable)
  );
  const inputByStage = new Map(
    editable.stages.map((stage) => [stage.stageId, stage])
  );
  for (const stage of normalized.stages) {
    const inputStage = inputByStage.get(stage.stageId);
    if (!inputStage) continue;
    if (
      Object.prototype.hasOwnProperty.call(inputStage, "summary") &&
      !inputStage.summary?.trim()
    ) {
      stage.summary = "";
    }
    if (
      Object.prototype.hasOwnProperty.call(inputStage, "brief") &&
      !inputStage.brief?.trim()
    ) {
      stage.brief = "";
    }
    const inputBySubStage = new Map(
      (inputStage.subStages ?? []).map((subStage) => [
        subStage.subStageId,
        subStage,
      ])
    );
    for (const subStage of stage.subStages ?? []) {
      const inputSubStage = inputBySubStage.get(subStage.subStageId);
      if (
        inputSubStage &&
        Object.prototype.hasOwnProperty.call(inputSubStage, "summary") &&
        !inputSubStage.summary?.trim()
      ) {
        subStage.summary = "";
      }
      if (
        inputSubStage &&
        Object.prototype.hasOwnProperty.call(inputSubStage, "brief") &&
        !inputSubStage.brief?.trim()
      ) {
        subStage.brief = "";
      }
    }
  }
  return normalized;
}

export function validateCountryCinemaHistoryEditableContent(
  history: CountryCinemaHistory,
  editable: CountryCinemaHistoryEditableContent
): string[] {
  const errors: string[] = [];
  const eventTypes = new Set(["movement", "industry", "technology", "institution", "film", "person", "historical"]);
  const framework = new Map(history.stages.map((stage) => [stage.id, stage]));
  const seenStages = new Set<string>();
  const eventIds = new Set<string>();
  const archiveFilmIds = new Set<string>();
  for (const content of editable.stages) {
    const stage = framework.get(content.stageId);
    if (!stage) { errors.push(`未知阶段: ${content.stageId}`); continue; }
    if (seenStages.has(content.stageId)) errors.push(`重复阶段内容: ${content.stageId}`);
    seenStages.add(content.stageId);
    for (const event of content.events) {
      if (!event.id.trim()) errors.push(`阶段 ${stage.title} 存在缺少 ID 的事件`);
      if (eventIds.has(event.id)) errors.push(`重复事件 ID: ${event.id}`);
      eventIds.add(event.id);
      if (!event.title.trim()) errors.push(`事件 ${event.id} 缺少标题`);
      if (!event.description.trim()) errors.push(`事件 ${event.id} 缺少说明`);
      if (event.type && !eventTypes.has(event.type)) errors.push(`事件 ${event.id} 的类型无效`);
      if (event.endYear !== undefined && event.endYear < event.year) errors.push(`事件年份倒置: ${event.id}`);
      if (event.year < stage.yearStart || (stage.yearEnd !== null && (event.endYear ?? event.year) > stage.yearEnd)) errors.push(`事件 ${event.id} 超出阶段 ${stage.id} 的年份范围`);
      for (const film of event.archiveFilms ?? []) {
        if (!film.id.trim()) errors.push(`事件 ${event.id} 存在缺少 ID 的影片卡`);
        if (archiveFilmIds.has(film.id)) errors.push(`重复史料影片 ID: ${film.id}`);
        archiveFilmIds.add(film.id);
        if (!film.title.trim()) errors.push(`史料影片 ${film.id} 缺少片名`);
        if (!film.synopsis.trim()) errors.push(`史料影片 ${film.id} 缺少剧情简介`);
        if (!film.significance.trim()) errors.push(`史料影片 ${film.id} 缺少价值意义`);
        for (const credit of film.credits) {
          if (!credit.role.trim() || !credit.name.trim()) errors.push(`史料影片 ${film.id} 存在不完整主创字段`);
        }
      }
    }
    const subStageFramework = new Map(
      (stage.subStages ?? []).map((subStage) => [subStage.id, subStage])
    );
    const seenSubStages = new Set<string>();
    for (const subStageContent of content.subStages ?? []) {
      const subStage = subStageFramework.get(subStageContent.subStageId);
      if (!subStage) {
        errors.push(`阶段 ${stage.title} 包含未知子阶段: ${subStageContent.subStageId}`);
        continue;
      }
      if (seenSubStages.has(subStageContent.subStageId)) {
        errors.push(`重复子阶段内容: ${subStageContent.subStageId}`);
      }
      seenSubStages.add(subStageContent.subStageId);
      for (const event of subStageContent.events) {
        if (!event.id.trim()) errors.push(`子阶段 ${subStage.title} 存在缺少 ID 的事件`);
        if (eventIds.has(event.id)) errors.push(`重复事件 ID: ${event.id}`);
        eventIds.add(event.id);
        if (!event.title.trim()) errors.push(`事件 ${event.id} 缺少标题`);
        if (!event.description.trim()) errors.push(`事件 ${event.id} 缺少说明`);
        if (event.type && !eventTypes.has(event.type)) errors.push(`事件 ${event.id} 的类型无效`);
        if (event.endYear !== undefined && event.endYear < event.year) errors.push(`事件年份倒置: ${event.id}`);
        if (event.year < subStage.yearStart || (subStage.yearEnd !== null && (event.endYear ?? event.year) > subStage.yearEnd)) errors.push(`事件 ${event.id} 超出子阶段 ${subStage.id} 的年份范围`);
        for (const film of event.archiveFilms ?? []) {
          if (!film.id.trim()) errors.push(`事件 ${event.id} 存在缺少 ID 的影片卡`);
          if (archiveFilmIds.has(film.id)) errors.push(`重复史料影片 ID: ${film.id}`);
          archiveFilmIds.add(film.id);
          if (!film.title.trim()) errors.push(`史料影片 ${film.id} 缺少片名`);
          if (!film.synopsis.trim()) errors.push(`史料影片 ${film.id} 缺少剧情简介`);
          if (!film.significance.trim()) errors.push(`史料影片 ${film.id} 缺少价值意义`);
          for (const credit of film.credits) {
            if (!credit.role.trim() || !credit.name.trim()) errors.push(`史料影片 ${film.id} 存在不完整主创字段`);
          }
        }
      }
    }
  }
  for (const stage of history.stages) {
    if (!seenStages.has(stage.id)) errors.push(`缺少阶段内容: ${stage.id}`);
  }
  return errors;
}

function comparePeriod(
  a: { yearStart: number; yearEnd: number | null; id: string },
  b: { yearStart: number; yearEnd: number | null; id: string }
): number {
  return (
    a.yearStart - b.yearStart ||
    (a.yearEnd ?? Number.POSITIVE_INFINITY) -
      (b.yearEnd ?? Number.POSITIVE_INFINITY) ||
    a.id.localeCompare(b.id)
  );
}

function normalizeSubStage(stage: CinemaHistorySubStage): CinemaHistorySubStage {
  return {
    ...stage,
    events: sortEvents(stage.events ?? []),
    representativeFilmIds: [...(stage.representativeFilmIds ?? [])],
    representativePersonIds: [...(stage.representativePersonIds ?? [])],
  };
}

export function getCountryCinemaHistory(
  countryCode: string
): CountryCinemaHistory | null {
  const history = histories.get(countryCode.toLowerCase());
  if (!history) return null;

  return {
    ...history,
    stages: history.stages
      .map(normalizeStage)
      .sort(comparePeriod),
  };
}

export function validateCountryCinemaHistory(
  history: CountryCinemaHistory,
  availableFilmIds: Iterable<string>
): string[] {
  const errors: string[] = [];
  const filmIds = new Set(availableFilmIds);
  const stageIds = new Set<string>();
  const subStageIds = new Set<string>();
  const eventIds = new Set<string>();

  for (const stage of history.stages) {
    if (stageIds.has(stage.id)) errors.push(`重复阶段 ID: ${stage.id}`);
    stageIds.add(stage.id);
    if (stage.yearEnd !== null && stage.yearStart > stage.yearEnd) {
      errors.push(`阶段年份倒置: ${stage.id}`);
    }
    for (const filmId of stage.representativeFilmIds) {
      if (!filmIds.has(filmId)) errors.push(`阶段 ${stage.id} 引用了未知影片: ${filmId}`);
    }
    for (const personId of stage.representativePersonIds) {
      if (!getPerson(personId)) errors.push(`阶段 ${stage.id} 引用了未知人物: ${personId}`);
    }
    for (const event of stage.events) {
      if (eventIds.has(event.id)) errors.push(`重复事件 ID: ${event.id}`);
      eventIds.add(event.id);
      if (event.endYear !== undefined && event.endYear < event.year) {
        errors.push(`事件年份倒置: ${event.id}`);
      }
      if (
        event.year < stage.yearStart ||
        (stage.yearEnd !== null &&
          (event.endYear ?? event.year) > stage.yearEnd)
      ) {
        errors.push(`事件 ${event.id} 超出阶段 ${stage.id} 的年份范围`);
      }
      for (const filmId of event.filmIds ?? []) {
        if (!filmIds.has(filmId)) errors.push(`事件 ${event.id} 引用了未知影片: ${filmId}`);
      }
      for (const personId of event.personIds ?? []) {
        if (!getPerson(personId)) errors.push(`事件 ${event.id} 引用了未知人物: ${personId}`);
      }
    }
    for (const subStage of stage.subStages ?? []) {
      if (subStageIds.has(subStage.id)) {
        errors.push(`重复子阶段 ID: ${subStage.id}`);
      }
      subStageIds.add(subStage.id);
      if (subStage.yearEnd !== null && subStage.yearStart > subStage.yearEnd) {
        errors.push(`子阶段年份倒置: ${subStage.id}`);
      }
      if (
        subStage.yearStart < stage.yearStart ||
        (stage.yearEnd !== null &&
          (subStage.yearEnd ?? Number.POSITIVE_INFINITY) > stage.yearEnd)
      ) {
        errors.push(`子阶段 ${subStage.id} 超出主阶段 ${stage.id} 的年份范围`);
      }
      for (const filmId of subStage.representativeFilmIds ?? []) {
        if (!filmIds.has(filmId)) {
          errors.push(`子阶段 ${subStage.id} 引用了未知影片: ${filmId}`);
        }
      }
      for (const personId of subStage.representativePersonIds ?? []) {
        if (!getPerson(personId)) {
          errors.push(`子阶段 ${subStage.id} 引用了未知人物: ${personId}`);
        }
      }
      for (const event of subStage.events ?? []) {
        if (eventIds.has(event.id)) errors.push(`重复事件 ID: ${event.id}`);
        eventIds.add(event.id);
        if (event.endYear !== undefined && event.endYear < event.year) {
          errors.push(`事件年份倒置: ${event.id}`);
        }
        if (
          event.year < subStage.yearStart ||
          (subStage.yearEnd !== null &&
            (event.endYear ?? event.year) > subStage.yearEnd)
        ) {
          errors.push(`事件 ${event.id} 超出子阶段 ${subStage.id} 的年份范围`);
        }
        for (const filmId of event.filmIds ?? []) {
          if (!filmIds.has(filmId)) errors.push(`事件 ${event.id} 引用了未知影片: ${filmId}`);
        }
        for (const personId of event.personIds ?? []) {
          if (!getPerson(personId)) errors.push(`事件 ${event.id} 引用了未知人物: ${personId}`);
        }
      }
    }
  }
  return errors;
}
