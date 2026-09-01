const MAP_RETURN_PENDING_KEY = "cineatlas-map-return-pending";

export function isMapDetailPath(pathname: string): boolean {
  return pathname.startsWith("/film/") || pathname.startsWith("/country/");
}

export function markMapReturnPending(): void {
  try {
    window.sessionStorage.setItem(MAP_RETURN_PENDING_KEY, "1");
  } catch {
    // Session storage is optional; route history remains the primary signal.
  }
}

export function consumeMapReturnPending(): boolean {
  try {
    const pending =
      window.sessionStorage.getItem(MAP_RETURN_PENDING_KEY) === "1";
    window.sessionStorage.removeItem(MAP_RETURN_PENDING_KEY);
    return pending;
  } catch {
    return false;
  }
}

export function hasMapDetailReferrer(): boolean {
  try {
    if (!document.referrer) return false;
    const referrer = new URL(document.referrer);
    return (
      referrer.origin === window.location.origin &&
      isMapDetailPath(referrer.pathname)
    );
  } catch {
    return false;
  }
}
