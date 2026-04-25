
/**
 * Rate limiter using in-memory store.
 * Limits requests per user per time window.
 */

import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from '@/lib/constants';

/** Stores request timestamps per user */
const requestStore = new Map<string, number[]>();

/** Cleanup interval (every 5 minutes) */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/** Last cleanup timestamp */
let lastCleanup = Date.now();

/**
 * Removes expired entries from the request store.
 * Called periodically to prevent memory leaks.
 */
function cleanupStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const entries = Array.from(requestStore.entries());
  for (const [key, timestamps] of entries) {
    const valid = timestamps.filter((t: number) => now - t < RATE_LIMIT_WINDOW_MS);
    if (valid.length === 0) {
      requestStore.delete(key);
    } else {
      requestStore.set(key, valid);
    }
  }
}

/**
 * Checks if a user has exceeded the rate limit.
 * @param userId - The unique identifier for the user
 * @param maxRequests - Maximum requests allowed in the window (default: 20)
 * @param windowMs - Time window in milliseconds (default: 60000)
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  userId: string,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): { allowed: boolean; remaining: number; resetMs: number } {
  cleanupStore();

  const now = Date.now();
  const timestamps = requestStore.get(userId) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxRequests) {
    const oldestInWindow = validTimestamps[0];
    const resetMs = oldestInWindow + windowMs - now;
    return { allowed: false, remaining: 0, resetMs };
  }

  validTimestamps.push(now);
  requestStore.set(userId, validTimestamps);

  return {
    allowed: true,
    remaining: maxRequests - validTimestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Resets the rate limit for a specific user.
 * Used primarily in testing.
 * @param userId - The unique identifier for the user
 */
export function resetRateLimit(userId: string): void {
  requestStore.delete(userId);
}

/**
 * Clears all rate limit data.
 * Used primarily in testing.
 */
export function clearAllRateLimits(): void {
  requestStore.clear();
}
