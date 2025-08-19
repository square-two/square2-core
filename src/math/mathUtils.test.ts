import { describe, expect, it } from 'vitest';

import { clamp, distance, fuzzyEqual, lerp, linesIntersect, rotateAround, toDeg, toRad } from './mathUtils.js';
import { Vec2 } from './vec2.js';

describe('mathUtils', () => {
  it('lerp should interpolate between two values', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('clamp should clamp a value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('toDeg should convert radians to degrees', () => {
    expect(toDeg(Math.PI)).toBe(180);
    expect(toDeg(Math.PI / 2)).toBe(90);
  });

  it('toRad should convert degrees to radians', () => {
    expect(toRad(180)).toBeCloseTo(Math.PI);
    expect(toRad(90)).toBeCloseTo(Math.PI / 2);
  });

  it('distance should calculate the distance between two points', () => {
    expect(distance(0, 0, 3, 4)).toBe(5);
    expect(distance(1, 1, 4, 5)).toBe(5);
  });

  it('fuzzyEqual should compare two values that are almost equal', () => {
    expect(fuzzyEqual(0.1 + 0.2, 0.3)).toBe(true);
    expect(fuzzyEqual(0.1, 0.2)).toBe(false);
  });

  it('rotateAround should rotate a point around another point', () => {
    const point = new Vec2(1, 0);
    const center = new Vec2(0, 0);
    const rotated = rotateAround(point, center, 90);
    expect(rotated.x).toBeCloseTo(0);
    expect(rotated.y).toBeCloseTo(1);
  });

  it('linesIntersect should check if two lines intersect', () => {
    const p1Start = new Vec2(0, 0);
    const p1End = new Vec2(2, 2);
    const p2Start = new Vec2(0, 2);
    const p2End = new Vec2(2, 0);
    const out = new Vec2();
    expect(linesIntersect(p1Start, p1End, p2Start, p2End, out)).toBe(true);
    expect(out.x).toBeCloseTo(1);
    expect(out.y).toBeCloseTo(1);
  });
});
