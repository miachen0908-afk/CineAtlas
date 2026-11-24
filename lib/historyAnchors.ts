export function historyEventAnchor(eventId: string) {
  return `history-event-${eventId}`;
}

export function historyFilmAnchor(eventId: string, filmId: string) {
  return `history-film-${eventId}/${filmId}`;
}

export function readHistoryAnchor(hash: string) {
  try {
    const id = decodeURIComponent(hash.slice(1));
    return id.startsWith("history-event-") || id.startsWith("history-film-")
      ? id
      : null;
  } catch {
    return null;
  }
}

export function normalizeHistoryFilmTitle(title: string) {
  return title.normalize("NFKC").replace(/[\s《》〈〉「」『』·:：!！?？,，.。'“”"\-—–_]/g, "").toLocaleLowerCase("zh-CN");
}
