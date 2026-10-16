// Basic in-memory sliding-window rate limiter, used to slow down credential
// stuffing against the admin login. State lives in the Node.js process, so it
// is per-instance (on serverless hosts each warm instance keeps its own
// counters) — enough to stop casual brute forcing without extra infrastructure.

interface Window {
  failures: number[];
  blockedUntil: number;
}

declare global {
  var _hugRateLimit: Map<string, Window> | undefined;
}

const store: Map<string, Window> =
  global._hugRateLimit ?? (global._hugRateLimit = new Map());

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_MS = 15 * 60 * 1000; // 15-minute lockout
const MAX_KEYS = 10_000; // safety valve against unbounded memory growth

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

function getWindow(key: string): Window {
  let window = store.get(key);
  if (!window) {
    if (store.size >= MAX_KEYS) store.clear();
    window = { failures: [], blockedUntil: 0 };
    store.set(key, window);
  }
  return window;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const window = getWindow(key);

  if (window.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((window.blockedUntil - now) / 1000),
    };
  }

  window.failures = window.failures.filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailure(key: string): RateLimitResult {
  const now = Date.now();
  const window = getWindow(key);

  window.failures = window.failures.filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  window.failures.push(now);

  if (window.failures.length >= MAX_FAILURES) {
    window.blockedUntil = now + BLOCK_MS;
    window.failures = [];
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(BLOCK_MS / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearFailures(key: string): void {
  store.delete(key);
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
