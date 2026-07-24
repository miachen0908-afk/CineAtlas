export function logInfo(message: string, data?: Record<string, unknown>): void {
  const suffix = data ? ` ${JSON.stringify(data)}` : "";
  console.log(`[info] ${message}${suffix}`);
}

export function logWarn(message: string, data?: Record<string, unknown>): void {
  const suffix = data ? ` ${JSON.stringify(data)}` : "";
  console.warn(`[warn] ${message}${suffix}`);
}

export function logError(message: string, error?: unknown): void {
  console.error(`[error] ${message}`, error);
}
