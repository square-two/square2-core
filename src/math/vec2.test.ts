import { describe, expect, it } from 'vitest';

import { Vec2 } from './vec2.js';

describe('Vec2', () => {
  it('should create a vector with default values', () => {
    const vec = new Vec2();
    expect(vec.x).toBe(0);
    expect(vec.y).toBe(0);
  });

  it('should create a vector with given values', () => {
    const vec = new Vec2(1, 2);
    expect(vec.x).toBe(1);
    expect(vec.y).toBe(2);
  });

  it('should calculate the magnitude of the vector', () => {
    const vec = new Vec2(3, 4);
    expect(vec.magnitude).toBe(5);
  });

  it('should set the magnitude of the vector', () => {
    const vec = new Vec2(3, 4);
    vec.magnitude = 10;
    expect(vec.magnitude).toBe(10);
  });

  it('should get a vector from the pool', () => {
    const vec = Vec2.get(1, 2);
    expect(vec.x).toBe(1);
    expect(vec.y).toBe(2);
  });

  it('should calculate the distance between two vectors', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2(4, 6);
    expect(Vec2.distance(vec1, vec2)).toBe(5);
  });

  it('should check if two vectors are equal', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2(1, 2);
    expect(vec1.equals(vec2)).toBe(true);
  });

  it('should check if two vectors are almost equal', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2(1.00001, 2.00001);
    expect(vec1.fuzzyEquals(vec2)).toBe(true);
  });

  it('should clone a vector', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = vec1.clone();
    expect(vec2.equals(vec1)).toBe(true);
  });

  it('should copy values from another vector', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2();
    vec2.copyFrom(vec1);
    expect(vec2.equals(vec1)).toBe(true);
  });

  it('should set the values of the vector', () => {
    const vec = new Vec2();
    vec.set(1, 2);
    expect(vec.x).toBe(1);
    expect(vec.y).toBe(2);
  });

  it('should add another vector', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2(3, 4);
    vec1.add(vec2);
    expect(vec1.x).toBe(4);
    expect(vec1.y).toBe(6);
  });

  it('should subtract another vector', () => {
    const vec1 = new Vec2(3, 4);
    const vec2 = new Vec2(1, 2);
    vec1.subtract(vec2);
    expect(vec1.x).toBe(2);
    expect(vec1.y).toBe(2);
  });

  it('should multiply by another vector', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2(3, 4);
    vec1.multiply(vec2);
    expect(vec1.x).toBe(3);
    expect(vec1.y).toBe(8);
  });

  it('should divide by another vector', () => {
    const vec1 = new Vec2(6, 8);
    const vec2 = new Vec2(3, 4);
    vec1.divide(vec2);
    expect(vec1.x).toBe(2);
    expect(vec1.y).toBe(2);
  });

  it('should scale the vector by a scalar value', () => {
    const vec = new Vec2(1, 2);
    vec.scale(2);
    expect(vec.x).toBe(2);
    expect(vec.y).toBe(4);
  });

  it('should calculate the dot product of two vectors', () => {
    const vec1 = new Vec2(1, 2);
    const vec2 = new Vec2(3, 4);
    expect(vec1.dot(vec2)).toBe(11);
  });

  it('should normalize the vector', () => {
    const vec = new Vec2(3, 4);
    vec.normalize();
    expect(vec.magnitude).toBe(1);
  });

  it('should return a string representation of the vector', () => {
    const vec = new Vec2(1, 2);
    expect(vec.toString()).toBe('Vec2( x: 1, y: 2 )');
  });

  it('should check if the vector is pointing to the left', () => {
    const vec = new Vec2(-1, 0);
    expect(vec.isLeft).toBe(true);
    vec.set(1, 0);
    expect(vec.isLeft).toBe(false);
  });

  it('should check if the vector is pointing to the right', () => {
    const vec = new Vec2(1, 0);
    expect(vec.isRight).toBe(true);
    vec.set(-1, 0);
    expect(vec.isRight).toBe(false);
  });

  it('should check if the vector is pointing up', () => {
    const vec = new Vec2(0, -1);
    expect(vec.isUp).toBe(true);
    vec.set(0, 1);
    expect(vec.isUp).toBe(false);
  });

  it('should check if the vector is pointing down', () => {
    const vec = new Vec2(0, 1);
    expect(vec.isDown).toBe(true);
    vec.set(0, -1);
    expect(vec.isDown).toBe(false);
  });

  it('should check if the vector is zero', () => {
    const vec = new Vec2(0, 0);
    expect(vec.isZero).toBe(true);
    vec.set(1, 4);
    expect(vec.isZero).toBe(false);
  });
});
