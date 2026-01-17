import type { NumberArray, Vector } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Matrix4 is a 4x4 matrix of 32-bit floating point numbers.
 */
export class Matrix4<T extends NumberArray = Float32Array> extends Matrix<T, 4> {
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
   * Creates a Matrix from a vector (column vector, 4x1 matrix).
   * Note: Matrix4 is always 4x4, so this returns a base Matrix instance.
   * @param vector - The vector (must have size 4).
   * @returns A new Matrix instance (4x1 matrix).
   */
  static fromVector(vector: Vector<Float32Array, 4>): Matrix<Float32Array, 4, 1> {
    const data = new Float32Array(4);
    data.set(vector.data);
    // @ts-expect-error - Abstract class instantiation for column vector
    return new Matrix(data, 4, 1) as Matrix<Float32Array, 4, 1>;
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
   * Converts a Vector4 to a matrix (column vector, 4x1 matrix).
   * @param vector - The vector to convert (must be Vector4).
   * @returns A matrix representation of the vector.
   */
  protected vectorToMatrix<TVecSize extends number>(vector: Vector<NumberArray, TVecSize>): Matrix<NumberArray, 4, 1> {
    const data = new Float32Array(4);
    data.set(vector.data);
    // @ts-expect-error - Abstract class instantiation for column vector
    return new Matrix(data, 4, 1) as Matrix<NumberArray, 4, 1>;
  }
}
