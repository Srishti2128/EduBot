/**
 * Unit tests for utility functions.
 */

import {
  generateId,
  formatDate,
  formatRelativeTime,
  clamp,
  truncate,
  sanitizeInput,
  toPercentage,
  formatFileSize,
} from '@/lib/utils';

describe('generateId', () => {
  /** @returns Unique IDs each call */
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should return a non-empty string', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
});

describe('formatDate', () => {
  it('should format a valid ISO date', () => {
    const result = formatDate('2026-04-25T12:00:00Z');
    expect(result).toContain('2026');
    expect(result).toContain('Apr');
  });
});

describe('formatRelativeTime', () => {
  it('should return "just now" for recent dates', () => {
    const result = formatRelativeTime(new Date().toISOString());
    expect(result).toBe('just now');
  });

  it('should return minutes for dates < 1 hour ago', () => {
    const date = new Date(Date.now() - 30 * 60 * 1000);
    const result = formatRelativeTime(date.toISOString());
    expect(result).toContain('m ago');
  });
});

describe('clamp', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('truncate', () => {
  it('should truncate long strings', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
  });

  it('should return short strings unchanged', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeInput('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('toPercentage', () => {
  it('should calculate percentage correctly', () => {
    expect(toPercentage(75, 100)).toBe('75%');
    expect(toPercentage(1, 3)).toBe('33%');
  });

  it('should handle zero total', () => {
    expect(toPercentage(0, 0)).toBe('0%');
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(500)).toBe('500.0 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
  });
});
