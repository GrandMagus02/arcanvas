import type { NumberArray, Vector } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Matrix2 is a 2x2 matrix of 32-bit floating point numbers.
 */
export class Matrix2<T extends NumberArray = Float32Array> extends Matrix<T, 2> {
  constructor(data?: T) {
    super(data ?? (new Float32Array([1, 0, 0, 1]) as T), 2, 2);
  }

  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  static identity(): Matrix2<Float32Array> {
    return new Matrix2();
  }

  /**
   * Creates a Matrix2 from individual values (row-major order).
   * @param m00 - Element at row 0, column 0.
   * @param m01 - Element at row 0, column 1.
   * @param m10 - Element at row 1, column 0.
   * @param m11 - Element at row 1, column 1.
   * @returns A new Matrix2 instance.
   */
  static of(m00: number, m01: number, m10: number, m11: number): Matrix2<Float32Array> {
    return new Matrix2(new Float32Array([m00, m01, m10, m11]));
  }

  /**
   * Creates a Matrix2 from an array (row-major order).
   * @param array - The array of values (must have at least 4 elements).
   * @returns A new Matrix2 instance.
   */
  static fromArray(array: ArrayLike<number>): Matrix2<Float32Array> {
    const values = Array.from(array);
    // Pad with zeros if array is shorter than needed
    while (values.length < 4) {
      values.push(0);
    }
    // Truncate if array is longer than needed
    values.length = 4;
    return new Matrix2(new Float32Array(values));
  }

  /**
   * Creates a Matrix from a vector (column vector, 2x1 matrix).
   * Note: Matrix2 is always 2x2, so this returns a base Matrix instance.
   * @param vector - The vector (must have size 2).
   * @returns A new Matrix instance (2x1 matrix).
   */
  static fromVector(vector: Vector<Float32Array, 2>): Matrix<Float32Array, 2, 1> {
    const data = new Float32Array(2);
    data.set(vector.data);
    // @ts-expect-error - Abstract class instantiation for column vector
    return new Matrix(data, 2, 1) as Matrix<Float32Array, 2, 1>;
  }

  /**
   * Creates a Matrix2 from another matrix.
   * @param matrix - The matrix to copy.
   * @returns A new Matrix2 instance.
   */
  static fromMatrix(matrix: Matrix<Float32Array, 2, 2>): Matrix2<Float32Array> {
    const data = new Float32Array(4);
    data.set(matrix.data);
    return new Matrix2(data);
  }

  /**
   * Converts a Vector2 to a matrix (column vector, 2x1 matrix).
   * @param vector - The vector to convert (must be Vector2).
   * @returns A matrix representation of the vector.
   */
  protected vectorToMatrix<TVecSize extends number>(vector: Vector<NumberArray, TVecSize>): Matrix<NumberArray, 2, 1> {
    const data = new Float32Array(2);
    data.set(vector.data);
    // @ts-expect-error - Abstract class instantiation for column vector
    return new Matrix(data, 2, 1) as Matrix<NumberArray, 2, 1>;
  }
}
