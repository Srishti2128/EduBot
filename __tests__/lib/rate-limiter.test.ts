/**
 * Unit tests for rate limiter.
 */

import { checkRateLimit, resetRateLimit, clearAllRateLimits } from '@/lib/rate-limiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  it('should allow requests under the limit', () => {
    const result = checkRateLimit('user1', 20, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19);
  });

  it('should track remaining requests correctly', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('user2', 20, 60000);
    }
    const result = checkRateLimit('user2', 20, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('should block request 21 (returns 429 equivalent)', () => {
    for (let i = 0; i < 20; i++) {
      const res = checkRateLimit('user3', 20, 60000);
      expect(res.allowed).toBe(true);
    }

    /* Request 21 should be blocked */
    const blocked = checkRateLimit('user3', 20, 60000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('should allow request 20 and block request 21', () => {
    /* Fill up to 19 requests */
    for (let i = 0; i < 19; i++) {
      checkRateLimit('user-boundary', 20, 60000);
    }

    /* Request 20 should be allowed */
    const request20 = checkRateLimit('user-boundary', 20, 60000);
    expect(request20.allowed).toBe(true);
    expect(request20.remaining).toBe(0);

    /* Request 21 should be blocked */
    const request21 = checkRateLimit('user-boundary', 20, 60000);
    expect(request21.allowed).toBe(false);
  });

  it('should isolate rate limits between users', () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit('userA', 20, 60000);
    }

    /* UserA is blocked */
    expect(checkRateLimit('userA', 20, 60000).allowed).toBe(false);

    /* UserB is unaffected */
    expect(checkRateLimit('userB', 20, 60000).allowed).toBe(true);
  });

  it('should reset rate limit for a user', () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit('userReset', 20, 60000);
    }

    expect(checkRateLimit('userReset', 20, 60000).allowed).toBe(false);

    resetRateLimit('userReset');

    expect(checkRateLimit('userReset', 20, 60000).allowed).toBe(true);
  });
});
