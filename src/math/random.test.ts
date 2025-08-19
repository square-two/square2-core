import { beforeEach, describe, expect, it } from 'vitest';

import { Random } from './random.js';

describe('Random', () => {
  let random: Random;

  beforeEach(() => {
    random = new Random(12345);
  });

  it('should generate a random integer within the specified range', () => {
    const min = 10;
    const max = 20;
    const value = random.int(min, max);
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });

  it('should generate a random float within the specified range', () => {
    const min = 0.5;
    const max = 1.5;
    const value = random.float(min, max);
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });

  it('should generate a random color within the specified range', () => {
    const min = 0.2;
    const max = 0.8;
    const color = random.color(min, max, false);
    expect(color.red).toBeGreaterThanOrEqual(min);
    expect(color.red).toBeLessThanOrEqual(max);
    expect(color.green).toBeGreaterThanOrEqual(min);
    expect(color.green).toBeLessThanOrEqual(max);
    expect(color.blue).toBeGreaterThanOrEqual(min);
    expect(color.blue).toBeLessThanOrEqual(max);
    expect(color.alpha).toBe(1.0);
  });

  it('should reset the seed to a random value', () => {
    const initialSeed = random.seed;
    random.resetSeed();
    expect(random.seed).not.toBe(initialSeed);
  });

  it('should set and get the seed correctly', () => {
    random.seed = 54321;
    expect(random.seed).toBe(54321);
  });

  it('should generate the same sequence of numbers for the same seed', () => {
    const random1 = new Random(12345);
    const random2 = new Random(12345);

    expect(random1.int()).toBe(random2.int());
    expect(random1.float()).toBe(random2.float());
    expect(random1.color().toString()).toBe(random2.color().toString());
  });
});
