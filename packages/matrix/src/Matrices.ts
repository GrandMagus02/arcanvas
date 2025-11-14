import type { NumberArray } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Mat2 is a 2x2 matrix of 32-bit floating point numbers.
 */
export class Matrix2<T extends NumberArray = Float32Array> extends Matrix<T, 2> {
  constructor(data: T = new Float32Array([1, 0, 0, 1]) as T) {
    super(data, 2, 2);
  }

  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  static identity(): Matrix2<Float32Array> {
    return new Matrix2();
  }
}

/**
 * Mat3 is a 3x3 matrix of 32-bit floating point numbers.
 */
export class Matrix3<T extends NumberArray = Float32Array> extends Matrix<T, 3> {
  constructor(data: T = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) as T) {
    super(data, 3, 3);
  }

  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  static identity(): Matrix3<Float32Array> {
    return new Matrix3();
  }
}

/**
 * Mat4 is a 4x4 matrix of 32-bit floating point numbers.
 */
export class Matrix4<T extends NumberArray = Float32Array> extends Matrix<T, 4> {
  constructor(data: T = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) as T) {
    super(data, 4, 4);
  }

  /**
   * Creates a new identity matrix.
   * @returns A new identity matrix.
   */
  static identity(): Matrix4<Float32Array> {
    return new Matrix4();
  }
}
