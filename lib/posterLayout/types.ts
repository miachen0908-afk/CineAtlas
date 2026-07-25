export type Vec2 = { x: number; y: number };

export type LonLat = { longitude: number; latitude: number };

export type ZoomTier = "world" | "continent" | "country";

export type PosterCandidate = {
  x: number;
  y: number;
  score: number;
};

export type DebugCandidate = {
  x: number;
  y: number;
  status: "selected" | "boundary" | "collision" | "unused";
};

export type LayoutFilmInput = {
  id: string;
  titleZh: string;
  featuredPriority: number;
  posterColor: string;
  posterUrl?: string | null;
  year?: number;
  rating?: number;
  genreIds?: string[];
};

export type PlacedPoster = {
  filmId: string;
  titleZh: string;
  posterColor: string;
  posterUrl?: string | null;
  x: number;
  y: number;
  lon: number;
  lat: number;
  widthM: number;
  heightM: number;
  rank: number;
};

export type LayoutDebugInfo = {
  safeZoneRingsLocal: Vec2[][];
  candidates: DebugCandidate[];
  visualCenter: Vec2;
  visualCenterLonLat: LonLat;
};

export type CountryPosterLayoutResult = {
  countryCode: string;
  placed: PlacedPoster[];
  capacity: number;
  tier: ZoomTier;
  fallback: boolean;
  debug: LayoutDebugInfo;
};

export type LayoutRequest = {
  countryCode: string;
  isoId: string | null;
  films: LayoutFilmInput[];
  tier: ZoomTier;
  posterScale: number;
  isMobile: boolean;
  /** Optional hotspot center when no TopoJSON polygon. */
  hotspotCenter?: LonLat;
};

/** Debug overlays off for production layout. */
export const DEBUG_POSTER_LAYOUT = false;
