import { Matrix4 } from "@arcanvas/math";

/**
 * Converts a 3x3 matrix from row-major to column-major order.
 * Row-major: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 * Column-major: [m00, m10, m20, m01, m11, m21, m02, m12, m22]
 *
 * @param rowMajor - Row-major matrix as Float32Array(9)
 * @returns Column-major matrix as Float32Array(9)
 */
export function toColumnMajor3x3(rowMajor: Float32Array): Float32Array {
  if (rowMajor.length !== 9) {
    throw new Error("Matrix must have exactly 9 elements");
  }
  return new Float32Array([
    rowMajor[0]!,
    rowMajor[3]!,
    rowMajor[6]!, // column 0
    rowMajor[1]!,
    rowMajor[4]!,
    rowMajor[7]!, // column 1
    rowMajor[2]!,
    rowMajor[5]!,
    rowMajor[8]!, // column 2
  ]);
}

/**
 * Converts a 4x4 matrix from row-major to column-major order.
 * Row-major: [m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]
 * Column-major: [m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33]
 */
export function toColumnMajor4x4(rowMajor: Float32Array): Float32Array {
  if (rowMajor.length !== 16) {
    throw new Error("Matrix must have exactly 16 elements");
  }
  return new Float32Array([
    rowMajor[0]!,
    rowMajor[4]!,
    rowMajor[8]!,
    rowMajor[12]!,
    rowMajor[1]!,
    rowMajor[5]!,
    rowMajor[9]!,
    rowMajor[13]!,
    rowMajor[2]!,
    rowMajor[6]!,
    rowMajor[10]!,
    rowMajor[14]!,
    rowMajor[3]!,
    rowMajor[7]!,
    rowMajor[11]!,
    rowMajor[15]!,
  ]);
}

/**
 * TransformationMatrix is a 4x4 matrix that represents a transformation in 3D space.
 */
export class TransformationMatrix extends Matrix4 {
  translate(x: number = 0, y: number = 0, z: number = 0): this {
    // Column-major: translation is in column 3 at indices [12, 13, 14, 15]
    this._data[12] = this._data[12]! + x;
    this._data[13] = this._data[13]! + y;
    this._data[14] = this._data[14]! + z;
    return this;
  }
  translateX(x: number): this {
    return this.translate(x);
  }
  translateY(y: number): this {
    return this.translate(undefined, y);
  }
  translateZ(z: number): this {
    return this.translate(undefined, undefined, z);
  }

  scale(x: number = 1, y: number = 1, z: number = 1): this {
    this._data[0] = this._data[0]! * x;
    this._data[5] = this._data[5]! * y;
    this._data[10] = this._data[10]! * z;
    return this;
  }
  scaleX(x: number): this {
    return this.scale(x);
  }
  scaleY(y: number): this {
    return this.scale(undefined, y);
  }
  scaleZ(z: number): this {
    return this.scale(undefined, undefined, z);
  }

  rotateX(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // Rotation around X-axis:
    // [1   0    0   0]
    // [0   c   -s   0]
    // [0   s    c   0]
    // [0   0    0   1]
    // Column-major: column 1 at [4,5,6,7], column 2 at [8,9,10,11]
    this._data[5] = c;
    this._data[6] = s;
    this._data[9] = -s;
    this._data[10] = c;
    // Preserve translation Y at [13] and translation Z at [14]
    return this;
  }
  rotateY(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // Rotation around Y-axis:
    // [c   0   s   0]
    // [0   1   0   0]
    // [-s  0   c   0]
    // [0   0   0   1]
    // Column-major: column 0 at [0,1,2,3], column 2 at [8,9,10,11]
    this._data[0] = c;
    this._data[2] = -s;
    this._data[8] = s;
    this._data[10] = c;
    // Preserve translation X at [12] and translation Z at [14]
    return this;
  }
  rotateZ(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // Rotation around Z-axis:
    // [c  -s   0   0]
    // [s   c   0   0]
    // [0   0   1   0]
    // [0   0   0   1]
    // Column-major: column 0 at [0,1,2,3], column 1 at [4,5,6,7]
    this._data[0] = c;
    this._data[1] = s;
    this._data[4] = -s;
    this._data[5] = c;
    // Preserve translation X at [12] and translation Y at [13]
    return this;
  }

  /**
   * Returns the inverse of this matrix.
   * @returns A new TransformationMatrix that is the inverse of this matrix.
   */
  invert(): TransformationMatrix {
    // Simple 4x4 matrix inversion using adjugate method
    const m = this._data;
    const inv = new Float32Array(16);

    inv[0] = m[5]! * m[10]! * m[15]! - m[5]! * m[11]! * m[14]! - m[9]! * m[6]! * m[15]! + m[9]! * m[7]! * m[14]! + m[13]! * m[6]! * m[11]! - m[13]! * m[7]! * m[10]!;
    inv[4] = -m[4]! * m[10]! * m[15]! + m[4]! * m[11]! * m[14]! + m[8]! * m[6]! * m[15]! - m[8]! * m[7]! * m[14]! - m[12]! * m[6]! * m[11]! + m[12]! * m[7]! * m[10]!;
    inv[8] = m[4]! * m[9]! * m[15]! - m[4]! * m[11]! * m[13]! - m[8]! * m[5]! * m[15]! + m[8]! * m[7]! * m[13]! + m[12]! * m[5]! * m[11]! - m[12]! * m[7]! * m[9]!;
    inv[12] = -m[4]! * m[9]! * m[14]! + m[4]! * m[10]! * m[13]! + m[8]! * m[5]! * m[14]! - m[8]! * m[6]! * m[13]! - m[12]! * m[5]! * m[10]! + m[12]! * m[6]! * m[9]!;

    inv[1] = -m[1]! * m[10]! * m[15]! + m[1]! * m[11]! * m[14]! + m[9]! * m[2]! * m[15]! - m[9]! * m[3]! * m[14]! - m[13]! * m[2]! * m[11]! + m[13]! * m[3]! * m[10]!;
    inv[5] = m[0]! * m[10]! * m[15]! - m[0]! * m[11]! * m[14]! - m[8]! * m[2]! * m[15]! + m[8]! * m[3]! * m[14]! + m[12]! * m[2]! * m[11]! - m[12]! * m[3]! * m[10]!;
    inv[9] = -m[0]! * m[9]! * m[15]! + m[0]! * m[11]! * m[13]! + m[8]! * m[1]! * m[15]! - m[8]! * m[3]! * m[13]! - m[12]! * m[1]! * m[11]! + m[12]! * m[3]! * m[9]!;
    inv[13] = m[0]! * m[9]! * m[14]! - m[0]! * m[10]! * m[13]! - m[8]! * m[1]! * m[14]! + m[8]! * m[2]! * m[13]! + m[12]! * m[1]! * m[10]! - m[12]! * m[2]! * m[9]!;

    inv[2] = m[1]! * m[6]! * m[15]! - m[1]! * m[7]! * m[14]! - m[5]! * m[2]! * m[15]! + m[5]! * m[3]! * m[14]! + m[13]! * m[2]! * m[7]! - m[13]! * m[3]! * m[6]!;
    inv[6] = -m[0]! * m[6]! * m[15]! + m[0]! * m[7]! * m[14]! + m[4]! * m[2]! * m[15]! - m[4]! * m[3]! * m[14]! - m[12]! * m[2]! * m[7]! + m[12]! * m[3]! * m[6]!;
    inv[10] = m[0]! * m[5]! * m[15]! - m[0]! * m[7]! * m[13]! - m[4]! * m[1]! * m[15]! + m[4]! * m[3]! * m[13]! + m[12]! * m[1]! * m[7]! - m[12]! * m[3]! * m[5]!;
    inv[14] = -m[0]! * m[5]! * m[14]! + m[0]! * m[6]! * m[13]! + m[4]! * m[1]! * m[14]! - m[4]! * m[2]! * m[13]! - m[12]! * m[1]! * m[6]! + m[12]! * m[2]! * m[5]!;

    inv[3] = -m[1]! * m[6]! * m[11]! + m[1]! * m[7]! * m[10]! + m[5]! * m[2]! * m[11]! - m[5]! * m[3]! * m[10]! - m[9]! * m[2]! * m[7]! + m[9]! * m[3]! * m[6]!;
    inv[7] = m[0]! * m[6]! * m[11]! - m[0]! * m[7]! * m[10]! - m[4]! * m[2]! * m[11]! + m[4]! * m[3]! * m[10]! + m[8]! * m[2]! * m[7]! - m[8]! * m[3]! * m[6]!;
    inv[11] = -m[0]! * m[5]! * m[11]! + m[0]! * m[7]! * m[9]! + m[4]! * m[1]! * m[11]! - m[4]! * m[3]! * m[9]! - m[8]! * m[1]! * m[7]! + m[8]! * m[3]! * m[5]!;
    inv[15] = m[0]! * m[5]! * m[10]! - m[0]! * m[6]! * m[9]! - m[4]! * m[1]! * m[10]! + m[4]! * m[2]! * m[9]! + m[8]! * m[1]! * m[6]! - m[8]! * m[2]! * m[5]!;

    let det = m[0]! * inv[0] + m[1]! * inv[4] + m[2]! * inv[8] + m[3]! * inv[12];

    if (det === 0) {
      throw new Error("Matrix is not invertible");
    }

    det = 1.0 / det;
    for (let i = 0; i < 16; i++) {
      inv[i] = inv[i]! * det;
    }

    return new TransformationMatrix(inv);
  }

  /**
   * Returns the matrix as a column-major Float32Array for WebGL.
   * @returns A Float32Array in column-major order.
   */
  toColumnMajorArray(): Float32Array {
    return this.toFloat32Array();
  }
}
