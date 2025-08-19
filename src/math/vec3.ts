import type { Mat4 } from './mat4.js';

/**
 * A 3D vector. A vector is a mathematical object that has a magnitude and a direction.
 * It is often used to represent a point in 3D space.
 */
export class Vec3 {
  /**
   * The x axis position of the vector.
   */
  x: number;

  /**
   * The y axis position of the vector.
   */
  y: number;

  /**
   * The z axis position of the vector.
   */
  z: number;

  /**
   * Object pool to reuse vectors.
   */
  private static readonly POOL: Vec3[] = [];

  /**
   * Get a vector from the object pool. If the pool is empty, create a new vector.
   * @param x - The x axis position of the vector.
   * @param y - The y axis position of the vector.
   * @param z - The z axis position of the vector.
   * @returns The vector.
   */
  static get(x: number = 0, y: number = 0, z: number = 0): Vec3 {
    const vec = Vec3.POOL.pop();
    if (vec) {
      vec.set(x, y, z);

      return vec;
    }

    return new Vec3(x, y, z);
  }

  /**
   * Create a new vector.
   * @param x - The x axis position of the vector.
   * @param y - The y axis position of the vector.
   * @param z - The z axis position of the vector.
   */
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Check if two vectors are equal.
   * @param vec - The vector to compare with.
   * @returns True if the vectors are equal.
   */
  equals(vec: Vec3): boolean {
    return this.x === vec.x && this.y === vec.y && this.z === vec.z;
  }

  /**
   * Set new values for the vector.
   * @param x - The new x axis position.
   * @param y - The new y axis position.
   * @param z - The new z axis position.
   */
  set(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Clone this vector.
   * @param out - Optional vector to store the cloned values.
   * @returns The cloned vector.
   */
  clone(out?: Vec3): Vec3 {
    if (out) {
      out.set(this.x, this.y, this.z);
      return out;
    }

    return new Vec3(this.x, this.y, this.z);
  }

  /**
   * Copy values from another vector.
   * @param vec - The vector to copy values from.
   */
  copyFrom(vec: Vec3): void {
    this.x = vec.x;
    this.y = vec.y;
    this.z = vec.z;
  }

  /**
   * Transform this vector by a 4x4 matrix.
   * @param mat - The matrix to transform by.
   * @param x - Optional x axis position.
   * @param y - Optional y axis position.
   * @param z - Optional z axis position.
   */
  transformMat4(mat: Mat4, x?: number, y?: number, z?: number): void {
    const vX = x ?? this.x;
    const vY = y ?? this.y;
    const vZ = z ?? this.z;

    let w = mat.value[3] * vX + mat.value[7] * vY + mat.value[11] * vZ + mat.value[15];
    if (w === 0) {
      w = 1;
    }

    this.x = (mat.value[0] * vX + mat.value[4] * vY + mat.value[8] * vZ + mat.value[12]) / w;
    this.y = (mat.value[1] * vX + mat.value[5] * vY + mat.value[9] * vZ + mat.value[13]) / w;
    this.z = (mat.value[2] * vX + mat.value[6] * vY + mat.value[10] * vZ + mat.value[14]) / w;
  }

  /**
   * Get a string representation of the vector.
   * @returns The string representation of the vector.
   */
  toString(): string {
    return `{ x: ${this.x}, y: ${this.y}, z: ${this.z} }`;
  }

  /**
   * Return the vector to the object pool.
   */
  put(): void {
    Vec3.POOL.push(this);
  }
}
