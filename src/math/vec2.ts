/**
 * A 2D vector class.
 * A vector is a two-dimensional object that contains an x and a y position.
 * Vectors are used to represent directions and positions in 2D space.
 */
export class Vec2 {
  /**
   * The x axis position of the vector.
   */
  x: number;

  /**
   * The y axis position of the vector.
   */
  y: number;

  /**
   * Check if the vector is pointing to the left.
   */
  get isLeft(): boolean {
    return this.x === -1 && this.y === 0;
  }

  /**
   * Check if the vector is pointing to the right.
   */
  get isRight(): boolean {
    return this.x === 1 && this.y === 0;
  }

  /**
   * Check if the vector is pointing up.
   */
  get isUp(): boolean {
    return this.x === 0 && this.y === -1;
  }

  /**
   * Check if the vector is pointing down.
   */
  get isDown(): boolean {
    return this.x === 0 && this.y === 1;
  }

  /**
   * Check if the vector is a zero vector.
   */
  get isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  /**
   * Get the magnitude of the vector.
   */
  get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Set the new magnitude of the vector.
   */
  set magnitude(value: number) {
    this.normalize();
    this.x *= value;
    this.y *= value;
  }

  /**
   * Object pool to reuse vectors.
   */
  private static readonly POOL: Vec2[] = [];

  /**
   * Get a vector from the object pool. If the pool is empty, create a new vector.
   * @param x - The x axis position of the vector.
   * @param y - The y axis position of the vector.
   * @returns The vector.
   */
  static get(x: number = 0, y: number = 0): Vec2 {
    const vec = Vec2.POOL.pop();
    if (vec) {
      vec.set(x, y);

      return vec;
    }

    return new Vec2(x, y);
  }

  /**
   * Calculate the distance between two vectors.
   * @param a - The first vector.
   * @param b - The second vector.
   * @returns The distance.
   */
  static distance(a: Vec2, b: Vec2): number {
    const x = a.x - b.x;
    const y = a.y - b.y;

    return Math.sqrt(x * x + y * y);
  }

  /**
   * Create a new vector.
   * @param x The x axis position of the vector.
   * @param y The y axis position of the vector.
   */
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Check if this vector is equal to another vector.
   * @param other - The vector to compare with.
   * @returns True if the vectors are equal.
   */
  equals(other: Vec2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Check if this vector is almost equal to another vector.
   * @param other - The vector to compare with.
   * @param epsilon - The precision of the comparison.
   * @returns True if the vectors are almost equal.
   */
  fuzzyEquals(other: Vec2, epsilon: number = 0.0001): boolean {
    return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
  }

  /**
   * Clone the vector.
   * @param out - Optional vector to clone into.
   * @returns The cloned vector.
   */
  clone(out?: Vec2): Vec2 {
    const result = out ?? Vec2.get();
    result.set(this.x, this.y);

    return result;
  }

  /**
   * Copy the values from another vector.
   * @param other - The vector to copy from.
   */
  copyFrom(other: Vec2): void {
    this.x = other.x;
    this.y = other.y;
  }

  /**
   * Update the x and y axis position of the vector.
   * @param x - The new x axis position.
   * @param y - The new y axis position.
   */
  set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Add another vector to this vector.
   * @param other - The vector to add.
   * @returns The vector.
   */
  add(other: Vec2): Vec2 {
    this.x += other.x;
    this.y += other.y;

    return this;
  }

  /**
   * Subtract another vector from this vector.
   * @param other - The vector to subtract.
   * @returns The vector.
   */
  subtract(other: Vec2): Vec2 {
    this.x -= other.x;
    this.y -= other.y;

    return this;
  }

  /**
   * Multiply this vector by another vector.
   * @param other - The vector to multiply by.
   * @returns The vector.
   */
  multiply(other: Vec2): Vec2 {
    this.x *= other.x;
    this.y *= other.y;

    return this;
  }

  /**
   * Divide this vector by another vector.
   * @param other - The vector to divide by.
   * @returns The vector.
   */
  divide(other: Vec2): Vec2 {
    this.x /= other.x;
    this.y /= other.y;

    return this;
  }

  /**
   * Scale this vector by a scalar value.
   * @param scalar - The value to scale by.
   */
  scale(scalar: number): void {
    this.x *= scalar;
    this.y *= scalar;
  }

  /**
   * Calculate the dot product of this vector and another vector.
   * @param other - The vector to calculate the dot product with.
   * @returns The dot product.
   */
  dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Put this vector back into the object pool.
   */
  put(): void {
    Vec2.POOL.push(this);
  }

  /**
   * Normalize the vector. A normalized vector has a magnitude of 1.
   */
  normalize(): void {
    const magnitude = this.magnitude;
    if (magnitude !== 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
  }

  /**
   * Get a string representation of the vector.
   * @returns The string representation of the vector.
   */
  toString(): string {
    return `Vec2( x: ${this.x}, y: ${this.y} )`;
  }
}
