/**
 * SM-2 Spaced Repetition Algorithm implementation.
 * Based on the SuperMemo-2 algorithm for optimal review scheduling.
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import type { SM2Data } from '@/types';
import { SM2_DEFAULT_EFACTOR, SM2_MIN_EFACTOR } from '@/lib/constants';

/**
 * Creates a new SM2Data object with default values.
 * @returns Fresh SM2 data with default easiness factor
 */
export function createSM2Data(): SM2Data {
  return {
    interval: 0,
    repetition: 0,
    efactor: SM2_DEFAULT_EFACTOR,
  };
}

/**
 * Applies the SM-2 algorithm to calculate the next review interval.
 * @param data - Current SM2 state (interval, repetition, efactor)
 * @param quality - Quality of recall (0-5, where 3+ is correct)
 * @returns Updated SM2 data with new interval, repetition count, and efactor
 */
export function calculateSM2(data: SM2Data, quality: number): SM2Data {
  const clampedQuality = Math.max(0, Math.min(5, Math.round(quality)));

  /* Calculate new easiness factor */
  let newEfactor =
    data.efactor + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02));
  if (newEfactor < SM2_MIN_EFACTOR) {
    newEfactor = SM2_MIN_EFACTOR;
  }

  let newInterval: number;
  let newRepetition: number;

  if (clampedQuality < 3) {
    /* Failed recall — reset */
    newRepetition = 0;
    newInterval = 1;
  } else {
    /* Successful recall */
    if (data.repetition === 0) {
      newInterval = 1;
    } else if (data.repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(data.interval * data.efactor);
    }
    newRepetition = data.repetition + 1;
  }

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: Math.round(newEfactor * 100) / 100,
  };
}

/**
 * Calculates the next review date based on SM-2 interval.
 * @param intervalDays - The interval in days
 * @returns ISO date string for the next review
 */
export function getNextReviewDate(intervalDays: number): string {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate.toISOString();
}

/**
 * Determines if a concept is due for review.
 * @param nextReview - The ISO date string for the next review
 * @returns Whether the concept should be reviewed now
 */
export function isDueForReview(nextReview: string | null): boolean {
  if (!nextReview) return true;
  return new Date(nextReview) <= new Date();
}
