import { describe, expect, it } from 'vitest';
import { joinPaths } from './pathUtils.js';

describe('joinPaths', () => {
  it('joins simple paths with default separator', () => {
    expect(joinPaths(['a', 'b', 'c'])).toBe('a/b/c');
  });

  it('removes duplicate separators', () => {
    expect(joinPaths(['a/', '/b/', '/c/'])).toBe('a/b/c/');
    expect(joinPaths(['//a//', 'b//', '//c//'])).toBe('/a/b/c/');
  });

  it('handles empty array', () => {
    expect(joinPaths([])).toBe('');
  });

  it('handles single element array', () => {
    expect(joinPaths(['a'])).toBe('a');
  });

  it('handles custom separator', () => {
    expect(joinPaths(['a', 'b', 'c'], '\\')).toBe('a\\b\\c');
  });

  it('handles segments with only separators', () => {
    expect(joinPaths(['/', '/'], '/')).toBe('/');
  });

  it('handles empty strings in parts', () => {
    expect(joinPaths(['a', '', 'b'])).toBe('a/b');
  });
});
