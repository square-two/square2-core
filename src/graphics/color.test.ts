import { describe, expect, it } from 'vitest';

import { Color } from './color.js';

describe('Color', () => {
  it('should create a color with default values', () => {
    const color = new Color();
    expect(color.red).toBe(0);
    expect(color.green).toBe(0);
    expect(color.blue).toBe(0);
    expect(color.alpha).toBe(1);
  });

  it('should create a color with specified values', () => {
    const color = new Color(0.3, 0.5, 0.6, 0.7);
    expect(color.red).toBe(0.3);
    expect(color.green).toBe(0.5);
    expect(color.blue).toBe(0.6);
    expect(color.alpha).toBe(0.7);
  });

  it('should create a color from bytes', () => {
    const color = Color.fromBytes(100, 128, 200, 255);
    expect(color.red).toBeCloseTo(0.392, 3);
    expect(color.green).toBeCloseTo(0.502, 3);
    expect(color.blue).toBeCloseTo(0.784, 3);
    expect(color.alpha).toBeCloseTo(1, 3);
  });

  it('should create a color from hex', () => {
    const color = Color.fromHex('#80808080');
    expect(color.red).toBeCloseTo(0.502, 3);
    expect(color.green).toBeCloseTo(0.502, 3);
    expect(color.blue).toBeCloseTo(0.502, 3);
    expect(color.alpha).toBeCloseTo(0.502, 3);
  });

  it('should interpolate between two colors', () => {
    const color1 = new Color(0, 0, 0, 0);
    const color2 = new Color(1, 1, 1, 1);
    const interpolated = Color.interpolate(color1, color2, 0.5);
    expect(interpolated.red).toBe(0.5);
    expect(interpolated.green).toBe(0.5);
    expect(interpolated.blue).toBe(0.5);
    expect(interpolated.alpha).toBe(0.5);
  });

  it('should clone a color', () => {
    const color = new Color(0.5, 0.8, 0.2, 0.1);
    const clone = color.clone();
    expect(clone.red).toBe(0.5);
    expect(clone.green).toBe(0.8);
    expect(clone.blue).toBe(0.2);
    expect(clone.alpha).toBe(0.1);
  });

  it('should copy values from another color', () => {
    const color1 = new Color(0.2, 0.4, 0.6, 0.8);
    const color2 = new Color();
    color2.copyFrom(color1);
    expect(color2.red).toBe(0.2);
    expect(color2.green).toBe(0.4);
    expect(color2.blue).toBe(0.6);
    expect(color2.alpha).toBe(0.8);
  });

  it('should return a string representation of the color', () => {
    const color = new Color(0.75, 0.9, 1, 0.1);
    expect(color.toString()).toBe('Color( r: 0.75, g: 0.9, b: 1, a: 0.1 )');
  });
});
