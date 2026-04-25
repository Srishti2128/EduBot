/**
 * Unit tests for constants and helper functions.
 */

import { getMasteryLabel, APP_NAME, GEMINI_MODEL, RATE_LIMIT_MAX_REQUESTS } from '@/lib/constants';

describe('getMasteryLabel', () => {
  it('should return correct labels for each threshold', () => {
    expect(getMasteryLabel(0)).toBe('Novice');
    expect(getMasteryLabel(10)).toBe('Novice');
    expect(getMasteryLabel(20)).toBe('Beginner');
    expect(getMasteryLabel(40)).toBe('Developing');
    expect(getMasteryLabel(60)).toBe('Proficient');
    expect(getMasteryLabel(80)).toBe('Advanced');
    expect(getMasteryLabel(95)).toBe('Mastered');
    expect(getMasteryLabel(100)).toBe('Mastered');
  });
});

describe('Constants', () => {
  it('should have correct app name', () => {
    expect(APP_NAME).toBe('MindPath');
  });

  it('should have correct Gemini model', () => {
    expect(GEMINI_MODEL).toBe('gemini-2.5-flash');
  });

  it('should have rate limit of 20', () => {
    expect(RATE_LIMIT_MAX_REQUESTS).toBe(20);
  });
});
