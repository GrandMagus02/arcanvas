import type { NumberArray } from "../vector/types";
import { Matrix } from "./Matrix";

/**
 * Matrix3 is a 3x3 matrix of 32-bit floating point numbers.
 */
export class Matrix3<T extends NumberArray = Float32Array> extends Matrix<T, 3> {
  constructor(data?: T) {
    super(data ?? (new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) as T), 3, 3);
  }

  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  static identity(): Matrix3<Float32Array> {
    return new Matrix3();
  }

  /**
   * Creates a Matrix3 from individual values (row-major order).
   * @param m00 - Element at row 0, column 0.
   * @param m01 - Element at row 0, column 1.
   * @param m02 - Element at row 0, column 2.
   * @param m10 - Element at row 1, column 0.
   * @param m11 - Element at row 1, column 1.
   * @param m12 - Element at row 1, column 2.
   * @param m20 - Element at row 2, column 0.
   * @param m21 - Element at row 2, column 1.
   * @param m22 - Element at row 2, column 2.
   * @returns A new Matrix3 instance.
   */
  static fromValues(m00: number, m01: number, m02: number, m10: number, m11: number, m12: number, m20: number, m21: number, m22: number): Matrix3<Float32Array> {
    return new Matrix3(new Float32Array([m00, m01, m02, m10, m11, m12, m20, m21, m22]));
  }

  /**
   * Creates a Matrix3 from an array (row-major order).
   * @param array - The array of values (must have at least 9 elements).
   * @returns A new Matrix3 instance.
   */
  static fromArray(array: ArrayLike<number>): Matrix3<Float32Array> {
    const values = Array.from(array);
    // Pad with zeros if array is shorter than needed
    while (values.length < 9) {
      values.push(0);
    }
    // Truncate if array is longer than needed
    values.length = 9;
    return new Matrix3(new Float32Array(values));
  }

  /**
   * Creates a Matrix3 from another matrix.
   * @param matrix - The matrix to copy.
   * @returns A new Matrix3 instance.
   */
  static fromMatrix(matrix: Matrix<Float32Array, 3, 3>): Matrix3<Float32Array> {
    const data = new Float32Array(9);
    data.set(matrix.data);
    return new Matrix3(data);
  }
}
