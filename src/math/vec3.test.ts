import { beforeEach, describe, expect, it } from 'vitest';

import { Mat4 } from './mat4.js';
import { Vec3 } from './vec3.js';

describe('Vec3', () => {
  let vec: Vec3;

  beforeEach(() => {
    vec = new Vec3();
  });

  it('should create a vector with default values', () => {
    expect(vec.x).toBe(0);
    expect(vec.y).toBe(0);
    expect(vec.z).toBe(0);
  });

  it('should create a vector with given values', () => {
    vec = new Vec3(1, 2, 3);
    expect(vec.x).toBe(1);
    expect(vec.y).toBe(2);
    expect(vec.z).toBe(3);
  });

  it('should set new values for the vector', () => {
    vec.set(4, 5, 6);
    expect(vec.x).toBe(4);
    expect(vec.y).toBe(5);
    expect(vec.z).toBe(6);
  });

  it('should check if two vectors are equal', () => {
    const vec2 = new Vec3(1, 2, 3);
    vec.set(1, 2, 3);
    expect(vec.equals(vec2)).toBe(true);
  });

  it('should clone the vector', () => {
    vec.set(7, 8, 9);
    const clone = vec.clone();
    expect(clone.equals(vec)).toBe(true);
  });

  it('should clone the vector into another vector', () => {
    const vec2 = new Vec3();
    vec.set(10, 11, 12);
    vec.clone(vec2);
    expect(vec.equals(vec2)).toBe(true);
  });

  it('should copy values from another vector', () => {
    const vec2 = new Vec3(10, 11, 12);
    vec.copyFrom(vec2);
    expect(vec.equals(vec2)).toBe(true);
  });

  it('should transform the vector by a 4x4 matrix', () => {
    const mat = new Mat4();
    mat.value = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1];
    vec.set(1, 1, 1);
    vec.transformMat4(mat);
    expect(vec.x).toBe(2);
    expect(vec.y).toBe(3);
    expect(vec.z).toBe(4);
  });

  it('should return a string representation of the vector', () => {
    vec.set(13, 14, 15);
    expect(vec.toString()).toBe('{ x: 13, y: 14, z: 15 }');
  });
});
