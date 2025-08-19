/**
 * MathUtils.ts is a collection of math utility functions that are used throughout the engine.
 * These functions are used to perform common math operations that are not provided by the standard
 * JavaScript Math object.
 */

import { Vec2 } from './vec2.js';

/**
 * Lerp from one value to another.
 * @param start - The start value.
 * @param end - The end value.
 * @param position - The position in between the values (0 - 1).
 * @returns The value at the position.
 */
export function lerp(start: number, end: number, position: number): number {
  return start + (end - start) * position;
}

/**
 * Clamp a value between a minimum and a maximum.
 * @param value - The value to clamp.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert radians to degrees.
 * @param rad - The radian value to convert.
 * @returns The converted value in degrees.
 */
export function toDeg(rad: number): number {
  return rad * (180.0 / Math.PI);
}

/**
 * Convert degrees to radians.
 * @param deg - The degree value to convert.
 * @returns The converted value in radians.
 */
export function toRad(deg: number): number {
  return deg * (Math.PI / 180.0);
}

/**
 * Calculate the distance between two points.
 * @param x1 - The x position of the first point.
 * @param y1 - The y position of the first point.
 * @param x2 - The x position of the second point.
 * @param y2 - The y position of the second point.
 * @returns The distance.
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Compare two values that are almost equal.
 * @param a - The first value to compare.
 * @param b - The second value to compare.
 * @param epsilon - The precision to compare.
 * @returns True if the values are almost equal.
 */
export function fuzzyEqual(a: number, b: number, epsilon: number = 0.0001): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Rotate a point around another point.
 * @param point - The point to rotate.
 * @param center - The center to rotate around.
 * @param rotation - The rotation angle in degrees.
 * @returns The rotated position.
 */
export function rotateAround(point: Vec2, center: Vec2, rotation: number, out?: Vec2): Vec2 {
  const result = out ?? Vec2.get();

  const rad = toRad(-rotation);
  const c = Math.cos(rad);
  const s = Math.sin(rad);

  const tx = point.x - center.x;
  const ty = point.y - center.y;

  result.set(c * tx + s * ty + center.x, c * ty - s * tx + center.y);

  return result;
}

/**
 * Check if two lines intersect with each other.
 * @param p1Start - The position of the start of the first line.
 * @param p1End - The position of the end of the first line.
 * @param p2Start - The position of the start of the second line.
 * @param p2End - The position of the end of the second line.
 * @param out - Optional variable to store the intersect position in.
 * @returns True if the lines intersect.
 */
export function linesIntersect(p1Start: Vec2, p1End: Vec2, p2Start: Vec2, p2End: Vec2, out?: Vec2): boolean {
  const b = p1End.clone().subtract(p1Start);
  const d = p2End.clone().subtract(p2Start);

  const bDotDPrep = b.x * d.y - b.y * d.x;
  if (bDotDPrep === 0) {
    b.put();
    d.put();

    return false;
  }

  const c = p2Start.clone().subtract(p1Start);
  const t = (c.x * d.y - c.y * d.x) / bDotDPrep;
  if (t < 0 || t > 1) {
    b.put();
    d.put();
    c.put();

    return false;
  }

  const u = (c.x * b.y - c.y * b.x) / bDotDPrep;
  if (u < 0 || u > 1) {
    b.put();
    d.put();
    c.put();

    return false;
  }

  // Calculate the intersection point.
  if (out) {
    const point = p1Start.clone();
    b.scale(t);
    point.add(b);

    if (out.isZero) {
      out.copyFrom(point);
    } else {
      if (Vec2.distance(p1Start, point) < Vec2.distance(p1Start, out)) {
        out.copyFrom(point);
      }
      p1Start.put();
    }
    point.put();
  }

  b.put();
  d.put();
  c.put();

  return true;
}
