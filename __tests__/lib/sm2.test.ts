/**
 * Unit tests for SM-2 spaced repetition algorithm.
 */

import { createSM2Data, calculateSM2, getNextReviewDate, isDueForReview } from '@/lib/sm2';

describe('createSM2Data', () => {
  it('should create default SM2 data with efactor 2.5', () => {
    const data = createSM2Data();
    expect(data.interval).toBe(0);
    expect(data.repetition).toBe(0);
    expect(data.efactor).toBe(2.5);
  });
});

describe('calculateSM2', () => {
  it('should reset on failed recall (quality < 3)', () => {
    const data = { interval: 6, repetition: 2, efactor: 2.5 };
    const result = calculateSM2(data, 2);
    expect(result.repetition).toBe(0);
    expect(result.interval).toBe(1);
  });

  it('should set interval to 1 on first successful recall', () => {
    const data = createSM2Data();
    const result = calculateSM2(data, 4);
    expect(result.interval).toBe(1);
    expect(result.repetition).toBe(1);
  });

  it('should set interval to 6 on second successful recall', () => {
    const data = { interval: 1, repetition: 1, efactor: 2.5 };
    const result = calculateSM2(data, 4);
    expect(result.interval).toBe(6);
    expect(result.repetition).toBe(2);
  });

  it('should multiply interval by efactor on subsequent recalls', () => {
    const data = { interval: 6, repetition: 2, efactor: 2.5 };
    const result = calculateSM2(data, 4);
    expect(result.interval).toBe(15); // 6 * 2.5 = 15
    expect(result.repetition).toBe(3);
  });

  it('should never let efactor go below 1.3', () => {
    const data = { interval: 1, repetition: 0, efactor: 1.3 };
    const result = calculateSM2(data, 0);
    expect(result.efactor).toBeGreaterThanOrEqual(1.3);
  });

  it('should clamp quality between 0 and 5', () => {
    const data = createSM2Data();
    const result1 = calculateSM2(data, -1);
    expect(result1.repetition).toBe(0); // quality 0 => fail

    const result2 = calculateSM2(data, 10);
    expect(result2.repetition).toBe(1); // quality 5 => pass
  });
});

describe('getNextReviewDate', () => {
  it('should return a future date string', () => {
    const nextDate = getNextReviewDate(7);
    const parsed = new Date(nextDate);
    expect(parsed.getTime()).toBeGreaterThan(Date.now());
  });
});

describe('isDueForReview', () => {
  it('should return true for null nextReview', () => {
    expect(isDueForReview(null)).toBe(true);
  });

  it('should return true for past dates', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    expect(isDueForReview(pastDate)).toBe(true);
  });

  it('should return false for future dates', () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    expect(isDueForReview(futureDate)).toBe(false);
  });
});
