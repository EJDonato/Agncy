export interface GeminiFailureSummary {
  hasQuotaFailure: boolean;
  hasUnavailableFailure: boolean;
  retryAfterSeconds: number | null;
}

function statusOf(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) return null;
  return typeof error.status === "number" ? error.status : null;
}

function retryDelayOf(error: unknown): number | null {
  if (!(error instanceof Error)) return null;
  const match = error.message.match(/"retryDelay"\s*:\s*"(\d+)s"/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function summarizeGeminiFailures(errors: unknown[]): GeminiFailureSummary {
  const statuses = errors.map(statusOf);
  const retryDelays = errors.map(retryDelayOf).filter((delay): delay is number => delay !== null);
  return {
    hasQuotaFailure: statuses.includes(429),
    hasUnavailableFailure: statuses.includes(503),
    retryAfterSeconds: retryDelays.length ? Math.max(...retryDelays) : null,
  };
}

export function geminiFailureLog(error: unknown): { status: number | null; reason: string } {
  const status = statusOf(error);
  if (status === 429) return { status, reason: "quota_exhausted" };
  if (status === 503) return { status, reason: "high_demand" };
  if (error instanceof Error && /timed out|too long/i.test(error.message)) return { status, reason: "timeout" };
  return { status, reason: "request_failed" };
}
