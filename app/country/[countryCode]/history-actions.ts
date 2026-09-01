"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  restoreCountryCinemaHistoryRevision,
  saveCountryCinemaHistoryEditableContent,
  type HistoryMutationResult,
} from "@/lib/repositories/countryCinemaHistory";
import type { CountryCinemaHistoryEditableContent } from "@/types/cinema";

function normalizedCountryCode(countryCode: string): string | null {
  const value = countryCode.trim().toLowerCase();
  return /^[a-z]{2}$/.test(value) ? value : null;
}

function hasEditorAccess(secret: string): boolean {
  const expected = process.env.HISTORY_EDITOR_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  const providedBuffer = Buffer.from(secret);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length
    && timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function verifyCountryHistoryEditorAction(
  secret: string,
): Promise<{ ok: boolean; message?: string }> {
  if (hasEditorAccess(secret)) return { ok: true };
  return { ok: false, message: "编辑口令不正确" };
}

export async function saveCountryHistoryAction(
  countryCode: string,
  expectedVersion: number,
  content: CountryCinemaHistoryEditableContent,
  editorSecret: string,
): Promise<HistoryMutationResult> {
  if (!hasEditorAccess(editorSecret)) return { ok: false, kind: "validation", message: "没有编辑权限" };
  const code = normalizedCountryCode(countryCode);
  if (!code || !Number.isInteger(expectedVersion) || expectedVersion < 0) return { ok: false, kind: "validation", message: "保存参数无效" };
  const result = await saveCountryCinemaHistoryEditableContent(code, expectedVersion, content);
  if (result.ok) revalidatePath(`/country/${code}`);
  return result;
}

export async function restoreCountryHistoryRevisionAction(
  countryCode: string,
  revisionId: number,
  expectedVersion: number,
  editorSecret: string,
): Promise<HistoryMutationResult> {
  if (!hasEditorAccess(editorSecret)) return { ok: false, kind: "validation", message: "没有编辑权限" };
  const code = normalizedCountryCode(countryCode);
  if (!code || !Number.isInteger(revisionId) || revisionId < 1 || !Number.isInteger(expectedVersion) || expectedVersion < 0) return { ok: false, kind: "validation", message: "恢复参数无效" };
  const result = await restoreCountryCinemaHistoryRevision(code, revisionId, expectedVersion);
  if (result.ok) revalidatePath(`/country/${code}`);
  return result;
}
