import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  extractCountryCinemaHistoryEditableContent,
  getCountryCinemaHistory as getStaticCountryCinemaHistory,
  mergeCountryCinemaHistoryEditableContent,
  normalizeCountryCinemaHistoryEditableContent,
  validateCountryCinemaHistoryEditableContent,
} from "@/lib/countryCinemaHistory";
import type {
  CountryCinemaHistory,
  CountryCinemaHistoryEditableContent,
  CountryCinemaHistoryEditorState,
} from "@/types/cinema";

export type HistoryMutationResult =
  | { ok: true; version: number }
  | { ok: false; kind: "not-found" | "conflict" | "validation" | "storage"; message: string; errors?: string[] };

function parseContent(value: Prisma.JsonValue): CountryCinemaHistoryEditableContent {
  return JSON.parse(JSON.stringify(value)) as CountryCinemaHistoryEditableContent;
}

function jsonContent(value: CountryCinemaHistoryEditableContent): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function getCountryCinemaHistoryPageData(countryCode: string): Promise<{
  history: CountryCinemaHistory | null;
  editorState: CountryCinemaHistoryEditorState | null;
}> {
  const base = getStaticCountryCinemaHistory(countryCode);
  if (!base) return { history: null, editorState: null };
  try {
    const [stored, revisions] = await Promise.all([
      prisma.countryCinemaHistoryContent.findUnique({ where: { countryCode: base.countryCode } }),
      prisma.countryCinemaHistoryRevision.findMany({ where: { countryCode: base.countryCode }, orderBy: { createdAt: "desc" }, take: 30 }),
    ]);
    const storedContent = stored ? parseContent(stored.content) : extractCountryCinemaHistoryEditableContent(base);
    const content = normalizeCountryCinemaHistoryEditableContent(base, storedContent);
    return {
      history: mergeCountryCinemaHistoryEditableContent(base, content),
      editorState: {
        content,
        version: stored?.version ?? 0,
        updatedAt: stored?.updatedAt.toISOString() ?? null,
        revisions: revisions.map((revision) => ({ id: revision.id, version: revision.version, createdAt: revision.createdAt.toISOString() })),
      },
    };
  } catch (error) {
    console.error(`[country-history:${countryCode}] database read failed`, error);
    return {
      history: base,
      editorState: { content: extractCountryCinemaHistoryEditableContent(base), version: 0, updatedAt: null, revisions: [] },
    };
  }
}

export async function saveCountryCinemaHistoryEditableContent(
  countryCode: string,
  expectedVersion: number,
  content: CountryCinemaHistoryEditableContent
): Promise<HistoryMutationResult> {
  const base = getStaticCountryCinemaHistory(countryCode);
  if (!base) return { ok: false, kind: "not-found", message: "未找到该国家的电影史阶段配置" };
  let errors: string[];
  try {
    errors = validateCountryCinemaHistoryEditableContent(base, content);
  } catch {
    return { ok: false, kind: "validation", message: "内容结构无效" };
  }
  if (errors.length) return { ok: false, kind: "validation", message: "内容校验未通过", errors };
  const normalizedContent = normalizeCountryCinemaHistoryEditableContent(base, content);

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.countryCinemaHistoryContent.findUnique({ where: { countryCode: base.countryCode } });
      const currentVersion = existing?.version ?? 0;
      if (currentVersion !== expectedVersion) return { ok: false as const, kind: "conflict" as const, message: `内容已更新至版本 ${currentVersion}，请重新载入后再保存` };
      const previous = existing ? parseContent(existing.content) : extractCountryCinemaHistoryEditableContent(base);
      const nextVersion = currentVersion + 1;

      if (existing) {
        await tx.countryCinemaHistoryRevision.create({ data: { countryCode: base.countryCode, version: currentVersion, content: jsonContent(previous) } });
        await tx.countryCinemaHistoryContent.update({ where: { countryCode: base.countryCode }, data: { content: jsonContent(normalizedContent), version: nextVersion } });
      } else {
        await tx.countryCinemaHistoryContent.create({ data: { countryCode: base.countryCode, content: jsonContent(normalizedContent), version: nextVersion } });
        await tx.countryCinemaHistoryRevision.create({ data: { countryCode: base.countryCode, version: 0, content: jsonContent(previous) } });
      }
      return { ok: true as const, version: nextVersion };
    });
  } catch (error) {
    console.error(`[country-history:${countryCode}] database write failed`, error);
    return { ok: false, kind: "storage", message: "保存失败，请稍后重试" };
  }
}

export async function restoreCountryCinemaHistoryRevision(
  countryCode: string,
  revisionId: number,
  expectedVersion: number
): Promise<HistoryMutationResult> {
  const revision = await prisma.countryCinemaHistoryRevision.findFirst({ where: { id: revisionId, countryCode: countryCode.toLowerCase() } });
  if (!revision) return { ok: false, kind: "not-found", message: "未找到要恢复的历史版本" };
  return saveCountryCinemaHistoryEditableContent(countryCode, expectedVersion, parseContent(revision.content));
}
