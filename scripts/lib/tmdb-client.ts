import { ProxyAgent, fetch as undiciFetch } from "undici";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const MIN_INTERVAL_MS = 250;
const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 30_000;

let lastRequestAt = 0;
let proxyAgent: ProxyAgent | undefined;

function getProxyUrl(): string | undefined {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    undefined
  );
}

function getProxyAgent(): ProxyAgent | undefined {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) return undefined;
  if (!proxyAgent) {
    proxyAgent = new ProxyAgent(proxyUrl);
  }
  return proxyAgent;
}

function getToken(): string {
  const token = process.env.TMDB_API_READ_TOKEN;
  if (!token) {
    throw new Error(
      "TMDB_API_READ_TOKEN is not set. Add it to .env.local before running import."
    );
  }
  return token;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await sleep(MIN_INTERVAL_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

type FetchOptions = {
  headers?: Record<string, string>;
  auth?: boolean;
};

async function tmdbFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const dispatcher = getProxyAgent();
    return await undiciFetch(url, {
      headers: options.headers,
      signal: controller.signal,
      ...(dispatcher ? { dispatcher } : {}),
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(
  url: string,
  attempt = 0
): Promise<Response> {
  await throttle();
  const response = await tmdbFetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
  });

  if (
    (response.status === 429 || response.status >= 500) &&
    attempt < MAX_RETRIES
  ) {
    const backoff = MIN_INTERVAL_MS * Math.pow(2, attempt + 1);
    await sleep(backoff);
    return fetchWithRetry(url, attempt + 1);
  }

  return response;
}

export async function checkTmdbConnectivity(): Promise<void> {
  const proxyUrl = getProxyUrl();
  try {
    const response = await tmdbFetch(`${TMDB_BASE}/configuration`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    if (proxyUrl) {
      console.log(`[info] TMDB reachable via proxy ${proxyUrl}`);
    } else {
      console.log("[info] TMDB reachable (direct connection)");
    }
  } catch (error) {
    const hint = proxyUrl
      ? "Proxy is set but TMDB is still unreachable. Check that the proxy is running."
      : "TMDB is unreachable. Enable VPN/proxy, then set HTTPS_PROXY in .env.local (e.g. HTTPS_PROXY=http://127.0.0.1:7890).";
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${hint}\nOriginal error: ${message}`);
  }
}

export type TmdbSearchResult = {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  origin_country?: string[];
  genre_ids?: number[];
  vote_average?: number;
  overview?: string;
  poster_path?: string | null;
};

export type TmdbSearchResponse = {
  results: TmdbSearchResult[];
};

export type TmdbMovieDetail = TmdbSearchResult & {
  production_countries?: { iso_3166_1: string; name: string }[];
  production_companies?: { name: string }[];
  genres?: { id: number; name: string }[];
  credits?: {
    crew?: { id: number; name: string; job: string }[];
  };
  images?: {
    posters?: { file_path: string }[];
  };
};

export async function searchMovie(
  query: string,
  year?: number,
  language = "zh-CN"
): Promise<TmdbSearchResult[]> {
  const params = new URLSearchParams({
    query,
    language,
    include_adult: "false",
  });
  if (year !== undefined) {
    params.set("year", String(year));
  }
  const url = `${TMDB_BASE}/search/movie?${params}`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`TMDB search failed (${response.status}): ${query}`);
  }
  const data = (await response.json()) as TmdbSearchResponse;
  return data.results ?? [];
}

export async function getMovieDetail(tmdbId: number): Promise<TmdbMovieDetail> {
  const params = new URLSearchParams({
    language: "zh-CN",
    append_to_response: "credits,images",
  });
  const url = `${TMDB_BASE}/movie/${tmdbId}?${params}`;
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`TMDB detail failed (${response.status}): ${tmdbId}`);
  }
  return (await response.json()) as TmdbMovieDetail;
}

export function posterUrlFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${IMAGE_BASE}${path}`;
}

export async function downloadPoster(
  posterPath: string,
  destPath: string
): Promise<void> {
  const url = posterUrlFromPath(posterPath);
  if (!url) return;

  await throttle();
  const dispatcher = getProxyAgent();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await undiciFetch(url, {
      signal: controller.signal,
      ...(dispatcher ? { dispatcher } : {}),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`Poster download failed (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  const fs = await import("fs/promises");
  const path = await import("path");
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buffer);
}
