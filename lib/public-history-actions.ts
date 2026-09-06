import type { CountryCinemaHistoryEditableContent } from "@/types/cinema";

type PublicHistoryMutationResult = {
  ok: false;
  kind: "storage";
  message: string;
};

const unavailable: PublicHistoryMutationResult = {
  ok: false,
  kind: "storage",
  message: "公开展示版不提供内容编辑功能",
};

export async function verifyCountryHistoryEditorAction() {
  return { ok: false, message: "公开展示版不提供内容编辑功能" };
}

export async function saveCountryHistoryAction(
  _countryCode: string,
  _expectedVersion: number,
  _content: CountryCinemaHistoryEditableContent,
  _editorSecret: string,
): Promise<PublicHistoryMutationResult> {
  void _countryCode;
  void _expectedVersion;
  void _content;
  void _editorSecret;
  return unavailable;
}

export async function restoreCountryHistoryRevisionAction(
  _countryCode: string,
  _revisionId: number,
  _expectedVersion: number,
  _editorSecret: string,
): Promise<PublicHistoryMutationResult> {
  void _countryCode;
  void _revisionId;
  void _expectedVersion;
  void _editorSecret;
  return unavailable;
}
