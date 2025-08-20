import { describe, expect, it } from 'vitest';

import { Mat4 } from './mat4.js';

describe('Mat4', () => {
  it('should create an identity matrix by default', () => {
    const mat = new Mat4();
    expect(mat.value).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  it('should create a matrix from given values', () => {
    const values: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const mat = new Mat4(values);
    expect(mat.value).toEqual(values);
  });

  it('should set the identity matrix', () => {
    const mat = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    mat.identity();
    expect(mat.value).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });

  it('should compare two matrices for equality', () => {
    const mat1 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const mat2 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const mat3 = new Mat4([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(mat1.equals(mat2)).toBe(true);
    expect(mat1.equals(mat3)).toBe(false);
  });

  it('should clone a matrix', () => {
    const mat1 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const mat2 = mat1.clone();
    expect(mat1.equals(mat2)).toBe(true);
  });

  it('should copy values from another matrix', () => {
    const mat1 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const mat2 = new Mat4();
    mat2.copyFrom(mat1);
    expect(mat1.equals(mat2)).toBe(true);
  });

  it('should create a translation matrix', () => {
    const mat = Mat4.fromTranslation(1, 2, 3);
    expect(mat.value).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
  });

  it('should create a rotation matrix around the z axis', () => {
    const mat = Mat4.fromZRotation(Math.PI / 2);
    expect(mat.value[0]).toBeCloseTo(0);
    expect(mat.value[1]).toBeCloseTo(1);
    expect(mat.value[4]).toBeCloseTo(-1);
    expect(mat.value[5]).toBeCloseTo(0);
  });

  it('should create a scale matrix', () => {
    const mat = Mat4.fromScale(2, 3, 4);
    expect(mat.value).toEqual([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1]);
  });

  it('should create a matrix from a translation, rotation, and scale', () => {
    const mat = Mat4.from2dRotationTranslationScale({ rotation: Math.PI / 2, x: 20, y: 30, scaleX: 2, scaleY: 4 });
    expect(mat.value).toEqual([
      4.440892098500626e-16, 2, 0, 0, -4, 8.881784197001252e-16,

      0, 0, 0, 0, 1, 0, 20, 30, 0, 1,
    ]);
  });

  it('should multiply two matrices', () => {
    const mat1 = new Mat4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const mat2 = new Mat4([16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    const result = Mat4.multiply(mat1, mat2);
    expect(result.value).toEqual([386, 444, 502, 560, 274, 316, 358, 400, 162, 188, 214, 240, 50, 60, 70, 80]);
  });

  it('should invert a matrix', () => {
    const mat = new Mat4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
    const inv = mat.invert(Mat4.get());
    expect(inv?.value).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1, -2, -3, 1]);
  });

  it('should set an orthographic projection matrix', () => {
    const mat = new Mat4();
    mat.ortho({ left: 0, right: 800, bottom: 600, top: 0, near: -1, far: 1 });
    expect(mat.value).toEqual([0.0025, 0, 0, 0, 0, -0.0033333333333333335, 0, 0, 0, 0, -1, 0, -1, 1, -0, 1]);
  });
});
