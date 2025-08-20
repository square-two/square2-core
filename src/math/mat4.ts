/** 4x4 matrix array so 16 items. */
export type Mat4Value = [
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
];

export type OrthoParams = {
  left: number;
  right: number;
  bottom: number;
  top: number;
  near: number;
  far: number;
};

export type From2dRotationTranslationScaleParams = {
  rotation: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  out?: Mat4;
};

/**
 * A 4x4 matrix class.
 * Useful for 2D and 3D transformations.
 */
export class Mat4 {
  /**
   * The 4x4 matrix array.
   */
  value: Mat4Value;

  /**
   * Object pool to reuse matrices.
   */
  private static readonly POOL: Mat4[] = [];

  /**
   * Get a matrix from the object pool. If the pool is empty, create a new matrix.
   * @param data - Optional values to set the matrix with.
   * @returns The matrix.
   */
  static get(data?: Mat4Value): Mat4 {
    const mat = Mat4.POOL.pop();
    if (mat) {
      if (data) {
        mat.value[0] = data[0];
        mat.value[1] = data[1];
        mat.value[2] = data[2];
        mat.value[3] = data[3];
        mat.value[4] = data[4];
        mat.value[5] = data[5];
        mat.value[6] = data[6];
        mat.value[7] = data[7];
        mat.value[8] = data[8];
        mat.value[9] = data[9];
        mat.value[10] = data[10];
        mat.value[11] = data[11];
        mat.value[12] = data[12];
        mat.value[13] = data[13];
        mat.value[14] = data[14];
        mat.value[15] = data[15];
      } else {
        mat.identity();
      }

      return mat;
    }

    return new Mat4(data);
  }

  /**
   * Create a matrix from a translation.
   * @param x - The x axis translation.
   * @param y - The y axis translation.
   * @param z - The z axis translation.
   * @param out - Optional matrix to store the result.
   * @returns The translation matrix.
   */
  static fromTranslation(x: number, y: number, z: number, out?: Mat4): Mat4 {
    const result = out ?? Mat4.get();

    result.value[0] = 1;
    result.value[1] = 0;
    result.value[2] = 0;
    result.value[3] = 0;
    result.value[4] = 0;
    result.value[5] = 1;
    result.value[6] = 0;
    result.value[7] = 0;
    result.value[8] = 0;
    result.value[9] = 0;
    result.value[10] = 1;
    result.value[11] = 0;
    result.value[12] = x;
    result.value[13] = y;
    result.value[14] = z;
    result.value[15] = 1;

    return result;
  }

  /**
   * Create a matrix from a rotation around the z axis.
   * @param rotation - The rotation in radians.
   * @param out - Optional matrix to store the result.
   * @returns The rotation matrix.
   */
  static fromZRotation(rotation: number, out?: Mat4): Mat4 {
    const result = out ?? Mat4.get();

    const sin = Math.sin(rotation);
    const cos = Math.cos(rotation);

    result.value[0] = cos;
    result.value[1] = sin;
    result.value[2] = 0;
    result.value[3] = 0;
    result.value[4] = -sin;
    result.value[5] = cos;
    result.value[6] = 0;
    result.value[7] = 0;
    result.value[8] = 0;
    result.value[9] = 0;
    result.value[10] = 1;
    result.value[11] = 0;
    result.value[12] = 0;
    result.value[13] = 0;
    result.value[14] = 0;
    result.value[15] = 1;

    return result;
  }

  /**
   * Create a matrix from a scale.
   * @param x - The x axis scale.
   * @param y - The y axis scale.
   * @param z - The z axis scale.
   * @param out - Optional matrix to store the result.
   * @returns The matrix.
   */
  static fromScale(x: number, y: number, z: number, out?: Mat4): Mat4 {
    const result = out ?? Mat4.get();

    result.value[0] = x;
    result.value[1] = 0;
    result.value[2] = 0;
    result.value[3] = 0;
    result.value[4] = 0;
    result.value[5] = y;
    result.value[6] = 0;
    result.value[7] = 0;
    result.value[8] = 0;
    result.value[9] = 0;
    result.value[10] = z;
    result.value[11] = 0;
    result.value[12] = 0;
    result.value[13] = 0;
    result.value[14] = 0;
    result.value[15] = 1;

    return result;
  }

  /**
   * Create a matrix from a 2D rotation, translation, and scale.
   * @param rotation - The z rotation in radians.
   * @param x - The x axis translation.
   * @param y - The y axis translation.
   * @param scaleX - The x axis scale.
   * @param scaleY - The y axis scale.
   * @param out - Optional matrix to store the result.
   * @returns The matrix.
   */
  static from2dRotationTranslationScale({
    rotation,
    x,
    y,
    scaleX,
    scaleY,
    out,
  }: From2dRotationTranslationScaleParams): Mat4 {
    const result = out ?? Mat4.get();

    const z = Math.sin(rotation * 0.5);
    const w = Math.cos(rotation * 0.5);

    const z2 = z + z;
    const zz = z * z2;
    const wz = w * z2;

    result.value[0] = (1 - zz) * scaleX;
    result.value[1] = wz * scaleX;
    result.value[2] = 0;
    result.value[3] = 0;
    result.value[4] = (0 - wz) * scaleY;
    result.value[5] = (1 - zz) * scaleY;
    result.value[6] = 0;
    result.value[7] = 0;
    result.value[8] = 0;
    result.value[9] = 0;
    result.value[10] = 1;
    result.value[11] = 0;
    result.value[12] = x;
    result.value[13] = y;
    result.value[14] = 0;
    result.value[15] = 1;

    return result;
  }

  /**
   * Multiply two matrices.
   * @param a - The left matrix.
   * @param b - The right matrix.
   * @param out - Optional matrix to store the result.
   * @returns The result matrix.
   */
  static multiply(a: Mat4, b: Mat4, out?: Mat4): Mat4 {
    const result = out ?? Mat4.get();

    const a00 = a.value[0];
    const a01 = a.value[1];
    const a02 = a.value[2];
    const a03 = a.value[3];
    const a10 = a.value[4];
    const a11 = a.value[5];
    const a12 = a.value[6];
    const a13 = a.value[7];
    const a20 = a.value[8];
    const a21 = a.value[9];
    const a22 = a.value[10];
    const a23 = a.value[11];
    const a30 = a.value[12];
    const a31 = a.value[13];
    const a32 = a.value[14];
    const a33 = a.value[15];

    let b0 = b.value[0];
    let b1 = b.value[1];
    let b2 = b.value[2];
    let b3 = b.value[3];
    result.value[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result.value[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result.value[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result.value[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b.value[4];
    b1 = b.value[5];
    b2 = b.value[6];
    b3 = b.value[7];
    result.value[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result.value[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result.value[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result.value[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b.value[8];
    b1 = b.value[9];
    b2 = b.value[10];
    b3 = b.value[11];
    result.value[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result.value[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result.value[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result.value[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    b0 = b.value[12];
    b1 = b.value[13];
    b2 = b.value[14];
    b3 = b.value[15];
    result.value[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    result.value[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    result.value[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    result.value[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

    return result;
  }

  /**
   * Create a new matrix.
   * @param data - Optional values to set the matrix with.
   */
  constructor(data?: Mat4Value) {
    if (data) {
      this.value = [
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        data[5],
        data[6],
        data[7],
        data[8],
        data[9],
        data[10],
        data[11],
        data[12],
        data[13],
        data[14],
        data[15],
      ];
    } else {
      this.value = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
  }

  /**
   * Set the identity matrix.
   */
  identity(): void {
    this.value[0] = 1;
    this.value[1] = 0;
    this.value[2] = 0;
    this.value[3] = 0;
    this.value[4] = 0;
    this.value[5] = 1;
    this.value[6] = 0;
    this.value[7] = 0;
    this.value[8] = 0;
    this.value[9] = 0;
    this.value[10] = 1;
    this.value[11] = 0;
    this.value[12] = 0;
    this.value[13] = 0;
    this.value[14] = 0;
    this.value[15] = 1;
  }

  /**
   * Compare this matrix with another matrix.
   * @param mat - The matrix to compare with.
   * @returns True if the matrices are equal.
   */
  equals(mat: Mat4): boolean {
    return (
      this.value[0] === mat.value[0] &&
      this.value[1] === mat.value[1] &&
      this.value[2] === mat.value[2] &&
      this.value[3] === mat.value[3] &&
      this.value[4] === mat.value[4] &&
      this.value[5] === mat.value[5] &&
      this.value[6] === mat.value[6] &&
      this.value[7] === mat.value[7] &&
      this.value[8] === mat.value[8] &&
      this.value[9] === mat.value[9] &&
      this.value[10] === mat.value[10] &&
      this.value[11] === mat.value[11] &&
      this.value[12] === mat.value[12] &&
      this.value[13] === mat.value[13] &&
      this.value[14] === mat.value[14] &&
      this.value[15] === mat.value[15]
    );
  }

  /**
   * Clone the matrix.
   * @param out - Optional matrix to clone into.
   * @returns The cloned matrix.
   */
  clone(out?: Mat4): Mat4 {
    const result = out ?? Mat4.get();

    result.value[0] = this.value[0];
    result.value[1] = this.value[1];
    result.value[2] = this.value[2];

    result.value[3] = this.value[3];
    result.value[4] = this.value[4];
    result.value[5] = this.value[5];
    result.value[6] = this.value[6];
    result.value[7] = this.value[7];
    result.value[8] = this.value[8];
    result.value[9] = this.value[9];
    result.value[10] = this.value[10];
    result.value[11] = this.value[11];
    result.value[12] = this.value[12];
    result.value[13] = this.value[13];
    result.value[14] = this.value[14];
    result.value[15] = this.value[15];

    return result;
  }

  /**
   * Copy the values from another matrix.
   * @param mat - The matrix to copy from.
   */
  copyFrom(mat: Mat4): void {
    this.value[0] = mat.value[0];
    this.value[1] = mat.value[1];
    this.value[2] = mat.value[2];
    this.value[3] = mat.value[3];
    this.value[4] = mat.value[4];
    this.value[5] = mat.value[5];
    this.value[6] = mat.value[6];
    this.value[7] = mat.value[7];
    this.value[8] = mat.value[8];
    this.value[9] = mat.value[9];
    this.value[10] = mat.value[10];
    this.value[11] = mat.value[11];
    this.value[12] = mat.value[12];
    this.value[13] = mat.value[13];
    this.value[14] = mat.value[14];
    this.value[15] = mat.value[15];
  }

  /**
   * Set an orthographic projection matrix.
   * @param params - The parameters for the orthographic projection.
   * @param params.left - The left side of the view.
   * @param params.right - The right side of the view.
   * @param params.bottom - The bottom side of the view.
   * @param params.top - The top side of the view.
   * @param params.near - The near clipping plane.
   * @param params.far - The far clipping plane.
   */

  ortho({ left, right, bottom, top, near, far }: OrthoParams): void {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    this.value[0] = -2 * lr;
    this.value[1] = 0;
    this.value[2] = 0;
    this.value[3] = 0;
    this.value[4] = 0;
    this.value[5] = -2 * bt;
    this.value[6] = 0;
    this.value[7] = 0;
    this.value[8] = 0;
    this.value[9] = 0;
    this.value[10] = 2 * nf;
    this.value[11] = 0;
    this.value[12] = (left + right) * lr;
    this.value[13] = (top + bottom) * bt;
    this.value[14] = (far + near) * nf;
    this.value[15] = 1;
  }

  /**
   * Invert a matrix and return the inverted matrix.
   * @param out - Optional matrix to store the result.
   * @returns The inverted matrix.
   */
  invert(out: Mat4): Mat4 | null {
    const a00 = this.value[0];
    const a01 = this.value[1];
    const a02 = this.value[2];
    const a03 = this.value[3];
    const a10 = this.value[4];
    const a11 = this.value[5];
    const a12 = this.value[6];
    const a13 = this.value[7];
    const a20 = this.value[8];
    const a21 = this.value[9];
    const a22 = this.value[10];
    const a23 = this.value[11];
    const a30 = this.value[12];
    const a31 = this.value[13];
    const a32 = this.value[14];
    const a33 = this.value[15];

    const b00 = a00 * a11 - a01 * a10;
    const b01 = a00 * a12 - a02 * a10;
    const b02 = a00 * a13 - a03 * a10;
    const b03 = a01 * a12 - a02 * a11;
    const b04 = a01 * a13 - a03 * a11;
    const b05 = a02 * a13 - a03 * a12;
    const b06 = a20 * a31 - a21 * a30;
    const b07 = a20 * a32 - a22 * a30;
    const b08 = a20 * a33 - a23 * a30;
    const b09 = a21 * a32 - a22 * a31;
    const b10 = a21 * a33 - a23 * a31;
    const b11 = a22 * a33 - a23 * a32;

    // Calculate the determinant
    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    // Can't invert if the determinant is zero.
    if (det === 0) {
      return null;
    }
    det = 1.0 / det;

    out.value[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out.value[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out.value[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out.value[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out.value[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out.value[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out.value[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out.value[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out.value[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out.value[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out.value[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out.value[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out.value[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out.value[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out.value[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out.value[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
  }

  /**
   * Put the matrix back into the object pool.
   */
  put(): void {
    Mat4.POOL.push(this);
  }

  /**
   * Get a string representation of the matrix.
   * @returns A string representation of the matrix.
   */
  toString(): string {
    return `Matrix4x4( ${this.value[0]}, ${this.value[1]}, ${this.value[2]}, ${this.value[3]}, ${this.value[4]}' +
      ', ${this.value[5]}, ${this.value[6]}, ${this.value[7]}, ${this.value[8]}, ${this.value[9]}' +
      ', ${this.value[10]}, ${this.value[11]}, ${this.value[12]}, ${this.value[13]}, ${this.value[14]}' +
      ', ${this.value[15]} )`;
  }
}
