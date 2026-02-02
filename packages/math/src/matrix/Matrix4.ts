import type { NumberArray } from "../vector/types";
import { Vector } from "../vector/Vector";
import type { IMatrix } from "./IMatrix";
import { Matrix } from "./Matrix";

/**
 * Matrix4 is a 4x4 matrix of 32-bit floating point numbers.
 */
export class Matrix4<T extends NumberArray = Float32Array> extends Matrix<T, 4> implements IMatrix {
  constructor(data?: T) {
    super(data ?? (new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) as T), 4, 4);
  }

  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  static identity(): Matrix4<Float32Array> {
    return new Matrix4();
  }

  /**
   * Creates a Matrix4 from individual values (row-major order).
   * @param m00 - Element at row 0, column 0.
   * @param m01 - Element at row 0, column 1.
   * @param m02 - Element at row 0, column 2.
   * @param m03 - Element at row 0, column 3.
   * @param m10 - Element at row 1, column 0.
   * @param m11 - Element at row 1, column 1.
   * @param m12 - Element at row 1, column 2.
   * @param m13 - Element at row 1, column 3.
   * @param m20 - Element at row 2, column 0.
   * @param m21 - Element at row 2, column 1.
   * @param m22 - Element at row 2, column 2.
   * @param m23 - Element at row 2, column 3.
   * @param m30 - Element at row 3, column 0.
   * @param m31 - Element at row 3, column 1.
   * @param m32 - Element at row 3, column 2.
   * @param m33 - Element at row 3, column 3.
   * @returns A new Matrix4 instance.
   */
  static fromValues(
    m00: number,
    m01: number,
    m02: number,
    m03: number,
    m10: number,
    m11: number,
    m12: number,
    m13: number,
    m20: number,
    m21: number,
    m22: number,
    m23: number,
    m30: number,
    m31: number,
    m32: number,
    m33: number
  ): Matrix4<Float32Array> {
    return new Matrix4(new Float32Array([m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]));
  }

  /**
   * Creates a Matrix4 from an array (row-major order).
   * @param array - The array of values (must have at least 16 elements).
   * @returns A new Matrix4 instance.
   */
  static fromArray(array: ArrayLike<number>): Matrix4<Float32Array> {
    const values = Array.from(array);
    // Pad with zeros if array is shorter than needed
    while (values.length < 16) {
      values.push(0);
    }
    // Truncate if array is longer than needed
    values.length = 16;
    return new Matrix4(new Float32Array(values));
  }

  /**
   * Creates a Matrix from a vector (column vector, Nx1 matrix).
   * Signature must match base class; returns a base Matrix instance.
   * @param vector - The vector.
   * @returns A new Matrix instance (vector.size x 1).
   */
  static override fromVector<TVecArr extends NumberArray, TVecSize extends number>(vector: Vector<TVecArr, TVecSize>): Matrix<TVecArr, TVecSize, 1> {
    return Matrix.fromVector(vector);
  }

  /**
   * Creates a Matrix4 from another matrix.
   * @param matrix - The matrix to copy.
   * @returns A new Matrix4 instance.
   */
  static fromMatrix(matrix: Matrix<Float32Array, 4, 4>): Matrix4<Float32Array> {
    const data = new Float32Array(16);
    data.set(matrix.data);
    return new Matrix4(data);
  }

  /**
   * Translates the matrix by the given vector (in-place mutation).
   * @param x - The x component of the translation vector.
   * @param y - The y component of the translation vector.
   * @param z - The z component of the translation vector.
   * @returns This matrix after translation (for chaining).
   */
  translate(x: number, y: number, z: number): this {
    // Translation is stored in the last column (indices 12, 13, 14, 15)
    // Since this is column-major:
    // m[12] += x
    // m[13] += y
    // m[14] += z
    // Note: This applies translation in world space (post-multiplication if vector on right)
    this._data[12] = (this._data[12] ?? 0) + x;
    this._data[13] = (this._data[13] ?? 0) + y;
    this._data[14] = (this._data[14] ?? 0) + z;
    return this;
  }

  /**
   * Scales the matrix by the given vector (in-place mutation).
   * @param x - The x component of the scale vector.
   * @param y - The y component of the scale vector.
   * @param z - The z component of the scale vector.
   * @returns This matrix after scaling (for chaining).
   */
  scale(x: number, y: number, z: number): this {
    // Scale affects the basis vectors (first 3 columns)
    // Column 0 (X axis)
    this._data[0]! *= x;
    this._data[1]! *= x;
    this._data[2]! *= x;
    this._data[3]! *= x;

    // Column 1 (Y axis)
    this._data[4]! *= y;
    this._data[5]! *= y;
    this._data[6]! *= y;
    this._data[7]! *= y;

    // Column 2 (Z axis)
    this._data[8]! *= z;
    this._data[9]! *= z;
    this._data[10]! *= z;
    this._data[11]! *= z;

    return this;
  }

  /**
   * Rotates the matrix around the X axis (in-place mutation).
   * @param rad - The angle in radians.
   * @returns This matrix after rotation (for chaining).
   */
  rotateX(rad: number): this {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a10 = this._data[4]!;
    const a11 = this._data[5]!;
    const a12 = this._data[6]!;
    const a13 = this._data[7]!;
    const a20 = this._data[8]!;
    const a21 = this._data[9]!;
    const a22 = this._data[10]!;
    const a23 = this._data[11]!;

    this._data[4] = a10 * c + a20 * s;
    this._data[5] = a11 * c + a21 * s;
    this._data[6] = a12 * c + a22 * s;
    this._data[7] = a13 * c + a23 * s;

    this._data[8] = a20 * c - a10 * s;
    this._data[9] = a21 * c - a11 * s;
    this._data[10] = a22 * c - a12 * s;
    this._data[11] = a23 * c - a13 * s;

    return this;
  }

  /**
   * Rotates the matrix around the Y axis (in-place mutation).
   * @param rad - The angle in radians.
   * @returns This matrix after rotation (for chaining).
   */
  rotateY(rad: number): this {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a00 = this._data[0]!;
    const a01 = this._data[1]!;
    const a02 = this._data[2]!;
    const a03 = this._data[3]!;
    const a20 = this._data[8]!;
    const a21 = this._data[9]!;
    const a22 = this._data[10]!;
    const a23 = this._data[11]!;

    this._data[0] = a00 * c - a20 * s;
    this._data[1] = a01 * c - a21 * s;
    this._data[2] = a02 * c - a22 * s;
    this._data[3] = a03 * c - a23 * s;

    this._data[8] = a00 * s + a20 * c;
    this._data[9] = a01 * s + a21 * c;
    this._data[10] = a02 * s + a22 * c;
    this._data[11] = a03 * s + a23 * c;

    return this;
  }

  /**
   * Rotates the matrix around the Z axis (in-place mutation).
   * @param rad - The angle in radians.
   * @returns This matrix after rotation (for chaining).
   */
  rotateZ(rad: number): this {
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const a00 = this._data[0]!;
    const a01 = this._data[1]!;
    const a02 = this._data[2]!;
    const a03 = this._data[3]!;
    const a10 = this._data[4]!;
    const a11 = this._data[5]!;
    const a12 = this._data[6]!;
    const a13 = this._data[7]!;

    this._data[0] = a00 * c + a10 * s;
    this._data[1] = a01 * c + a11 * s;
    this._data[2] = a02 * c + a12 * s;
    this._data[3] = a03 * c + a13 * s;

    this._data[4] = a10 * c - a00 * s;
    this._data[5] = a11 * c - a01 * s;
    this._data[6] = a12 * c - a02 * s;
    this._data[7] = a13 * c - a03 * s;

    return this;
  }

  /**
   * Converts a Vector4 to a matrix (column vector, 4x1 matrix).
   * @param vector - The vector to convert (must be Vector4).
   * @returns A matrix representation of the vector.
   */
  protected vectorToMatrix<TVecSize extends number>(vector: Vector<NumberArray, TVecSize>): Matrix<NumberArray, 4, 1> {
    const data = new Float32Array(4);
    data.set(vector.data);
    return new Matrix(data, 4, 1) as Matrix<NumberArray, 4, 1>;
  }
}
